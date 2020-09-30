/** Companies Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const db = require('../../db');
const app = require('../../app');

// Global variables for testing
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
});

describe('GET /companies', async function() {
	test('Get a list of all companies', async function() {
		const response = await request(app).get('/companies');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : companyData.handle,
				name   : companyData.name
			}
		]);
	});
	test('Get a list of all companies with good search parameter', async function() {
		const response = await request(app).get('/companies?search=Test');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : companyData.handle,
				name   : companyData.name
			}
		]);
	});
	test('Return no companies with bad search parameter', async function() {
		const response = await request(app).get('/companies?search=badsearch');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
	test('Get a list of all companies with good min employees parameter', async function() {
		const response = await request(app).get('/companies?min_employees=10');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : companyData.handle,
				name   : companyData.name
			}
		]);
	});
	test('Return no companies with bad min employees parameter', async function() {
		const response = await request(app).get('/companies?min_employees=100');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
	test('Get a list of all companies with good max employees parameter', async function() {
		const response = await request(app).get('/companies?max_employees=100');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([
			{
				handle : companyData.handle,
				name   : companyData.name
			}
		]);
	});
	test('Return no companies with bad max employees parameter', async function() {
		const response = await request(app).get('/companies?max_employees=10');

		expect(response.statusCode).toBe(200);
		expect(response.body.companies).toEqual([]);
	});
});

describe('GET /companies/:handle', async function() {
	test('Get a specific company by handle', async function() {
		const response = await request(app).get(`/companies/${companyData.handle}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.company).toEqual({
			handle        : 'Test-Name',
			name          : 'Test Name',
			num_employees : 50,
			description   : 'Test Description for Test Name',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png',
			jobs          : [ 'No jobs available.' ]
		});
	});
	test('Invalid handle returns 400', async function() {
		const response = await request(app).get(`/companies/cacacachoo`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle cacacachoo');
	});
});

describe('POST /companies/', async function() {
	test('Create a new company', async function() {
		const response = await request(app).post(`/companies/`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
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
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Company name already exists.');
	});
	test('Returns 400 for invalid post data', async function() {
		const response = await request(app).post(`/companies/`).send({
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('PATCH /companies/', async function() {
	test('Patch an existing company', async function() {
		const response = await request(app).patch(`/companies/${companyData.handle}`).send({
			name          : 'Test Name2',
			num_employees : 502,
			description   : 'Test Description for Test Name2',
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
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
			logo_url      : 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png'
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle kaboom');
	});
	test('Returns 400 for invalid patch data', async function() {
		const response = await request(app).patch(`/companies/${companyData.handle}`).send({
			num_employees : -1
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('DELETE /companies/', async function() {
	test('Delete a company', async function() {
		const response = await request(app).delete(`/companies/${companyData.handle}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('Company deleted');
	});
	test('Returns 400 for invalid company handle', async function() {
		const response = await request(app).delete(`/companies/kaboom`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No company found with handle kaboom');
	});
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
});
afterAll(async function() {
	await db.end();
});
