/** Jobs Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const db = require('../../db');
const app = require('../../app');

// Global variables for testing
let jobData = {
	title          : 'Test Manager',
	salary         : 80000,
	equity         : 0.25,
	company_handle : 'Test-Name'
};
let companyData = {
	handle        : 'Test-Name',
	name          : 'Test Name',
	num_employees : 50,
	description   : 'Test Description for Test Name',
	logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
};

beforeEach(async () => {
	await db.query(
		`INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
		[
			companyData.handle,
			companyData.name,
			companyData.num_employees,
			companyData.description,
			companyData.logo_url
		]
	);

	jobData = await db.query(
		`INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle, date_posted`,
		[ jobData.title, jobData.salary, jobData.equity, jobData.company_handle ]
	);
	jobData = jobData.rows[0];
});

describe('GET /jobs', async function() {
	test('Get a list of all jobs', async function() {
		const response = await request(app).get('/jobs');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : jobData.title,
				company_handle : jobData.company_handle
			}
		]);
	});
	test('Get a list of all jobs with good search parameter', async function() {
		const response = await request(app).get('/jobs?search=Test');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : jobData.title,
				company_handle : jobData.company_handle
			}
		]);
	});
	test('Return no jobs with bad search parameter', async function() {
		const response = await request(app).get('/jobs?search=badsearch');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
	test('Get a list of all jobs with good min salary parameter', async function() {
		const response = await request(app).get('/jobs?min_salary=10000');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : jobData.title,
				company_handle : jobData.company_handle
			}
		]);
	});
	test('Return no jobs with bad min salary parameter', async function() {
		const response = await request(app).get('/jobs?min_salary=90000');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
	test('Get a list of all jobs with good max salary parameter', async function() {
		const response = await request(app).get('/jobs?max_salary=90000');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : jobData.title,
				company_handle : jobData.company_handle
			}
		]);
	});
	test('Return no jobs with bad max salary parameter', async function() {
		const response = await request(app).get('/jobs?max_salary=10000');

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
});

describe('GET /jobs/:id', async function() {
	test('Get a specific job by id', async function() {
		const response = await request(app).get(`/jobs/${jobData.id}`);

		console.log(response);

		expect(response.statusCode).toBe(200);
		expect(response.body.job).toEqual({
			id          : jobData.id,
			title       : jobData.title,
			salary      : jobData.salary,
			equity      : jobData.equity,
			date_posted : expect.any(String),
			company     : {
				description   : companyData.description,
				handle        : companyData.handle,
				logo_url      : companyData.logo_url,
				name          : companyData.name,
				num_employees : companyData.num_employees
			}
		});
	});
	test('Invalid integer id returns 400', async function() {
		const response = await request(app).get(`/jobs/999`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 999');
	});
	test('Invalid noninteger id returns 400', async function() {
		const response = await request(app).get(`/jobs/invalid`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Id must be an integer.');
	});
});

describe('POST /jobs/', async function() {
	test('Create a new job', async function() {
		const response = await request(app).post(`/jobs/`).send({
			title          : 'Test Tech',
			salary         : 40000,
			equity         : 0.1,
			company_handle : 'Test-Name'
		});

		expect(response.statusCode).toBe(201);
		expect(response.body.job).toEqual({
			id             : expect.any(Number),
			title          : 'Test Tech',
			salary         : 40000,
			equity         : 0.1,
			date_posted    : expect.any(String),
			company_handle : companyData.handle
		});
	});

	test('Returns 400 for invalid post data - missing title', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 0.1,
			company_handle : 'Test-Name'
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 400 for invalid post data - equity not > 1.0', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 999,
			company_handle : 'Test-Name'
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('PATCH /jobs/', async function() {
	test('Patch an existing job', async function() {
		const response = await request(app).patch(`/jobs/${jobData.id}`).send({
			title  : 'Test Developer',
			salary : 60000
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.job).toEqual({
			id          : jobData.id,
			title       : 'Test Developer',
			salary      : 60000,
			equity      : jobData.equity,
			date_posted : expect.any(String),
			company     : {
				handle        : companyData.handle,
				name          : companyData.name,
				num_employees : companyData.num_employees,
				description   : companyData.description,
				logo_url      : companyData.logo_url
			}
		});
	});
	test('Returns 400 for nonexistant job id', async function() {
		const response = await request(app).patch(`/jobs/9999`).send({
			title  : 'Test Developer',
			salary : 60000
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 9999');
	});
	test('Returns 400 for invalid noninteger job id', async function() {
		const response = await request(app).patch(`/jobs/invalid`).send({
			title  : 'Test Developer',
			salary : 60000
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Id must be an integer.');
	});
	test('Returns 400 for invalid patch data - equity not <1.0', async function() {
		const response = await request(app).patch(`/jobs/${jobData.id}`).send({
			equity : 50
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('DELETE /jobs/', async function() {
	test('Delete a job', async function() {
		const response = await request(app).delete(`/jobs/${jobData.id}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('Job deleted');
	});
	test('Returns 400 for invalid job id', async function() {
		const response = await request(app).delete(`/jobs/9999`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 9999');
	});
	test('Returns 400 for invalid noninteger job id', async function() {
		const response = await request(app).delete(`/jobs/invalid`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Id must be an integer.');
	});
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
	await db.query('DELETE FROM jobs');
});
afterAll(async function() {
	await db.end();
});
