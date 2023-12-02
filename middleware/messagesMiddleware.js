// messagesMiddleware.js

function messagesMiddleware(req, res, next) {
  if (req.session && req.session.successMessage) {
    res.locals.successMessage = req.session.successMessage;
    delete req.session.successMessage;
  }
  if (req.session && req.session.errorMessage) {
    res.locals.errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
  }
  next();
}

module.exports = messagesMiddleware;
