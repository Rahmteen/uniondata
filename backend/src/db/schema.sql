-- Trump Word Map Database Schema
-- Run this file to initialize the database

-- Drop existing tables (for fresh start)
DROP TABLE IF EXISTS word_stats CASCADE;
DROP TABLE IF EXISTS word_totals CASCADE;
DROP TABLE IF EXISTS speeches CASCADE;

-- Speeches table - stores individual speech transcripts
CREATE TABLE speeches (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  date DATE,
  location VARCHAR(255),
  speech_type VARCHAR(100), -- 'rally', 'address', 'press_conference', 'interview', etc.
  transcript TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  unique_word_count INTEGER DEFAULT 0,
  source VARCHAR(255), -- Where the transcript came from
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Word statistics per speech (pre-computed for performance)
CREATE TABLE word_stats (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  speech_id INTEGER REFERENCES speeches(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(word, speech_id)
);

-- Global word aggregates across all speeches
CREATE TABLE word_totals (
  word VARCHAR(100) PRIMARY KEY,
  total_count INTEGER NOT NULL DEFAULT 0,
  speech_count INTEGER NOT NULL DEFAULT 0, -- How many speeches contain this word
  avg_per_speech DECIMAL(10, 2) DEFAULT 0,
  first_used DATE,
  last_used DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_speeches_date ON speeches(date);
CREATE INDEX idx_speeches_type ON speeches(speech_type);
CREATE INDEX idx_word_stats_word ON word_stats(word);
CREATE INDEX idx_word_stats_frequency ON word_stats(frequency DESC);
CREATE INDEX idx_word_stats_speech_id ON word_stats(speech_id);
CREATE INDEX idx_word_totals_count ON word_totals(total_count DESC);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_speeches_updated_at
    BEFORE UPDATE ON speeches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_totals_updated_at
    BEFORE UPDATE ON word_totals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for word cloud data (top words)
CREATE OR REPLACE VIEW word_cloud_data AS
SELECT 
  word,
  total_count as value,
  speech_count,
  avg_per_speech
FROM word_totals
WHERE total_count > 5
ORDER BY total_count DESC
LIMIT 500;

-- View for timeline data
CREATE OR REPLACE VIEW word_timeline AS
SELECT 
  s.date,
  ws.word,
  ws.frequency,
  s.title as speech_title
FROM word_stats ws
JOIN speeches s ON ws.speech_id = s.id
WHERE s.date IS NOT NULL
ORDER BY s.date, ws.frequency DESC;

