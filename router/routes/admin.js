var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../../models/db.js');
var isauth = require('../../auth/authenticate.js');


router.get('/', function(req, res){
  res.render('admin/bookEntry');
});

router.post('/', function(req, res){
  var post = {title: req.body.title, author: req.body.author, description: req.body.description, issueDate: req.body.issueDate, isbn: req.body.isbn, tags: req.body.tags, price: req.body.price, category: req.body.category, image: req.body.image, url: req.body.url};

  connection.query("INSERT INTO books SET ?", post, function(err, rows){
    if(err) return console.log(err);

    if(rows.insertId){
      res.render('admin/bookEntry', {success: 'added'});
    }else{
      res.render('admin/bookEntry', {success: 'no'});

    }
  });
});

module.exports = router;
