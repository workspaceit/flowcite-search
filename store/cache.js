const LRU = require('./backends/lru');

class Cache {
  constructor() {
    this._backend = LRU;
  }

  get = (key) => {
    return this._backend.get(key);
  };

  set = (key, value) => {
    this._backend.set(key, value);
  };
}

const instance = new Cache();

module.exports = instance;
