export const MONTH_LABELS = Object.freeze({
  1: 'Pine',
  2: 'Plum',
  3: 'Cherry Blossom',
  4: 'Wisteria',
  5: 'Iris',
  6: 'Peony',
  7: 'Bush Clover',
  8: 'Pampas Grass',
  9: 'Chrysanthemum',
 10: 'Maple',
 11: 'Willow',
 12: 'Paulownia'
});

export const CARD_CATEGORIES = Object.freeze({
  LIGHT: 'light',
  ANIMAL: 'animal',
  RIBBON: 'ribbon',
  CHAFF: 'chaff'
});

export const RIBBON_COLORS = Object.freeze({
  RED: 'red',
  BLUE: 'blue',
  PLAIN: 'plain'
});

export const DEFAULT_POINTS_BY_CATEGORY = Object.freeze({
  [CARD_CATEGORIES.LIGHT]: 20,
  [CARD_CATEGORIES.ANIMAL]: 10,
  [CARD_CATEGORIES.RIBBON]: 5,
  [CARD_CATEGORIES.CHAFF]: 1
});

export const CARD_BLUEPRINTS = Object.freeze([
  {
    className: 'PineCraneCard',
    id: '01-light-crane',
    month: 1,
    name: '松に鶴',
    category: CARD_CATEGORIES.LIGHT,
    rarity: 'bright',
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.LIGHT],
    tags: ['matsu', 'pine', 'crane', 'bright']
  },
  {
    className: 'PinePoetryRibbonCard',
    id: '01-ribbon-poetry',
    month: 1,
    name: '松の赤短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.RED,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['matsu', 'pine', 'ribbon', 'akatan']
  },
  {
    className: 'PineChaffOneCard',
    id: '01-chaff-a',
    month: 1,
    name: '松のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['matsu', 'pine', 'chaff']
  },
  {
    className: 'PineChaffTwoCard',
    id: '01-chaff-b',
    month: 1,
    name: '松のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['matsu', 'pine', 'chaff']
  },
  {
    className: 'PlumWarblerCard',
    id: '02-animal-warbler',
    month: 2,
    name: '梅に鶯',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['ume', 'plum', 'warbler', 'uguisu', 'tane']
  },
  {
    className: 'PlumPoetryRibbonCard',
    id: '02-ribbon-poetry',
    month: 2,
    name: '梅の赤短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.RED,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['ume', 'plum', 'ribbon', 'akatan']
  },
  {
    className: 'PlumChaffOneCard',
    id: '02-chaff-a',
    month: 2,
    name: '梅のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['ume', 'plum', 'chaff']
  },
  {
    className: 'PlumChaffTwoCard',
    id: '02-chaff-b',
    month: 2,
    name: '梅のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['ume', 'plum', 'chaff']
  },
  {
    className: 'CherryCurtainCard',
    id: '03-light-curtain',
    month: 3,
    name: '桜に幕',
    category: CARD_CATEGORIES.LIGHT,
    rarity: 'bright',
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.LIGHT],
    tags: ['sakura', 'cherry', 'bright', 'curtain']
  },
  {
    className: 'CherryPoetryRibbonCard',
    id: '03-ribbon-poetry',
    month: 3,
    name: '桜の赤短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.RED,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['sakura', 'cherry', 'ribbon', 'akatan']
  },
  {
    className: 'CherryChaffOneCard',
    id: '03-chaff-a',
    month: 3,
    name: '桜のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['sakura', 'cherry', 'chaff']
  },
  {
    className: 'CherryChaffTwoCard',
    id: '03-chaff-b',
    month: 3,
    name: '桜のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['sakura', 'cherry', 'chaff']
  },
  {
    className: 'WisteriaCuckooCard',
    id: '04-animal-cuckoo',
    month: 4,
    name: '藤に杜鵑',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['fuji', 'wisteria', 'cuckoo', 'hototogisu', 'tane']
  },
  {
    className: 'WisteriaRibbonCard',
    id: '04-ribbon',
    month: 4,
    name: '藤の短冊',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.PLAIN,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['fuji', 'wisteria', 'ribbon']
  },
  {
    className: 'WisteriaChaffOneCard',
    id: '04-chaff-a',
    month: 4,
    name: '藤のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['fuji', 'wisteria', 'chaff']
  },
  {
    className: 'WisteriaChaffTwoCard',
    id: '04-chaff-b',
    month: 4,
    name: '藤のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['fuji', 'wisteria', 'chaff']
  },
  {
    className: 'IrisBridgeCard',
    id: '05-animal-bridge',
    month: 5,
    name: '菖蒲に八つ橋',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['ayame', 'iris', 'bridge', 'yatsuhashi', 'tane']
  },
  {
    className: 'IrisRibbonCard',
    id: '05-ribbon',
    month: 5,
    name: '菖蒲の短冊',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.PLAIN,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['ayame', 'iris', 'ribbon']
  },
  {
    className: 'IrisChaffOneCard',
    id: '05-chaff-a',
    month: 5,
    name: '菖蒲のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['ayame', 'iris', 'chaff']
  },
  {
    className: 'IrisChaffTwoCard',
    id: '05-chaff-b',
    month: 5,
    name: '菖蒲のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['ayame', 'iris', 'chaff']
  },
  {
    className: 'PeonyButterflyCard',
    id: '06-animal-butterfly',
    month: 6,
    name: '牡丹に蝶',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['botan', 'peony', 'butterfly', 'tane']
  },
  {
    className: 'PeonyBlueRibbonCard',
    id: '06-ribbon-blue',
    month: 6,
    name: '牡丹の青短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.BLUE,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['botan', 'peony', 'ribbon', 'aotan']
  },
  {
    className: 'PeonyChaffOneCard',
    id: '06-chaff-a',
    month: 6,
    name: '牡丹のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['botan', 'peony', 'chaff']
  },
  {
    className: 'PeonyChaffTwoCard',
    id: '06-chaff-b',
    month: 6,
    name: '牡丹のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['botan', 'peony', 'chaff']
  },
  {
    className: 'BushCloverBoarCard',
    id: '07-animal-boar',
    month: 7,
    name: '萩に猪',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['hagi', 'bush-clover', 'boar', 'tane']
  },
  {
    className: 'BushCloverRibbonCard',
    id: '07-ribbon',
    month: 7,
    name: '萩の短冊',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.PLAIN,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['hagi', 'bush-clover', 'ribbon']
  },
  {
    className: 'BushCloverChaffOneCard',
    id: '07-chaff-a',
    month: 7,
    name: '萩のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['hagi', 'bush-clover', 'chaff']
  },
  {
    className: 'BushCloverChaffTwoCard',
    id: '07-chaff-b',
    month: 7,
    name: '萩のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['hagi', 'bush-clover', 'chaff']
  },
  {
    className: 'PampasMoonCard',
    id: '08-light-moon',
    month: 8,
    name: '芒に月',
    category: CARD_CATEGORIES.LIGHT,
    rarity: 'bright',
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.LIGHT],
    tags: ['susuki', 'pampas', 'moon', 'bright']
  },
  {
    className: 'PampasGeeseCard',
    id: '08-animal-geese',
    month: 8,
    name: '芒に雁',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['susuki', 'pampas', 'geese', 'tane']
  },
  {
    className: 'PampasChaffOneCard',
    id: '08-chaff-a',
    month: 8,
    name: '芒のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['susuki', 'pampas', 'chaff']
  },
  {
    className: 'PampasChaffTwoCard',
    id: '08-chaff-b',
    month: 8,
    name: '芒のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['susuki', 'pampas', 'chaff']
  },
  {
    className: 'ChrysanthemumSakeCupCard',
    id: '09-animal-sake-cup',
    month: 9,
    name: '菊に盃',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['kiku', 'chrysanthemum', 'sake', 'cup', 'tane']
  },
  {
    className: 'ChrysanthemumBlueRibbonCard',
    id: '09-ribbon-blue',
    month: 9,
    name: '菊の青短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.BLUE,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['kiku', 'chrysanthemum', 'ribbon', 'aotan']
  },
  {
    className: 'ChrysanthemumChaffOneCard',
    id: '09-chaff-a',
    month: 9,
    name: '菊のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['kiku', 'chrysanthemum', 'chaff']
  },
  {
    className: 'ChrysanthemumChaffTwoCard',
    id: '09-chaff-b',
    month: 9,
    name: '菊のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['kiku', 'chrysanthemum', 'chaff']
  },
  {
    className: 'MapleDeerCard',
    id: '10-animal-deer',
    month: 10,
    name: '紅葉に鹿',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['momiji', 'maple', 'deer', 'tane']
  },
  {
    className: 'MapleBlueRibbonCard',
    id: '10-ribbon-blue',
    month: 10,
    name: '紅葉の青短',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.BLUE,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['momiji', 'maple', 'ribbon', 'aotan']
  },
  {
    className: 'MapleChaffOneCard',
    id: '10-chaff-a',
    month: 10,
    name: '紅葉のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['momiji', 'maple', 'chaff']
  },
  {
    className: 'MapleChaffTwoCard',
    id: '10-chaff-b',
    month: 10,
    name: '紅葉のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['momiji', 'maple', 'chaff']
  },
  {
    className: 'WillowRainmanCard',
    id: '11-light-rainman',
    month: 11,
    name: '柳に小野道風',
    category: CARD_CATEGORIES.LIGHT,
    rarity: 'bright',
    isSpecial: true,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.LIGHT],
    tags: ['yanagi', 'willow', 'rain', 'bright']
  },
  {
    className: 'WillowSwallowCard',
    id: '11-animal-swallow',
    month: 11,
    name: '柳に燕',
    category: CARD_CATEGORIES.ANIMAL,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.ANIMAL],
    tags: ['yanagi', 'willow', 'swallow', 'tane']
  },
  {
    className: 'WillowRibbonCard',
    id: '11-ribbon',
    month: 11,
    name: '柳の短冊',
    category: CARD_CATEGORIES.RIBBON,
    ribbonColor: RIBBON_COLORS.PLAIN,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.RIBBON],
    tags: ['yanagi', 'willow', 'ribbon']
  },
  {
    className: 'WillowLightningCard',
    id: '11-chaff-lightning',
    month: 11,
    name: '柳に小野道風の雷',
    category: CARD_CATEGORIES.CHAFF,
    isSpecial: true,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['yanagi', 'willow', 'lightning', 'chaff']
  },
  {
    className: 'PaulowniaPhoenixCard',
    id: '12-light-phoenix',
    month: 12,
    name: '桐に鳳凰',
    category: CARD_CATEGORIES.LIGHT,
    rarity: 'bright',
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.LIGHT],
    tags: ['kiri', 'paulownia', 'phoenix', 'bright']
  },
  {
    className: 'PaulowniaChaffOneCard',
    id: '12-chaff-a',
    month: 12,
    name: '桐のカス一',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['kiri', 'paulownia', 'chaff']
  },
  {
    className: 'PaulowniaChaffTwoCard',
    id: '12-chaff-b',
    month: 12,
    name: '桐のカス二',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['kiri', 'paulownia', 'chaff']
  },
  {
    className: 'PaulowniaChaffThreeCard',
    id: '12-chaff-c',
    month: 12,
    name: '桐のカス三',
    category: CARD_CATEGORIES.CHAFF,
    points: DEFAULT_POINTS_BY_CATEGORY[CARD_CATEGORIES.CHAFF],
    tags: ['kiri', 'paulownia', 'chaff']
  }
]);
