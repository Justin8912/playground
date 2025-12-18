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
    authentication_type = "API_KEY"
    name                = "${var.stack_name}-api"
    schema              = data.local_file.schema.content
}