-- OPTIONAL hardening (do it if time allows): run as the RDS master user, then store THIS user's
-- credentials in the Secrets Manager secret instead of the master password. The API then cannot
-- create, alter or drop tables even if it were compromised. Migrations and seeding keep using the master user.
-- Replace the password with a long random one (it only ever lives in Secrets Manager).
CREATE USER thyme_app WITH PASSWORD 'REPLACE-WITH-LONG-RANDOM-PASSWORD';
GRANT CONNECT ON DATABASE thyme TO thyme_app;
GRANT USAGE ON SCHEMA public TO thyme_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON users, profiles, sessions TO thyme_app;
GRANT SELECT ON ingredients, recipes TO thyme_app;
