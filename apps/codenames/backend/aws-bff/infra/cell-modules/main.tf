module "codenames_table" {
  source = "../modules/dynamo"

  table_name = var.stack_name
}

module "deck_generator" {
  source = "../modules/lambda"

  function_name = "${var.stack_name}-game-board-handler"
  table_name    = module.codenames_table.table_name
  table_arn     = module.codenames_table.table_arn
  gsi_name      = module.codenames_table.gsi_name
}