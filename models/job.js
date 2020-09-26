/** Job Class */

const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {
	// constructor(handle, name, num_employees, description, logo_url) {
	// 	this.handle = handle;
	// 	this.name = name;
	// 	this.num_employees = num_employees;
	// 	this.description = description || 'No decription available.';
	// 	this.logo_url = logo_url;
	// }

	/** Return all jobs in database. queries may contain optional filters */
	static async all(queries) {
		console.debug('Class Job all - Start');

		// Throw error if query parameter min salary greater than or equal
		// to max_salary
		if (+queries.min_salary >= +queries.max_salary) {
			throw new ExpressError(
				'Query parameters are invalid. Minimum salary must be less than maximum salary.',
				400
			);
		}
		let queryIdx = 1;
		let whereStatements = [];
		let queryValues = [];
		let baseQuery = `SELECT title, company_handle
                FROM jobs`;

		// For each included query parameter, add appropriate language
		// to whereStatements and increment queryIdx by one.
		if (queries.search) {
			whereStatements.push(`to_tsvector(title) @@ to_tsquery($${queryIdx})`);
			queryIdx += 1;
			queryValues.push(queries.search);
		}
		if (queries.min_salary) {
			whereStatements.push(`salary >= $${queryIdx}`);
			queryIdx += 1;
			queryValues.push(queries.min_salary);
		}
		if (queries.max_salary) {
			whereStatements.push(`salary <= $${queryIdx}`);
			queryIdx += 1;
			queryValues.push(queries.max_salary);
		}

		let finalQuery = '';
		if (whereStatements.length > 0) {
			finalQuery = baseQuery.concat(' WHERE ', whereStatements.join(' AND '), ' ORDER BY date_posted');
		}
		const results = await db.query(finalQuery ? finalQuery : baseQuery, queryValues);
		return results.rows;
	}

	/** Create a Job in database and returns that Job data*/
	static async create(data) {
		console.debug('Class Job create - Start');

		try {
			const result = await db.query(
				`INSERT INTO jobs
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING title, salary, equity, company_handle, date_posted`,
				[ data.title, data.salary, data.equity, data.company_handle ]
			);
			return result.rows[0];
		} catch (e) {
			return e;
		}
	}

	/** Find a Job in database by handle and returns that Job data*/
	static async find(handle) {
		console.debug('Class Job find - Start');

		const result = await db.query(
			`SELECT handle, name, num_employees, description, logo_url FROM companies
                WHERE handle = $1`,
			[ handle ]
		);

		// Throw error if handle is not found
		if (result.rows.length === 0) {
			throw new ExpressError(`No Job found with handle ${handle}`, 400);
		}
		return result.rows[0];
	}

	/** Find a Job in database by handle, update it with provided 
     * data returns that Job data*/
	static async update(handle, data) {
		console.debug('Class Job update - Start');

		const { query, values } = sqlForPartialUpdate('companies', data, 'handle', handle);

		try {
			const result = await db.query(query, values);

			// Throw error if handle is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No Job found with handle ${handle}`, 400);
			}
			return result.rows[0];
		} catch (e) {
			if (e.code === '23505') {
				throw new ExpressError('Job name already exists.', 400);
			}
			return e;
		}
	}

	/** Find a Job in database by handle and delete it */
	static async delete(handle) {
		console.debug('Class Job delete - Start');
		try {
			const result = await db.query(
				`DELETE FROM companies
                WHERE handle = $1
                RETURNING handle`,
				[ handle ]
			);
			// Throw error if handle is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No Job found with handle ${handle}`, 400);
			}
		} catch (e) {
			return e;
		}
	}
}

module.exports = Job;
