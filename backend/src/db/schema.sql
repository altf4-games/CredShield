-- CredShield Student Profile and Leaderboard Schema
-- Run this SQL in your Neon DB console to create the schema

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,  -- Maps to mobile app user identifier
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  branch VARCHAR(100),  -- CS, IT, EE, ME, CE, ECE, etc.
  academic_year VARCHAR(10),  -- FE, SE, TE, BE or 1, 2, 3, 4
  gpa DECIMAL(4,2),  -- Actual GPA (stored securely, e.g., 8.53)
  skills TEXT[],  -- Array of skill tags
  resume_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_eligible BOOLEAN DEFAULT false,  -- Passed ZK proof threshold
  leaderboard_opt_in BOOLEAN DEFAULT false,  -- User opted into leaderboard
  show_anonymous BOOLEAN DEFAULT false,  -- Show only initials on leaderboard
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- Create index on leaderboard_opt_in for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_students_leaderboard ON students(leaderboard_opt_in, gpa DESC);

-- Privacy-aware leaderboard view
-- This view NEVER exposes exact GPAs, only ranges
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  id,
  CASE 
    WHEN show_anonymous THEN SUBSTRING(name, 1, 2) || '.'
    ELSE name
  END as display_name,
  branch,
  academic_year,
  CASE
    WHEN gpa >= 9.50 THEN '9.5-10.0'
    WHEN gpa >= 9.00 THEN '9.0-9.5'
    WHEN gpa >= 8.50 THEN '8.5-9.0'
    WHEN gpa >= 8.00 THEN '8.0-8.5'
    WHEN gpa >= 7.50 THEN '7.5-8.0'
    WHEN gpa >= 7.00 THEN '7.0-7.5'
    WHEN gpa >= 6.50 THEN '6.5-7.0'
    ELSE '6.0-6.5'
  END as gpa_range,
  gpa as actual_gpa,  -- Used ONLY for sorting, NOT exposed to frontend
  is_eligible,
  show_anonymous
FROM students
WHERE leaderboard_opt_in = true
ORDER BY actual_gpa DESC;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
