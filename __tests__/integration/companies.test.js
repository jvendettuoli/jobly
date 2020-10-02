/** Companies Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../../app');

const { afterAllSetup, afterEachSetup, testData, beforeEachSetup } = require('./setup');

beforeEach(async () => {
	await beforeEachSetup(testData);
});

describe('GET /companies', async function() {
	test('Get a list of all companies', async function() {
		const response = await request(app).get('/companies').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : testData.testCompany.handle,
				name   : testData.testCompany.name
			}
		]);
	});
	test('Get a list of all companies with good search parameter', async function() {
		const response = await request(app).get('/companies?search=Test').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : testData.testCompany.handle,
				name   : testData.testCompany.name
			}
		]);
	});
	test('Return no companies with bad search parameter', async function() {
		const response = await request(app)
			.get('/companies?search=badsearch')
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
	test('Get a list of all companies with good min employees parameter', async function() {
		const response = await request(app)
			.get('/companies?min_employees=10')
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : testData.testCompany.handle,
				name   : testData.testCompany.name
			}
		]);
	});
	test('Return no companies with bad min employees parameter', async function() {
		const response = await request(app)
			.get('/companies?min_employees=100')
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
	test('Get a list of all companies with good max employees parameter', async function() {
		const response = await request(app)
			.get('/companies?max_employees=100')
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : testData.testCompany.handle,
				name   : testData.testCompany.name
			}
		]);
	});
	test('Return no companies with bad max employees parameter', async function() {
		const response = await request(app)
			.get('/companies?max_employees=10')
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
	test('Return 401 for bad token', async function() {
		const response = await request(app).get('/companies?max_employees=10').send({ _token: 'bad-token' });

		expect(response.statusCode).toBe(401);
	});
	test('Return 401 for no token', async function() {
		const response = await request(app).get('/companies?max_employees=10');

		expect(response.statusCode).toBe(401);
	});
});

describe('GET /companies/:handle', async function() {
	test('Get a specific company by handle', async function() {
		const response = await request(app)
			.get(`/companies/${testData.testCompany.handle}`)
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.company).toEqual({
			handle        : 'Test-Name',
			name          : 'Test Name',
			num_employees : 50,
			description   : 'Test Description for Test Name',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			jobs          : [
				{
					id          : testData.testJob.id,
					title       : testData.testJob.title,
					salary      : testData.testJob.salary,
					equity      : testData.testJob.equity,
					date_posted : expect.any(String)
				}
			]
		});
	});
	test('Invalid handle returns 400', async function() {
		const response = await request(app).get(`/companies/cacacachoo`).send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle cacacachoo');
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).get(`/companies/cacacachoo`).send({ _token: 'bad-token' });

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).get(`/companies/cacacachoo`);

		expect(response.statusCode).toBe(401);
	});
});

describe('POST /companies/', async function() {
	test('Create a new company', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(201);
		expect(response.body.company).toEqual({
			handle        : 'Test-Name2',
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});
	});
	test('Returns 400 for existing company', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Company name already exists.');
	});
	test('Returns 400 for invalid post data', async function() {
		const response = await request(app).post(`/companies/`).send({
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 401 for lack of admin authorization', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('PATCH /companies/', async function() {
	test('Patch an existing company', async function() {
		const response = await request(app).patch(`/companies/${testData.testCompany.handle}`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.company).toEqual({
			handle        : 'Test-Name',
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});
	});
	test('Returns 400 for invalid company handle', async function() {
		const response = await request(app).patch(`/companies/kaboom`).send({
			name          : 'Test Name',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle kaboom');
	});
	test('Returns 400 for invalid patch data', async function() {
		const response = await request(app).patch(`/companies/${testData.testCompany.handle}`).send({
			num_employees : -1,
			_token        : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 401 for lack of admin authorization', async function() {
		const response = await request(app).patch(`/companies/${testData.testCompany.handle}`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});

	test('Returns 401 for bad token', async function() {
		const response = await request(app).patch(`/companies/${testData.testCompany.handle}`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			_token        : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});

	test('Returns 401 for no token', async function() {
		const response = await request(app).patch(`/companies/${testData.testCompany.handle}`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('DELETE /companies/', async function() {
	test('Delete a company', async function() {
		const response = await request(app).delete(`/companies/${testData.testCompany.handle}`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('Company deleted');
	});
	test('Returns 400 for invalid company handle', async function() {
		const response = await request(app).delete(`/companies/kaboom`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle kaboom');
	});
	test('Returns 401 for lack of admin authorization', async function() {
		const response = await request(app).delete(`/companies/${testData.testCompany.handle}`).send({
			_token : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).delete(`/companies/${testData.testCompany.handle}`).send({
			_token : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
	});
	test('Returns 401 for no token', async function() {
		const response = await request(app).delete(`/companies/${testData.testCompany.handle}`);

		expect(response.statusCode).toBe(401);
	});
});

afterEach(async function() {
	await afterEachSetup();
});
afterAll(async function() {
	await afterAllSetup();
});
