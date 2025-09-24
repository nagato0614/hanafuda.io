<script setup>
import { reactive, ref } from 'vue';
import GameBoardView from './components/game/GameBoardView.vue';
import RuleModal from './components/modals/RuleModal.vue';
import { useUiStateStore } from './stores/uiState';
import { storeToRefs } from 'pinia';

const createCard = (id, name, asset, shortLabel, category) => ({
  id,
  name,
  shortLabel: shortLabel ?? name,
  image: `/assets/hanafuda/${asset}`,
  category
});

const catalog = {
  pineBright: createCard('01-light-crane', '松に鶴', '01-pine-bright.png', '松光', 'light'),
  pineRibbon: createCard('01-ribbon', '松の短冊', '01-pine-ribbon.png', '松短', 'ribbon'),
  pineChaff: createCard('01-chaff-a', '松のカス一', '01-pine-chaff-1.png', '松カス', 'chaff'),
  plumAnimal: createCard('02-animal-warbler', '梅に鶯', '02-plum-animal.png', '梅タネ', 'animal'),
  plumRibbon: createCard('02-ribbon-poetry', '梅の短冊', '02-plum-ribbon.png', '梅短', 'ribbon'),
  cherryBright: createCard('03-light-curtain', '桜に幕', '03-cherry-bright.png', '桜光', 'light'),
  cherryRibbon: createCard('03-ribbon-poetry', '桜の短冊', '03-cherry-ribbon.png', '桜短', 'ribbon'),
  wisteriaAnimal: createCard('04-animal-cuckoo', '藤に杜鵑', '04-wisteria-animal.png', '藤タネ', 'animal'),
  irisAnimal: createCard('05-animal-bridge', '菖蒲に八つ橋', '05-iris-animal.png', '菖蒲橋', 'animal'),
  peonyRibbon: createCard('06-ribbon-blue', '牡丹の青短', '06-peony-ribbon.png', '牡丹青', 'ribbon'),
  bushAnimal: createCard('07-animal-boar', '萩に猪', '07-bushclover-animal.png', '萩猪', 'animal'),
  bushRibbon: createCard('07-ribbon', '萩の短冊', '07-bushclover-ribbon.png', '萩短', 'ribbon'),
  pampasBright: createCard('08-light-moon', '芒に月', '08-pampas-bright.png', '月見', 'light'),
  pampasAnimal: createCard('08-animal-geese', '芒に雁', '08-pampas-animal.png', '芒雁', 'animal'),
  chrysanthemumRibbon: createCard('09-ribbon-blue', '菊の青短', '09-chrysanthemum-ribbon.png', '菊青', 'ribbon'),
  chrysanthemumChaff: createCard('09-chaff-a', '菊のカス一', '09-chrysanthemum-chaff-1.png', '菊カス', 'chaff'),
  mapleAnimal: createCard('10-animal-deer', '紅葉に鹿', '10-maple-animal.png', '紅葉鹿', 'animal'),
  willowBright: createCard('11-light-rainman', '柳に小野道風', '11-willow-bright.png', '雨四光', 'light'),
  willowChaff: createCard('11-chaff-lightning', '柳のカス', '11-willow-chaff.png', '柳カス', 'chaff'),
  paulowniaBright: createCard('12-light-phoenix', '桐に鳳凰', '12-paulownia-bright.png', '桐鳳凰', 'light'),
  paulowniaChaff: createCard('12-chaff-a', '桐のカス一', '12-paulownia-chaff-1.png', '桐カス', 'chaff')
};

const cloneCard = (card) => ({ ...card });

const uiState = useUiStateStore();
const { isRuleModalOpen } = storeToRefs(uiState);

const state = reactive({
  status: {
    monthLabel: '3月（桜）',
    phase: '手札選択',
    turnLabel: 'あなたの手番',
    timeRemaining: '45秒',
    koikoiLevel: 1
  },
  opponent: {
    id: 'cpu',
    name: 'CPU 花子',
    roleLabel: 'CPU',
    capturedTotal: 12,
    roundScore: 7,
    totalScore: 38,
    captured: [
      {
        key: 'light',
        label: '光札',
        cards: [cloneCard(catalog.pineBright), cloneCard(catalog.pampasBright), cloneCard(catalog.willowBright)]
      },
      {
        key: 'animal',
        label: 'タネ札',
        cards: [cloneCard(catalog.plumAnimal), cloneCard(catalog.bushAnimal), cloneCard(catalog.pampasAnimal)]
      },
      {
        key: 'ribbon',
        label: '短冊',
        cards: [cloneCard(catalog.plumRibbon), cloneCard(catalog.chrysanthemumRibbon)]
      },
      {
        key: 'chaff',
        label: 'カス',
        cards: []
      }
    ]
  },
  player: {
    id: 'player',
    name: 'プレイヤー',
    roleLabel: 'あなた',
    capturedTotal: 9,
    roundScore: 5,
    totalScore: 45,
    selectedCardId: null,
    hand: [
      catalog.cherryBright,
      catalog.irisAnimal,
      catalog.peonyRibbon,
      catalog.chrysanthemumChaff,
      catalog.mapleAnimal,
      catalog.willowChaff,
      catalog.paulowniaBright,
      catalog.paulowniaChaff
    ],
    captured: [
      {
        key: 'light',
        label: '光札',
        cards: [cloneCard(catalog.cherryBright), cloneCard(catalog.paulowniaBright)]
      },
      {
        key: 'animal',
        label: 'タネ札',
        cards: []
      },
      {
        key: 'ribbon',
        label: '短冊',
        cards: [cloneCard(catalog.cherryRibbon), cloneCard(catalog.peonyRibbon), cloneCard(catalog.bushRibbon)]
      },
      {
        key: 'chaff',
        label: 'カス',
        cards: [cloneCard(catalog.chrysanthemumChaff), cloneCard(catalog.paulowniaChaff)]
      }
    ]
  },
  field: {
    drawPile: 18,
    discard: [catalog.pineChaff],
    selectedCardId: null,
    cards: [
      cloneCard(catalog.pineRibbon),
      cloneCard(catalog.plumAnimal),
      cloneCard(catalog.cherryRibbon),
      cloneCard(catalog.wisteriaAnimal),
      cloneCard(catalog.irisAnimal),
      cloneCard(catalog.peonyRibbon),
      cloneCard(catalog.bushRibbon),
      cloneCard(catalog.pampasAnimal)
    ]
  },
  actions: {
    primary: [
      { key: 'play-card', label: '手札を出す', variant: 'primary', disabled: true },
      { key: 'call-koikoi', label: 'コイコイ宣言', variant: 'warning', disabled: false }
    ],
    secondary: [
      { key: 'view-rules', label: 'ルールを見る', variant: 'secondary', disabled: false },
      { key: 'end-turn', label: 'ターンを終了', variant: 'secondary', disabled: false }
    ],
    logs: [
      { id: 'log-3', time: '00:12', message: 'CPU 花子が「紅葉に鹿」を獲得。', variant: 'info' },
      { id: 'log-2', time: '00:09', message: 'あなたが「桜に幕」を獲得。', variant: 'info' },
      { id: 'log-1', time: '00:05', message: '山札から「柳のカス」を引きました。', variant: 'info' }
    ]
  }
});

const activeScene = ref(null);
const activeSceneKey = ref('');

const CAPTURED_LABELS = {
  light: '光札',
  animal: 'タネ札',
  ribbon: '短冊',
  chaff: 'カス',
  others: 'その他'
};

const pushLog = (message, variant = 'info') => {
  state.actions.logs.unshift({
    id: `log-${Date.now()}`,
    time: new Date().toLocaleTimeString('ja-JP', { hour12: false }).slice(0, 5),
    message,
    variant
  });
};

const addCapturedCard = (playerState, card) => {
  const key = card.category ?? 'others';
  let bucket = playerState.captured.find((entry) => entry.key === key);

  if (!bucket) {
    bucket = {
      key,
      label: CAPTURED_LABELS[key] ?? CAPTURED_LABELS.others,
      cards: []
    };
    playerState.captured.push(bucket);
  }

  bucket.cards.push(card);
};

const handleSceneReady = (scene) => {
  activeScene.value = scene;
  activeSceneKey.value = scene?.scene?.key ?? '';
};

const handleSelectCard = (card) => {
  const playAction = state.actions.primary.find((action) => action.key === 'play-card');

  if (state.player.selectedCardId === card.id) {
    state.player.selectedCardId = null;
    state.field.selectedCardId = null;
    state.status.phase = '手札選択';

    if (playAction) {
      playAction.disabled = true;
      playAction.label = '手札を出す';
    }

    return;
  }

  state.player.selectedCardId = card.id;
  state.field.selectedCardId = null;
  state.status.phase = `${card.name} を選択中 - 場札を選択してください`;

  if (playAction) {
    playAction.disabled = true;
    playAction.label = `${card.name} を出す`;
  }

  pushLog(`${card.name} を選択しました。`, 'info');
};

const handleSelectFieldCard = (card) => {
  if (!state.player.selectedCardId) {
    pushLog('先に手札を選択してください。', 'error');
    return;
  }

  const selectedHand = state.player.hand.find((handCard) => handCard.id === state.player.selectedCardId);

  if (!selectedHand) {
    pushLog('選択中の手札が見つかりません。', 'error');
    return;
  }

  const playAction = state.actions.primary.find((action) => action.key === 'play-card');

  if (state.field.selectedCardId === card.id) {
    state.field.selectedCardId = null;
    state.status.phase = `${selectedHand.name} を選択中 - 場札を選択してください`;

    if (playAction) {
      playAction.disabled = true;
      playAction.label = `${selectedHand.name} を出す`;
    }

    return;
  }

  state.field.selectedCardId = card.id;
  state.status.phase = `${selectedHand.name} と ${card.name} を組み合わせます - 「手札を出す」を押してください`;

  if (playAction) {
    playAction.disabled = false;
    playAction.label = `${selectedHand.name} と ${card.name} を出す`;
  }
};

const handleAction = (action) => {
  switch (action.key) {
    case 'play-card': {
      if (!state.player.selectedCardId) {
        pushLog('手札を選択してください。', 'error');
        return;
      }

      if (!state.field.selectedCardId) {
        pushLog('場札を選択してください。', 'error');
        return;
      }

      const handIndex = state.player.hand.findIndex((card) => card.id === state.player.selectedCardId);
      if (handIndex === -1) {
        pushLog('選択中の手札が見つかりません。', 'error');
        return;
      }

      const fieldIndex = state.field.cards.findIndex((card) => card.id === state.field.selectedCardId);
      if (fieldIndex === -1) {
        pushLog('選択中の場札が見つかりません。', 'error');
        return;
      }

      const handCard = state.player.hand.splice(handIndex, 1)[0];
      const fieldCard = state.field.cards.splice(fieldIndex, 1)[0];

      addCapturedCard(state.player, handCard);
      addCapturedCard(state.player, fieldCard);

      state.player.capturedTotal += 2;
      state.player.roundScore += 1;

      state.status.phase = '手札選択';
      state.player.selectedCardId = null;
      state.field.selectedCardId = null;

      action.disabled = true;
      action.label = '手札を出す';

      pushLog(`${handCard.name} と ${fieldCard.name} を獲得しました。`, 'success');
      break;
    }
    case 'call-koikoi':
      pushLog('コイコイを宣言しました（モック）。', 'info');
      state.status.koikoiLevel += 1;
      break;
    case 'view-rules':
      uiState.showRuleModal();
      break;
    case 'end-turn':
      pushLog('ターンを終了しました（モック）。', 'info');
      state.player.selectedCardId = null;
      state.field.selectedCardId = null;
      state.status.phase = '手札選択';
      state.actions.primary.forEach((primaryAction) => {
        if (primaryAction.key === 'play-card') {
          primaryAction.disabled = true;
          primaryAction.label = '手札を出す';
        }
      });
      state.status.turnLabel = state.status.turnLabel === 'あなたの手番' ? 'CPU 花子の手番' : 'あなたの手番';
      break;
    default:
      pushLog(`${action.label} をクリックしました。`, 'info');
  }
};

const handleStartGame = () => {
  if (activeScene.value && typeof activeScene.value.changeScene === 'function') {
    activeScene.value.changeScene();
  }
};
</script>

<template>
  <GameBoardView
    :state="state"
    @scene-ready="handleSceneReady"
    @select-card="handleSelectCard"
    @select-field-card="handleSelectFieldCard"
    @action="handleAction"
    @start-game="handleStartGame"
    :scene-key="activeSceneKey"
  />

  <RuleModal
    v-if="isRuleModalOpen"
    @close="uiState.hideRuleModal()"
  />
</template>
