module "codenames_table" {
  source = "../modules/dynamo"

  table_name = var.stack_name
}

module "deck_generator" {
  source = "../modules/lambda"

  function_name = "${var.stack_name}-deck-generator"
}