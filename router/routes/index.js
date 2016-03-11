var express = require('express');
var router = express.Router();


router.get('/', function(req, res){
  res.send('ell world');
});


//etc...




module.exports = router;
