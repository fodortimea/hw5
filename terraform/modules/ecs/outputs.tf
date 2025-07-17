output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.main.arn
}

output "pet_service_name" {
  description = "Name of the pet service"
  value       = aws_ecs_service.pet_service.name
}

output "food_service_name" {
  description = "Name of the food service"
  value       = aws_ecs_service.food_service.name
}

output "pet_service_task_definition_arn" {
  description = "ARN of the pet service task definition"
  value       = aws_ecs_task_definition.pet_service.arn
}

output "food_service_task_definition_arn" {
  description = "ARN of the food service task definition"
  value       = aws_ecs_task_definition.food_service.arn
}

output "pet_service_target_group_arn" {
  description = "ARN of the pet service target group"
  value       = aws_lb_target_group.pet_service.arn
}

output "food_service_target_group_arn" {
  description = "ARN of the food service target group"
  value       = aws_lb_target_group.food_service.arn
}

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_service_security_group_id" {
  description = "Security group ID for ECS services"
  value       = aws_security_group.ecs_service.id
}

output "alb_security_group_id" {
  description = "Security group ID for ALB"
  value       = aws_security_group.alb.id
}

# Service endpoints
output "pet_service_endpoint" {
  description = "Pet service endpoint"
  value       = "http://${aws_lb.main.dns_name}/petstore/pets"
}

output "food_service_endpoint" {
  description = "Food service endpoint"
  value       = "http://${aws_lb.main.dns_name}/petstore/foods"
}