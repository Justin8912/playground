variable "stack_name" {
  type = string
}
variable "region" {
  type = string
}
variable "account_id" {
  type = string
}
variable "callback_urls" {
  type = list(string)
}
variable "logout_urls" {
  type = list(string)
}