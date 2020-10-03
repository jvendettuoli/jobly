/** Users Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../../app');
const User = require('../../models/user');

const { afterAllSetup, afterEachSetup, testData, beforeEachSetup } = require('../config/setup');

beforeEach(async () => {
	await beforeEachSetup(testData);
});

describe('GET /users', async function() {
	test('Get a list of all users', async function() {
		const response = await request(app).get('/users').send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.users).toEqual([
			{
				username   : testData.testUser.username,
				first_name : testData.testUser.first_name,
				last_name  : testData.testUser.last_name,
				email      : testData.testUser.email
			},
			{
				username   : testData.testAdmin.username,
				first_name : testData.testAdmin.first_name,
				last_name  : testData.testAdmin.last_name,
				email      : testData.testAdmin.email
			}
		]);
	});
});

describe('GET /users/:username', async function() {
	test('Get a specific user by username', async function() {
		const response = await request(app)
			.get(`/users/${testData.testUser.username}`)
			.send({ _token: testData.testUser.userToken });

		expect(response.statusCode).toBe(200);
		expect(response.body.user).toEqual({
			username   : testData.testUser.username,
			first_name : testData.testUser.first_name,
			last_name  : testData.testUser.last_name,
			email      : testData.testUser.email,
			photo_url  : testData.testUser.photo_url,
			jobs       : [
				{
					created_at : expect.any(String),
					id         : expect.any(Number),
					state      : 'applied'
				}
			]
		});
		expect(response.body.user).not.toHaveProperty('password');
	});
	test('Invalid username returns 400', async function() {
		const response = await request(app).get(`/users/cacacachoo`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No User found with username cacacachoo');
	});
});

describe('POST /users/', async function() {
	test('Create a new user', async function() {
		const response = await request(app).post(`/users/`).send({
			username   : 'Test User 2',
			password   : 'Hashed password2',
			first_name : 'Rob',
			last_name  : 'Rugged',
			email      : 'ruggy@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			is_admin   : false
		});

		expect(response.statusCode).toBe(201);
		expect(response.body).toHaveProperty('token');
		const newUser = await User.find('Test User 2');
		expect(newUser).toEqual({
			username   : 'Test User 2',
			first_name : 'Rob',
			last_name  : 'Rugged',
			email      : 'ruggy@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			jobs       : [ 'No applications' ]
		});
	});
	test('Returns 400 for existing username', async function() {
		const response = await request(app).post(`/users/`).send({
			username   : 'Test User 1',
			password   : 'Hashed password1',
			first_name : 'Justin',
			last_name  : 'Vendettuoli',
			email      : 'jendettuoli@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			is_admin   : true
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Username already exists.');
	});
	test('Returns 400 for existing email', async function() {
		const response = await request(app).post(`/users/`).send({
			username   : 'Test User 3',
			password   : 'Hashed password1',
			first_name : 'Justin',
			last_name  : 'Vendettuoli',
			email      : 'jendettul@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			is_admin   : true
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('Email already associated with another username.');
	});
	test('Returns 400 for invalid post data - no password', async function() {
		const response = await request(app).post(`/users/`).send({
			username   : 'Test User 3',
			first_name : 'Justin',
			last_name  : 'Vendettuoli',
			email      : 'jendettul@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			is_admin   : true
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('PATCH /users/', async function() {
	test('Patch an existing user', async function() {
		const response = await request(app).patch(`/users/${testData.testUser.username}`).send({
			first_name : 'Taco',
			last_name  : 'McGee',
			_token     : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.user).toEqual({
			username   : 'Test User 1',
			first_name : 'Taco',
			last_name  : 'McGee',
			email      : 'jendettul@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg'
		});
	});
	test('Returns 400 for invalid user username', async function() {
		const response = await request(app).patch(`/users/kaboom`).send({
			first_name : 'Taco',
			last_name  : 'McGee',
			_token     : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(401);
		expect(response.body.message).toEqual('Unauthorized - Must be same user');
	});
	test('Returns 400 for invalid patch data - bad email', async function() {
		const response = await request(app).patch(`/users/${testData.testUser.username}`).send({
			email  : 'bad-email',
			_token : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(400);
	});
	test('Returns 401 for request by different user', async function() {
		const response = await request(app).patch(`/users/${testData.testUser.username}`).send({
			first_name : 'Taco',
			last_name  : 'McGee',
			_token     : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(401);
		expect(response.body.message).toEqual('Unauthorized - Must be same user');
	});
	test('Returns 401 for bad token', async function() {
		const response = await request(app).patch(`/users/${testData.testUser.username}`).send({
			first_name : 'Taco',
			last_name  : 'McGee',
			_token     : 'bad-token'
		});

		expect(response.statusCode).toBe(401);
		expect(response.body.message).toEqual('Unauthorized - Must be same user');
	});
});

describe('DELETE /users/', async function() {
	test('Delete a user', async function() {
		const response = await request(app).delete(`/users/${testData.testUser.username}`).send({
			_token : testData.testUser.userToken
		});

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('User deleted');
	});
	test('Returns 401 for invalid user username', async function() {
		const response = await request(app).delete(`/users/kaboom`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(401);
		expect(response.body.message).toEqual('Unauthorized - Must be same user');
	});
	test('Returns 401 for request by different user ', async function() {
		const response = await request(app).delete(`/users/${testData.testUser.username}`).send({
			_token : testData.testAdmin.userToken
		});

		expect(response.statusCode).toBe(401);
		expect(response.body.message).toEqual('Unauthorized - Must be same user');
	});
});

afterEach(async function() {
	await afterEachSetup();
});
afterAll(async function() {
	await afterAllSetup();
});
