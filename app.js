require('./utils/perf')();

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const init = (app) => {
  const loaderFiles = fs.readdirSync(path.join(__dirname, 'loaders')).sort((a, b) => a - b);

  loaderFiles.forEach((loaderFile) => {
    const fullPath = path.join(__dirname, 'loaders', loaderFile);
    const loader = require(fullPath);

    loader(app);
  });
};

init(app);

module.exports = app;
