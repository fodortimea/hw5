# Secrets Manager Module Outputs

output "secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "secret_name" {
  description = "Name of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "secret_id" {
  description = "ID of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.id
}

output "database_password" {
  description = "Generated database password (sensitive)"
  value       = random_password.db_password.result
  sensitive   = true
}

output "secrets_access_policy_arn" {
  description = "ARN of the IAM policy for accessing secrets"
  value       = aws_iam_policy.secrets_access.arn
}

output "connection_string" {
  description = "Database connection string template"
  value       = "postgresql://${var.database_username}:${random_password.db_password.result}@${var.database_host}:${var.database_port}/${var.database_name}"
  sensitive   = true
}