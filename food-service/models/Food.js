const { Client } = require('pg');

class Food {
  constructor() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    this.client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/petstore',
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
    this.init();
  }

  async init() {
    try {
      await this.client.connect();
      console.log('Connected to PostgreSQL database');
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS foods (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          brand VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          category VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await this.client.query(createTableQuery);
      console.log('Foods table ready');
    } catch (err) {
      console.error('Error initializing database:', err);
      // Create a new client instance for retry
      this.client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/petstore',
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
      });
      // Retry connection with exponential backoff
      setTimeout(() => this.init(), 5000);
    }
  }

  // Create a new food item
  async create(foodData) {
    try {
      const { name, brand, price, stock, category, description } = foodData;
      const query = `
        INSERT INTO foods (name, brand, price, stock, category, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, brand, price, stock, category, description, created_at, updated_at
      `;
      
      const result = await this.client.query(query, [name, brand, price, stock, category, description]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Get all food items with pagination
  async getAll(offset = 0, limit = 100) {
    try {
      const query = `
        SELECT * FROM foods 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await this.client.query(query, [limit, offset]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  // Get food item by ID
  async getById(id) {
    try {
      const query = 'SELECT * FROM foods WHERE id = $1';
      
      const result = await this.client.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Update food item
  async update(id, foodData) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(foodData).forEach(key => {
        if (foodData[key] !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(foodData[key]);
          paramIndex++;
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE foods SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      
      const result = await this.client.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Food item not found');
      }
      
      return { id, ...foodData };
    } catch (err) {
      throw err;
    }
  }

  // Delete food item
  async delete(id) {
    try {
      const query = 'DELETE FROM foods WHERE id = $1';
      
      const result = await this.client.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('Food item not found');
      }
      
      return { message: `Food item ${id} deleted successfully` };
    } catch (err) {
      throw err;
    }
  }

  // Close database connection
  async close() {
    await this.client.end();
  }
}

module.exports = Food;