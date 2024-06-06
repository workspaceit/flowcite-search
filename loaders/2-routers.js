const rootRouter = require('../routers/root');

const register = (app) => {
  app.use('/', rootRouter);
};

module.exports = register;
