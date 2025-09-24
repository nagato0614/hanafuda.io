const clone = (value) =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const CATEGORY_LABELS = {
  light: '光札',
  animal: 'タネ札',
  ribbon: '短冊',
  chaff: 'カス',
  others: 'その他'
};

const createCard = ({
  month,
  type,
  name,
  asset,
  shortLabel,
  category
}) => ({
  id: `${String(month).padStart(2, '0')}-${category}-${type}`,
  month,
  name,
  shortLabel,
  category,
  image: `/assets/hanafuda/${asset}`
});

const initialState = () => ({
  matchId: 'mock-match',
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
        label: CATEGORY_LABELS.light,
        cards: [
          createCard({
            month: 1,
            type: 'bright',
            name: '松に鶴',
            asset: '01-pine-bright.png',
            shortLabel: '松光',
            category: 'light'
          }),
          createCard({
            month: 8,
            type: 'bright',
            name: '芒に月',
            asset: '08-pampas-bright.png',
            shortLabel: '月見',
            category: 'light'
          }),
          createCard({
            month: 11,
            type: 'bright',
            name: '柳に小野道風',
            asset: '11-willow-bright.png',
            shortLabel: '雨四光',
            category: 'light'
          })
        ]
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
    hand: [
      createCard({
        month: 3,
        type: 'bright',
        name: '桜に幕',
        asset: '03-cherry-bright.png',
        shortLabel: '桜光',
        category: 'light'
      }),
      createCard({
        month: 5,
        type: 'animal',
        name: '菖蒲に八つ橋',
        asset: '05-iris-animal.png',
        shortLabel: '菖蒲橋',
        category: 'animal'
      }),
      createCard({
        month: 6,
        type: 'ribbon',
        name: '牡丹の青短',
        asset: '06-peony-ribbon.png',
        shortLabel: '牡丹青',
        category: 'ribbon'
      }),
      createCard({
        month: 9,
        type: 'chaff-a',
        name: '菊のカス一',
        asset: '09-chrysanthemum-chaff-1.png',
        shortLabel: '菊カス',
        category: 'chaff'
      }),
      createCard({
        month: 10,
        type: 'animal',
        name: '紅葉に鹿',
        asset: '10-maple-animal.png',
        shortLabel: '紅葉鹿',
        category: 'animal'
      }),
      createCard({
        month: 11,
        type: 'chaff',
        name: '柳のカス',
        asset: '11-willow-chaff.png',
        shortLabel: '柳カス',
        category: 'chaff'
      }),
      createCard({
        month: 12,
        type: 'bright',
        name: '桐に鳳凰',
        asset: '12-paulownia-bright.png',
        shortLabel: '桐鳳凰',
        category: 'light'
      }),
      createCard({
        month: 12,
        type: 'chaff-a',
        name: '桐のカス一',
        asset: '12-paulownia-chaff-1.png',
        shortLabel: '桐カス',
        category: 'chaff'
      })
    ],
    captured: [
      {
        key: 'light',
        label: CATEGORY_LABELS.light,
        cards: [
          createCard({
            month: 3,
            type: 'bright',
            name: '桜に幕',
            asset: '03-cherry-bright.png',
            shortLabel: '桜光',
            category: 'light'
          }),
          createCard({
            month: 12,
            type: 'bright',
            name: '桐に鳳凰',
            asset: '12-paulownia-bright.png',
            shortLabel: '桐鳳凰',
            category: 'light'
          })
        ]
      }
    ]
  },
  field: {
    drawPile: 18,
    discard: [createCard({
      month: 1,
      type: 'chaff-a',
      name: '松のカス一',
      asset: '01-pine-chaff-1.png',
      shortLabel: '松カス',
      category: 'chaff'
    })],
    cards: [
      createCard({
        month: 1,
        type: 'ribbon',
        name: '松の短冊',
        asset: '01-pine-ribbon.png',
        shortLabel: '松短',
        category: 'ribbon'
      }),
      createCard({
        month: 2,
        type: 'animal',
        name: '梅に鶯',
        asset: '02-plum-animal.png',
        shortLabel: '梅タネ',
        category: 'animal'
      }),
      createCard({
        month: 3,
        type: 'ribbon',
        name: '桜の短冊',
        asset: '03-cherry-ribbon.png',
        shortLabel: '桜短',
        category: 'ribbon'
      }),
      createCard({
        month: 4,
        type: 'animal',
        name: '藤に杜鵑',
        asset: '04-wisteria-animal.png',
        shortLabel: '藤タネ',
        category: 'animal'
      }),
      createCard({
        month: 7,
        type: 'ribbon',
        name: '萩の短冊',
        asset: '07-bushclover-ribbon.png',
        shortLabel: '萩短',
        category: 'ribbon'
      }),
      createCard({
        month: 8,
        type: 'animal',
        name: '芒に雁',
        asset: '08-pampas-animal.png',
        shortLabel: '芒雁',
        category: 'animal'
      }),
      createCard({
        month: 9,
        type: 'chaff-a',
        name: '菊のカス一',
        asset: '09-chrysanthemum-chaff-1.png',
        shortLabel: '菊カス',
        category: 'chaff'
      }),
      createCard({
        month: 10,
        type: 'animal',
        name: '紅葉に鹿',
        asset: '10-maple-animal.png',
        shortLabel: '紅葉鹿',
        category: 'animal'
      })
    ],
    selectedCardId: null
  },
  logs: []
});

const backendState = initialState();

const formatTime = () => new Date().toLocaleTimeString('ja-JP', { hour12: false }).slice(0, 5);

const findCardById = (id, collections) => {
  for (const collection of collections) {
    const index = collection.findIndex((card) => card.id === id);
    if (index !== -1) {
      return { index, card: collection[index], collection };
    }
  }
  return null;
};

const addCaptured = (playerState, card) => {
  const key = card.category ?? 'others';
  let bucket = playerState.captured.find((entry) => entry.key === key);
  if (!bucket) {
    bucket = {
      key,
      label: CATEGORY_LABELS[key] ?? CATEGORY_LABELS.others,
      cards: []
    };
    playerState.captured.push(bucket);
  }
  bucket.cards.push(clone(card));
};

export async function fetchGameState() {
  return clone(backendState);
}

export async function fetchSelectableFieldCards(handCardId) {
  const match = findCardById(handCardId, [backendState.player.hand]);
  if (!match) {
    return [];
  }
  const month = match.card.month;
  return backendState.field.cards
    .filter((card) => card.month === month)
    .map((card) => card.id);
}

export async function fetchSelectableHandCards(fieldCardId) {
  const match = findCardById(fieldCardId, [backendState.field.cards]);
  if (!match) {
    return [];
  }
  const month = match.card.month;
  return backendState.player.hand
    .filter((card) => card.month === month)
    .map((card) => card.id);
}

export async function playCards(handCardId, fieldCardId) {
  const handMatch = findCardById(handCardId, [backendState.player.hand]);
  const fieldMatch = findCardById(fieldCardId, [backendState.field.cards]);

  if (!handMatch || !fieldMatch) {
    return {
      state: clone(backendState),
      log: { message: 'カードの組み合わせに失敗しました。', variant: 'error' }
    };
  }

  const [playedHand] = handMatch.collection.splice(handMatch.index, 1);
  const [playedField] = fieldMatch.collection.splice(fieldMatch.index, 1);

  addCaptured(backendState.player, playedHand);
  addCaptured(backendState.player, playedField);

  backendState.player.capturedTotal += 2;
  backendState.player.roundScore += 1;
  backendState.status.phase = '手札選択';
  backendState.status.turnLabel = backendState.status.turnLabel === 'あなたの手番'
    ? 'CPU 花子の手番'
    : 'あなたの手番';

  const logMessage = `${playedHand.name} と ${playedField.name} を獲得しました。`;

  return {
    state: clone(backendState),
    log: { message: logMessage, variant: 'success' }
  };
}

export function resetBackendState() {
  const fresh = initialState();
  Object.keys(backendState).forEach((key) => {
    backendState[key] = fresh[key];
  });
}
