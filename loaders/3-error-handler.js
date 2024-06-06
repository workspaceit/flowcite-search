const register = (app) => {
  app.use((err, req, res, next) => {
    res.json({
      message: err ? err.toString() : 'Error occurred',
    }).status(500);
  });
};

module.exports = register;
