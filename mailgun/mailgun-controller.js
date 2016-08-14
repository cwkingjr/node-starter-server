const config = require('../config/main');
const mailgunService = require('mailgun-js')({
  apiKey: config.mailgun_priv_key,
  domain: config.mailgun_domain
 });

exports.sendContactForm = function(req, res, next) {
  const fromText = req.body.firstName + ' ' + req.body.lastName + ' ' +
                  '<' + req.body.email + '>';

  const message = {
    subject: req.body.subject,
    text: req.body.message
  };

  const data = {
    from: fromText,
    to: 'you@yourdomain.com',
    subject: message.subject,
    text: message.text
  };

  mailgunService.messages().send(data, function(error, body) {
  //  console.log(body);
  });

  res.status(200).json({ message: 'Your email has been sent. We will be in touch with you soon.' });
  next();
}

// Create and export function to send emails through Mailgun API
exports.sendEmail = function(recipient, message) {
  const data = {
    from: 'Your Site <info@yourdomain.com>',
    to: recipient,
    subject: message.subject,
    text: message.text
  };

  mailgunService.messages().send(data, function(error, body) {
  //  console.log(body);
  });
}
