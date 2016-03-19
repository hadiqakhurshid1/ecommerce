var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../../models/db.js');
var isauth = require('../../auth/authenticate.js');


function addOrUpdateShippingDetails(){
  var userID = req.user[0].id;
  var customerPost = {user_id: userID, title: req.body.title, name: req.body.name, surname: req.body.surname, address: req.body.address, city: req.body.city, postcode: req.body.postcode, phoneNumber: req.body.phonenumber};

  connection.query("SELECT user_id FROM customer WHERE user_id = ?", userID, function(err, rows){
    if(err) return console.log(error);
    if(rows.length<1){
      connection.query("INSERT INTO customer SET ?", customerPost, function(err, rows){
        if(err) return console.log(error);
        console.log('inserted customer');
      });
    }else{
      connection.query("UPDATE customer SET ?", customerPost, function(err, rows){
        if(err) return console.log(error);
        console.log('changed ' + rows.changedRows + ' rows');
      });
    }
  });
}

//This gets executed when the user searches for books or manually enters /store in the url
router.get('/', function(req, res){
  var searchCategory = req.query.search_category;
  var searchQuery = req.query.search;

    if(searchCategory && searchQuery){
      connection.query("select * from books where title like ? AND category = ?",['%'+searchQuery+'%',searchCategory], function(err, rows){
        res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
        return;
      });
    }else{
      //if user manually entered url, /store without using the search feature
      connection.query("select * from books", function(err, rows){
        res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
        return;
      });
    }
});


//this gets executed when the user clicks on a book to view it
router.get('/view/:id/:title', function(req, res){
  var id = req.params.id;
  var title = req.params.title;
  //replace dashes with space to recover the correct title and then use it
  //to perform db query
  title = title.replace(/-+/g, ' ');

  connection.query("select * from books where id = ? AND title = ?",[id,title], function(err, rows){
    res.render('store/book', {searchResults: rows, user: req.user, cartSize: cartSession.length});
    return;
  });
});

//this gets executed when the user clicks on book categories
router.get('/category/:category', function(req, res){
  var category = req.params.category;

  connection.query("select * from books where category = ?", category, function(err, rows){
    res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
    return;
  });
});

// ************ CART FUNCTIONALITY ********************
//this gets executed when the opens their cart
router.get('/cart', function(req, res){
  res.render('store/cart', {cart: cartSession, cartSize: cartSession.length});
});

//this gets executed when the user clicks add item to basket
router.post('/add-to-cart/:id', function(req, res){
  var id = req.params.id;
  connection.query("SELECT * FROM books where id =?", id, function(err, rows){
    if(err){
       console.error(err);
     }else{
       cartSession.push(rows[0]);
       res.json({data: cartSession.length})
     }
  });
});

//this gets executed when the user clicks checkout when inside the cart page
router.get('/cart/checkout', isauth, function(req, res){
  res.render('store/cart-checkout');
});

//this gets executed when the user enters their shipping details and clicks buy
router.post('/cart/checkout', isauth, function(req, res){
  var time = new Date();
  var userID = req.user[0].id;

  addOrUpdateShippingDetails();

  for(var i=0; i<cartSession.length; i++){
    var cartbookid = cartSession[i].id;
    connection.query("SELECT price FROM books WHERE id=?", cartbookid, function(err, rows){
      var post = {purchaseDate: time,amountPaid: rows[0].price, books_id: cartbookid, customer_id: userID}
      connection.query("INSERT INTO purchases SET ?", post, function(err, rows){
        if(err) console.log(err);
        console.log(i);
        });
    });
  }

  res.redirect('/store/checkout/completed/thank-you');
});

// ************ END OF - CART FUNCTIONALITY **************













// ************ SINGLE ITEM BUY FUNCTIONALITY **************
//this gets executed when the user clicks buy now on a book instead of adding it to the cart
router.get('/checkout/:id', isauth, function(req, res){
  var id = req.params.id;

  connection.query("select title, price from books where id = ?", id, function(err, rows){
    res.render('store/checkout',{buyNow: rows, cartSize: cartSession.length});
    return;
  });
});

//this gets executed when the user enters their shipping details and clicks buy
router.post('/checkout/:id', isauth, function(req, res){
  var time = new Date();
  var bookID = req.params.id;
  var userID = req.user[0].id;

  addOrUpdateShippingDetails();

  connection.query("SELECT price FROM books WHERE id = ?", bookID, function(err, rows){
    var post = {purchaseDate: time, amountPaid: rows[0].price, books_id: bookID, customer_id: userID};
    connection.query("INSERT INTO purchases SET ?", post, function(err, rows){
      if(err){
        console.log(err);
      }else{
      res.redirect('/store/checkout/completed/thank-you');
      }
    });
  });
});
// ************ END OF - SINGLE ITEM BUY FUNCTIONALITY **************

//this gets executed when the user has purchased an item
router.get('/checkout/completed/thank-you', function(req, res){
  res.render('store/checkout-thank-you');
});







module.exports = router;
