-- TABLE COUNTRY
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- TABLE USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    country_id INT,
    CONSTRAINT fk_country_user FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- TABLE SUPPLIERS
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    address TEXT,
    country_id INT,
    CONSTRAINT fk_country_supplier FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- TABLE CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- TABLE PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    current_stock INT NOT NULL,
	 image_url VARCHAR(255),
    description TEXT,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- TABLE ENTRIES
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    quantity INT NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT fk_product_entry FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_user_entry FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TABLE EXITS
CREATE TABLE exits (
    id SERIAL PRIMARY KEY,
    exit_date DATE NOT NULL,
    quantity INT NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT fk_product_exit FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_user_exit FOREIGN KEY (user_id) REFERENCES users(id)
);

