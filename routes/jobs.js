/** Jobs Routes */
const express = require('express');
const { validate } = require('jsonschema');

const Job = require('../models/job');
const ExpressError = require('../helpers/expressError');
const { jobNewSchema, jobUpdateSchema } = require('../schemas');
const { authenticateJWT, ensureAdmin } = require('../middleware/auth');

const router = new express.Router();

/**GET /jobs  
 *  
 * Can take query parameters search, min_employees, and/or max employees
 * which filter the query statement
 * 
 * => {jobs: [{title, company_handle},...]}
 */

router.get('/', authenticateJWT, async function(req, res, next) {
	console.debug('Routes jobs GET / - Start');

	try {
		const jobs = await Job.all(req.query);
		return res.json({ jobs });
	} catch (e) {
		return next(e);
	}
});

/**POST /jobs
 *
 *  Takes JSON object {title, salary, equity, company_handle}
 *
 * => {job: {id,title, salary, equity, company_handle, date_posted}}
 */

router.post('/', ensureAdmin, async function(req, res, next) {
	console.debug('Routes jobs POST / - Start');

	try {
		const validation = validate(req.body, jobNewSchema);
		if (!validation.valid) {
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}
		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (e) {
		return next(e);
	}
});

/**POST /jobs/:id/apply
 *	Creates or updates an application
 *  Takes JSON object {state: string-of-application-state}
 *
 * => {message: new-state}
 */

router.post('/:id/apply', authenticateJWT, async function(req, res, next) {
	console.debug('Routes jobs POST /:id/apply - Start');

	try {
		const application = await Job.apply(req.user.username, req.params.id, req.body.state);
		return res.status(201).json({ message: application.state });
	} catch (e) {
		return next(e);
	}
});

/**GET /jobs:id
 *
 *  Finds a job by its id
 *
 * => {job: {id, title, salary, equity, date_posted, company:{companyData}}}
 */

router.get('/:id', authenticateJWT, async function(req, res, next) {
	console.debug('Routes jobs GET /:id - Start');

	try {
		if (!Number.isInteger(+req.params.id)) {
			throw new ExpressError('Id must be an integer.', 400);
		}
		const job = await Job.find(req.params.id);
		if (job instanceof ExpressError) {
			return next(job);
		}
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/**PATCH /jobs:id
 *
 *  Finds a job by its id and update some of its data
 *  Takes JSON object with any of the keys
 *  {title, salary, equity,}
 *
 * => {job:{id, title, salary, equity, date_posted, company:{companyData}}}
 */

router.patch('/:id', ensureAdmin, async function(req, res, next) {
	console.debug('Routes jobs GET /:id - Start');

	try {
		if (!Number.isInteger(+req.params.id)) {
			throw new ExpressError('Id must be an integer.', 400);
		}
		const validation = validate(req.body, jobUpdateSchema);
		if (!validation.valid) {
			throw new ExpressError(validation.errors.map((e) => e.stack), 400);
		}

		const job = await Job.update(req.params.id, req.body);
		if (job instanceof ExpressError) {
			return next(job);
		}
		return res.json({ job });
	} catch (e) {
		return next(e);
	}
});

/**DELETE /jobs:id
 *
 *  Finds a job by its id and deletes it
 *
 * => {message: job delete}
 */

router.delete('/:id', ensureAdmin, async function(req, res, next) {
	console.debug('Routes jobs DELETE /:id - Start');

	try {
		if (!Number.isInteger(+req.params.id)) {
			throw new ExpressError('Id must be an integer.', 400);
		}
		const result = await Job.delete(req.params.id);
		if (result instanceof ExpressError) {
			return next(result);
		}
		return res.json({ message: 'Job deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
