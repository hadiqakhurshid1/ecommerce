var bcrypt = require('bcryptjs');

module.exports = function(passport, connection, LocalStrategy){

  passport.use('local-login', new LocalStrategy({
    passReqToCallback: true
  },

  function(req, username, password, done){

    req.sanitize("username").escape();
    req.sanitize("password").escape();

    req.sanitize("username").trim();
    req.sanitize("password").trim();

    req.checkBody("username", "Enter a valid username").notEmpty().isAlphanumeric().len(1,25);
    req.checkBody("password", "Enter a valid password").notEmpty().isAlphanumeric().len(5);


    var errors = req.validationErrors();

    if(errors){
      console.log(errors);
      return done(null, false, req.flash('login-validation', errors));
    }else{

      connection.query('SELECT * FROM users WHERE username = ?', username, function(err, rows){
        if(err){
           return done(err,null);
         }
         //if user doesn't exist
         if(rows.length==0){
           return done(null, false, req.flash('login-validation-credentials', 'Incorrect username'));
         }
         //if password is incorrect
         if(!validPassword(password, rows[0].password)){
           return done(null, false, req.flash('login-validation-credentials','Invalid Password'));
         }
         //if everything is correct, return the user
         return done(null, rows[0]);
      });
    }
  }
));

  var validPassword = function(enteredPassword, realPassword){
    return bcrypt.compareSync(enteredPassword, realPassword);
  }

}
