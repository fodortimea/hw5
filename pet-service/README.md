# Pet Service - FastAPI Microservice

A FastAPI-based REST API microservice for managing pet information in the Pet Store application.

## 🚀 Features

- **CRUD Operations**: Create, Read, Update, Delete pets
- **Type Safety**: Pydantic models for request/response validation
- **Database Support**: SQLite (development) and PostgreSQL (production)
- **Health Checks**: Built-in health monitoring endpoints
- **Auto Documentation**: OpenAPI/Swagger documentation
- **Container Ready**: Docker/Podman containerization

## 📋 API Endpoints

### Pet Management
- `GET /pets` - List all pets
- `GET /pets/{id}` - Get a specific pet
- `POST /pets` - Create a new pet
- `PUT /pets/{id}` - Update a pet
- `DELETE /pets/{id}` - Delete a pet

### System
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🗄️ Data Model

```python
{
    "id": "integer",
    "name": "string",
    "breed": "string", 
    "age": "integer",
    "owner": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

## 🛠️ Development Setup

### Prerequisites
- Python 3.11+
- pip or pipenv

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python -m uvicorn main:app --reload --port 8000

# API will be available at http://localhost:8000
# Documentation at http://localhost:8000/docs
```

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=sqlite:///./pets.db  # Development
DATABASE_URL=postgresql://user:pass@host:5432/db  # Production

# Application Configuration
PORT=8000
HOST=0.0.0.0
```

## 🐳 Docker Deployment

### Build Container
```bash
podman build -t pet-service:latest .
```

### Run Container
```bash
podman run -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./pets.db \
  pet-service:latest
```

### AWS ECS Deployment
```bash
# Build for AWS
podman build --platform linux/amd64 -t pet-service:latest .

# Tag for ECR
podman tag pet-service:latest <ECR_URI>/pet-store-dev-pet-service:latest

# Push to ECR
podman push <ECR_URI>/pet-store-dev-pet-service:latest
```

## 📊 Database Schema

```sql
CREATE TABLE pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    owner VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Database Connection
The service supports both SQLite (development) and PostgreSQL (production):

```python
# SQLite (default)
DATABASE_URL = "sqlite:///./pets.db"

# PostgreSQL
DATABASE_URL = "postgresql://username:password@host:5432/database"
```

### CORS Configuration
CORS is configured to allow requests from the UI application:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for specific origins in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Testing

### Unit Tests
```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# List pets
curl http://localhost:8000/pets

# Create pet
curl -X POST http://localhost:8000/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Buddy", "breed": "Golden Retriever", "age": 3, "owner": "John"}'
```

## 🔒 Security

### Authentication
- JWT token validation for production deployment
- Token passed via Authorization header: `Bearer <token>`

### Input Validation
- Pydantic models validate all request data
- SQL injection prevention through parameterized queries
- Type checking for all API endpoints

## 📈 Monitoring

### Health Checks
- `/health` endpoint for container health monitoring
- Database connection validation
- Service status reporting

### Logging
- Structured logging with timestamps
- Request/response logging
- Error tracking and reporting

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
    "detail": "Error message",
    "error_type": "ValidationError",
    "timestamp": "2025-07-18T10:30:00Z"
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
- **FastAPI**: Web framework
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Development Dependencies
- **pytest**: Testing framework
- **pytest-cov**: Coverage reporting
- **black**: Code formatting
- **flake8**: Code linting

## 🏗️ Architecture Integration

This service integrates with:
- **API Gateway**: External access via AWS API Gateway
- **Load Balancer**: Internal routing via Application Load Balancer
- **Database**: PostgreSQL via AWS RDS
- **Authentication**: JWT validation via AWS Cognito
- **Monitoring**: CloudWatch logging and metrics

---

**Port**: 8000  
**Health Check**: `/health`  
**Documentation**: `/docs`  
**Version**: 1.0.0