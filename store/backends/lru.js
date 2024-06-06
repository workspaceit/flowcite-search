const LRU = require('lru-cache');

/**
 * @type {LRU.Options}
 */
const options = {
  max: 500,
};

const instance = new LRU(options);

module.exports = instance;
