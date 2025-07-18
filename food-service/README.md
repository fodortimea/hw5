# Food Service - Express.js Microservice

An Express.js-based REST API microservice for managing food inventory in the Pet Store application.

## 🚀 Features

- **CRUD Operations**: Create, Read, Update, Delete food items
- **Inventory Management**: Track stock levels and pricing
- **Input Validation**: Comprehensive request validation
- **Database Support**: SQLite (development) and PostgreSQL (production)
- **Health Checks**: Built-in health monitoring endpoints
- **Security**: Helmet.js security middleware
- **Container Ready**: Docker/Podman containerization

## 📋 API Endpoints

### Food Management
- `GET /foods` - List all food items
- `GET /foods/{id}` - Get a specific food item
- `POST /foods` - Create a new food item
- `PUT /foods/{id}` - Update a food item
- `DELETE /foods/{id}` - Delete a food item

### System
- `GET /health` - Health check endpoint
- `GET /` - Service information

## 🗄️ Data Model

```javascript
{
    "id": "integer",
    "name": "string",
    "brand": "string",
    "price": "number",
    "stock": "integer",
    "category": "string",
    "description": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development
```bash
# Install dependencies
npm install

# Run the application
npm start

# Development with auto-reload
npm run dev

# API will be available at http://localhost:8001
```

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=sqlite:///./foods.db  # Development
DATABASE_URL=postgresql://user:pass@host:5432/db  # Production

# Application Configuration
PORT=8001
NODE_ENV=development
```

## 🐳 Docker Deployment

### Build Container
```bash
podman build -t food-service:latest .
```

### Run Container
```bash
podman run -p 8001:8001 \
  -e DATABASE_URL=sqlite:///./foods.db \
  food-service:latest
```

### AWS ECS Deployment
```bash
# Build for AWS
podman build --platform linux/amd64 -t food-service:latest .

# Tag for ECR
podman tag food-service:latest <ECR_URI>/pet-store-dev-food-service:latest

# Push to ECR
podman push <ECR_URI>/pet-store-dev-food-service:latest
```

## 📊 Database Schema

```sql
CREATE TABLE foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Database Connection
The service supports both SQLite (development) and PostgreSQL (production):

```javascript
// SQLite (default)
const dbPath = process.env.DATABASE_URL || 'sqlite:///./foods.db';

// PostgreSQL
const dbUrl = 'postgresql://username:password@host:5432/database';
```

### CORS Configuration
CORS is configured to allow requests from the UI application:

```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
```

### Security Middleware
```javascript
// Helmet.js for security headers
app.use(helmet());

// Request logging
app.use(morgan('combined'));

// JSON parsing with limits
app.use(express.json({ limit: '10mb' }));
```

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### API Testing
```bash
# Health check
curl http://localhost:8001/health

# List foods
curl http://localhost:8001/foods

# Create food item
curl -X POST http://localhost:8001/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Dog Food",
    "brand": "Purina",
    "price": 29.99,
    "stock": 50,
    "category": "dog",
    "description": "High-quality nutrition for adult dogs"
  }'
```

## 🔒 Security

### Authentication
- JWT token validation for production deployment
- Token passed via Authorization header: `Bearer <token>`

### Input Validation
- Comprehensive request validation middleware
- SQL injection prevention through parameterized queries
- Data sanitization for all inputs

### Security Headers
- Helmet.js provides security headers
- CORS configuration for cross-origin requests
- Rate limiting (can be configured)

## 📈 Monitoring

### Health Checks
- `/health` endpoint for container health monitoring
- Database connection validation
- Service status reporting

### Logging
- Morgan middleware for HTTP request logging
- Structured error logging
- Database operation logging

## 🚨 Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
    "error": "Error message",
    "details": "Additional error details",
    "timestamp": "2025-07-18T10:30:00Z",
    "path": "/foods/123"
}
```

## 🔄 Development Workflow

1. **Local Development**: Use SQLite for quick development
2. **Feature Development**: Test against local database
3. **Container Testing**: Build and test with Docker/Podman
4. **AWS Deployment**: Deploy to ECS with PostgreSQL
5. **Integration Testing**: Test with other services

## 📚 Dependencies

### Core Dependencies
- **Express.js**: Web framework
- **sqlite3**: SQLite database driver
- **pg**: PostgreSQL database driver
- **helmet**: Security middleware
- **cors**: CORS middleware
- **morgan**: HTTP request logger

### Development Dependencies
- **nodemon**: Development auto-reload
- **jest**: Testing framework
- **supertest**: HTTP testing
- **eslint**: Code linting
- **prettier**: Code formatting

## 🏗️ Architecture Integration

This service integrates with:
- **API Gateway**: External access via AWS API Gateway
- **Load Balancer**: Internal routing via Application Load Balancer
- **Database**: PostgreSQL via AWS RDS
- **Authentication**: JWT validation via AWS Cognito
- **Monitoring**: CloudWatch logging and metrics

## 🎯 Food Categories

Supported food categories:
- `dog` - Dog food and treats
- `cat` - Cat food and treats
- `bird` - Bird seed and treats
- `fish` - Fish food and aquarium supplies
- `small-animal` - Food for rabbits, hamsters, etc.
- `reptile` - Reptile food and supplements

## 📦 Inventory Management

### Stock Tracking
- Automatic stock level tracking
- Low stock alerts (configurable)
- Inventory history logging

### Pricing
- Support for decimal pricing
- Price history tracking
- Bulk pricing options (future enhancement)

---

**Port**: 8001  
**Health Check**: `/health`  
**Database**: SQLite/PostgreSQL  
**Version**: 1.0.0