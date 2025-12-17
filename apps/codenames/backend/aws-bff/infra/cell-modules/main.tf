module "codenames_table" {
  source = "../modules/dynamo"

  table_name = var.table_name
}

module "deck_generator" {
  source = "../modules/lambda"

  function_name = "codenames-deck-generator"
}