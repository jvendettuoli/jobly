/** Users Routes */
const express = require('express');
const { validate } = require('jsonschema');

const User = require('../models/user');
const ExpressError = require('../helpers/expressError');
const { userNewSchema, userUpdateSchema } = require('../schemas');
const createToken = require('../helpers/createToken');
const { ensureCorrectUser } = require('../middleware/auth');

const router = new express.Router();

/**GET /users  
 *   
 * => {users: [{username, first_name, laset_name, email},...]}
 */

router.get('/', async function(req, res, next) {
	console.debug('Routes users GET / - Start');

	try {
		const users = await User.all(req.query);
		return res.json({ users });
	} catch (e) {
		return next(e);
	}
});

/**POST /users
 *
 *  Takes JSON object 
 * {username, password, first_name, last_name, email, photo_url, is_admin}
 *
 * => {user: {username, password, first_name, last_name, email, photo_url, is_admin}}
 */

router.post('/', async function(req, res, next) {
	console.debug('Routes users POST / - Start');

	try {
		const validation = validate(req.body, userNewSchema);
		if (!validation.valid) {
			console.debug('Routes users POST / - Validation Error');
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}
		const user = await User.register(req.body);
		if (user instanceof ExpressError) {
			return next(user);
		}
		const token = createToken(user);
		return res.status(201).json({ token });
	} catch (e) {
		return next(e);
	}
});

/**GET /users:username
 *
 *  Finds a user by username
 *
 * => {user: {username, first_name, last_name, email, photo_url, jobs:{id, state, created_at}}}
 */

router.get('/:username', async function(req, res, next) {
	console.debug('Routes users GET /:username - Start');

	try {
		const user = await User.find(req.params.username);
		if (user instanceof ExpressError) {
			return next(user);
		}
		return res.json({ user });
	} catch (e) {
		return next(e);
	}
});

/**PATCH /users:username
 *
 *  Finds a user by its username and update some of its data
 *  Takes JSON object with any of the keys
 *  {username, password, first_name, last_name, email, photo_url, is_admin}
 *
 * => {user:{username, first_name, last_name, email, photo_url, is_admin}}
 */

router.patch('/:username', ensureCorrectUser, async function(req, res, next) {
	console.debug('Routes users GET /:username - Start');

	try {
		const validation = validate(req.body, userUpdateSchema);
		if (!validation.valid) {
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}

		const user = await User.update(req.params.username, req.body);
		if (user instanceof ExpressError) {
			return next(user);
		}
		return res.json({ user });
	} catch (e) {
		return next(e);
	}
});

/**DELETE /users:username
 *
 *  Finds a user by its username and deletes it
 *
 * => {message: user delete}
 */

router.delete('/:username', ensureCorrectUser, async function(req, res, next) {
	console.debug('Routes users DELETE /:username - Start');

	try {
		const result = await User.delete(req.params.username);
		if (result instanceof ExpressError) {
			return next(result);
		}
		return res.json({ message: 'User deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
