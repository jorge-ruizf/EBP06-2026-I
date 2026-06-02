-- Additive production schema updates for features merged after the initial baseline.
-- Uses IF NOT EXISTS guards so it is safe for Railway databases that already
-- received some columns through Hibernate ddl-auto=update.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
UPDATE users SET email = username WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_users_email'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
  END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(255) DEFAULT 'COP';
UPDATE users SET currency = 'COP' WHERE currency IS NULL;
ALTER TABLE users ALTER COLUMN currency SET DEFAULT 'COP';

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT 'USER';
UPDATE users SET role = 'USER' WHERE role IS NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_password_change_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_lockout_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_achievement_id BIGINT;

CREATE TABLE IF NOT EXISTS achievement (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_achievement_code'
      AND conrelid = 'achievement'::regclass
  ) THEN
    ALTER TABLE achievement ADD CONSTRAINT uk_achievement_code UNIQUE (code);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_achievement (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  achievement_id BIGINT NOT NULL,
  unlocked_at TIMESTAMP NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_user_achievement_user'
      AND conrelid = 'user_achievement'::regclass
  ) THEN
    ALTER TABLE user_achievement
      ADD CONSTRAINT fk_user_achievement_user
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_user_achievement_achievement'
      AND conrelid = 'user_achievement'::regclass
  ) THEN
    ALTER TABLE user_achievement
      ADD CONSTRAINT fk_user_achievement_achievement
      FOREIGN KEY (achievement_id) REFERENCES achievement(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_user_achievement'
      AND conrelid = 'user_achievement'::regclass
  ) THEN
    ALTER TABLE user_achievement
      ADD CONSTRAINT uk_user_achievement UNIQUE (user_id, achievement_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS alert (
  id BIGSERIAL PRIMARY KEY,
  message VARCHAR(255),
  percentage NUMERIC(38,2),
  type VARCHAR(255),
  category_id BIGINT,
  user_id BIGINT,
  created_at TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_alert_category'
      AND conrelid = 'alert'::regclass
  ) THEN
    ALTER TABLE alert
      ADD CONSTRAINT fk_alert_category
      FOREIGN KEY (category_id) REFERENCES category(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_alert_user'
      AND conrelid = 'alert'::regclass
  ) THEN
    ALTER TABLE alert
      ADD CONSTRAINT fk_alert_user
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token VARCHAR(255) NOT NULL,
  device VARCHAR(255),
  ip_address VARCHAR(255),
  last_activity TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_user_sessions_user'
      AND conrelid = 'user_sessions'::regclass
  ) THEN
    ALTER TABLE user_sessions
      ADD CONSTRAINT fk_user_sessions_user
      FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;
