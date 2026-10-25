-- Fair Match database. Three tables: people, login sessions, and messages.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT UNIQUE,                 -- NULL for demo profiles
  password_hash   TEXT,                        -- bcrypt hash; we never store the real password
  name            TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'New York',
  willing_to_move BOOLEAN NOT NULL DEFAULT FALSE,
  bio             TEXT NOT NULL DEFAULT '',
  answers         JSONB,                       -- quiz answers, e.g. {"routine": 5, "faith": 2, ...}; NULL until the quiz is done
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  audit_group     TEXT,                        -- demo profiles only: A/B/C for the fairness audit; matching never reads it
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,                 -- random 32-byte token stored in an httpOnly cookie
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  from_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_pair ON messages (LEAST(from_id, to_id), GREATEST(from_id, to_id), created_at);

-- 60 fictional demo profiles (only added if there are none yet)
INSERT INTO users (name, city, willing_to_move, bio, answers, is_demo, audit_group)
SELECT * FROM (VALUES
('Oluchi L.', 'Los Angeles', false, 'Teacher who loves weekend hikes.', '{"routine":1,"school":3,"faith":2,"screens":4,"discipline":5,"freedom":3,"culture":2,"sharing":5,"money":4,"health":2}'::jsonb, TRUE, 'A'),
('Esi N.', 'Atlanta', false, 'Nurse, early riser, big family.', '{"routine":1,"school":3,"faith":5,"screens":1,"discipline":3,"freedom":1,"culture":2,"sharing":1,"money":1,"health":4}'::jsonb, TRUE, 'B'),
('Mariam A.', 'New York', false, 'Engineer and amateur cook.', '{"routine":3,"school":5,"faith":2,"screens":3,"discipline":1,"freedom":1,"culture":3,"sharing":3,"money":2,"health":4}'::jsonb, TRUE, 'C'),
('Farid H.', 'Atlanta', false, 'Grew up bilingual and want the same for my kid.', '{"routine":3,"school":2,"faith":2,"screens":2,"discipline":1,"freedom":4,"culture":4,"sharing":4,"money":5,"health":1}'::jsonb, TRUE, 'A'),
('Yara L.', 'Los Angeles', true, 'Small business owner, very organized.', '{"routine":1,"school":1,"faith":2,"screens":3,"discipline":4,"freedom":5,"culture":1,"sharing":4,"money":5,"health":2}'::jsonb, TRUE, 'B'),
('Rania E.', 'Chicago', false, 'Social worker who believes in gentle routines.', '{"routine":1,"school":5,"faith":3,"screens":5,"discipline":3,"freedom":3,"culture":2,"sharing":3,"money":2,"health":4}'::jsonb, TRUE, 'C'),
('Hugo L.', 'Los Angeles', false, 'Musician; patient and playful.', '{"routine":5,"school":5,"faith":3,"screens":3,"discipline":2,"freedom":1,"culture":4,"sharing":2,"money":4,"health":5}'::jsonb, TRUE, 'A'),
('Chioma M.', 'Los Angeles', true, 'Accountant who plans everything.', '{"routine":5,"school":1,"faith":4,"screens":4,"discipline":2,"freedom":3,"culture":1,"sharing":4,"money":2,"health":2}'::jsonb, TRUE, 'B'),
('Pablo X.', 'Boston', false, 'Teacher who loves weekend hikes.', '{"routine":2,"school":1,"faith":5,"screens":2,"discipline":1,"freedom":4,"culture":4,"sharing":5,"money":5,"health":2}'::jsonb, TRUE, 'C'),
('Oluchi M.', 'New York', true, 'Nurse, early riser, big family.', '{"routine":4,"school":4,"faith":2,"screens":2,"discipline":2,"freedom":1,"culture":2,"sharing":5,"money":3,"health":5}'::jsonb, TRUE, 'A'),
('Dario E.', 'Chicago', true, 'Engineer and amateur cook.', '{"routine":2,"school":3,"faith":3,"screens":4,"discipline":2,"freedom":2,"culture":5,"sharing":2,"money":3,"health":4}'::jsonb, TRUE, 'B'),
('Nico P.', 'Boston', false, 'Grew up bilingual and want the same for my kid.', '{"routine":2,"school":2,"faith":4,"screens":2,"discipline":1,"freedom":4,"culture":2,"sharing":1,"money":2,"health":1}'::jsonb, TRUE, 'C'),
('Nico F.', 'Chicago', false, 'Small business owner, very organized.', '{"routine":4,"school":5,"faith":5,"screens":3,"discipline":1,"freedom":5,"culture":3,"sharing":5,"money":5,"health":3}'::jsonb, TRUE, 'A'),
('Dario Q.', 'Los Angeles', true, 'Social worker who believes in gentle routines.', '{"routine":2,"school":3,"faith":5,"screens":3,"discipline":5,"freedom":5,"culture":4,"sharing":1,"money":1,"health":1}'::jsonb, TRUE, 'B'),
('Mariam R.', 'Atlanta', false, 'Musician; patient and playful.', '{"routine":5,"school":4,"faith":5,"screens":5,"discipline":3,"freedom":2,"culture":3,"sharing":5,"money":4,"health":2}'::jsonb, TRUE, 'C'),
('Yara Q.', 'Boston', false, 'Accountant who plans everything.', '{"routine":1,"school":2,"faith":1,"screens":1,"discipline":4,"freedom":4,"culture":5,"sharing":5,"money":3,"health":4}'::jsonb, TRUE, 'A'),
('Dario H.', 'New York', true, 'Teacher who loves weekend hikes.', '{"routine":2,"school":3,"faith":3,"screens":4,"discipline":4,"freedom":4,"culture":1,"sharing":4,"money":3,"health":3}'::jsonb, TRUE, 'B'),
('Luca L.', 'Chicago', false, 'Nurse, early riser, big family.', '{"routine":2,"school":1,"faith":3,"screens":2,"discipline":3,"freedom":3,"culture":4,"sharing":3,"money":1,"health":1}'::jsonb, TRUE, 'C'),
('Dario Y.', 'New York', false, 'Engineer and amateur cook.', '{"routine":3,"school":3,"faith":1,"screens":5,"discipline":1,"freedom":2,"culture":2,"sharing":4,"money":3,"health":1}'::jsonb, TRUE, 'A'),
('Zane T.', 'Atlanta', false, 'Grew up bilingual and want the same for my kid.', '{"routine":3,"school":5,"faith":3,"screens":1,"discipline":1,"freedom":1,"culture":1,"sharing":2,"money":4,"health":4}'::jsonb, TRUE, 'B'),
('Nico Z.', 'New York', false, 'Small business owner, very organized.', '{"routine":2,"school":2,"faith":5,"screens":3,"discipline":2,"freedom":5,"culture":5,"sharing":2,"money":3,"health":5}'::jsonb, TRUE, 'C'),
('Yara R.', 'Chicago', false, 'Social worker who believes in gentle routines.', '{"routine":2,"school":3,"faith":4,"screens":3,"discipline":4,"freedom":3,"culture":3,"sharing":5,"money":5,"health":4}'::jsonb, TRUE, 'A'),
('Hugo Q.', 'Atlanta', false, 'Musician; patient and playful.', '{"routine":2,"school":5,"faith":2,"screens":5,"discipline":3,"freedom":2,"culture":3,"sharing":5,"money":4,"health":5}'::jsonb, TRUE, 'B'),
('Rania D.', 'Boston', false, 'Accountant who plans everything.', '{"routine":3,"school":2,"faith":4,"screens":4,"discipline":4,"freedom":4,"culture":1,"sharing":5,"money":5,"health":3}'::jsonb, TRUE, 'C'),
('Luca B.', 'Chicago', false, 'Teacher who loves weekend hikes.', '{"routine":4,"school":3,"faith":3,"screens":4,"discipline":4,"freedom":3,"culture":1,"sharing":1,"money":1,"health":1}'::jsonb, TRUE, 'A'),
('Jalen V.', 'Los Angeles', false, 'Nurse, early riser, big family.', '{"routine":1,"school":1,"faith":2,"screens":4,"discipline":2,"freedom":5,"culture":4,"sharing":5,"money":5,"health":2}'::jsonb, TRUE, 'B'),
('Chioma Q.', 'Boston', false, 'Engineer and amateur cook.', '{"routine":2,"school":2,"faith":4,"screens":3,"discipline":3,"freedom":3,"culture":1,"sharing":4,"money":4,"health":5}'::jsonb, TRUE, 'C'),
('Chioma B.', 'New York', false, 'Grew up bilingual and want the same for my kid.', '{"routine":2,"school":2,"faith":5,"screens":3,"discipline":5,"freedom":2,"culture":4,"sharing":1,"money":4,"health":4}'::jsonb, TRUE, 'A'),
('Jalen F.', 'Atlanta', false, 'Small business owner, very organized.', '{"routine":1,"school":1,"faith":4,"screens":3,"discipline":5,"freedom":4,"culture":3,"sharing":5,"money":1,"health":1}'::jsonb, TRUE, 'B'),
('Nico R.', 'Boston', false, 'Social worker who believes in gentle routines.', '{"routine":2,"school":1,"faith":4,"screens":4,"discipline":3,"freedom":2,"culture":5,"sharing":3,"money":4,"health":1}'::jsonb, TRUE, 'C'),
('Yara P.', 'Boston', true, 'Musician; patient and playful.', '{"routine":2,"school":4,"faith":4,"screens":2,"discipline":5,"freedom":3,"culture":1,"sharing":4,"money":3,"health":1}'::jsonb, TRUE, 'A'),
('Vera C.', 'New York', false, 'Accountant who plans everything.', '{"routine":2,"school":3,"faith":3,"screens":4,"discipline":3,"freedom":4,"culture":1,"sharing":5,"money":5,"health":2}'::jsonb, TRUE, 'B'),
('Esi N.', 'Atlanta', false, 'Teacher who loves weekend hikes.', '{"routine":3,"school":2,"faith":3,"screens":1,"discipline":5,"freedom":2,"culture":3,"sharing":2,"money":3,"health":1}'::jsonb, TRUE, 'C'),
('Pablo B.', 'Los Angeles', false, 'Nurse, early riser, big family.', '{"routine":4,"school":5,"faith":1,"screens":3,"discipline":3,"freedom":3,"culture":3,"sharing":3,"money":3,"health":3}'::jsonb, TRUE, 'A'),
('Amara S.', 'New York', false, 'Engineer and amateur cook.', '{"routine":1,"school":2,"faith":4,"screens":5,"discipline":2,"freedom":4,"culture":5,"sharing":3,"money":1,"health":3}'::jsonb, TRUE, 'B'),
('Luca L.', 'Chicago', false, 'Grew up bilingual and want the same for my kid.', '{"routine":1,"school":4,"faith":3,"screens":5,"discipline":5,"freedom":3,"culture":1,"sharing":5,"money":1,"health":3}'::jsonb, TRUE, 'C'),
('Luca R.', 'Chicago', false, 'Small business owner, very organized.', '{"routine":5,"school":4,"faith":5,"screens":5,"discipline":5,"freedom":5,"culture":5,"sharing":5,"money":1,"health":1}'::jsonb, TRUE, 'A'),
('Zane A.', 'Chicago', false, 'Social worker who believes in gentle routines.', '{"routine":4,"school":4,"faith":2,"screens":5,"discipline":3,"freedom":5,"culture":4,"sharing":2,"money":1,"health":2}'::jsonb, TRUE, 'B'),
('Sami B.', 'New York', true, 'Musician; patient and playful.', '{"routine":4,"school":2,"faith":4,"screens":5,"discipline":3,"freedom":4,"culture":4,"sharing":1,"money":4,"health":5}'::jsonb, TRUE, 'C'),
('Grace P.', 'Los Angeles', false, 'Accountant who plans everything.', '{"routine":2,"school":5,"faith":4,"screens":2,"discipline":3,"freedom":3,"culture":5,"sharing":1,"money":3,"health":1}'::jsonb, TRUE, 'A'),
('Pablo U.', 'Chicago', false, 'Teacher who loves weekend hikes.', '{"routine":5,"school":2,"faith":3,"screens":1,"discipline":5,"freedom":1,"culture":4,"sharing":4,"money":3,"health":3}'::jsonb, TRUE, 'B'),
('Pablo X.', 'Atlanta', true, 'Nurse, early riser, big family.', '{"routine":1,"school":1,"faith":5,"screens":1,"discipline":1,"freedom":3,"culture":1,"sharing":4,"money":4,"health":1}'::jsonb, TRUE, 'C'),
('Jalen V.', 'Boston', true, 'Engineer and amateur cook.', '{"routine":4,"school":4,"faith":1,"screens":4,"discipline":3,"freedom":5,"culture":3,"sharing":3,"money":3,"health":3}'::jsonb, TRUE, 'A'),
('Oluchi F.', 'New York', false, 'Grew up bilingual and want the same for my kid.', '{"routine":4,"school":2,"faith":5,"screens":5,"discipline":3,"freedom":3,"culture":2,"sharing":4,"money":5,"health":5}'::jsonb, TRUE, 'B'),
('Rania I.', 'Los Angeles', false, 'Small business owner, very organized.', '{"routine":5,"school":2,"faith":1,"screens":2,"discipline":5,"freedom":3,"culture":5,"sharing":1,"money":4,"health":4}'::jsonb, TRUE, 'C'),
('Zane G.', 'Los Angeles', true, 'Social worker who believes in gentle routines.', '{"routine":5,"school":2,"faith":3,"screens":2,"discipline":2,"freedom":2,"culture":5,"sharing":4,"money":2,"health":3}'::jsonb, TRUE, 'A'),
('Ines L.', 'New York', false, 'Musician; patient and playful.', '{"routine":5,"school":4,"faith":3,"screens":5,"discipline":3,"freedom":5,"culture":3,"sharing":4,"money":3,"health":3}'::jsonb, TRUE, 'B'),
('Pablo Q.', 'Chicago', true, 'Accountant who plans everything.', '{"routine":1,"school":4,"faith":2,"screens":2,"discipline":1,"freedom":1,"culture":4,"sharing":2,"money":1,"health":3}'::jsonb, TRUE, 'C'),
('Rania D.', 'Atlanta', true, 'Teacher who loves weekend hikes.', '{"routine":2,"school":4,"faith":2,"screens":2,"discipline":4,"freedom":3,"culture":5,"sharing":1,"money":1,"health":2}'::jsonb, TRUE, 'A'),
('Wes W.', 'Los Angeles', false, 'Nurse, early riser, big family.', '{"routine":1,"school":4,"faith":4,"screens":4,"discipline":5,"freedom":3,"culture":2,"sharing":1,"money":5,"health":3}'::jsonb, TRUE, 'B'),
('Esi A.', 'Los Angeles', true, 'Engineer and amateur cook.', '{"routine":3,"school":3,"faith":3,"screens":5,"discipline":3,"freedom":4,"culture":3,"sharing":5,"money":5,"health":1}'::jsonb, TRUE, 'C'),
('Farid X.', 'Boston', false, 'Grew up bilingual and want the same for my kid.', '{"routine":3,"school":3,"faith":2,"screens":2,"discipline":2,"freedom":4,"culture":5,"sharing":5,"money":2,"health":3}'::jsonb, TRUE, 'A'),
('Luca N.', 'Atlanta', false, 'Small business owner, very organized.', '{"routine":3,"school":5,"faith":2,"screens":3,"discipline":1,"freedom":1,"culture":1,"sharing":1,"money":2,"health":4}'::jsonb, TRUE, 'B'),
('Mariam L.', 'Boston', false, 'Social worker who believes in gentle routines.', '{"routine":4,"school":3,"faith":2,"screens":4,"discipline":2,"freedom":3,"culture":2,"sharing":1,"money":5,"health":2}'::jsonb, TRUE, 'C'),
('Chioma Y.', 'New York', false, 'Musician; patient and playful.', '{"routine":3,"school":1,"faith":4,"screens":5,"discipline":1,"freedom":5,"culture":2,"sharing":5,"money":3,"health":3}'::jsonb, TRUE, 'A'),
('Amara K.', 'New York', false, 'Accountant who plans everything.', '{"routine":3,"school":3,"faith":1,"screens":5,"discipline":4,"freedom":2,"culture":1,"sharing":1,"money":4,"health":4}'::jsonb, TRUE, 'B'),
('Zane W.', 'Los Angeles', true, 'Teacher who loves weekend hikes.', '{"routine":4,"school":3,"faith":5,"screens":2,"discipline":1,"freedom":5,"culture":5,"sharing":5,"money":2,"health":1}'::jsonb, TRUE, 'C'),
('Amara Y.', 'Atlanta', false, 'Nurse, early riser, big family.', '{"routine":1,"school":4,"faith":4,"screens":4,"discipline":1,"freedom":5,"culture":2,"sharing":3,"money":2,"health":1}'::jsonb, TRUE, 'A'),
('Grace X.', 'Los Angeles', false, 'Engineer and amateur cook.', '{"routine":2,"school":1,"faith":5,"screens":1,"discipline":5,"freedom":2,"culture":5,"sharing":5,"money":4,"health":1}'::jsonb, TRUE, 'B'),
('Ines H.', 'New York', false, 'Grew up bilingual and want the same for my kid.', '{"routine":3,"school":4,"faith":4,"screens":3,"discipline":1,"freedom":5,"culture":4,"sharing":4,"money":3,"health":5}'::jsonb, TRUE, 'C')
) AS demo(name, city, willing_to_move, bio, answers, is_demo, audit_group)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE is_demo);
