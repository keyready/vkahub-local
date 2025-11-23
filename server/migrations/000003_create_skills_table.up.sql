INSERT INTO skill_models (name)
VALUES
    ('Golang'), ('Python'), ('Ruby'), ('Java'), ('PHP'), ('NodeJs'),
    ('NestJs'), ('Django'), ('Flask'), ('FastAPI'), ('JavaSpring'), ('Laravel'),
    ('React'), ('Angular'), ('Vue'), ('Next'), ('Nuxt'), ('JQuery'),
    ('Docker'), ('Kubernetes'), ('Git'), ('Nginx'), ('Redis'), ('Vercel'), 
    ('Caddy'), ('CI/CD'),
    ('PostgreSQL'), ('MongoDB'), ('MySQL'), ('ElasticSearch'), ('SQLite'),
    ('Figma'), ('Photoshop'), ('Illustrator'),
    ('TensorFlow'), ('PyTorch'), ('HuggingFace'),
    ('HTML'), ('CSS'), ('SCSS'), ('Tailwind'),
    ('WordPress'), ('1C')
ON CONFLICT (name) DO NOTHING;
