-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  recipient_email VARCHAR(255) NOT NULL,
  subject TEXT,
  body TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  job_id VARCHAR(255) -- BullMQ Job ID
);

-- Rate Limits / Sender Config (Optional but good for multi-sender)
CREATE TABLE IF NOT EXISTS sender_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  hourly_limit INTEGER DEFAULT 100,
  start_time TIMESTAMP WITH TIME ZONE, -- Global start time for campaign if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
