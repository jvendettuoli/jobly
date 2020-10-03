/** Jobs Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../../app');

const { afterAllSetup, afterEachSetup, testData, beforeEachSetup } = require('../config/setup');

beforeEach(async () => {
	await beforeEachSetup(testData);
});

describe('GET /jobs', async function() {
	test('Get a list of all jobs', async function() {
		const response = await request(app).get('/jobs').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : testData.testJob.title,
				company_handle : testData.testJob.company_handle
			}
		]);
	});
	test('Get a list of all jobs with good search parameter', async function() {
		const response = await request(app).get('/jobs?search=Test').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : testData.testJob.title,
				company_handle : testData.testJob.company_handle
			}
		]);
	});
	test('Return no jobs with bad search parameter', async function() {
		const response = await request(app).get('/jobs?search=badsearch').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
	test('Get a list of all jobs with good min salary parameter', async function() {
		const response = await request(app).get('/jobs?min_salary=10000').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : testData.testJob.title,
				company_handle : testData.testJob.company_handle
			}
		]);
	});
	test('Return no jobs with bad min salary parameter', async function() {
		const response = await request(app).get('/jobs?min_salary=90000').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
	test('Get a list of all jobs with good max salary parameter', async function() {
		const response = await request(app).get('/jobs?max_salary=90000').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([
			{
				title          : testData.testJob.title,
				company_handle : testData.testJob.company_handle
			}
		]);
	});
	test('Return no jobs with bad max salary parameter', async function() {
		const response = await request(app).get('/jobs?max_salary=10000').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.jobs).toEqual([]);
	});
});

describe('GET /jobs/:id', async function() {
	test('Get a specific job by id', async function() {
		const response = await request(app)
			.get(`/jobs/${testData.testJob.id}`)
			.send({ _token: testData.testUser.userToken });

		console.log(response);

		expect(response.statusCode).toBe(200);
		expect(response.body.job).toEqual({
			id          : testData.testJob.id,
			title       : testData.testJob.title,
			salary      : testData.testJob.salary,
			equity      : testData.testJob.equity,
			date_posted : expect.any(String),
			company     : {
				description   : testData.testCompany.description,
				handle        : testData.testCompany.handle,
				logo_url      : testData.testCompany.logo_url,
				name          : testData.testCompany.name,
				num_employees : testData.testCompany.num_employees
			}
		});
	});
	test('Invalid integer id returns 400', async function() {
		const response = await request(app).get(`/jobs/999`).send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 999');
	});
	test('Invalid noninteger id returns 400', async function() {
		const response = await request(app).get(`/jobs/invalid`).send({ _token: testData.testUser.userToken });

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
			company_handle : 'Test-Name',
			_token         : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(201);
		expect(response.body.job).toEqual({
			id             : expect.any(Number),
			title          : 'Test Tech',
			salary         : 40000,
			equity         : 0.1,
			date_posted    : expect.any(String),
			company_handle : testData.testCompany.handle
		});
	});

	test('Returns 400 for invalid post data - missing title', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 0.1,
			company_handle : 'Test-Name',
			_token         : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 400 for invalid post data - equity not > 1.0', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 999,
			company_handle : 'Test-Name',
			_token         : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 401 for lack of admin access', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 999,
			company_handle : 'Test-Name',
			_token         : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 999,
			company_handle : 'Test-Name',
			_token         : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).post(`/jobs/`).send({
			salary         : 40000,
			equity         : 999,
			company_handle : 'Test-Name'
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('PATCH /jobs/', async function() {
	test('Patch an existing job', async function() {
		const response = await request(app).patch(`/jobs/${testData.testJob.id}`).send({
			title  : 'Test Developer',
			salary : 60000,
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.job).toEqual({
			id          : testData.testJob.id,
			title       : 'Test Developer',
			salary      : 60000,
			equity      : testData.testJob.equity,
			date_posted : expect.any(String),
			company     : {
				handle        : testData.testCompany.handle,
				name          : testData.testCompany.name,
				num_employees : testData.testCompany.num_employees,
				description   : testData.testCompany.description,
				logo_url      : testData.testCompany.logo_url
			}
		});
	});
	test('Returns 400 for nonexistant job id', async function() {
		const response = await request(app).patch(`/jobs/9999`).send({
			title  : 'Test Developer',
			salary : 60000,
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 9999');
	});
	test('Returns 400 for invalid noninteger job id', async function() {
		const response = await request(app).patch(`/jobs/invalid`).send({
			title  : 'Test Developer',
			salary : 60000,
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Id must be an integer.');
	});
	test('Returns 400 for invalid patch data - equity not <1.0', async function() {
		const response = await request(app).patch(`/jobs/${testData.testJob.id}`).send({
			equity : 50,
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 401 for lack of admin access', async function() {
		const response = await request(app).patch(`/jobs/${testData.testJob.id}`).send({
			title  : 'Test Developer',
			salary : 60000,
			_token : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).patch(`/jobs/${testData.testJob.id}`).send({
			title  : 'Test Developer',
			salary : 60000,
			_token : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).patch(`/jobs/${testData.testJob.id}`).send({
			title  : 'Test Developer',
			salary : 60000
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('DELETE /jobs/', async function() {
	test('Delete a job', async function() {
		const response = await request(app).delete(`/jobs/${testData.testJob.id}`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('Job deleted');
	});
	test('Returns 400 for invalid job id', async function() {
		const response = await request(app).delete(`/jobs/9999`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No Job found with id 9999');
	});
	test('Returns 400 for invalid noninteger job id', async function() {
		const response = await request(app).delete(`/jobs/invalid`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Id must be an integer.');
	});

	test('Returns 401 for lack of admin access', async function() {
		const response = await request(app).delete(`/jobs/${testData.testJob.id}`).send({
			_token : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).delete(`/jobs/${testData.testJob.id}`).send({
			_token : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).delete(`/jobs/${testData.testJob.id}`);

		expect(response.statusCode).toBe(401);
	});
});

afterEach(async function() {
	await afterEachSetup();
});
afterAll(async function() {
	await afterAllSetup();
});
