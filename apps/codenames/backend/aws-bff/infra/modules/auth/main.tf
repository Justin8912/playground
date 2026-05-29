resource "aws_cognito_user_pool" "codenames" {
  name = "${var.stack_name}-user-pool"
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration = "OFF"
  
  device_configuration {
    device_only_remembered_on_user_prompt = false
  }
  
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  password_policy {
    minimum_length = 6
    require_lowercase = false
    require_numbers = false
    require_symbols = false
    require_uppercase = false
    temporary_password_validity_days = 7
  }
}

resource "aws_cognito_user_pool_client" "codenames_client" {
  name = "${var.stack_name}-client"
  user_pool_id = aws_cognito_user_pool.codenames.id
  access_token_validity = 1 # default unit is in hours
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["openid", "email", "profile"]
  callback_urls = var.callback_urls
  logout_urls = var.logout_urls
  supported_identity_providers = ["COGNITO"]
  explicit_auth_flows = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  auth_session_validity = 15
}

resource "aws_cognito_user_pool_domain" "codenames_domain" {
  domain       = "${var.stack_name}-auth"
  user_pool_id = aws_cognito_user_pool.codenames.id
}