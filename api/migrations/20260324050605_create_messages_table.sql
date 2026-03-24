CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    message_from UUID REFERENCES users(user_id),
    message_to UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
