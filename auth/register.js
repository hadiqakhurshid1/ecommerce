var bcrypt = require('bcryptjs');

module.exports = function(passport, connection, LocalStrategy){

  passport.use('local-registration', new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done){
    //validation
    req.sanitize("username").escape();
    req.sanitize("password").escape();
    req.sanitize("email").escape();

    req.sanitize("username").trim();
    req.sanitize("password").trim();
    req.sanitize("email").trim();

    req.checkBody("username", "Enter a valid username").notEmpty().isAlphanumeric().len(1,25);
    req.checkBody("password", "Enter a valid password").notEmpty().isAlphanumeric().len(5);
    req.checkBody("email", "Enter a valid email address").notEmpty().isEmail().len(4,320);

    var errors = req.validationErrors();

    if(errors){
      console.log(errors);
      return done(null, false, req.flash('registration-validation', errors));
    }

    findOrCreateUser = function(){

      connection.query('select * from users where username = ? OR email = ?',[username, req.body.email], function(err,rows){
        if(err){
           return done(err,null);
         }
         if(rows.length>0){
           if(rows[0].username === username){
             return done(null, false, req.flash('registration-validation-exists', 'username already exists'));
           }else if(rows[0].email === req.body.email){
             return done(null, false, req.flash('registration-validation-exists', 'email already exists'));
           }
        }else{

          var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

          var newUser = new Object();
          newUser.username = username;
          newUser.email = req.body.email;
          newUser.password = hash;

          var post = {username: username, email: req.body.email, password:hash};
          connection.query('INSERT INTO users SET ?', post, function(err, rows){
            //mysql library exposes users id from insert query inside insertID field
            newUser.id = rows.insertId;
            return done(null, newUser);
          });
        }
      });
    };
    process.nextTick(findOrCreateUser);
  }
));

}
