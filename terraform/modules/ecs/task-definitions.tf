# Pet Service Task Definition
resource "aws_ecs_task_definition" "pet_service" {
  family                   = "${var.project_name}-${var.environment}-pet-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.pet_service.cpu
  memory                   = var.pet_service.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "pet-service"
      image = var.pet_service.image_uri != "" ? var.pet_service.image_uri : "nginx:latest"
      
      portMappings = [
        {
          containerPort = var.pet_service.port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "COGNITO_USER_POOL_ID"
          value = var.cognito_user_pool_id
        },
        {
          name  = "COGNITO_USER_POOL_CLIENT_ID"
          value = var.cognito_user_pool_client_id
        },
        {
          name  = "PORT"
          value = tostring(var.pet_service.port)
        }
      ]

      environment = [
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = var.enable_logging ? {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.pet_service[0].name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      } : null

      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:${var.pet_service.port}/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-pet-service-task"
  }
}

# Food Service Task Definition
resource "aws_ecs_task_definition" "food_service" {
  family                   = "${var.project_name}-${var.environment}-food-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.food_service.cpu
  memory                   = var.food_service.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "food-service"
      image = var.food_service.image_uri != "" ? var.food_service.image_uri : "nginx:latest"
      
      portMappings = [
        {
          containerPort = var.food_service.port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "COGNITO_USER_POOL_ID"
          value = var.cognito_user_pool_id
        },
        {
          name  = "COGNITO_USER_POOL_CLIENT_ID"
          value = var.cognito_user_pool_client_id
        },
        {
          name  = "PORT"
          value = tostring(var.food_service.port)
        }
      ]

      environment = [
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = var.enable_logging ? {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.food_service[0].name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      } : null

      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:${var.food_service.port}/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-food-service-task"
  }
}

# Data source for current region
data "aws_region" "current" {}