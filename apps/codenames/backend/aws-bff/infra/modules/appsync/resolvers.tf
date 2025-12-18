data "local_file" "createGame_mutation" {
  filename   = "${local.resolvers_path}/build/mutation/function.createGame.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "createGame_mutation" {
  api_id = aws_appsync_graphql_api.codenames_api.id
  type   = "Mutation"
  field  = "createGame"
  data_source = aws_appsync_datasource.deck_manager_lambda.name
  runtime {
    name = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  code = data.local_file.createGame_mutation.content
}

data "local_file" "deleteGame_mutation" {
  filename   = "${local.resolvers_path}/build/mutation/function.deleteGame.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "deleteGame_mutation" {
  api_id = aws_appsync_graphql_api.codenames_api.id
  type   = "Mutation"
  field  = "deleteGame"
  data_source = aws_appsync_datasource.deck_manager_lambda.name
  runtime {
    name = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  code = data.local_file.deleteGame_mutation.content

}