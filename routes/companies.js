/** Companies Routes */
const express = require('express');
const Company = require('../models/company');
const ExpressError = require('../helpers/expressError');
const router = new express.Router();

/**GET /companies  
 *  
 * Can take query parameters search, min_employees, and/or max employees
 * which filter the query statement
 * 
 * => {companies: [{handle, name},...]}
 */

router.get('/', async function(req, res, next) {
	try {
		console.debug('Routes companies GET /: Start');
		console.log('Query', req.query);
		const companies = await Company.all(req.query);
		return res.json({ companies });
	} catch (e) {
		return next(e);
	}
});
/**POST /companies  
 *
 * 
 * => {companies: [{handle, name},...]}
 */

router.post('/', async function(req, res, next) {
	try {
		console.debug('Routes companies GET /: Start');
		console.log('Query', req.query);
		const companies = await Company.all(req.query);
		return res.json({ companies });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
