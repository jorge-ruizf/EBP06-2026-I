-- Flyway baseline migration (tables simplified)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction (
  id BIGINT PRIMARY KEY,
  amount DECIMAL(19,2) NOT NULL,
  description VARCHAR(500),
  category_id BIGINT,
  user_id BIGINT,
  CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES category(id),
  CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS budget (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  limit_amount DECIMAL(19,2)
);
