/** Users Routes Tests */
const request = require('supertest');

process.env.NODE_ENV = 'test';
const db = require('../../db');
const app = require('../../app');

// Global variables for testing
let userData = {
	username   : 'Test User 1',
	password   : 'Hashed password1',
	first_name : 'Justin',
	last_name  : 'Vendettuoli',
	email      : 'jendettul@gmail.com',
	photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
	is_admin   : true
};

beforeEach(async () => {
	await db.query(
		`INSERT INTO users
		(username, password, first_name, last_name, email, photo_url, is_admin)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
		[
			userData.username,
			userData.password,
			userData.first_name,
			userData.last_name,
			userData.email,
			userData.photo_url,
			userData.is_admin
		]
	);
});

describe('GET /users', async function() {
	test('Get a list of all users', async function() {
		const response = await request(app).get('/users');

		expect(response.statusCode).toBe(200);
		expect(response.body.users).toEqual([
			{
				username   : userData.username,
				first_name : userData.first_name,
				last_name  : userData.last_name,
				email      : userData.email
			}
		]);
	});
});

describe('GET /users/:username', async function() {
	test('Get a specific user by username', async function() {
		const response = await request(app).get(`/users/${userData.username}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.user).toEqual({
			username   : 'Test User 1',
			first_name : 'Justin',
			last_name  : 'Vendettuoli',
			email      : 'jendettul@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg'
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
		expect(response.body.user).toEqual({
			username   : 'Test User 2',
			password   : 'Hashed password2',
			first_name : 'Rob',
			last_name  : 'Rugged',
			email      : 'ruggy@gmail.com',
			photo_url  : 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
			is_admin   : false
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
		const response = await request(app).patch(`/users/${userData.username}`).send({
			first_name : 'Taco',
			last_name  : 'McGee'
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
			last_name  : 'McGee'
		});

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No User found with username kaboom');
	});
	test('Returns 400 for invalid patch data - bad email', async function() {
		const response = await request(app).patch(`/users/${userData.username}`).send({
			email : 'bad-email'
		});

		expect(response.statusCode).toBe(400);
	});
});

describe('DELETE /users/', async function() {
	test('Delete a user', async function() {
		const response = await request(app).delete(`/users/${userData.username}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.message).toEqual('User deleted');
	});
	test('Returns 400 for invalid user username', async function() {
		const response = await request(app).delete(`/users/kaboom`);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toEqual('No User found with username kaboom');
	});
});

afterEach(async function() {
	await db.query('DELETE FROM users');
});
afterAll(async function() {
	await db.end();
});
