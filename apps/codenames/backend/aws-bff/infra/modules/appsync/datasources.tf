resource "aws_appsync_datasource" "deck_manager_lambda" {
  api_id           = aws_appsync_graphql_api.codenames_api.id
  name             = "publish_notifications"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.deck_manager_lambda.arn

  lambda_config {
    function_arn = var.deck_manager_lambda_arn
  }
}

resource "aws_appsync_datasource" "table" {
    api_id           = aws_appsync_graphql_api.codenames_api.id
    name             = "codenames_table"
    type             = "AMAZON_DYNAMODB"
    service_role_arn = aws_iam_role.table_role.arn

    dynamodb_config {
        table_name = var.table.name
    }
}
