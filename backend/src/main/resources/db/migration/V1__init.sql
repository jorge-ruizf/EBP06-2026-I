-- Flyway baseline migration (tables simplified)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'user',
  register_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  description VARCHAR(500),
  state VARCHAR(20) NOT NULL,
  user_id BIGINT ,
  CONSTRAINT fk_user_category FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transaction (
  id BIGSERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  amount DECIMAL(19,2) NOT NULL,
  description VARCHAR(500),
  type VARCHAR(20) NOT NULL,
  state VARCHAR(20) NOT NULL,
  user_id BIGINT,
  CONSTRAINT fk_user_transaction FOREIGN KEY (user_id) REFERENCES users(id),
  category_id BIGINT,
  CONSTRAINT fk_category_transaction FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS budget (
  id BIGSERIAL PRIMARY KEY,
  month INT NOT NULL,
  year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  limit_amount DECIMAL(19,2),
  user_id BIGINT,
  CONSTRAINT fk_user_budget FOREIGN KEY (user_id) REFERENCES users(id),
  category_id BIGINT,
  CONSTRAINT fk_category_budget FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS recovery_token (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  generated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_date TIMESTAMP NOT NULL,
  user_id BIGINT,
  CONSTRAINT fk_user_recovery_token FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS session(
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  generated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP NOT NULL,
  state VARCHAR(20) NOT NULL,
  user_id BIGINT,
  CONSTRAINT fk_user_session FOREIGN KEY (user_id) REFERENCES users(id)
);
