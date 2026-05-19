CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS projets_technologies;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS projets;

CREATE TABLE projets (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        TEXT        NOT NULL UNIQUE,
    titre       TEXT        NOT NULL,
    description TEXT        NOT NULL,
    lien        TEXT        NOT NULL,
    est_publie  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technologies (
    id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE
);

CREATE TABLE projets_technologies (
    projet_id     INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    technologie_id INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    PRIMARY KEY (projet_id, technologie_id)
);

CREATE TABLE messages (
    id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nom     TEXT        NOT NULL,
    email   TEXT        NOT NULL,
    message TEXT        NOT NULL,
    recu_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT messages_email_message_unique UNIQUE (email, message)
);

CREATE INDEX projets_technologies_technologie_id_idx
    ON projets_technologies (technologie_id);

CREATE INDEX messages_recu_le_idx
    ON messages (recu_le DESC);

INSERT INTO projets (slug, titre, description, lien) VALUES
    (
        'portfolio',
        'Portfolio personnel',
        'Mon site vitrine en Next.js et Tailwind.',
        'https://exemple.com/portfolio'
    ),
    (
        'gestion-tacos',
        'App de commande de tacos',
        'Une petite app pour commander son tacos prefere.',
        'https://exemple.com/tacos'
    );

INSERT INTO technologies (nom) VALUES
    ('Next.js'),
    ('TypeScript'),
    ('Tailwind'),
    ('React'),
    ('Node.js');

INSERT INTO projets_technologies (projet_id, technologie_id)
SELECT p.id, t.id
FROM projets p
JOIN technologies t ON t.nom IN ('Next.js', 'TypeScript', 'Tailwind')
WHERE p.slug = 'portfolio';

INSERT INTO projets_technologies (projet_id, technologie_id)
SELECT p.id, t.id
FROM projets p
JOIN technologies t ON t.nom IN ('React', 'Node.js')
WHERE p.slug = 'gestion-tacos';
