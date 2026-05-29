variable "stack_name" {
    type = string
}
variable "enable_texts" {
    type    = bool
    default = false
}
variable "phone_number" {
    type    = string
}
variable "active_subscriptions_alarm" {
  type = object({
      threshold           = number
      period              = number
      evaluation_periods  = number
      datapoints_to_alarm = number
  })
  default = {
      threshold           = 3
      period              = 60
      evaluation_periods  = 1
      datapoints_to_alarm = 5
  }
}
variable "appsync_api_id" {
    type = string
}