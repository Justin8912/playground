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
  region                    = var.region
}

module "appsync_cognito_auth" {
  source = "../modules/appsync"

  stack_name                = "${var.stack_name}-cognito-auth"
  deck_manager_lambda_arn   = module.deck_generator.arn
  table                     = module.codenames_table.table
  region                    = var.region
  user_pool_id              = module.authentication.pool.id
  use_cognito_auth          = true
}

module "alarms" {
    source = "../modules/alarms"

    stack_name    = var.stack_name
    enable_texts  = true
    phone_number  = "+15612718136"
    appsync_api_id  = module.appsync_cognito_auth.api.id
}

module "authentication" {
  source = "../modules/auth"

  stack_name = var.stack_name
  region     = var.region
  account_id = var.account_id
}