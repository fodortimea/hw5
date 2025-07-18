# Pet Store Microservices Architecture

A complete microservices-based pet store application built with AWS infrastructure, containerized services, and a cross-platform mobile/web UI.

## 🏗️ Architecture Overview

This project implements a modern microservices architecture on AWS with the following components:

### Infrastructure (AWS)
- **VPC**: Multi-AZ setup with public/private subnets
- **ECS Fargate**: Container orchestration for microservices
- **Application Load Balancer**: Service routing and load balancing
- **API Gateway**: External API access with authentication
- **RDS PostgreSQL**: Managed database with encryption
- **ECR**: Container image registry
- **Cognito**: User authentication and authorization
- **CloudWatch**: Logging and monitoring

### Services
- **Pet Service**: FastAPI-based REST API for pet management
- **Food Service**: Express.js-based REST API for food inventory
- **UI Application**: React Native/Expo cross-platform mobile/web app

### Key Features
- 🔐 JWT-based authentication with AWS Cognito
- 🚀 Containerized microservices with Docker/Podman
- 🌐 Cross-platform UI (iOS, Android, Web)
- 📊 Infrastructure as Code with Terraform
- 🔒 Secure credential management
- 📈 CloudWatch monitoring and logging
- 🎯 CORS-enabled API access

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform >= 1.0
- Docker or Podman
- Node.js >= 18
- Python >= 3.11

### 1. Deploy Infrastructure
```bash
cd terraform
terraform init
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars
```

### 2. Build and Deploy Services
```bash
# Login to ECR
aws ecr get-login-password --region eu-west-1 | podman login --username AWS --password-stdin 869935088019.dkr.ecr.eu-west-1.amazonaws.com

# Build and push pet service
cd pet-service
podman build --cgroup-manager=cgroupfs --platform linux/amd64 -t <ECR_URI>/pet-store-dev-pet-service:latest .
podman push <ECR_URI>/pet-store-dev-pet-service:latest

# Build and push food service
cd ../food-service
podman build --cgroup-manager=cgroupfs --platform linux/amd64 -t <ECR_URI>/pet-store-dev-food-service:latest .
podman push <ECR_URI>/pet-store-dev-food-service:latest

# Update ECS services
aws ecs update-service --cluster pet-store-dev-cluster --service pet-store-dev-pet-service --force-new-deployment --region eu-west-1
aws ecs update-service --cluster pet-store-dev-cluster --service pet-store-dev-food-service --force-new-deployment --region eu-west-1
```

### 3. Configure and Run UI Application
```bash
cd ui-app
./scripts/sync-config.sh  # Sync configuration from Terraform
npm install
npx expo start --clear
```

## 📁 Project Structure

```
hw5/
├── terraform/                      # Infrastructure as Code
│   ├── main.tf                    # Main infrastructure configuration
│   ├── variables.tf               # Variable definitions
│   ├── outputs.tf                 # Output values
│   ├── provider.tf                # Provider configuration
│   ├── environments/              # Environment-specific configurations
│   │   ├── dev/                   # Development environment
│   │   │   ├── terraform.tfvars   # Development variables
│   │   │   └── backend.tf         # Development backend
│   │   └── prod/                  # Production environment
│   │       ├── terraform.tfvars   # Production variables
│   │       └── backend.tf         # Production backend
│   └── modules/                   # Reusable Terraform modules
│       ├── vpc/                   # VPC and networking
│       ├── cognito/               # Authentication
│       ├── rds/                   # Database
│       ├── ecs/                   # Container orchestration
│       ├── ecr/                   # Container registry
│       ├── api-gateway/           # API management
│       └── docker-build/          # Docker build automation
├── pet-service/                   # Pet management microservice
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # Data models
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Container configuration
│   └── pets.db                    # SQLite database (dev)
├── food-service/                  # Food inventory microservice
│   ├── server.js                  # Express.js application
│   ├── models/                    # Data models
│   ├── package.json               # Node.js dependencies
│   ├── Dockerfile                 # Container configuration
│   └── foods.db                   # SQLite database (dev)
├── ui-app/                        # React Native/Expo application
│   ├── App.js                     # Main application component
│   ├── src/                       # Application source code
│   │   ├── components/            # Reusable UI components
│   │   ├── screens/               # Application screens
│   │   ├── services/              # API integration
│   │   ├── context/               # State management
│   │   └── navigation/            # Navigation configuration
│   ├── assets/                    # Images, icons, fonts
│   ├── scripts/                   # Utility scripts
│   │   ├── sync-config.sh         # Configuration sync
│   │   ├── run-mobile.sh          # Mobile development
│   │   └── fix-dependencies.sh    # Dependency management
│   ├── app.config.js              # Expo configuration
│   ├── package.json               # Dependencies
│   └── .env.local                 # Environment variables
└── README.md                      # This file
```

## 🔧 Configuration

### Environment Variables
The UI application uses environment variables for configuration:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://j3kdz7d2m2.execute-api.eu-west-1.amazonaws.com/dev
EXPO_PUBLIC_ALB_BASE_URL=http://pet-store-dev-alb-2001751252.eu-west-1.elb.amazonaws.com

# Cognito Configuration
EXPO_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_TDhFk8TQ8
EXPO_PUBLIC_COGNITO_CLIENT_ID=2n2t2mfa8tn6o6m8e474o6tq3j
EXPO_PUBLIC_COGNITO_REGION=eu-west-1
```

### Terraform Variables
Key infrastructure variables in `terraform/environments/dev/terraform.tfvars`:

```hcl
# Project Configuration
project_name = "pet-store"
environment = "dev"
aws_region = "eu-west-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["eu-west-1a", "eu-west-1b"]

# Database Configuration
database_name = "petstore"
database_username = "petstore_admin"
database_instance_class = "db.t3.micro"

# ECS Configuration
pet_service_port = 8000
food_service_port = 8001
```

## 🛠️ Development

### Running Services Locally
```bash
# Pet Service
cd pet-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Food Service
cd food-service
npm install
npm start
```

### UI Development
```bash
cd ui-app
npm install
npx expo start --clear
```

### Testing API Endpoints
```bash
# Get JWT token
aws cognito-idp admin-initiate-auth \
  --user-pool-id eu-west-1_TDhFk8TQ8 \
  --client-id 2n2t2mfa8tn6o6m8e474o6tq3j \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=testuser,PASSWORD=<password>

# Test Pet Service
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  https://j3kdz7d2m2.execute-api.eu-west-1.amazonaws.com/dev/petstore/pets

# Test Food Service
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  https://j3kdz7d2m2.execute-api.eu-west-1.amazonaws.com/dev/petstore/foods
```

## 📱 Mobile Application

### Features
- **Pet Management**: Create, read, update, delete pets
- **Food Inventory**: Manage food items and stock
- **Cross-Platform**: Works on iOS, Android, and Web
- **Authentication**: JWT-based authentication with Cognito
- **Real-time Updates**: Direct API integration with AWS infrastructure

### Development Scripts
```bash
# Sync configuration from Terraform
./scripts/sync-config.sh

# Run mobile development server
./scripts/run-mobile.sh

# Fix dependency issues
./scripts/fix-dependencies.sh
```

## 🚀 Deployment

### Development Environment
```bash
# Deploy infrastructure
terraform apply -var-file=environments/dev/terraform.tfvars

# Build and deploy services
./scripts/build-and-deploy.sh

# Configure UI
cd ui-app && ./scripts/sync-config.sh
```

### Production Environment
```bash
# Copy and customize production configuration
cp environments/prod/terraform.tfvars.example environments/prod/terraform.tfvars
# Edit with production values

# Deploy to production
terraform apply -var-file=environments/prod/terraform.tfvars
```

## 🔒 Security

### Implemented Security Features
- **VPC**: Private subnets for services and database
- **Security Groups**: Restricted network access
- **IAM Roles**: Least privilege access for services
- **Encryption**: RDS encryption at rest
- **JWT Authentication**: Secure API access
- **CORS Configuration**: Restricted cross-origin requests

### Security Considerations
- Database credentials are auto-generated and stored in Terraform state
- API endpoints require JWT authentication
- Services run in private subnets with no direct internet access
- All traffic encrypted in transit (HTTPS/TLS)

## 📊 Monitoring

### CloudWatch Integration
- **ECS Container Insights**: Container and service metrics
- **Application Logs**: Centralized logging for all services
- **API Gateway Logs**: Request/response logging
- **Database Metrics**: RDS performance monitoring

### Health Checks
- **ECS Health Checks**: Container health monitoring
- **Load Balancer Health Checks**: Service availability
- **Database Health**: Connection and query monitoring

## 🔧 Troubleshooting

### Common Issues

#### Infrastructure Deployment
```bash
# Module not found errors
# Solution: Run terraform from root terraform/ directory

# Provider configuration errors
# Solution: Check AWS credentials and region configuration

# Resource conflicts
# Solution: Check for existing resources with same names
```

#### Docker Build Issues
```bash
# SSL certificate issues in WSL/Podman
# Solution: Use --cgroup-manager=cgroupfs flag

# ECR authentication
# Solution: Run ECR login command before push
```

#### UI Application Issues
```bash
# Environment variables not loading
# Solution: Restart Expo server with --clear flag

# API connection errors
# Solution: Run ./scripts/sync-config.sh to update configuration
```

### Logs and Debugging
```bash
# Check ECS service logs
aws logs tail /ecs/pet-store-dev-pet-service --follow

# Check Terraform state
terraform show

# Check service health
aws ecs describe-services --cluster pet-store-dev-cluster --services pet-store-dev-pet-service
```

## 📝 License

This project is for educational purposes. See individual service licenses for details.

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Environment**: AWS eu-west-1