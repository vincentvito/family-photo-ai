ALTER TABLE familyphotoai.app_settings ADD COLUMN IF NOT EXISTS default_generation_method text NOT NULL DEFAULT 'current-prompt';
ALTER TABLE familyphotoai.generations ADD COLUMN IF NOT EXISTS generation_method text NOT NULL DEFAULT 'current-prompt';
ALTER TABLE familyphotoai.generations ADD COLUMN IF NOT EXISTS reference_inputs text;
