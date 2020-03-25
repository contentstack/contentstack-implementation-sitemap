// routes

module.exports = function (app) {
  app.use('/', require('../middleware'));
  app.use('/', require('../routes/home'));
  app.use('/blog', require('../routes/blog'));
};
