-- Add Salesforce metadata fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sf_date_range TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sf_name TEXT;
