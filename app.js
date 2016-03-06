//all methods and properties from the express module
//will be assigned to the express variable
var express = require('express');
var handlebars = require('express3-handlebars').create({defaultLayout:'main'});

//in the rest of the application we will be enhancing
//the app variable by adding/modifying properties and settings of it
var app = express();

app.set('port', process.env.PORT || 3000);

//view engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index');
})


app.listen(app.get('port'), function(){
  console.log('Express started press Ctrl-C to terminate');
});
