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

data "local_file" "cardResolver_unit" {
  filename   = "${local.resolvers_path}/build/unit/function.cards.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "cardResolver_unit" {
    api_id = aws_appsync_graphql_api.codenames_api.id
    type   = "Game"
    field  = "cards"
    data_source = aws_appsync_datasource.table.name
    runtime {
        name = "APPSYNC_JS"
        runtime_version = "1.0.0"
    }
    code = data.local_file.cardResolver_unit.content
}

data "local_file" "getAllGames_query" {
  filename   = "${local.resolvers_path}/build/query/function.getAllGames.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "getAllGames_resolver" {
  api_id = aws_appsync_graphql_api.codenames_api.id
  type   = "Query"
  field  = "getAllGames"
  data_source = aws_appsync_datasource.table.name
  runtime {
    name = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  code = data.local_file.getAllGames_query.content
}

data "local_file" "getGame_query" {
  filename   = "${local.resolvers_path}/build/query/function.getGame.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "getGame_resolver" {
  api_id = aws_appsync_graphql_api.codenames_api.id
  type   = "Query"
  field  = "getGame"
  data_source = aws_appsync_datasource.table.name
  runtime {
    name = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  code = data.local_file.getGame_query.content
}

data "local_file" "updateCard_mutation" {
  filename   = "${local.resolvers_path}/build/mutation/function.updateCard.js"
  depends_on = [data.external.compile_resolvers]
}

resource "aws_appsync_resolver" "updateCard_mutation" {
  api_id = aws_appsync_graphql_api.codenames_api.id
  type   = "Mutation"
  field  = "updateCard"
  data_source = aws_appsync_datasource.table.name
  runtime {
    name = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  code = data.local_file.updateCard_mutation.content
}