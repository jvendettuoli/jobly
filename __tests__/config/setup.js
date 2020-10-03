/**Setup for integration tests
 * Creates standard user, admin user, company, and job
 * to be used in other tests.
 */
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
const app = require('../../app');
const db = require('../../db');

//Store test data for access in test files
let testData = {
	testUser    : {
		username   : 'Test User 1',
		password   : 'pw1',
		first_name : 'Justin',
		last_name  : 'Vendettuoli',
		email      : 'jendettul@gmail.com',
		photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
		is_admin   : false
	},

	testAdmin   : {
		username   : 'Test Admin 1',
		password   : 'pw2',
		first_name : 'Mel',
		last_name  : 'Messineo',
		email      : 'admin@biz.com',
		photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
		is_admin   : true
	},
	testCompany : {
		handle        : 'Test-Name',
		name          : 'Test Name',
		num_employees : 50,
		description   : 'Test Description for Test Name',
		logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
	},
	testJob     : {
		title          : 'Test Manager',
		salary         : 80000,
		equity         : 0.25,
		company_handle : 'Test-Name'
	},
	testApp     : {}
};

/**Before Each functions to run before each test create new
 * test data
 */
async function beforeEachSetup(testData) {
	try {
		console.debug('Test Setup - Start');
		//Create User
		const hashedUserPassword = await bcrypt.hash(testData.testUser.password, 1);
		await db.query(
			`INSERT INTO users
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
			[
				testData.testUser.username,
				hashedUserPassword,
				testData.testUser.first_name,
				testData.testUser.last_name,
				testData.testUser.email,
				testData.testUser.photo_url,
				testData.testUser.is_admin
			]
		);
		//Create Admin
		const hashedAdminPassword = await bcrypt.hash(testData.testAdmin.password, 1);
		await db.query(
			`INSERT INTO users
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
			[
				testData.testAdmin.username,
				hashedAdminPassword,
				testData.testAdmin.first_name,
				testData.testAdmin.last_name,
				testData.testAdmin.email,
				testData.testAdmin.photo_url,
				testData.testAdmin.is_admin
			]
		);
		//Login both users
		const responseUser = await request(app).post('/login').send({
			username : testData.testUser.username,
			password : testData.testUser.password
		});
		testData.testUser.userToken = responseUser.body.token;

		const responseAdmin = await request(app).post('/login').send({
			username : testData.testAdmin.username,
			password : testData.testAdmin.password
		});
		testData.testAdmin.userToken = responseAdmin.body.token;

		//Create Company
		await db.query(
			`INSERT INTO companies
            (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`,
			[
				testData.testCompany.handle,
				testData.testCompany.name,
				testData.testCompany.num_employees,
				testData.testCompany.description,
				testData.testCompany.logo_url
			]
		);

		//Create Job
		let jobResult = await db.query(
			`INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
			[
				testData.testJob.title,
				testData.testJob.salary,
				testData.testJob.equity,
				testData.testJob.company_handle
			]
		);
		testData.testJob = jobResult.rows[0];

		//Create Application
		let appResult = await db.query(
			`INSERT INTO applications
            (username, job_id, state)
            VALUES
			($1, $2, $3)
			RETURNING *`,
			[ testData.testUser.username, testData.testJob.id, 'applied' ]
		);
		testData.testApp = appResult.rows;
	} catch (e) {
		console.debug('Error setting up testData: ', e);
	}
}

async function afterEachSetup() {
	try {
		await db.query('DELETE FROM users');
		await db.query('DELETE FROM companies');
		await db.query('DELETE FROM jobs');
	} catch (e) {
		console.error(e);
	}
}

async function afterAllSetup() {
	try {
		await db.end();
	} catch (e) {
		console.error(e);
	}
}

module.exports = {
	afterAllSetup,
	afterEachSetup,
	testData,
	beforeEachSetup
};
