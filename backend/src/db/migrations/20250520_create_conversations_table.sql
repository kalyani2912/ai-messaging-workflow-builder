CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,           -- you can default this to 1 until you wire up real auth
  messages JSONB NOT NULL,        -- the full chat history array
  created_at TIMESTAMP DEFAULT NOW()
);
