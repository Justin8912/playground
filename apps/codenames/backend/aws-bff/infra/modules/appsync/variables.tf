variable "stack_name" {
  type = string
}

variable "deck_manager_lambda_arn" {
  type = string
}

variable "table" {
  type = object({
    name = string
    arn  = string
  })
}

variable "use_cognito_auth" {
  type = bool
  default = false
}

variable "region" {
  type = string
}

variable user_pool_id {
  type = string
  default = ""
}