/** Companies Routes */
const express = require('express');
const { validate } = require('jsonschema');

const Company = require('../models/company');
const ExpressError = require('../helpers/expressError');
const { companyNewSchema, companyUpdateSchema } = require('../schemas');

const router = new express.Router();

/**GET /companies  
 *  
 * Can take query parameters search, min_employees, and/or max employees
 * which filter the query statement
 * 
 * => {companies: [{handle, name},...]}
 */

router.get('/', async function(req, res, next) {
	console.debug('Routes companies GET / - Start');

	try {
		const companies = await Company.all(req.query);
		return res.json({ companies });
	} catch (e) {
		return next(e);
	}
});

/**POST /companies  
 *
 *  Takes JSON object {name, num_employees, description, logo_url}
 * 
 * => {company: {handle, name, num_employees, description, logo_url}
 */

router.post('/', async function(req, res, next) {
	console.debug('Routes companies POST / - Start');

	try {
		const validation = validate(req.body, companyNewSchema);
		if (!validation.valid) {
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}
		const company = await Company.create(req.body);
		return res.status(201).json({ company });
	} catch (e) {
		if (e.code === '23505') {
			throw new ExpressError('Company name already exists.', 400);
		}
		return next(e);
	}
});

/**GET /companies:handle  
 *
 *  Finds a company by its handle
 * 
 * => {company: {handle, name, num_employees, description, logo_url}
 */

router.get('/:handle', async function(req, res, next) {
	console.debug('Routes companies GET /:handle - Start');

	try {
		const company = await Company.find(req.params.handle);
		if (company instanceof ExpressError) {
			return next(company);
		}
		return res.json({ company });
	} catch (e) {
		return next(e);
	}
});

/**PATCH /companies:handle  
 *
 *  Finds a company by its handle and update some of its data
 *  Takes JSON object with any of the keys 
 *  {name, num_employees, description, logo_url}
 * 
 * => {company: {handle, name, num_employees, description, logo_url}
 */

router.patch('/:handle', async function(req, res, next) {
	console.debug('Routes companies GET /:handle - Start');

	try {
		const validation = validate(req.body, companyUpdateSchema);
		if (!validation.valid) {
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}

		const company = await Company.update(req.params.handle, req.body);
		if (company instanceof ExpressError) {
			return next(company);
		}
		return res.json({ company });
	} catch (e) {
		return next(e);
	}
});

/**DELETE /companies:handle  
 *
 *  Finds a company by its handle and deletes it
 * 
 * => {message: Company delete}
 */

router.delete('/:handle', async function(req, res, next) {
	console.debug('Routes companies DELETE /:handle - Start');

	try {
		const result = await Company.delete(req.params.handle);
		if (result instanceof ExpressError) {
			return next(result);
		}
		return res.json({ message: 'Company deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
