var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../../models/db.js');


router.get('/', function(req, res){
  res.render('index', {user: req.user, cartSize: cartSession.length});
});

router.get('/login', function(req, res){
  if(req.user){
    res.redirect('/');
  }else{
    res.render('login', {loginValidation: req.flash('login-validation'), credentialsValidation: req.flash('login-validation-credentials'), user: req.user, redirectTo: req.flash('redirectTo'), cartSize: cartSession.length});
  }
});

// router.post('/login', passport.authenticate('local-login', {
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true,
// }));
router.post('/login', passport.authenticate('local-login'), function(req, res){
  console.log(req.body.redirectTo);
  res.redirect(req.body.redirectTo || '/');
});

router.get('/register', function(req, res){
  if(req.user){
    res.redirect('/');
  }else{
    res.render('register', {registrationValidation: req.flash('registration-validation'), alreadyExists: req.flash('registration-validation-exists'), user: req.user, cartSize: cartSession.length});
  }
});

router.post('/register', passport.authenticate('local-registration', {
  successRedirect: '/',
  failureRedirect: '/register',
  failureFlash: true,
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



module.exports = router;
