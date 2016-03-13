var LocalStrategy = require('passport-local').Strategy;
var register = require('./register');
var login = require('./login');
var connection = require('../models/db.js');

module.exports = function(passport){

  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    connection.query('SELECT * from users where id ='+id, function(err, rows){
      done(err, rows);
    });
  });

  register(passport, connection, LocalStrategy);
  login(passport, connection, LocalStrategy);
}
