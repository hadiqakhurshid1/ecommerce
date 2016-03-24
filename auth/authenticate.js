var isAuthenticated = function (req, res, next) {

	if (req.isAuthenticated()){
		return next();
  }else{
		 var path = req.url;
		 req.flash('redirectTo', 'store'+path);
	   res.redirect('/login');
   }
}

module.exports = isAuthenticated;
