const User = require('./user-model');

exports.viewProfile = function(req, res, next) {
    const userId = req.params.userId;

    if (req.user._id !== userId) {
    	return res.status(401).json(
			{ error: 'You are not authorized to view this profile.' }
		);
    }

    User.findById(userId, function(err, user) {
        if (err) {
        	res.status(400).json(
				{ error: 'User not found.' }
			);
        	return next(err);
        }

        res.status(200).json(
			{ user: user }
		);
        return next();
    });
}
