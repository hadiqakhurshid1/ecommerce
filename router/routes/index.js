var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../../models/db.js');

router.get('/', function(req, res){
  res.render('index');
});

router.get('/login', function(req, res){
  res.render('login', {loginValidation: req.flash('login-validation'), credentialsValidation: req.flash('login-validation-credentials')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/user/',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/register', function(req, res){
  res.render('register', {registrationValidation: req.flash('registration-validation'), alreadyExists: req.flash('registration-validation-exists')});
});

router.post('/register', passport.authenticate('local-registration', {
  successRedirect: '/user/',
  failureRedirect: '/register',
  failureFlash: true,
}));



router.get('/store', function(req, res){
  res.render('store');
});




router.post('/store', function(req, res){

  //trim white space from front and end
  var searchQuery = req.body.search.replace(/(^\s+|\s+$)/g, '');
  //if search is empty
  if(!searchQuery){
    res.render('store');
    return;
  }


  if(req.body.search_category !== 'default'){
    //if search category is set
    //then query only that category
    connection.query("select * from books where title like ? AND category = ?",['%'+searchQuery+'%',req.body.search_category], function(err, rows){
      console.log(rows);
      res.render('store', {searchResults: rows});
    });

  }else{
    //if the search category is default
    //then query the whole table
    connection.query("select * from books where title like ?",'%'+searchQuery+'%', function(err, rows){
      console.log(rows);
      res.render('store', {searchResults: rows});
    });

  }

});






router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



module.exports = router;
