function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      res.locals.isLoggedIn = true; // Definindo isLoggedIn como true no contexto local
      return next();
  } else {
      res.locals.isLoggedIn = false; // Definindo isLoggedIn como false no contexto local
      res.redirect('auth/login');
  }
}
