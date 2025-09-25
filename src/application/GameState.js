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

  return CATEGORY_ORDER
    .filter((key) => buckets.has(key))
    .map((key) => buckets.get(key));
}

function calculateCapturedPoints(cards = []) {
  return cards.reduce((total, card) => total + (Number.isFinite(card.points) ? card.points : 0), 0);
}

function findCardName(cardId) {
  return cardDefinitionsById[cardId]?.name ?? cardId;
}

export class GameState {
  constructor(options = {}) {
    this._config = { ...options };
    this.matchId = options.matchId ?? 'local-match';
    this._service = new GameService(options);
    this._ensureMatchStarted();
  }

  reset(options = {}) {
    this._config = { ...options };
    this.matchId = options.matchId ?? 'local-match';
    this._service = new GameService(options);
    this._ensureMatchStarted();
  }

  _ensureMatchStarted() {
    if (!this._service.round) {
      this._service.startMatch(this._config);
    }
  }

  _getRoundSnapshot() {
    this._ensureMatchStarted();
    const snapshot = this._service.getSnapshot();
    return snapshot?.round ?? null;
  }

  _buildPlayerView(playerSnapshot, { includeHand = true } = {}) {
    const capturedPoints = calculateCapturedPoints(playerSnapshot.captured);
    return {
      id: playerSnapshot.id,
      name: playerSnapshot.name,
      roleLabel: playerSnapshot.id === 'player' ? 'あなた' : 'CPU',
      capturedTotal: playerSnapshot.captured.length,
      roundScore: capturedPoints,
      totalScore: capturedPoints,
      hand: includeHand ? playerSnapshot.hand.map((card) => buildCardView(card)) : [],
      captured: groupCapturedCards(playerSnapshot.captured)
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

  _deriveMonthLabel(roundSnapshot) {
    const fallbackMonth = 1;
    const sampleCard = roundSnapshot.field.cards?.[0];
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

  _buildStatus(roundSnapshot, playersById) {
    const currentPlayer = playersById.get(roundSnapshot.currentPlayerId);
    const monthLabel = this._deriveMonthLabel(roundSnapshot);
    const phase = currentPlayer?.id === 'player' ? '手札選択' : currentPlayer ? `${currentPlayer.name}の手番` : '待機中';
    const turnLabel = currentPlayer
      ? currentPlayer.id === 'player'
        ? 'あなたの手番'
        : `${currentPlayer.name}の手番`
      : '';

    return {
      monthLabel,
      phase,
      turnLabel,
      timeRemaining: '--',
      koikoiLevel: 1
    };
  }

  snapshot() {
    const roundSnapshot = this._getRoundSnapshot();
    if (!roundSnapshot) {
      return null;
    }

    const playerMap = new Map(roundSnapshot.players.map((player) => [player.id, player]));

    const selfPlayerSnapshot = playerMap.get('player') ?? roundSnapshot.players[0];
    const opponentSnapshot = roundSnapshot.players.find((player) => player.id !== selfPlayerSnapshot.id) ?? selfPlayerSnapshot;

    const playerView = this._buildPlayerView(selfPlayerSnapshot, { includeHand: true });
    const opponentView = this._buildPlayerView(opponentSnapshot, { includeHand: false });

    const status = this._buildStatus(roundSnapshot, new Map([
      [playerView.id, { id: playerView.id, name: playerView.name }],
      [opponentView.id, { id: opponentView.id, name: opponentView.name }]
    ]));

    return {
      matchId: this.matchId,
      status,
      player: playerView,
      opponent: opponentView,
      field: this._buildFieldView(roundSnapshot),
      logs: []
    };
  }

  getSelectableFieldCards(handCardId) {
    const roundSnapshot = this._getRoundSnapshot();
    if (!roundSnapshot) {
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

  getSelectableHandCards(fieldCardId) {
    const roundSnapshot = this._getRoundSnapshot();
    if (!roundSnapshot) {
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

  playCards(handCardId, fieldCardId) {
    const roundSnapshot = this._getRoundSnapshot();
    if (!roundSnapshot) {
      throw new Error('ラウンドが開始されていません。');
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

    this._service.playCard(targetMove);

    const lastEvent = this._service.round.history[this._service.round.history.length - 1] ?? null;
    const log = this._buildLogFromEvent(lastEvent);

    return {
      state: this.snapshot(),
      log
    };
  }

  _buildLogFromEvent(event) {
    if (!event) {
      return null;
    }

    const capturedCards = [
      ...(event.capturedFromHand ?? []),
      ...(event.capturedFromDeck ?? [])
    ];

    if (capturedCards.length > 0) {
      const names = [...new Set(capturedCards.map((card) => card.name))];
      return {
        message: `${names.join('、')} を獲得しました。`,
        variant: 'success'
      };
    }

    const cardName = findCardName(event.handCardId);
    return {
      message: `${cardName} を場に出しました。`,
      variant: 'info'
    };
  }
}
