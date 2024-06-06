const express = require('express');
const cors = require('cors');

const register = (app) => {
  app.use(cors());
  app.use(express.json());
};

module.exports = register;
