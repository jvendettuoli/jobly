INSERT INTO companies
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
    ('Test Tech', 40000, 0.1, 'test2');

INSERT INTO users
    (username, password, first_name, last_name, email, photo_url, is_admin)
VALUES
    ('Test User 1', 'Hashed password1', 'Justin', 'Vendettuoli', 'jvend@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', true),
    ('Test User 2', 'hashed password2', 'Greg', 'Miller', 'gmiller@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', false),
    ('Test User 3', 'hashed password3', 'Mel', 'Messineo', 'messy@gmail.com', 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg', false);