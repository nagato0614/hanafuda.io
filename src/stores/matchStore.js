import { defineStore } from 'pinia';
import {
  fetchGameState,
  fetchSelectableFieldCards,
  fetchSelectableHandCards,
  playCards
} from '../backend/gameBackend.js';

const defaultActions = () => ({
  primary: [
    { key: 'play-card', label: '手札を出す', variant: 'primary', disabled: true },
    { key: 'call-koikoi', label: 'コイコイ宣言', variant: 'warning', disabled: false }
  ],
  secondary: [
    { key: 'view-rules', label: 'ルールを見る', variant: 'secondary', disabled: false },
    { key: 'end-turn', label: 'ターンを終了', variant: 'secondary', disabled: false }
  ],
  logs: []
});

const getPlayAction = (match) => match?.actions.primary.find((action) => action.key === 'play-card');

export const useMatchStore = defineStore('match', {
  state: () => ({
    match: null,
    loading: false,
    error: null,
    selectedHandId: null,
    selectedFieldId: null,
    selectableHandIds: [],
    selectableFieldIds: [],
    sceneKey: 'MainMenu'
  }),
  getters: {
    hasMatch: (state) => Boolean(state.match)
  },
  actions: {
    async loadInitialState() {
      this.loading = true;
      this.error = null;
      try {
        const data = await fetchGameState();
        this.applyBackendState(data, { resetLogs: true });
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
    applyBackendState(backendData, { resetLogs = false } = {}) {
      const existingLogs = resetLogs
        ? [...(backendData.logs ?? [])]
        : [...(this.match?.actions.logs ?? []), ...(backendData.logs ?? [])];

      this.match = {
        status: backendData.status,
        opponent: backendData.opponent,
        player: {
          ...backendData.player,
          selectedCardId: this.selectedHandId
        },
        field: {
          ...backendData.field,
          selectedCardId: this.selectedFieldId
        },
        actions: {
          ...defaultActions(),
          logs: existingLogs.slice(0, 50) // keep recent logs only
        }
      };
    },
    addLog(message, variant = 'info') {
      if (!this.match) {
        return;
      }
      this.match.actions.logs.unshift({
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('ja-JP', { hour12: false }).slice(0, 5),
        message,
        variant
      });
      if (this.match.actions.logs.length > 50) {
        this.match.actions.logs.pop();
      }
    },
    setPhase(text) {
      if (this.match) {
        this.match.status.phase = text;
      }
    },
    updatePlayAction({ disabled, label }) {
      const playAction = getPlayAction(this.match);
      if (playAction) {
        playAction.disabled = disabled;
        if (label) {
          playAction.label = label;
        }
      }
    },
    clearSelections() {
      this.selectedHandId = null;
      this.selectedFieldId = null;
      this.selectableHandIds = [];
      this.selectableFieldIds = [];
      if (this.match) {
        this.match.player.selectedCardId = null;
        this.match.field.selectedCardId = null;
      }
      this.updatePlayAction({ disabled: true, label: '手札を出す' });
      this.setPhase('手札選択');
    },
    async selectHandCard(card) {
      if (!this.match) {
        return;
      }

      if (this.selectableHandIds.length && !this.selectableHandIds.includes(card.id)) {
        this.addLog(`${card.name} は選択できません。`, 'error');
        return;
      }

      if (this.selectedHandId === card.id) {
        this.clearSelections();
        return;
      }

      const hadFieldSelection = Boolean(this.selectedFieldId);

      this.selectedHandId = card.id;
      this.match.player.selectedCardId = card.id;
      if (!hadFieldSelection) {
        this.selectedFieldId = null;
        this.match.field.selectedCardId = null;
      }
      this.selectableHandIds = [];

      let selectable = [];
      try {
        selectable = await fetchSelectableFieldCards(card.id);
      } catch (err) {
        this.addLog('場札候補の取得に失敗しました。', 'error');
      }

      this.selectableFieldIds = selectable;

      if (!selectable.length) {
        this.updatePlayAction({ disabled: true, label: `${card.name} を出す` });
        this.setPhase(`${card.name} を選択中（組み合わせ可能な場札なし）`);
        this.addLog(`${card.name} に対応する場札がありません。`, 'error');
        return;
      }

      if (hadFieldSelection && this.selectedFieldId) {
        if (!selectable.includes(this.selectedFieldId)) {
          this.selectedFieldId = null;
          this.match.field.selectedCardId = null;
          this.updatePlayAction({ disabled: true, label: `${card.name} を出す` });
          this.setPhase(`${card.name} を選択中 - 場札を選択してください`);
        } else {
          const fieldCard = this.match.field.cards.find((item) => item.id === this.selectedFieldId);
          if (fieldCard) {
            this.updatePlayAction({
              disabled: false,
              label: `${card.name} と ${fieldCard.name} を出す`
            });
            this.setPhase(`${card.name} と ${fieldCard.name} を組み合わせます - 「手札を出す」を押してください`);
          }
        }
      } else {
        this.updatePlayAction({ disabled: true, label: `${card.name} を出す` });
        this.setPhase(`${card.name} を選択中 - 場札を選択してください`);
      }

      this.addLog(`${card.name} を選択しました。`, 'info');
    },
    async selectFieldCard(card) {
      if (!this.match) {
        return;
      }

      if (!this.selectedHandId) {
        let handOptions = [];
        try {
          handOptions = await fetchSelectableHandCards(card.id);
        } catch (err) {
          this.addLog('手札候補の取得に失敗しました。', 'error');
          return;
        }

        this.selectableHandIds = handOptions;
        this.selectableFieldIds = [card.id];
        this.selectedFieldId = card.id;
        this.match.field.selectedCardId = card.id;

        if (!handOptions.length) {
          this.addLog(`${card.name} に対応する手札がありません。`, 'error');
          this.setPhase(`${card.name} を選択中（組み合わせ可能な手札なし）`);
          return;
        }

        this.addLog(`${card.name} を選択しました。`, 'info');
        this.setPhase(`${card.name} を選択中 - 手札を選択してください`);
        return;
      }

      if (this.selectableFieldIds.length && !this.selectableFieldIds.includes(card.id)) {
        this.addLog(`${card.name} は選択できません。`, 'error');
        return;
      }

      if (this.selectedFieldId === card.id) {
        this.selectedFieldId = null;
        this.match.field.selectedCardId = null;
        this.updatePlayAction({ disabled: true });
        this.setPhase('手札選択');
        return;
      }

      this.selectedFieldId = card.id;
      this.match.field.selectedCardId = card.id;
      this.selectableFieldIds = [card.id];

      const handCard = this.match.player.hand.find((item) => item.id === this.selectedHandId);
      if (handCard) {
        this.updatePlayAction({ disabled: false, label: `${handCard.name} と ${card.name} を出す` });
        this.setPhase(`${handCard.name} と ${card.name} を組み合わせます - 「手札を出す」を押してください`);
      }
    },
    async handleAction(action) {
      switch (action.key) {
        case 'play-card':
          return this.playSelectedCards();
        case 'call-koikoi':
          this.addLog('コイコイを宣言しました（モック）。', 'info');
          if (this.match) {
            this.match.status.koikoiLevel += 1;
          }
          return 'call-koikoi';
        case 'view-rules':
          return 'view-rules';
        case 'end-turn':
          this.addLog('ターンを終了しました（モック）。', 'info');
          this.clearSelections();
          if (this.match) {
            this.match.status.turnLabel = this.match.status.turnLabel === 'あなたの手番'
              ? 'CPU 花子の手番'
              : 'あなたの手番';
          }
          return 'end-turn';
        default:
          return null;
      }
    },
    async playSelectedCards() {
      if (!this.selectedHandId || !this.selectedFieldId) {
        this.addLog('手札と場札を選択してください。', 'error');
        return;
      }

      try {
        const result = await playCards(this.selectedHandId, this.selectedFieldId);
        this.applyBackendState(result.state);
        if (result.log) {
          this.addLog(result.log.message, result.log.variant);
        }
        this.clearSelections();
        return 'play-card';
      } catch (err) {
        this.addLog('カードのプレイに失敗しました。', 'error');
      }
    }
  }
});
