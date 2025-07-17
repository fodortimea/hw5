# Pet Service
resource "aws_ecs_service" "pet_service" {
  name            = "${var.project_name}-${var.environment}-pet-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.pet_service.arn
  desired_count   = var.pet_service.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.pet_service.arn
    container_name   = "pet-service"
    container_port   = var.pet_service.port
  }

  depends_on = [
    aws_lb_listener.main,
    aws_lb_listener_rule.pet_service
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-pet-service"
  }
}

# Food Service
resource "aws_ecs_service" "food_service" {
  name            = "${var.project_name}-${var.environment}-food-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.food_service.arn
  desired_count   = var.food_service.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.food_service.arn
    container_name   = "food-service"
    container_port   = var.food_service.port
  }

  depends_on = [
    aws_lb_listener.main,
    aws_lb_listener_rule.food_service
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-food-service"
  }
}

# Auto Scaling Target for Pet Service
resource "aws_appautoscaling_target" "pet_service" {
  count = var.enable_auto_scaling ? 1 : 0

  max_capacity       = var.auto_scaling_config.max_capacity
  min_capacity       = var.auto_scaling_config.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.pet_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Pet Service
resource "aws_appautoscaling_policy" "pet_service_cpu" {
  count = var.enable_auto_scaling ? 1 : 0

  name               = "${var.project_name}-${var.environment}-pet-service-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.pet_service[0].resource_id
  scalable_dimension = aws_appautoscaling_target.pet_service[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.pet_service[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = var.auto_scaling_config.target_cpu
  }
}

# Auto Scaling Target for Food Service
resource "aws_appautoscaling_target" "food_service" {
  count = var.enable_auto_scaling ? 1 : 0

  max_capacity       = var.auto_scaling_config.max_capacity
  min_capacity       = var.auto_scaling_config.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.food_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy for Food Service
resource "aws_appautoscaling_policy" "food_service_cpu" {
  count = var.enable_auto_scaling ? 1 : 0

  name               = "${var.project_name}-${var.environment}-food-service-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.food_service[0].resource_id
  scalable_dimension = aws_appautoscaling_target.food_service[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.food_service[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = var.auto_scaling_config.target_cpu
  }
}