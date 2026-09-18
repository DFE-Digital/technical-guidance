variable "hosted_zone" {
  type    = map(any)
  default = {}
}

variable "rate_limit_max" {
  type    = string
  default = null
}

variable "allow_aks" {
  type    = bool
  default = false
}

variable "block_ip" {
  type    = bool
  default = false
}
