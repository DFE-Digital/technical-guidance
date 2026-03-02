variable "environment" {
  type        = string
  description = "Environment name"
}

variable "domains" {
  type = list(object({
    name                  = string
    zone                  = string
    zone_resource_group   = string
    environment           = string
    origin_hostname       = string
    patterns_to_match     = list(string)
    enable_caching        = optional(bool, true)
    subdomain            = optional(string)
    health_probe_path    = optional(string, "/")
    health_probe_interval = optional(number, 30)
    health_probe_timeout  = optional(number, 120)
  }))
  description = "List of domain configurations"
}

variable "rate_limit" {
  type = object({
    duration_in_minutes = number
    threshold          = number
    action            = string
  })
  default = null
}