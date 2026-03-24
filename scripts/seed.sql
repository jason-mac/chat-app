INSERT INTO users (user_id, username, email, password_hash, role) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'jason', 'jason@test.com', '$argon2id$v=19$m=19456,t=2,p=1$Iy3YsAQjDOBFBFsKFdwimg$5KNNlWoKMoKXM0CgQXzHFcRZLgzrEP6YKliPNrVFRZQ', 'user'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'mike', 'mike@test.com', '$argon2id$v=19$m=19456,t=2,p=1$Iy3YsAQjDOBFBFsKFdwimg$5KNNlWoKMoKXM0CgQXzHFcRZLgzrEP6YKliPNrVFRZQ', 'user'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'alice', 'alice@test.com', '$argon2id$v=19$m=19456,t=2,p=1$Iy3YsAQjDOBFBFsKFdwimg$5KNNlWoKMoKXM0CgQXzHFcRZLgzrEP6YKliPNrVFRZQ', 'user');

INSERT INTO messages (message_id, content, message_from, message_to) VALUES
  (gen_random_uuid(), 'hey mike!', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'hey jason whats up', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'not much just building a chat app lol', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'nice! in rust?', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'yeah its actually pretty fun', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'borrow checker is a pain though', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'lmao yeah i heard that', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'once it compiles though it just works', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'thats actually sick', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'websockets were surprisingly easy', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'axum is pretty clean', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'yeah ive heard good things about axum', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'are you gonna add auth?', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'already done lol', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'jwt tokens and everything', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'damn you work fast', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'hey alice!', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (gen_random_uuid(), 'hey jason!', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
