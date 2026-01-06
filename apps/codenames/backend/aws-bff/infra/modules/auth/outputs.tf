output "pool" {
  value = {
    id = aws_cognito_user_pool.codenames.id
  }
}