const authController = require('./auth/auth-controller');
const userController = require('./auth/user-controller');
const mailgunController = require('./mailgun/mailgun-controller');
const express = require('express');
const passportService = require('./config/passport');
const passport = require('passport');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

// Constants for role types
const REQUIRE_ADMIN = "Admin",
      REQUIRE_OWNER = "Owner",
      REQUIRE_MEMBER = "Member";

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const userRoutes = express.Router();
  const mailgunRoutes = express.Router();

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);
  authRoutes.post('/register', authController.register);
  authRoutes.post('/login', requireLogin, authController.login);
  authRoutes.post('/forgot-password', authController.forgotPassword);
  authRoutes.post('/reset-password/:token', authController.verifyToken);

  // Set user routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/user', userRoutes);
  userRoutes.get('/:userId', requireAuth, userController.viewProfile);

  // Test protected route
  apiRoutes.get('/protected', requireAuth, function(req, res) {
    res.send({ content: 'The protected test route is functional!'});
  });

  apiRoutes.use('/communication', mailgunRoutes);
  mailgunRoutes.post('/contact', mailgunController.sendContactForm);

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
