output "pet_service_build_status" {
  description = "Status of pet service Docker build"
  value       = null_resource.pet_service_build.id
}

output "food_service_build_status" {
  description = "Status of food service Docker build"
  value       = null_resource.food_service_build.id
}

output "pet_service_image_uri" {
  description = "Full image URI for pet service"
  value       = "${var.pet_service_repository_url}:${var.image_tag}"
}

output "food_service_image_uri" {
  description = "Full image URI for food service"
  value       = "${var.food_service_repository_url}:${var.image_tag}"
}

output "docker_commands" {
  description = "Docker commands that were executed"
  value = {
    pet_service_build = "docker build -t ${var.pet_service_repository_url}:${var.image_tag} ${var.project_root}/pet-service"
    pet_service_push  = "docker push ${var.pet_service_repository_url}:${var.image_tag}"
    food_service_build = "docker build -t ${var.food_service_repository_url}:${var.image_tag} ${var.project_root}/food-service"
    food_service_push  = "docker push ${var.food_service_repository_url}:${var.image_tag}"
  }
}