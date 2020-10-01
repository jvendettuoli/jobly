/** Company Class */
const slugify = require('slugify');

const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
	/** Return all companies in database. queries may contain optional filters */
	static async all(queries) {
		console.debug('Class Company all - Start');

		// Throw error if query parameter min employees greater than or equal
		// to max_employees
		if (+queries.min_employees >= +queries.max_employees) {
			throw new ExpressError(
				'Query parameters are invalid. Minimum number of employees must be less than maximum number of employees.',
				400
			);
		}
		let queryIdx = 1;
		let whereStatements = [];
		let queryValues = [];
		let baseQuery = `SELECT handle, name
                FROM companies`;

		// For each included query parameter, add appropriate language
		// to whereStatements and increment queryIdx by one.
		if (queries.search) {
			whereStatements.push(`to_tsvector(name) @@ to_tsquery($${queryIdx})`);
			queryIdx += 1;
			queryValues.push(queries.search);
		}
		if (queries.min_employees) {
			whereStatements.push(`num_employees >= $${queryIdx}`);
			queryIdx += 1;
			queryValues.push(queries.min_employees);
		}
		if (queries.max_employees) {
			whereStatements.push(`num_employees <= $${queryIdx}`);
			queryIdx += 1;
			queryValues.push(queries.max_employees);
		}

		let finalQuery = '';
		if (whereStatements.length > 0) {
			finalQuery = baseQuery.concat(' WHERE ', whereStatements.join(' AND '));
		}

		const results = await db.query(finalQuery ? finalQuery : baseQuery, queryValues);
		return results.rows;
	}

	/** Create a company in database and returns that company data*/
	static async create(data) {
		console.debug('Class Company create - Start');
		const handle = slugify(data.name);

		try {
			const result = await db.query(
				`INSERT INTO companies
                (handle, name, num_employees, description, logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING handle, name, num_employees, description, logo_url`,
				[ handle, data.name, data.num_employees, data.description, data.logo_url ]
			);
			return result.rows[0];
		} catch (e) {
			// Throw specific error if duplicate value found
			if (e.code === '23505') {
				throw new ExpressError('Company name already exists.', 400);
			}
			return e;
		}
	}

	/** Find a company in database by handle and returns that company data*/
	static async find(handle) {
		console.debug('Class Company find - Start');

		const result = await db.query(
			`SELECT handle, name, num_employees, description, logo_url FROM companies
                WHERE handle = $1`,
			[ handle ]
		);

		// Throw error if handle is not found
		if (result.rows.length === 0) {
			throw new ExpressError(`No company found with handle ${handle}`, 400);
		}
		let company = result.rows[0];
		const jobsResults = await db.query(
			`SELECT id, title, salary, equity, date_posted
            FROM jobs
            WHERE company_handle = $1`,
			[ company.handle ]
		);

		company['jobs'] = jobsResults.rows.length === 0 ? [ 'No jobs available.' ] : jobsResults.rows[0];

		return company;
	}

	/** Find a company in database by handle, update it with provided 
     * data returns that company data*/
	static async update(handle, data) {
		console.debug('Class Company update - Start');

		const { query, values } = sqlForPartialUpdate('companies', data, 'handle', handle);

		try {
			const result = await db.query(query, values);

			// Throw error if handle is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No company found with handle ${handle}`, 400);
			}
			return result.rows[0];
		} catch (e) {
			if (e.code === '23505') {
				throw new ExpressError('Company name already exists.', 400);
			}
			return e;
		}
	}

	/** Find a company in database by handle and delete it */
	static async delete(handle) {
		console.debug('Class Company delete - Start');
		try {
			const result = await db.query(
				`DELETE FROM companies
                WHERE handle = $1
                RETURNING handle`,
				[ handle ]
			);
			// Throw error if handle is not found
			if (result.rows.length === 0) {
				throw new ExpressError(`No company found with handle ${handle}`, 400);
			}
		} catch (e) {
			return e;
		}
	}
}

module.exports = Company;
