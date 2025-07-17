variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "repositories" {
  description = "List of ECR repositories to create"
  type = list(object({
    name                 = string
    image_tag_mutability = string
    scan_on_push         = bool
  }))
  default = [
    {
      name                 = "pet-service"
      image_tag_mutability = "MUTABLE"
      scan_on_push         = true
    },
    {
      name                 = "food-service"
      image_tag_mutability = "MUTABLE"
      scan_on_push         = true
    }
  ]
}

variable "lifecycle_policy" {
  description = "Lifecycle policy for ECR repositories"
  type        = string
  default     = ""
}

variable "enable_lifecycle_policy" {
  description = "Enable lifecycle policy for ECR repositories"
  type        = bool
  default     = true
}

variable "untagged_image_expiration_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 1
}

variable "tagged_image_count_limit" {
  description = "Maximum number of tagged images to keep"
  type        = number
  default     = 10
}

variable "enable_encryption" {
  description = "Enable encryption for ECR repositories"
  type        = bool
  default     = true
}

variable "encryption_type" {
  description = "Encryption type for ECR repositories"
  type        = string
  default     = "AES256"
  validation {
    condition     = contains(["AES256", "KMS"], var.encryption_type)
    error_message = "Encryption type must be either AES256 or KMS."
  }
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (only used if encryption_type is KMS)"
  type        = string
  default     = ""
}