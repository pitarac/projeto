function ensureNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/'); // Redireciona para a página inicial se o usuário estiver autenticado
  }
  next();
}

module.exports = ensureNotAuthenticated; 