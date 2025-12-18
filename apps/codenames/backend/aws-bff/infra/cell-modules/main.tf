module "codenames_table" {
  source = "../modules/dynamo"

  table_name = var.stack_name
}

module "deck_generator" {
  source = "../modules/lambda"

  function_name = "${var.stack_name}-game-board-handler"
  table = module.codenames_table.table
}

module "appsync" {
  source = "../modules/appsync"

  stack_name                = var.stack_name
  deck_manager_lambda_arn   = module.deck_generator.arn
  table                     = module.codenames_table.table
}