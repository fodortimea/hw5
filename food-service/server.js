const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT || 8001;

// Initialize Food model
let foodModel;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    foodModel = new Food();
    console.log('Food service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize food service:', error);
    process.exit(1);
  }
};

// Initialize database
initializeDatabase();

// Middleware
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validation middleware
const validateFoodData = (req, res, next) => {
  const { name, brand, price, stock, category } = req.body;
  
  if (req.method === 'POST') {
    if (!name || !brand || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        error: 'Missing required fields: name, brand, price, stock, category'
      });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        error: 'Price must be a positive number'
      });
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        error: 'Stock must be a non-negative number'
      });
    }
  }
  
  next();
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Food Service is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'food-service' });
});

// Create new food item
app.post('/petstore/foods', validateFoodData, async (req, res) => {
  try {
    const food = await foodModel.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all food items
app.get('/petstore/foods', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    
    if (limit > 100) {
      return res.status(400).json({ error: 'Limit cannot exceed 100' });
    }
    
    const foods = await foodModel.getAll(skip, limit);
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get food item by ID
app.get('/petstore/foods/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const food = await foodModel.getById(id);
    
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    
    res.json(food);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update food item
app.put('/petstore/foods/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    // Validate price and stock if provided
    if (req.body.price !== undefined && (typeof req.body.price !== 'number' || req.body.price < 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    if (req.body.stock !== undefined && (typeof req.body.stock !== 'number' || req.body.stock < 0)) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }
    
    const food = await foodModel.update(id, req.body);
    
    // Get updated food item to return complete data
    const updatedFood = await foodModel.getById(id);
    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    if (error.message === 'Food item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Delete food item
app.delete('/petstore/foods/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const result = await foodModel.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting food:', error);
    if (error.message === 'Food item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (foodModel) {
    await foodModel.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  if (foodModel) {
    await foodModel.close();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Food Service running on port ${PORT}`);
});

module.exports = app;