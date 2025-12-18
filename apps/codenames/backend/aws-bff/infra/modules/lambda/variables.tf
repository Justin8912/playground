variable "function_name" {
  type = string
}

variable "table" {
  type = object({
    name     = string
    arn      = string
    gsi_name = string
  })
}