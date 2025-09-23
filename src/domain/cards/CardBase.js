export class CardBase {
  /**
   * @param {object} definition
   * @param {string} definition.id
   * @param {number} definition.month
   * @param {string} definition.name
   * @param {string} definition.category - one of light|animal|ribbon|chaff
   * @param {string|null} [definition.rarity]
   * @param {string|null} [definition.ribbonColor]
   * @param {boolean} [definition.isSpecial]
   * @param {number} [definition.points]
   * @param {string[]} [definition.tags]
   * @param {string} [definition.description]
   */
  constructor(definition) {
    if (new.target === CardBase) {
      throw new TypeError('CardBase is abstract and cannot be instantiated directly.');
    }

    if (!definition || typeof definition !== 'object') {
      throw new TypeError('Card definition must be a non-null object.');
    }

    const {
      id,
      month,
      name,
      category,
      rarity = null,
      ribbonColor = null,
      isSpecial = false,
      points = 0,
      tags = [],
      description = ''
    } = definition;

    if (!id || typeof id !== 'string') {
      throw new TypeError('Card id must be a non-empty string.');
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new RangeError('Card month must be an integer between 1 and 12.');
    }

    if (!name || typeof name !== 'string') {
      throw new TypeError('Card name must be a non-empty string.');
    }

    if (!category || typeof category !== 'string') {
      throw new TypeError('Card category must be a non-empty string.');
    }

    this.id = id;
    this.month = month;
    this.name = name;
    this.category = category;
    this.rarity = rarity;
    this.ribbonColor = ribbonColor;
    this.isSpecial = Boolean(isSpecial);
    this.points = points;
    this.tags = Object.freeze([...new Set(tags)]);
    this.description = description;

    Object.freeze(this);
  }

  /**
   * Returns a JSON serialisable representation of the card.
   */
  toJSON() {
    return {
      id: this.id,
      month: this.month,
      name: this.name,
      category: this.category,
      rarity: this.rarity,
      ribbonColor: this.ribbonColor,
      isSpecial: this.isSpecial,
      points: this.points,
      tags: [...this.tags],
      description: this.description
    };
  }

  /**
   * Convenience helper to duplicate the card instance.
   */
  clone() {
    const CardClass = this.constructor;
    return new CardClass();
  }
}
