/** User Class */

const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class User {
	/** Return all users in database.  */
	static async all() {
		console.debug('Class User all - Start');

		const results = await db.query(
			`SELECT username, first_name, last_name, email
			FROM users`
		);
		return results.rows;
	}

	/** Create a User in database and returns that User data*/
	static async create(data) {
		console.debug('Class User create - Start');

		try {
			const result = await db.query(
				`INSERT INTO users
                (username, password, first_name, last_name, email, photo_url, is_admin)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
				[
					data.username,
					data.password,
					data.first_name,
					data.last_name,
					data.email,
					data.photo_url,
					data.is_admin
				]
			);
			return result.rows[0];
		} catch (e) {
			if (e.code === '23505') {
				if (e.constraint === 'users_email_key') {
					throw new ExpressError('Email already associated with another username.', 400);
				}
				if (e.constraint === 'users_pkey') {
					throw new ExpressError('Username name already exists.', 400);
				}
			}
			return e;
		}
	}

	/** Find a User in database by username and returns that User data*/
	static async find(username) {
		console.debug('Class User find - Start');

		const result = await db.query(
			`SELECT username, first_name, last_name, email, photo_url, is_admin
			FROM users
			WHERE username = $1`,
			[ username ]
		);

		// Throw error if username is not found
		if (result.rows.length === 0) {
			throw new ExpressError(`No User found with username ${username}`, 400);
		}
		return result.rows[0];
	}

	/** Find a User in database by username, update it with provided 
     * data returns that User data*/
	static async update(username, data) {
		console.debug('Class User update - Start');

		const { query, values } = sqlForPartialUpdate('users', data, 'username', username);

		try {
			const result = await db.query(query, values);

			// Throw error if username is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No User found with username ${username}`, 400);
			}
			return result.rows[0];
		} catch (e) {
			return e;
		}
	}

	/** Find a User in database by username and delete it */
	static async delete(username) {
		console.debug('Class User delete - Start');
		try {
			const result = await db.query(
				`DELETE FROM users
                WHERE username = $1
                RETURNING username`,
				[ username ]
			);
			// Throw error if username is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No User found with username ${username}`, 400);
			}
		} catch (e) {
			return e;
		}
	}
}

module.exports = User;
