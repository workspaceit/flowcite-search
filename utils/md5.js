const Crypto = require('crypto');

/**
 * Returns md5 hash of payload.
 * 
 * @param {object} payload Payload
 * 
 * @returns {string}
 */
 const md5 = (payload) => {
  let data;

  if (typeof payload === 'object') {
    data = JSON.stringify(payload);
  } else if (typeof payload === 'string') {
    data = payload;
  }

  return Crypto.createHash('md5').update(data).digest('hex');
};

module.exports = md5;
