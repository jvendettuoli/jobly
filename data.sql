DROP TYPE IF EXISTS state;
DROP TABLE IF EXISTS
companies, users, jobs, applications, technologies
CASCADE;



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
    -- technology TEXT REFERENCES technologies
);

CREATE TABLE users
(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false
    -- technology TEXT REFERENCES technologies
);

CREATE TYPE state AS ENUM
('interested', 'applied', 'accepted', 'rejected');

CREATE TABLE applications
(
    username TEXT REFERENCES users ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs ON DELETE CASCADE,
    state state,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(username, job_id)
);

-- CREATE TABLE technologies
-- (
--     technology TEXT PRIMARY KEY,
--     job_id INTEGER REFERENCES jobs ON DELETE CASCADE,
--     username TEXT REFERENCES users ON DELETE CASCADE

-- );