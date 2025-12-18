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