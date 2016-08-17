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
const REQUIRE_ADMIN = "Admin";
const REQUIRE_OWNER = "Owner";
const REQUIRE_MEMBER = "Member";

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const mailgunRoutes = express.Router();
  const userRoutes = express.Router();

  // Set these routes as a subdir of apiRoutes
  // e.g., /api/auth/login, /api/user/, etc
  apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/user', userRoutes);
  apiRoutes.use('/communication', mailgunRoutes);

  authRoutes.post('/register', authController.register);
  authRoutes.post('/login', requireLogin, authController.login);
  authRoutes.post('/forgot-password', authController.forgotPassword);
  authRoutes.post('/reset-password/:token', authController.verifyToken);

  mailgunRoutes.post('/contact', mailgunController.sendContactForm);

  userRoutes.get('/:userId', requireAuth, userController.viewProfile);

  // Temp protected route to make sure token authentication is working
  apiRoutes.get('/protected', requireAuth, function(req, res) {
    res.send({ content: 'The protected test route is functional!'});
  });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
