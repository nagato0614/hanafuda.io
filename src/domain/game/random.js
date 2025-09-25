const UINT_MAX = 0xffffffff;

export class Random {
  constructor(seed = Date.now()) {
    this._seed = seed >>> 0;
    if (this._seed === 0) {
      this._seed = 0x1a2b3c4d;
    }
  }

  nextInt() {
    // xorshift32
    let x = this._seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this._seed = x >>> 0;
    return this._seed;
  }

  next() {
    return this.nextInt() / UINT_MAX;
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
