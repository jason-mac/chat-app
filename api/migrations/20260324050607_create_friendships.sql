CREATE TABLE friendships (
    requester_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (requester_id, receiver_id),

    CONSTRAINT no_self_friend CHECK (requester_id <> receiver_id)
);

CREATE UNIQUE INDEX unique_friendship_pair
ON friendships (
    LEAST(requester_id, receiver_id),
    GREATEST(requester_id, receiver_id)
);
