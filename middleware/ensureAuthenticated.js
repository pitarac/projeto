function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  } else {
      // Mostra uma mensagem de erro caso o usuário não esteja autenticado
      res.render('error', { message: 'Você precisa estar logado para acessar esta página' });
  }
}
