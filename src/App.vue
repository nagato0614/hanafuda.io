<script setup>
import { reactive, ref } from 'vue';
import GameBoardView from './components/game/GameBoardView.vue';

const createCard = (id, name, asset, shortLabel) => ({
  id,
  name,
  shortLabel: shortLabel ?? name,
  image: `/assets/hanafuda/${asset}`
});

const catalog = {
  pineBright: createCard('01-light-crane', '松に鶴', '01-pine-bright.png', '松光'),
  pineRibbon: createCard('01-ribbon', '松の短冊', '01-pine-ribbon.png', '松短'),
  pineChaff: createCard('01-chaff-a', '松のカス一', '01-pine-chaff-1.png', '松カス'),
  plumAnimal: createCard('02-animal-warbler', '梅に鶯', '02-plum-animal.png', '梅タネ'),
  plumRibbon: createCard('02-ribbon-poetry', '梅の短冊', '02-plum-ribbon.png', '梅短'),
  cherryBright: createCard('03-light-curtain', '桜に幕', '03-cherry-bright.png', '桜光'),
  cherryRibbon: createCard('03-ribbon-poetry', '桜の短冊', '03-cherry-ribbon.png', '桜短'),
  wisteriaAnimal: createCard('04-animal-cuckoo', '藤に杜鵑', '04-wisteria-animal.png', '藤タネ'),
  irisAnimal: createCard('05-animal-bridge', '菖蒲に八つ橋', '05-iris-animal.png', '菖蒲橋'),
  peonyRibbon: createCard('06-ribbon-blue', '牡丹の青短', '06-peony-ribbon.png', '牡丹青'),
  bushAnimal: createCard('07-animal-boar', '萩に猪', '07-bushclover-animal.png', '萩猪'),
  bushRibbon: createCard('07-ribbon', '萩の短冊', '07-bushclover-ribbon.png', '萩短'),
  pampasBright: createCard('08-light-moon', '芒に月', '08-pampas-bright.png', '月見'),
  pampasAnimal: createCard('08-animal-geese', '芒に雁', '08-pampas-animal.png', '芒雁'),
  chrysanthemumRibbon: createCard('09-ribbon-blue', '菊の青短', '09-chrysanthemum-ribbon.png', '菊青'),
  chrysanthemumChaff: createCard('09-chaff-a', '菊のカス一', '09-chrysanthemum-chaff-1.png', '菊カス'),
  mapleAnimal: createCard('10-animal-deer', '紅葉に鹿', '10-maple-animal.png', '紅葉鹿'),
  willowBright: createCard('11-light-rainman', '柳に小野道風', '11-willow-bright.png', '雨四光'),
  willowChaff: createCard('11-chaff-lightning', '柳のカス', '11-willow-chaff.png', '柳カス'),
  paulowniaBright: createCard('12-light-phoenix', '桐に鳳凰', '12-paulownia-bright.png', '桐鳳凰'),
  paulowniaChaff: createCard('12-chaff-a', '桐のカス一', '12-paulownia-chaff-1.png', '桐カス')
};

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
    capturedTotal: 12,
    roundScore: 7,
    totalScore: 38,
    captured: [
      {
        key: 'light',
        label: '光札',
        cards: [catalog.pineBright, catalog.pampasBright, catalog.willowBright]
      },
      {
        key: 'animal',
        label: 'タネ札',
        cards: [catalog.plumAnimal, catalog.bushAnimal, catalog.pampasAnimal]
      },
      {
        key: 'ribbon',
        label: '短冊',
        cards: [catalog.plumRibbon, catalog.chrysanthemumRibbon]
      }
    ]
  },
  player: {
    id: 'player',
    name: 'プレイヤー',
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
        cards: [catalog.cherryBright, catalog.paulowniaBright]
      },
      {
        key: 'ribbon',
        label: '短冊',
        cards: [catalog.cherryRibbon, catalog.peonyRibbon, catalog.bushRibbon]
      },
      {
        key: 'chaff',
        label: 'カス',
        cards: [catalog.chrysanthemumChaff, catalog.paulowniaChaff]
      }
    ]
  },
  field: {
    drawPile: 18,
    discard: [catalog.pineChaff],
    slots: [
      {
        month: 1,
        label: '1月 松',
        cards: [catalog.pineRibbon, catalog.pineChaff]
      },
      {
        month: 2,
        label: '2月 梅',
        cards: [catalog.plumAnimal]
      },
      {
        month: 3,
        label: '3月 桜',
        cards: [catalog.cherryRibbon]
      },
      {
        month: 4,
        label: '4月 藤',
        cards: [catalog.wisteriaAnimal]
      },
      {
        month: 7,
        label: '7月 萩',
        cards: [catalog.bushRibbon]
      },
      {
        month: 8,
        label: '8月 芒',
        cards: [catalog.pampasAnimal]
      }
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
      { id: 'log-3', time: '00:12', message: 'CPU 花子が「紅葉に鹿」を獲得。' },
      { id: 'log-2', time: '00:09', message: 'あなたが「桜に幕」を獲得。' },
      { id: 'log-1', time: '00:05', message: '山札から「柳のカス」を引きました。' }
    ]
  }
});

const activeScene = ref(null);

const pushLog = (message) => {
  state.actions.logs.unshift({
    id: `log-${Date.now()}`,
    time: new Date().toLocaleTimeString('ja-JP', { hour12: false }).slice(0, 5),
    message
  });

  if (state.actions.logs.length > 8) {
    state.actions.logs.pop();
  }
};

const handleSceneReady = (scene) => {
  activeScene.value = scene;
};

const handleSelectCard = (card) => {
  state.player.selectedCardId = card.id;
  state.status.phase = `${card.name} を選択中`;
  const playAction = state.actions.primary.find((action) => action.key === 'play-card');

  if (playAction) {
    playAction.disabled = false;
    playAction.label = `${card.name} を出す`;
  }

  pushLog(`${card.name} を選択しました。`);
};

const handleAction = (action) => {
  switch (action.key) {
    case 'play-card':
      if (!state.player.selectedCardId) {
        pushLog('出す札を選択してください。');
        return;
      }
      pushLog(`${action.label}（モック）`);
      state.player.selectedCardId = null;
      state.status.phase = '手札選択';
      action.disabled = true;
      action.label = '手札を出す';
      break;
    case 'call-koikoi':
      pushLog('コイコイを宣言しました（モック）。');
      state.status.koikoiLevel += 1;
      break;
    case 'view-rules':
      pushLog('ルール表示（モック）。');
      break;
    case 'end-turn':
      pushLog('ターンを終了しました（モック）。');
      state.status.turnLabel = state.status.turnLabel === 'あなたの手番' ? 'CPU 花子の手番' : 'あなたの手番';
      break;
    default:
      pushLog(`${action.label} をクリックしました。`);
  }
};
</script>

<template>
  <GameBoardView
    :state="state"
    @scene-ready="handleSceneReady"
    @select-card="handleSelectCard"
    @action="handleAction"
  />
</template>
