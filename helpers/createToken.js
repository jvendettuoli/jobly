/** Middleware for handling req authorization for routes. */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/**Accepts user data and returns a signed JWT 
 * => {token: {username, is_admin, iat}}
  */

function createToken(user) {
	let payload = {
		username : user.username,
		is_admin : user.is_admin
	};

	return jwt.sign(payload, SECRET_KEY);
}

module.exports = createToken;
