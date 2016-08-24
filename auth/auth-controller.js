"use strict";

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user-model');
const mailgun = require('../mailgun/mailgun-controller');
const config = require('../config/main');

function generateToken(user) {
    return jwt.sign(user, config.jwt_secret, {
        expiresIn: 10080 // seconds
    });
}

function setUserInfo(request) {
    let getUserInfo = {
        _id: request._id,
        firstName: request.profile.firstName,
        lastName: request.profile.lastName,
        email: request.email,
        role: request.role,
    };
    return getUserInfo;
}

exports.login = function(req, res, next) {
    let userInfo = setUserInfo(req.user);
    res.status(200).json({
        token: 'JWT ' + generateToken(userInfo),
        user: userInfo
    });
}

exports.register = function(req, res, next) {
    // Check for registration errors
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    if (!email) {
        return res.status(422).send(
            { error: 'You must enter an email address.'}
        );
    }

    if (!firstName || !lastName) {
        return res.status(422).send(
            { error: 'You must enter your full name.'}
        );
    }

    if (!password) {
        return res.status(422).send(
            { error: 'You must enter a password.' }
        );
    }

    User.findOne({ email: email }, function(err, existingUser) {
        if (err) { return next(err); }

        // If user is not unique, return error
        if (existingUser) {
            return res.status(422).send(
                { error: 'That email address is already in use.' }
            );
        }

        // Build and save the new user

        let user = new User({
            email: email,
            password: password,
            profile: { firstName: firstName, lastName: lastName }
        });

        user.save(function(err, user) {
            if (err) { return next(err); }

            // Respond with JWT if user was created

            let userInfo = setUserInfo(user);

            res.status(201).json({
                token: 'JWT ' + generateToken(userInfo),
                user: userInfo
            });
        });
    });
}

exports.roleAuthorization = function(role) {
    return function(req, res, next) {
        const user = req.user;

        User.findById(user._id, function(err, foundUser) {
            if (err) {
                res.status(422).json({ error: 'No user found.' });
                return next(err);
            }

            // If user is found, check role.
            if (foundUser.role === role) {
                return next();
            }

            res.status(401).json(
                { error: 'You are not authorized to view this content.' }
            );
            return next('Unauthorized');
        })
    }
}

exports.forgotPassword = function(req, res, next) {
    const email = req.body.email;

    User.findOne({ email: email }, function(err, existingUser) {
        // If user is not found, return error
        if (err || existingUser === null) {
            res.status(422).json(
                { error: 'Your request could not be processed as entered.' }
            );
            return next(err);
        }

        // If user is found, generate and save resetToken

        // Generate a token with Crypto
        crypto.randomBytes(48, function(err, buffer) {
            if (err) { return next(err); }

            const resetToken = buffer.toString('hex');
            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            existingUser.save(function(err) {
                if (err) { return next(err); }

                const message = {
                    subject: 'Reset Password',
                    text: 'You are receiving this because you (or someone else) requested a password reset.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'https://' + req.headers.host + '/reset-password/' + resetToken + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                }

                // Otherwise, send user email via Mailgun
                mailgun.sendEmail(existingUser.email, message);

                res.status(200).json(
                    { message: 'Please check your email for the link to reset your password.'}
                );
                next();
            });
        });
    });
}

exports.verifyToken = function(req, res, next) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() } }, function(err, resetUser) {

        if(!resetUser) {
            res.status(422).json({
                error: 'Your token has expired. Please attempt to reset your password again.'
            });
        }

        // Otherwise, save new password and clear resetToken from database
        resetUser.password = req.body.password;
        resetUser.resetPasswordToken = undefined;
        resetUser.resetPasswordExpires = undefined;

        resetUser.save(function(err) {
            if (err) { return next(err); }

            // If password change saved successfully, alert user via email
            const message = {
                subject: 'Password Changed',
                text: 'You are receiving this email because you changed your password. \n\n' +
                'If you did not request this change, please contact us immediately.'
            }

            // Otherwise, send user email confirmation of password change via Mailgun
            mailgun.sendEmail(resetUser.email, message);

            res.status(200).json({
                message: 'Password changed successfully. Please login with your new password.'
            });
            next();
        });
    });
}
