/** Authentication Routes */
const jwt = require('jsonwebtoken');
const Router = require('express').Router;
const router = new Router();

const User = require('../models/user');
const createToken = require('../helpers/createToken');

/** POST /login validates user login credentials
 * in request body and returns {token} 
 * or error for invalid login*/

router.post('/login', async function(req, res, next) {
	console.debug('Routes auth POST /login - Start');
	try {
		const { username, password } = req.body;
		const user = await User.authenticate(username, password);
		const token = createToken(user);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
