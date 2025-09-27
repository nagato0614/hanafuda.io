import { defineStore } from 'pinia';
import {
  fetchGameState,
  fetchSelectableFieldCards,
  fetchSelectableHandCards,
  playCards,
  resolveKoikoi as resolveKoikoiRemote,
  startNextRound as startNextRoundRemote,
  advanceCpuTurn as advanceCpuTurnRemote
} from '../backend/gameBackend.js';

const MAX_LOGS = 50;

const defaultActions = () => ({
  primary: [],
  secondary: [],
  logs: []
});

function createLogEntry(message, variant = 'info') {
  return {
    id: `log-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    time: new Date().toLocaleTimeString('ja-JP', { hour12: false }).slice(0, 5),
    message,
    variant
  };
}

export const useMatchStore = defineStore('match', {
  state: () => ({
    match: null,
    matchInfo: null,
    pendingKoikoi: null,
    roundResult: null,
    loading: false,
    error: null,
    selectedHandId: null,
    selectedFieldId: null,
    selectableHandIds: [],
    selectableFieldIds: [],
    sceneKey: 'MainMenu',
    cpuDelay: 1000,
    cpuTimer: null
  }),
  getters: {
    hasMatch: (state) => Boolean(state.match)
  },
  actions: {
    async loadInitialState() {
      this.loading = true;
      this.error = null;
      try {
        const snapshot = await fetchGameState();
        this.applyBackendState(snapshot, { resetLogs: true });
        this.clearSelections();
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    setScene(scene) {
      this.sceneKey = scene?.scene?.key ?? '';
    },
    applyBackendState(snapshot, { resetLogs = false } = {}) {
      const previousLogs = resetLogs ? [] : [...(this.match?.actions.logs ?? [])];

      if (!snapshot) {
        this.match = null;
        this.matchInfo = null;
        this.pendingKoikoi = null;
        this.roundResult = null;
        return;
      }

      this.matchInfo = snapshot.match ?? null;
      this.pendingKoikoi = snapshot.pendingKoikoi ?? null;
      this.roundResult = snapshot.roundResult ?? null;

      const playerView = snapshot.player
        ? { ...snapshot.player, selectedCardId: this.selectedHandId }
        : null;
      const fieldView = snapshot.field
        ? { ...snapshot.field, selectedCardId: this.selectedFieldId }
        : { drawPile: 0, discard: [], cards: [] };

      this.match = {
        status: snapshot.status,
        opponent: snapshot.opponent,
        player: playerView,
        field: fieldView,
        actions: defaultActions(),
        meta: snapshot.meta ?? {}
      };

      this.match.actions.logs = previousLogs;
      this._pushBatchLogs(snapshot.logs ?? [], { reset: resetLogs });
      this.cpuDelay = snapshot.meta?.cpuThinkDelay ?? this.cpuDelay;
      this._refreshActions();
      this._scheduleCpuAdvance();
    },
    clearSelections() {
      this.selectedHandId = null;
      this.selectedFieldId = null;
      this.selectableHandIds = [];
      this.selectableFieldIds = [];
      if (this.match?.player) {
        this.match.player.selectedCardId = null;
      }
      if (this.match?.field) {
        this.match.field.selectedCardId = null;
      }
      this._refreshActions();
      this._scheduleCpuAdvance();
    },
    async selectHandCard(card) {
      if (!this.match || !card) {
        return;
      }

      if (this.pendingKoikoi) {
        this.addLog('コイコイの選択中は手札を操作できません。', 'warning');
        return;
      }

      if (!this._isPlayerTurn()) {
        this.addLog('現在はあなたの手番ではありません。', 'warning');
        return;
      }

      if (this.selectableHandIds.length && !this.selectableHandIds.includes(card.id)) {
        this.addLog(`${card.name} は選択できません。`, 'error');
        return;
      }

      if (this.selectedHandId === card.id) {
        this.selectedHandId = null;
        this.selectableHandIds = [];
        this.selectableFieldIds = [];
        this.selectedFieldId = null;
        if (this.match?.player) {
          this.match.player.selectedCardId = null;
        }
        if (this.match?.field) {
          this.match.field.selectedCardId = null;
        }
        this._refreshActions();
        return;
      }

      this.selectedHandId = card.id;
      if (this.match.player) {
        this.match.player.selectedCardId = card.id;
      }

      let selectable = [];
      try {
        selectable = await this._loadSelectableField(card.id);
      } catch (err) {
        this.addLog('場札候補の取得に失敗しました。', 'error');
      }

      this.selectableFieldIds = selectable;

      if (selectable.length === 0) {
        this.selectedFieldId = null;
        if (this.match.field) {
          this.match.field.selectedCardId = null;
        }
      } else if (this.selectedFieldId && !selectable.includes(this.selectedFieldId)) {
        this.selectedFieldId = null;
        if (this.match.field) {
          this.match.field.selectedCardId = null;
        }
      }

      this._refreshActions();
    },
    async selectFieldCard(card) {
      if (!this.match || !card) {
        return;
      }

      if (this.pendingKoikoi) {
        this.addLog('コイコイの選択中は場札を操作できません。', 'warning');
        return;
      }

      if (!this._isPlayerTurn()) {
        this.addLog('現在はあなたの手番ではありません。', 'warning');
        return;
      }

      if (!this.selectedHandId) {
        let handOptions = [];
        try {
          handOptions = await this._loadSelectableHand(card.id);
        } catch (err) {
          this.addLog('手札候補の取得に失敗しました。', 'error');
          return;
        }

        this.selectableHandIds = handOptions;
        this.selectableFieldIds = [card.id];
        this.selectedFieldId = card.id;
        if (this.match.field) {
          this.match.field.selectedCardId = card.id;
        }

        if (!handOptions.length) {
          this.addLog(`${card.name} に対応する手札がありません。`, 'error');
        }
        this._refreshActions();
        return;
      }

      if (this.selectableFieldIds.length && !this.selectableFieldIds.includes(card.id)) {
        this.addLog(`${card.name} は選択できません。`, 'error');
        return;
      }

      if (this.selectedFieldId === card.id) {
        this.selectedFieldId = null;
        if (this.match.field) {
          this.match.field.selectedCardId = null;
        }
        if (!this.selectedHandId) {
          this.selectableFieldIds = [];
          this.selectableHandIds = [];
        }
        this._refreshActions();
        return;
      }

      this.selectedFieldId = card.id;
      if (this.match.field) {
        this.match.field.selectedCardId = card.id;
      }
      this._refreshActions();
    },
    async handleAction(action) {
      switch (action.key) {
        case 'play-card':
          return this.playSelectedCards();
        case 'koikoi-continue':
          return this.resolveKoikoi('continue');
        case 'koikoi-stop':
          return this.resolveKoikoi('stop');
        case 'start-next-round':
          return this.startNextRound();
        case 'view-rules':
          return 'view-rules';
        default:
          return null;
      }
    },
    async playSelectedCards() {
      if (!this.match) {
        return;
      }

      if (this.pendingKoikoi) {
        this.addLog('コイコイの選択中はカードを出せません。', 'error');
        return;
      }

      if (!this._isPlayerTurn()) {
        this.addLog('現在はあなたの手番ではありません。', 'error');
        return;
      }

      if (!this.selectedHandId) {
        this.addLog('手札を選択してください。', 'error');
        return;
      }

      if (this.selectableFieldIds.length > 0 && !this.selectedFieldId) {
        this.addLog('組み合わせる場札を選択してください。', 'error');
        return;
      }

      try {
        const result = await playCards(this.selectedHandId, this.selectedFieldId ?? null);
        await this.applyBackendState(result.state);
        this.clearSelections();
        return 'play-card';
      } catch (err) {
        this.addLog('カードのプレイに失敗しました。', 'error');
      }
    },
    async resolveKoikoi(decisionKey) {
      if (!this.pendingKoikoi) {
        this.addLog('コイコイを選択できる状態ではありません。', 'error');
        return;
      }

      const decision = decisionKey === 'continue' ? 'continue' : 'stop';

      try {
        const result = await resolveKoikoiRemote(decision);
        await this.applyBackendState(result.state);
        this.clearSelections();
        return decision === 'continue' ? 'koikoi-continue' : 'koikoi-stop';
      } catch (err) {
        this.addLog('コイコイの処理に失敗しました。', 'error');
      }
    },
    async startNextRound() {
      try {
        const result = await startNextRoundRemote();
        await this.applyBackendState(result.state, { resetLogs: false });
        this.clearSelections();
        return 'start-next-round';
      } catch (err) {
        this.addLog('次の局を開始できませんでした。', 'error');
      }
    },
    addLog(message, variant = 'info') {
      this._appendLog(message, variant);
    },
    _appendLog(message, variant = 'info') {
      if (!this.match || !message) {
        return;
      }
      this.match.actions.logs.unshift(createLogEntry(message, variant));
      if (this.match.actions.logs.length > MAX_LOGS) {
        this.match.actions.logs.length = MAX_LOGS;
      }
    },
    _pushBatchLogs(logs = [], { reset = false } = {}) {
      if (!this.match) {
        return;
      }
      if (reset) {
        this.match.actions.logs = [];
      }
      for (const entry of logs) {
        if (!entry || !entry.message) {
          continue;
        }
        this._appendLog(entry.message, entry.variant ?? 'info');
      }
    },
    _refreshActions() {
      if (!this.match) {
        return;
      }

      if (this.match.player) {
        this.match.player.selectedCardId = this.selectedHandId ?? null;
      }
      if (this.match.field) {
        this.match.field.selectedCardId = this.selectedFieldId ?? null;
      }

      const primary = [];
      const secondary = [
        { key: 'view-rules', label: 'ルールを見る', variant: 'secondary', disabled: false }
      ];

      const roundFinished = Boolean(this.roundResult);
      const matchFinished = Boolean(this.matchInfo?.isFinished);
      const pending = this.pendingKoikoi;

      if (pending) {
        if (pending.playerId === this.match.player?.id) {
          primary.push({ key: 'koikoi-continue', label: 'コイコイする', variant: 'warning', disabled: false });
          primary.push({ key: 'koikoi-stop', label: '上がる', variant: 'success', disabled: false });
        } else {
          const label = `${pending.playerName ?? '相手'}がコイコイ判定中`;
          primary.push({ key: 'koikoi-wait', label, variant: 'secondary', disabled: true });
        }
      } else if (roundFinished) {
        if (matchFinished) {
          primary.push({ key: 'match-complete', label: '対局終了', variant: 'secondary', disabled: true });
        } else {
          primary.push({ key: 'start-next-round', label: '次の局を始める', variant: 'primary', disabled: false });
        }
      } else {
        const canPlay = this._canPlayCard();
        const label = this._buildPlayLabel();
        primary.push({ key: 'play-card', label, variant: 'primary', disabled: !canPlay });
      }

      this.match.actions.primary = primary;
      this.match.actions.secondary = secondary;
    },
    _scheduleCpuAdvance() {
      if (!this.match) {
        this._clearCpuTimer();
        return;
      }

      const meta = this.match.meta ?? {};
      const shouldWait = !meta.matchFinished && !this.pendingKoikoi && !meta.isPlayerTurn;

      if (this.sceneKey !== 'Game' || !shouldWait) {
        this._clearCpuTimer();
        return;
      }

      if (this.cpuTimer) {
        return;
      }

      const delay = Math.max(0, this.cpuDelay ?? 1000);
      this.cpuTimer = setTimeout(async () => {
        this.cpuTimer = null;
        try {
          const result = await advanceCpuTurnRemote();
          await this.applyBackendState(result.state);
          this._pushBatchLogs(result.logs ?? []);
          this._scheduleCpuAdvance();
        } catch (err) {
          this.addLog('CPU の処理に失敗しました。', 'error');
        }
      }, delay);
    },
    _clearCpuTimer() {
      if (this.cpuTimer) {
        clearTimeout(this.cpuTimer);
        this.cpuTimer = null;
      }
    },
    _canPlayCard() {
      if (!this.match || !this.match.player) {
        return false;
      }
      if (this.pendingKoikoi || this.roundResult) {
        return false;
      }
      if (!this._isPlayerTurn()) {
        return false;
      }
      if (!this.selectedHandId) {
        return false;
      }
      if (this.selectableFieldIds.length > 0 && !this.selectedFieldId) {
        return false;
      }
      return true;
    },
    _buildPlayLabel() {
      if (!this.match?.player || !this.selectedHandId) {
        return '手札を出す';
      }

      return '手札を出す';
    },
    _getHandCardById(cardId) {
      return this.match?.player?.hand?.find((card) => card.id === cardId) ?? null;
    },
    _getFieldCardById(cardId) {
      return this.match?.field?.cards?.find((card) => card.id === cardId) ?? null;
    },
    _isPlayerTurn() {
      return this.match?.meta?.isPlayerTurn === true;
    },
    async _loadSelectableField(cardId) {
      return fetchSelectableFieldCards(cardId);
    },
    async _loadSelectableHand(cardId) {
      return fetchSelectableHandCards(cardId);
    }
  }
});
