module "statuscake" {
  count = var.enable_monitoring ? 1 : 0

  source = "./vendor/modules/aks//monitoring/statuscake"

  uptime_urls = compact([var.external_url])
  ssl_urls    = compact([var.external_url])

  contact_groups = var.statuscake_contact_groups
}
