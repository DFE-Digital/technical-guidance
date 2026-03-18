variable "hosted_zone" {
  type    = map(any)
  default = {}
}

variable "block_paths" {
  type = list(object({
    name       = string
    priority   = number
    enabled    = optional(bool, true)
    patterns   = list(string)
    operator   = optional(string, "EndsWith")
    transforms = optional(list(string), ["Lowercase"])
    negate     = optional(bool, false)
  }))
  nullable    = false
  default     = []
  description = "List of path blocking rules for Front Door WAF"
}
