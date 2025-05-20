CREATE TABLE IF NOT EXISTS workflow_drafts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,           -- same user_id as above
  spec JSONB NOT NULL,            -- the final valid JSON spec
  created_at TIMESTAMP DEFAULT NOW()
);
