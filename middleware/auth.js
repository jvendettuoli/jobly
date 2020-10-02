/**Middleware for user authentication and authorization */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/expressError');

/**Authenticate user JWT  
 */

function authenticateJWT(req, res, next) {
	console.debug('Middleware Auth authenticateJWT - Start');
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, SECRET_KEY);
		req.user = payload;
		return next();
	} catch (e) {
		return next(new ExpressError('You must be authenticated', 401));
	}
}

/**Ensures user has admin authorization */

function ensureAdmin(req, res, next) {
	console.debug('Middleware Auth ensureAdmin - Start');
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, SECRET_KEY);
		req.user = payload;

		if (payload.is_admin) {
			return next();
		}
		else {
			throw new ExpressError('This route requires admin access', 401);
		}
	} catch (e) {
		return next(new ExpressError('This route requires admin access', 401));
	}
}
/**Ensures user is accessing correct user data */

function ensureCorrectUser(req, res, next) {
	console.debug('Middleware Auth ensureCorrectUser - Start');
	try {
		const tokenFromBody = req.body._token;
		const payload = jwt.verify(tokenFromBody, SECRET_KEY);
		req.user = payload;
		if (payload.username === req.params.username) {
			return next();
		}
		else {
			return next({ status: 401, message: 'Unauthorized - Must be same user' });
		}
	} catch (e) {
		return next({ status: 401, message: 'Unauthorized - Must be same user' });
	}
}

module.exports = {
	authenticateJWT,
	ensureAdmin,
	ensureCorrectUser
};
