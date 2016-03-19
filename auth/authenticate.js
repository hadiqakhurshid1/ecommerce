var isAuthenticated = function (req, res, next) {

	if (req.isAuthenticated()){
		return next();
  }else{
		 var path = req.path;
		 req.flash('redirectTo', 'store'+path);
	   res.redirect('/login');
   }
}

module.exports = isAuthenticated;
