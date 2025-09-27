import { GameService } from '../domain/game/GameService.js';
import { cardDefinitionsById } from '../domain/cards/index.js';
import { MONTH_LABELS } from '../domain/cards/definitions.js';

const CATEGORY_LABELS = Object.freeze({
  light: '光札',
  animal: 'タネ札',
  ribbon: '短冊',
  chaff: 'カス',
  others: 'その他'
});

const CATEGORY_ORDER = ['light', 'animal', 'ribbon', 'chaff', 'others'];

const MONTH_KANJI_LABELS = Object.freeze({
  1: '松',
  2: '梅',
  3: '桜',
  4: '藤',
  5: '菖蒲',
  6: '牡丹',
  7: '萩',
  8: '芒',
  9: '菊',
  10: '紅葉',
  11: '柳',
  12: '桐'
});

const MONTH_ASSET_SLUG = Object.freeze({
  1: 'pine',
  2: 'plum',
  3: 'cherry',
  4: 'wisteria',
  5: 'iris',
  6: 'peony',
  7: 'bushclover',
  8: 'pampas',
  9: 'chrysanthemum',
  10: 'maple',
  11: 'willow',
  12: 'paulownia'
});

function deriveShortLabel(name) {
  if (!name) {
    return '';
  }
  const sanitized = name.replace(/[のにをへと]/g, '');
  return sanitized.slice(0, 4);
}

function resolveAssetPath(card) {
  const monthSlug = MONTH_ASSET_SLUG[card.month];
  if (!monthSlug) {
    return null;
  }
  const prefix = `${String(card.month).padStart(2, '0')}-${monthSlug}`;

  switch (card.category) {
    case 'light':
      return `/assets/hanafuda/${prefix}-bright.png`;
    case 'animal':
      return `/assets/hanafuda/${prefix}-animal.png`;
    case 'ribbon':
      return `/assets/hanafuda/${prefix}-ribbon.png`;
    case 'chaff': {
      const suffix = card.id.split('-').at(-1);
      let variant = '';
      if (suffix === 'a') {
        variant = '-1';
      } else if (suffix === 'b') {
        variant = '-2';
      } else if (suffix === 'c') {
        variant = '-3';
      }
      return `/assets/hanafuda/${prefix}-chaff${variant}.png`;
    }
    default:
      return `/assets/hanafuda/${prefix}.png`;
  }
}

function buildCardView(card) {
  const definition = cardDefinitionsById[card.id] ?? card;
  return {
    id: card.id,
    month: card.month,
    name: definition?.name ?? card.name,
    category: card.category,
    ribbonColor: definition?.ribbonColor ?? card.ribbonColor ?? null,
    rarity: definition?.rarity ?? card.rarity ?? null,
    isSpecial: Boolean(definition?.isSpecial ?? card.isSpecial),
    points: Number.isFinite(card.points) ? card.points : definition?.points ?? 0,
    shortLabel: deriveShortLabel(definition?.name ?? card.name),
    image: resolveAssetPath(card)
  };
}

function groupCapturedCards(cards = []) {
  const buckets = new Map();

  cards.forEach((card) => {
    const key = card.category ?? 'others';
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        label: CATEGORY_LABELS[key] ?? CATEGORY_LABELS.others,
        cards: []
      });
    }
    buckets.get(key).cards.push(buildCardView(card));
  });

  return CATEGORY_ORDER.filter((key) => buckets.has(key)).map((key) => buckets.get(key));
}

function calculateCapturedPoints(cards = []) {
  return cards.reduce((total, card) => total + (Number.isFinite(card.points) ? card.points : 0), 0);
}

function findCardName(cardId) {
  return cardDefinitionsById[cardId]?.name ?? cardId;
}

function formatPointSummary(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return '';
  }
  return entries
    .map((entry) => `${entry.name ?? entry.playerId}: ${entry.points}点`)
    .join(' / ');
}

export class GameState {
  constructor(options = {}) {
    this._config = { ...options };
    this.matchId = options.matchId ?? 'local-match';
    this._service = new GameService(options);
    this._logQueue = [];
    this._startPromise = null;
    this._pendingCpu = Promise.resolve();
    this._ensureMatchStarted();
  }

  reset(options = {}) {
    this._config = { ...options };
    this.matchId = options.matchId ?? 'local-match';
    this._service = new GameService(options);
    this._logQueue = [];
    this._startPromise = null;
    this._pendingCpu = Promise.resolve();
    this._ensureMatchStarted();
  }

  _ensureMatchStarted() {
    if (!this._startPromise) {
      this._startPromise = this._service.startMatch(this._config).then((result) => {
      this._appendLogsFromEvents(result?.events ?? []);
      return result;
    });
  }
    return this._startPromise;
  }

  async _waitCpu() {
    await this._pendingCpu;
  }

  async _getServiceSnapshot() {
    await this._waitCpu();
    await this._ensureMatchStarted();
    return this._service.getSnapshot();
  }

  async _getRoundSnapshot() {
    const snapshot = await this._getServiceSnapshot();
    return snapshot?.round ?? null;
  }

  async snapshot() {
    const base = await this._collectSnapshot();
    if (!base) {
      return null;
    }
    return {
      ...base,
      logs: this._drainLogs()
    };
  }

  async _collectSnapshot() {
    const serviceSnapshot = await this._getServiceSnapshot();
    if (!serviceSnapshot) {
      return null;
    }

    const roundSnapshot = serviceSnapshot.round;
    const matchSnapshot = serviceSnapshot.match ?? null;

    if (!roundSnapshot) {
      return {
        matchId: this.matchId,
        status: {
          monthLabel: '',
          phase: '対局終了',
          turnLabel: '',
          timeRemaining: '--',
          koikoiLevel: 0,
          currentRound: matchSnapshot?.currentRound ?? matchSnapshot?.totalRounds ?? 0,
          totalRounds: matchSnapshot?.totalRounds ?? 0
        },
        player: null,
        opponent: null,
        field: { drawPile: 0, discard: [], cards: [] },
        match: this._buildMatchInfo(matchSnapshot),
        pendingKoikoi: null,
      roundResult: matchSnapshot?.history?.at(-1)?.result ?? null,
        meta: {
          matchFinished: Boolean(matchSnapshot?.isFinished),
          cpuThinkDelay: this._service.cpuThinkDelay
        }
      };
    }

    const playersById = new Map(roundSnapshot.players.map((player) => [player.id, player]));
    const statusById = new Map((roundSnapshot.playerStatus ?? []).map((status) => [status.playerId, status]));
    const yakuById = new Map((roundSnapshot.playerYaku ?? []).map((entry) => [entry.playerId, entry.list ?? []]));
    const totalsById = new Map((matchSnapshot?.totals ?? []).map((entry) => [entry.playerId, entry.points]));

    const humanPlayer = playersById.get('player') ?? roundSnapshot.players[0];
    const opponent = roundSnapshot.players.find((player) => player.id !== humanPlayer.id) ?? humanPlayer;

    const playerView = this._buildPlayerView(humanPlayer, {
      status: statusById.get(humanPlayer.id),
      totalScore: totalsById.get(humanPlayer.id) ?? 0,
      yakuList: yakuById.get(humanPlayer.id) ?? [],
      includeHand: true
    });

    const opponentView = this._buildPlayerView(opponent, {
      status: statusById.get(opponent.id),
      totalScore: totalsById.get(opponent.id) ?? 0,
      yakuList: yakuById.get(opponent.id) ?? [],
      includeHand: false
    });

    const status = this._buildStatus({
      roundSnapshot,
      playerView,
      opponentView,
      statusById,
      matchSnapshot
    });

    const rawPlayerState = playersById.get(playerView.id);
    const rawOpponentState = playersById.get(opponentView.id);

    const meta = {
      currentPlayerId: roundSnapshot.currentPlayerId,
      isPlayerTurn:
        !roundSnapshot.pendingKoikoi && roundSnapshot.currentPlayerId === playerView.id,
      matchFinished: Boolean(matchSnapshot?.isFinished),
      pendingKoikoiPlayerId: roundSnapshot.pendingKoikoi?.playerId ?? null,
      cpuThinkDelay: this._service.cpuThinkDelay,
      handCounts: {
        player: rawPlayerState?.hand?.length ?? playerView.hand?.length ?? 0,
        opponent: rawOpponentState?.hand?.length ?? opponentView.hand?.length ?? 0
      },
      selectableHandIds: [],
      selectableFieldIds: []
    };

    return {
      matchId: this.matchId,
      status,
      player: playerView,
      opponent: opponentView,
      field: this._buildFieldView(roundSnapshot),
      match: this._buildMatchInfo(matchSnapshot),
      pendingKoikoi: this._buildPendingKoikoi(roundSnapshot.pendingKoikoi),
      roundResult: this._buildRoundResultInfo(roundSnapshot.roundResult),
      meta
    };
  }

  _buildPlayerView(playerSnapshot, { status = {}, totalScore = 0, yakuList = [], includeHand = true } = {}) {
    const roundScore = status?.totalPoints ?? calculateCapturedPoints(playerSnapshot.captured);
    return {
      id: playerSnapshot.id,
      name: playerSnapshot.name,
      roleLabel: playerSnapshot.id === 'player' ? 'あなた' : 'CPU',
      capturedTotal: playerSnapshot.captured.length,
      roundScore,
      totalScore,
      koikoiLevel: status?.koikoiLevel ?? 0,
      koikoiDeclared: Boolean(status?.koikoiDeclared),
      hand: includeHand ? playerSnapshot.hand.map((card) => buildCardView(card)) : [],
      captured: groupCapturedCards(playerSnapshot.captured),
      yaku: yakuList.map((item) => ({ ...item }))
    };
  }

  _buildFieldView(roundSnapshot) {
    const { field, deckRemaining } = roundSnapshot;
    return {
      drawPile: deckRemaining,
      discard: (field.discard ?? []).map((card) => buildCardView(card)),
      cards: (field.cards ?? []).map((card) => buildCardView(card))
    };
  }

  _buildStatus({ roundSnapshot, playerView, opponentView, statusById, matchSnapshot }) {
    const playersById = new Map([
      [playerView.id, { id: playerView.id, name: playerView.name }],
      [opponentView.id, { id: opponentView.id, name: opponentView.name }]
    ]);

    const pending = roundSnapshot.pendingKoikoi;
    const roundResult = roundSnapshot.roundResult;

    let phase = '';
    let turnLabel = '';

    if (roundResult) {
      phase = '局終了';
      if (roundResult.winnerId) {
        const winner = playersById.get(roundResult.winnerId) ?? { name: roundResult.winnerId };
        turnLabel = `${winner.name} が上がりました`;
      } else {
        turnLabel = '流局しました';
      }
    } else if (pending) {
      const actor = playersById.get(pending.playerId) ?? { name: pending.playerId };
      if (pending.playerId === playerView.id) {
        phase = 'コイコイ選択中';
        turnLabel = 'コイコイするか選択してください';
      } else {
        phase = `${actor.name} がコイコイ判定中`;
        turnLabel = `${actor.name}の手番`;
      }
    } else {
      const currentPlayer = playersById.get(roundSnapshot.currentPlayerId);
      phase = currentPlayer?.id === playerView.id ? '手札選択' : currentPlayer ? `${currentPlayer.name}の手番` : '待機中';
      if (currentPlayer) {
        turnLabel = currentPlayer.id === playerView.id ? 'あなたの手番' : `${currentPlayer.name}の手番`;
      } else {
        turnLabel = '';
      }
    }

    return {
      monthLabel: this._deriveMonthLabel(roundSnapshot),
      phase,
      turnLabel,
      timeRemaining: '--',
      koikoiLevel: statusById.get(playerView.id)?.koikoiLevel ?? 0,
      currentRound: matchSnapshot?.currentRound ?? 1,
      totalRounds: matchSnapshot?.totalRounds ?? 1
    };
  }

  _buildMatchInfo(matchSnapshot) {
    if (!matchSnapshot) {
      return {
        totalRounds: 0,
        completedRounds: 0,
        currentRound: 0,
        totals: [],
        history: [],
        isFinished: false
      };
    }

    const totals = (matchSnapshot.totals ?? []).map((entry) => ({
      playerId: entry.playerId,
      name: this._getPlayerDisplayName(entry.playerId),
      points: entry.points
    }));

    return {
      totalRounds: matchSnapshot.totalRounds,
      completedRounds: matchSnapshot.completedRounds,
      currentRound: matchSnapshot.currentRound,
      totals,
      history: (matchSnapshot.history ?? []).map((entry) => ({
        round: entry.round,
        result: {
          reason: entry.result.reason,
          winnerId: entry.result.winnerId,
          winnerName: entry.result.winnerId ? this._getPlayerDisplayName(entry.result.winnerId) : null,
          points: entry.result.points.map((item) => ({
            playerId: item.playerId,
            name: this._getPlayerDisplayName(item.playerId),
            points: item.points
          })),
          statuses: entry.result.statuses.map((status) => ({ ...status })),
          yaku: entry.result.yaku.map((item) => ({
            playerId: item.playerId,
            name: this._getPlayerDisplayName(item.playerId),
            list: item.list.map((yaku) => ({ ...yaku }))
          }))
        }
      })),
      isFinished: Boolean(matchSnapshot.isFinished)
    };
  }

  _buildPendingKoikoi(pending) {
    if (!pending) {
      return null;
    }
    return {
      playerId: pending.playerId,
      playerName: this._getPlayerDisplayName(pending.playerId),
      newYaku: pending.newYaku.map((item) => ({ ...item })),
      allYaku: pending.allYaku.map((item) => ({ ...item })),
      score: { ...pending.score }
    };
  }

  _buildRoundResultInfo(result) {
    if (!result) {
      return null;
    }
    return {
      reason: result.reason,
      winnerId: result.winnerId,
      winnerName: result.winnerId ? this._getPlayerDisplayName(result.winnerId) : null,
      points: result.points.map((entry) => ({
        playerId: entry.playerId,
        name: this._getPlayerDisplayName(entry.playerId),
        points: entry.points
      })),
      statuses: result.statuses.map((status) => ({ ...status })),
      yaku: result.yaku.map((entry) => ({
        playerId: entry.playerId,
        name: this._getPlayerDisplayName(entry.playerId),
        list: entry.list.map((yaku) => ({ ...yaku }))
      }))
    };
  }

  _deriveMonthLabel(roundSnapshot) {
    const fallbackMonth = 1;
    const sampleCard = roundSnapshot.field?.cards?.[0];
    const month = sampleCard?.month ?? fallbackMonth;
    const kanji = MONTH_KANJI_LABELS[month];
    const english = MONTH_LABELS[month];
    if (kanji) {
      return `${month}月（${kanji}）`;
    }
    if (english) {
      return `${month}月（${english}）`;
    }
    return `${month}月`;
  }

  async getSelectableFieldCards(handCardId) {
    const roundSnapshot = await this._getRoundSnapshot();
    if (!roundSnapshot || roundSnapshot.pendingKoikoi) {
      return [];
    }
    const player = roundSnapshot.players.find((item) => item.id === 'player');
    const targetCard = player?.hand.find((card) => card.id === handCardId);
    if (!targetCard) {
      return [];
    }
    return (roundSnapshot.field.cards ?? [])
      .filter((fieldCard) => fieldCard.month === targetCard.month)
      .map((card) => card.id);
  }

  async getSelectableHandCards(fieldCardId) {
    const roundSnapshot = await this._getRoundSnapshot();
    if (!roundSnapshot || roundSnapshot.pendingKoikoi) {
      return [];
    }
    const player = roundSnapshot.players.find((item) => item.id === 'player');
    if (!player) {
      return [];
    }
    const fieldCard = (roundSnapshot.field.cards ?? []).find((card) => card.id === fieldCardId);
    if (!fieldCard) {
      return [];
    }
    return player.hand
      .filter((card) => card.month === fieldCard.month)
      .map((card) => card.id);
  }

  async playCards(handCardId, fieldCardId) {
    await this._waitCpu();
    const roundSnapshot = await this._getRoundSnapshot();
    if (!roundSnapshot) {
      throw new Error('ラウンドが開始されていません。');
    }

    if (roundSnapshot.pendingKoikoi) {
      throw new Error('コイコイの選択が保留中です。');
    }

    const playerId = roundSnapshot.currentPlayerId;
    if (!playerId) {
      throw new Error('現在アクティブなプレイヤーが存在しません。');
    }

    const availableMoves = this._service.getAvailableMoves(playerId);
    const targetMove = availableMoves.find((move) => {
      if (move.handCardId !== handCardId) {
        return false;
      }
      if (!fieldCardId) {
        return (move.fieldCardIds ?? []).length === 0;
      }
      return (move.fieldCardIds ?? []).includes(fieldCardId);
    });

    if (!targetMove) {
      throw new Error('指定したカードの組み合わせは無効です。');
    }

    const result = await this._service.playCard(targetMove);
    this._appendLogsFromEvents(result.events);

    const state = await this.snapshot();
    return {
      state,
      logs: state.logs
    };
  }

  async resolveKoikoi(decision) {
    await this._waitCpu();
    const normalized = decision === 'continue' ? 'continue' : 'stop';
    const result = await this._service.resolveKoikoi(normalized);
    this._appendLogsFromEvents(result.events);
    const state = await this.snapshot();
    return {
      state,
      logs: state.logs
    };
  }

  async startNextRound() {
    await this._waitCpu();
    const result = await this._service.startNextRound();
    this._appendLogsFromEvents(result.events);
    const state = await this.snapshot();
    return {
      state,
      logs: state.logs
    };
  }

  async advanceCpuTurn() {
    const cpuTask = this._pendingCpu.then(() => this._service.advanceCpuTurn());
    this._pendingCpu = cpuTask.catch(() => {});

    let result;
    try {
      result = await cpuTask;
    } finally {
      this._pendingCpu = Promise.resolve();
    }

    this._appendLogsFromEvents(result.events);
    const state = await this.snapshot();
    return {
      state,
      logs: state.logs
    };
  }

  _appendLogsFromEvents(events = []) {
    if (!Array.isArray(events) || events.length === 0) {
      return;
    }
    events
      .flatMap((event) => this._buildLogsFromEvent(event))
      .filter(Boolean)
      .forEach((entry) => this._enqueueLog(entry));
  }

  _buildLogsFromEvent(event) {
    if (!event) {
      return [];
    }

    switch (event.type) {
      case 'round-start': {
        const firstName = this._getPlayerDisplayName(event.firstPlayerId);
        const segments = [`第${event.round}局を開始`];
        if (event.redealCount) {
          segments.push(`再配札 ${event.redealCount} 回`);
        }
        segments.push(`先攻: ${firstName}`);
        return [
          {
            message: segments.join(' / '),
            variant: 'info'
          }
        ];
      }
      case 'turn': {
        return this._buildTurnLogs(event);
      }
      case 'koikoi-prompt': {
        const actorName = this._getPlayerDisplayName(event.playerId);
        const yakuNames = this._describeYakuList(event.pending?.newYaku ?? []);
        const message = yakuNames
          ? `${actorName} が ${yakuNames} を成立。コイコイしますか？`
          : `${actorName} が役を成立させました。コイコイしますか？`;
        return [
          {
            message,
            variant: 'warning'
          }
        ];
      }
      case 'koikoi-decision': {
        const actorName = this._getPlayerDisplayName(event.playerId);
        if (event.decision === 'continue') {
          return [
            {
              message: `${actorName} はコイコイを宣言しました（${event.level}回目）`,
              variant: 'warning'
            }
          ];
        }
        const points = event.result?.points ?? [];
        const summary = formatPointSummary(
          points.map((entry) => ({
            ...entry,
            name: this._getPlayerDisplayName(entry.playerId)
          }))
        );
        return [
          {
            message: `${actorName} は上がりを宣言しました。${summary}`.trim(),
            variant: 'success'
          }
        ];
      }
      case 'round-end': {
        const winnerName = event.result.winnerId
          ? this._getPlayerDisplayName(event.result.winnerId)
          : null;
        const summary = formatPointSummary(
          event.result.points.map((entry) => ({
            ...entry,
            name: this._getPlayerDisplayName(entry.playerId)
          }))
        );
        const message = winnerName
          ? `第${event.roundNumber ?? ''}局終了：${winnerName} が ${summary}`
          : `第${event.roundNumber ?? ''}局終了：流局 ${summary}`;
        return [
          {
            message: message.trim(),
            variant: winnerName ? 'success' : 'info'
          }
        ];
      }
      case 'match-end': {
        const summary = formatPointSummary(
          (event.totals ?? []).map((entry) => ({
            ...entry,
            name: this._getPlayerDisplayName(entry.playerId)
          }))
        );
        return [
          {
            message: summary ? `全局終了。最終得点 ${summary}` : '全局終了',
            variant: 'success'
          }
        ];
      }
      default:
        return [];
    }
  }

  _buildTurnLogs(event) {
    const actorName = this._getPlayerDisplayName(event.playerId);
    const result = event.result ?? {};
    const captured = [
      ...(result.capturedFromHand ?? []),
      ...(result.capturedFromDeck ?? [])
    ];
    const logs = [];

    if (captured.length > 0) {
      logs.push({
        message: `${actorName} が ${this._describeCards(captured)} を獲得しました。`,
        variant: 'success'
      });
    } else if (event.move?.handCardId) {
      logs.push({
        message: `${actorName} が ${findCardName(event.move.handCardId)} を場に出しました。`,
        variant: 'info'
      });
    }

    const newYaku = result.newYaku ?? [];
    for (const yaku of newYaku) {
      logs.push({
        message: `${actorName} が 役「${yaku.name}」を成立 (+${yaku.points}点)`,
        variant: 'success'
      });
    }

    return logs;
  }

  _describeCards(cards = []) {
    if (!cards.length) {
      return '';
    }
    const names = cards.map((card) => card.name ?? findCardName(card.id));
    return [...new Set(names)].join('、');
  }

  _describeYakuList(yakuList = []) {
    if (!yakuList.length) {
      return '';
    }
    return yakuList.map((item) => item.name).join(' / ');
  }

  _getPlayerDisplayName(playerId) {
    const player = (this._service.players ?? []).find((item) => item.id === playerId);
    return player?.name ?? playerId;
  }

  _enqueueLog(entry) {
    if (!entry || !entry.message) {
      return;
    }
    this._logQueue.push({
      message: entry.message,
      variant: entry.variant ?? 'info'
    });
  }

  _drainLogs() {
    const logs = [...this._logQueue];
    this._logQueue = [];
    return logs;
  }
}
