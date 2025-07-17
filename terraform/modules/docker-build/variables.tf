variable "project_root" {
  description = "Root directory of the project (where pet-service and food-service directories are located)"
  type        = string
}

variable "pet_service_repository_url" {
  description = "ECR repository URL for pet service"
  type        = string
}

variable "food_service_repository_url" {
  description = "ECR repository URL for food service"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to use"
  type        = string
  default     = "latest"
}

variable "pet_service_port" {
  description = "Port the pet service runs on"
  type        = number
  default     = 8000
}

variable "food_service_port" {
  description = "Port the food service runs on"
  type        = number
  default     = 3000
}

variable "create_dockerfiles" {
  description = "Whether to create Dockerfiles automatically"
  type        = bool
  default     = true
}

variable "cleanup_local_images" {
  description = "Whether to clean up local Docker images after pushing"
  type        = bool
  default     = false
}

variable "aws_region" {
  description = "AWS region for ECR"
  type        = string
  default     = ""
}