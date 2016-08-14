module.exports = {
  // Secret key for JWT signing and encryption
  'jwt_secret': process.env.API_JWT_SECRET || 'your super secret passphrase',
  // Database connection information
  'database_url': process.env.API_MONGO_URL || 'mongodb://localhost:27017',
  // Setting port for server
  'port': process.env.API_SERVER_PORT || 3000,
  // Configuring Mailgun API for sending transactional email
  'mailgun_priv_key': process.env.API_MAILGUN_PRIVATE_KEY || 'mailgun private key here',
  // Configuring Mailgun domain for sending transactional email
  'mailgun_domain': process.env.API_MAILGUN_DOMAIN || 'mailgun domain here'
}
