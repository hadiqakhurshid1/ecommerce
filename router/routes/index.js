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

function returnBooks(category, query, res){

  if(category !== 'default'){
    //if search category is set
    //then query only that category
    connection.query("select * from books where title like ? AND category = ?",['%'+query+'%',category], function(err, rows){
      console.log(rows);
      res.render('store/books', {searchResults: rows});
      return;
    });

  }else{
    connection.query("select * from books where title like ?",'%'+query+'%', function(err, rows){
      console.log(rows);
      res.render('store/books', {searchResults: rows});
      return;
    });
  }

}

router.get('/store', function(req, res){

  if(!req.query.search_category || !req.query.search){
    res.render('store/books');
  }else{
    var searchCategory = req.query.search_category;
    var searchQuery = req.query.search;
    returnBooks(searchCategory, searchQuery, res);
  }

});

router.get('/store/view/:title', function(req, res){

var title = req.params.title;
title = title.replace(/-+/g, ' ');

  connection.query("select * from books where title = ?",title, function(err, rows){
    console.log(rows);

    res.render('store/book', {searchResults: rows});
    return;
  });


});


router.get('/store/:category', function(req, res){

  var category = req.params.category;

  connection.query("select * from books where category = ?", category, function(err, rows){

    res.render('store/books', {searchResults: rows});
    return;
  });

});











router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



module.exports = router;
