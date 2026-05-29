data "local_file" "schema" {
  filename = "${path.module}/resources/schema.graphql"
}

// Trigger rebuild for resolvers.tf
data "external" "compile_resolvers" {
  working_dir = local.resolvers_path
  program     = ["bash", "-c", "npm run build --silent && echo '{\"status\":\"ok\"}'"]
}

resource "aws_appsync_graphql_api" "codenames_api" {
#   TODO: Update this authentication method to not be API key as it is not very secure
    authentication_type = var.use_cognito_auth ? "AMAZON_COGNITO_USER_POOLS" : "API_KEY"
    name                = "${var.stack_name}-api"
    schema              = data.local_file.schema.content
    log_config {
        field_log_level = "ALL"
        cloudwatch_logs_role_arn = aws_iam_role.appsync_role.arn
    }
    user_pool_config {
      aws_region     = var.region
      # TODO: Change this to DENY and update graphql schema with user pool specific rules
      default_action = "ALLOW"
      user_pool_id   = var.user_pool_id
    }
}

resource "aws_cloudwatch_log_group" "appsync_log_group" {
    name              = "/aws/appsync/apis/${aws_appsync_graphql_api.codenames_api.id}"
    retention_in_days = 1
}