/** Company Class */
const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Company {
	constructor(handle, name, num_employees, description, logo_url) {
		this.handle = handle;
		this.name = name;
		this.num_employees = num_employees;
		this.description = description || 'No decription available.';
		this.logo_url = logo_url;
	}

	static async all(queries) {
		console.debug('Class Company all: Start');

		if (+queries.min_employees >= +queries.max_employees) {
			throw new ExpressError(
				'Query parameters are invalid. Minimum number of emloyees must be less than maximum number of employees.',
				400
			);
		}
		let queryIdx = 1;
		let whereStatements = [];
		let baseQuery = `SELECT handle, name
                FROM companies`;

		if (queries.search) {
			whereStatements.push(`to_tsvector(name) @@ to_tsquery($${queryIdx})`);
			queryIdx += 1;
		}
		if (queries.min_employees) {
			whereStatements.push(`num_employees >= $${queryIdx}`);
			queryIdx += 1;
		}
		if (queries.max_employees) {
			whereStatements.push(`num_employees <= $${queryIdx}`);
			queryIdx += 1;
		}

		let finalQuery = '';
		if (whereStatements.length > 0) {
			finalQuery = baseQuery.concat(' WHERE ', whereStatements.join(' AND '));
		}

		try {
			const results = await db.query(finalQuery ? finalQuery : baseQuery, Object.values(queries));
			return results.rows;
		} catch (e) {
			return e;
		}
	}

	static async create() {
		console.debug('Class Company create: Start');
	}
}

module.exports = Company;
