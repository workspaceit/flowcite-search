const csv = require('fast-csv');

const tokenize = (query) => {
  return new Promise((resolve, reject) => {
    let result;
    csv.parseString(query, { headers: false, delimiter: ' ' })
      .on('error', (err) => reject(err))
      .on('data', (row) => { result = row.filter((x) => x.length > 0); })
      .on('end', (rowCount) => resolve(result));
  });
};

module.exports = tokenize;
