variable "hosted_zone" {
  type    = map(any)
  default = {}
}

variable "deploy_default_records" {
  default = false
}