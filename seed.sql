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