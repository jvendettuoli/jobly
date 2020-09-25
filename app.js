/** Express app for jobly. */
const express = require('express');
const morgan = require('morgan');

const ExpressError = require('./helpers/expressError');
const companiesRoutes = require('./routes/companies');

const app = express();

app.use(express.json());

app.use('/companies', companiesRoutes);

// add logging system
app.use(morgan('tiny'));

/** 404 handler */

app.use(function(req, res, next) {
	const err = new ExpressError('Not Found', 404);

	// pass the error to the next piece of middleware
	return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	console.error(err.stack);

	return res.json({
		status  : err.status,
		message : err.message
	});
});

module.exports = app;
