const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
	try {
		const hashedPassword1 = await bcrypt.hash('test1', 1);
		const hashedPassword2 = await bcrypt.hash('test2', 1);
		const hashedPassword3 = await bcrypt.hash('test3', 1);
		await db.query(
			`INSERT INTO users
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES
            ('Test User 1', $1, 'Justin', 'Vendettuoli', 'jvend@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', true),
            ('Test User 2', $2, 'Greg', 'Miller', 'gmiller@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', false),
            ('Test User 3', $3, 'Mel', 'Messineo', 'messy@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', false);`,
			[ hashedPassword1, hashedPassword2, hashedPassword3 ]
		);

		await db.query(
			`INSERT INTO companies
            (handle, name, num_employees, description, logo_url)
            VALUES
            ('test1', 'Test Co.', 50, 'First test company', 'https://seekvectorlogo.com/wp-content/uploads/2018/03/mini-vector-logo-small.png'),
            ('test2', 'Test and Sons', 100, 'Second Test Company', 'https://www.freelogodesign.org/Content/img/logo-samples/bakary.png'),
            ('test3', 'Testers Inc.', 150, 'Third Test Company', 'https://www.freelogodesign.org/Content/img/logo-samples/barbara.png');

            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES
            ('Test Manager', 80000, 0.2, 'test1'),
            ('Test Boss', 400000, 0.75, 'test1'),
            ('Test Tech', 40000, 0.1, 'test2');`
		);

		await db.query(
			`INSERT INTO applications
            (username, job_id, state)
            VALUES
            ('Test User 1', 1, 'applied'),
            ('Test User 1', 2, 'interested'),
            ('Test User 2', 1, 'accepted')`
		);
	} catch (e) {
		console.log(`Error: ${e}`);
		process.exit(1);
	}
}
seed().then(() => {
	console.log('Data seeded');
	process.exit();
});
