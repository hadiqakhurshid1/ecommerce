var express = require('express');
var router = express.Router();
var passport = require('passport');
var connection = require('../../models/db.js');
var isauth = require('../../auth/authenticate.js');


function addOrUpdateShippingDetails(req){
  var userID = req.user[0].id;
  //add checks for checking that form fields aren't empty and consist of valid characters
  //dont need to escape input because mysql's prepared statements (added using ?) will do that for us
  var customerPost = {user_id: userID, title: req.body.title, name: req.body.name, surname: req.body.surname, address: req.body.address, city: req.body.city, postcode: req.body.postcode, phoneNumber: req.body.phonenumber, card_type: req.body.cardtype, name_on_card: req.body.nameoncard, card_number: req.body.cardnumber,expiry_date: req.body.expirydate, secret_code: req.body.secretcode};
  connection.query("SELECT user_id FROM customer WHERE user_id = ?", userID, function(err, rows){
    if(err) { return connection.rollback(function(){
      throw err;
      });
    }
    if(rows.length<1){
      connection.query("INSERT INTO customer SET ?", customerPost, function(err, rows){
        if(err) { return connection.rollback(function(){
          throw err;
          });
        }
        console.log('inserted customer');
      });
    }else{
      //if no details have changed then the fields do not get updated
      //changedRows returns the the rows that were updated
      connection.query("UPDATE customer SET ?", customerPost, function(err, rows){
        if(err) { return connection.rollback(function(){
          throw err;
          });
        }
         console.log('changed ' + rows.changedRows + ' rows');
      });
    }
  });
}

//This gets executed when the user searches for books or manually enters /store in the url
router.get('/', function(req, res){
  var searchCategory = req.query.search_category;
  var searchQuery = req.query.search;

    if(searchCategory === 'default' && searchQuery){
      connection.query("select * from books where title regexp ? ORDER BY issueDate DESC",'[[:<:]]'+searchQuery+'[[:>:]]', function(err, rows){
        res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
        return;
      });
    }else if(searchCategory !== 'default' && searchQuery){
      connection.query("select * from books where title regexp ? AND category = ? ORDER BY issueDate DESC",['[[:<:]]'+searchQuery+'[[:>:]]',searchCategory], function(err, rows){
        res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
        return;
      });
    }else if(searchCategory !== 'default' && !searchQuery){
      connection.query("select * from books where category = ? ORDER BY issueDate DESC",searchCategory, function(err, rows){
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
router.get('/view/book/:id/:title', function(req, res){
  var id = req.params.id;
  var title = req.params.title;
  //replace dashes with space to recover the correct title and then use it
  //to perform db query
  title = title.replace(/-+/g, ' ');

  connection.query("select * from books where id = ? AND title = ?",[id,title], function(err, rows){
    res.render('store/book', {bookID: id, searchResults: rows, user: req.user, cartSize: cartSession.length});
    return;
  });
});

//this gets executed when the user clicks on book categories
router.get('/category/:category', function(req, res){
  var category = req.params.category;

  connection.query("select * from books where category = ? ORDER BY issueDate DESC LIMIT 5", category, function(err, rows){
    res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length, category, category});
    return;
  });
});

//this gets executed via AJAX request when the user scrolls to the bottom of the page
//it simply loads the next 5 books and returns them via json response
router.post('/category/:category', function(req, res){
  var category = req.params.category;
  var counter = Number(req.body.count);

  connection.query("select * from books where category = ? ORDER BY issueDate DESC LIMIT 5 OFFSET ?", [category, counter], function(err, rows){
    res.json({"data": rows});
  });

});


router.get('/view/tag/:tag', function(req, res){
  var tag = req.params.tag;

  connection.query("SELECT * FROM books WHERE tags = ? OR tags2 = ? ORDER BY issueDate DESC", [tag, tag], function(err, rows){
    if(err){
       console.error(err);
     }else{
       res.render('store/books', {searchResults: rows, user: req.user, cartSize: cartSession.length});
       return;
     }
  });
});


// ************ CART FUNCTIONALITY ********************
//this gets executed when the opens their cart
router.get('/cart', function(req, res){
  res.render('store/cart', {cart: cartSession, user: req.user, cartSize: cartSession.length});
});


router.post('/add-to-cart/:id', function(req, res){
  var id = req.params.id;
  var quantity = req.query.quantity;

  connection.query("SELECT * FROM books where id =?", id, function(err, rows){
    if(err){
       console.error(err);
     }else{
      var alreadyInBasket = false;

       for(var i=0; i<cartSession.length; i++){
         if(cartSession[i].id == id){
           alreadyInBasket = true;

           var qnt = cartSession[i].quantity;
           var priceForOne = rows[0].price;

           cartSession[i].quantity = Number(qnt) + Number(quantity);
           cartSession[i].price = priceForOne * Number(cartSession[i].quantity);
         }
       }

       if(alreadyInBasket == false){
         rows[0].quantity = quantity;
         rows[0].price = rows[0].price * quantity;
         cartSession.push(rows[0]);
       }

       console.log(cartSession);
       res.json({"data": cartSession.length});
    }
  });
});



router.post('/update-cart/:id', function(req, res){
  var id = req.params.id;
  var quantity = req.query.quantity;

  connection.query("SELECT * FROM books where id =?", id, function(err, rows){
    if(err){
       console.error(err);
     }else{
       for(var i=0; i<cartSession.length; i++){
         if(cartSession[i].id == id){

           var qnt = cartSession[i].quantity;
           var priceForOne = rows[0].price;

           cartSession[i].quantity = Number(quantity);
           cartSession[i].price = priceForOne * Number(cartSession[i].quantity);
           console.log('dasdasdasdasdadasdsadasdqwewqeqwew');
           res.json({"price": cartSession[i].price});
        }
      }
    }
  });
});



//this gets executed when the user clicks checkout when inside the cart page
router.get('/cart/checkout', isauth, function(req, res){
  var totalPrice = 0;
  for(var i=0; i<cartSession.length; i++){
    totalPrice += cartSession[i].price;
  }
  res.render('store/cart-checkout', {priceToPay: totalPrice, user: req.user, cartSize: cartSession.length});
});

//this gets executed when the user enters their shipping details and clicks buy
router.post('/cart/checkout', isauth, function(req, res){
  var time = new Date();
  var userID = req.user[0].id;

  function insertPurchase(updatedPrice, cartbookid, quantity){
    var post = {purchaseDate: time, amountPaid: updatedPrice, books_id: cartbookid, customer_id: userID, quantity: quantity};

    connection.query("INSERT INTO purchases SET ?", post, function(err, rows){
      if(err) { return connection.rollback(function(){
        throw err;
        });
      }

      });
  }


  function updateStock(currentStock, cartbookid, quantity){
    var updatedStock = currentStock - quantity;

    connection.query("UPDATE books SET stock = ? WHERE id = ?", [updatedStock, cartbookid], function(err, rows){
      if(err) {
        return connection.rollback(function(){
        throw err;
        });
      }
    });
  }

  function selectPrice(quantity, cartbookid){
    connection.query("SELECT price, stock FROM books WHERE id=?", cartbookid, function(err, rows){
      if(err) { return connection.rollback(function(){
        throw err;
        });
      }
      var updatedPrice = rows[0].price * quantity;
      insertPurchase(updatedPrice, cartbookid, quantity);
      updateStock(rows[0].stock, cartbookid, quantity);
  });
}




connection.beginTransaction(function(err){
  if(err) { throw err; }

    addOrUpdateShippingDetails(req);

    for(var i=0; i<cartSession.length; i++){
      selectPrice(cartSession[i].quantity, cartSession[i].id);

    }

    connection.commit(function(err){
      if(err){
        return connection.rollback(function(){
          throw err;
        });
      }
      res.redirect('/store/checkout/completed/thank-you');
    });

  });

});

// ************ END OF - CART FUNCTIONALITY **************

// ************ SINGLE ITEM BUY FUNCTIONALITY **************
//this gets executed when the user clicks buy now on a book instead of adding it to the cart
router.get('/checkout/:id', isauth, function(req, res){
  var id = req.params.id;
   checkoutQuantity = req.session;
   checkoutQuantity = req.query.quantity;
  var totalPrice = 0;

  connection.query("select title, price from books where id = ?", id, function(err, rows){
    totalPrice = checkoutQuantity * rows[0].price;
    res.render('store/checkout',{priceToPay: totalPrice,  user: req.user, cartSize: cartSession.length});
    return;
  });
});

//this gets executed when the user enters their shipping details and clicks buy
router.post('/checkout/:id', isauth, function(req, res){
  var time = new Date();
  var bookID = req.params.id;
  var userID = req.user[0].id;

  connection.beginTransaction(function(err){
    if(err) { throw err; }

      addOrUpdateShippingDetails(req);

  connection.query("SELECT price, stock FROM books WHERE id = ?", bookID, function(err, rows){
    if(err) {
      return connection.rollback(function(){
      throw err;
      });
    }
    var updatedPrice = rows[0].price * checkoutQuantity;
    var updatedStock = rows[0].stock - checkoutQuantity;
    var post = {purchaseDate: time, amountPaid: updatedPrice, books_id: bookID, customer_id: userID, quantity: checkoutQuantity};
    connection.query("INSERT INTO purchases SET ?", post, function(err, rows){
      if(err) {
        return connection.rollback(function(){
        throw err;
        });
      }else{
      checkoutQuantity = null;
      }
    });

    connection.query("UPDATE books SET stock = ? WHERE id = ?", [updatedStock, bookID], function(err, rows){
      if(err) {
        return connection.rollback(function(){
        throw err;
        });
      }
    });

  });//end of top query

  connection.commit(function(err){
    if(err){
      return connection.rollback(function(){
        throw err;
      });
    }
    res.redirect('/store/checkout/completed/thank-you');
  });

  });
});
// ************ END OF - SINGLE ITEM BUY FUNCTIONALITY **************

//this gets executed when the user has purchased an item
router.get('/checkout/completed/thank-you', function(req, res){
  //clear the cart
  cartSession = [];
  res.render('store/checkout-thank-you', {user: req.user, cartSize: cartSession.length});
});







module.exports = router;
