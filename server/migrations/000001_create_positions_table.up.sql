INSERT INTO position_models (name) 
VALUES
    ('Frontend'),
    ('Backend'),
    ('DevOps'),
    ('Аналитик'),
    ('UI/UX'),
    ('Project Manager'),
    ('ML'),
    ('Pentest/Security')
ON CONFLICT (name) DO NOTHING;

