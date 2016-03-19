//all methods and properties from the express module
//will be assigned to the express variable
var bodyParser = require('body-parser');
var validator = require('express-validator');
var expressSession = require('express-session');
var express = require('express');
var passport = require('passport');

var handlebars = require('express3-handlebars').create({
  defaultLayout:'main',
  helpers: {
    section: function(name, options){
      if(!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }});
//in the rest of the application we will be enhancing
//the app variable by adding/modifying properties and settings of it
var app = express();

app.set('port', process.env.PORT || 3000);

//view engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


var initPassport = require('./auth/passport');
initPassport(passport);

//bodyParser makes the request body available for us to use in a nice form
//by making it into an object
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());


app.use(express.static(__dirname + '/public'));

app.use(expressSession({
  secret: 'whats sink dkjsda',
  resave: true,
  saveUninitialized: false,
}));

app.use(function initCart(req, res, next){
  if(typeof cartSession === 'undefined'){
    cartSession = req.session;
    cartSession = [];
  }
  return next();
});

app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());



var router = require('./router/index')(app);




app.use(function(req,res,next){
  res.status(404);
  res.render('404');
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started press Ctrl-C to terminate');
});
