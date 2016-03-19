var isauth = require('../auth/authenticate.js');

module.exports = function(app){

  app.use('/', require('./routes/index'));
  app.use('/user', isauth, require('./routes/user'));
  app.use('/store', require('./routes/store'));
};
