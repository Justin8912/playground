module "codenames_table" {
  source = "../modules/dynamo"

  table_name = var.table_name
}