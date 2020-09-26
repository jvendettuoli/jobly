
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS jobs;

CREATE TABLE companies
(
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs
(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL CHECK (equity <= 1.0),
    company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);