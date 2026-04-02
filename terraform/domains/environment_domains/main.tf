# Used to create domains to be managed by front door.
module "domains" {
  for_each            = var.hosted_zone
  source              = "./vendor/modules/domains//domains/environment_domains"
  zone                = each.key
  front_door_name     = each.value.front_door_name
  resource_group_name = each.value.resource_group_name
  domains             = each.value.domains
  environment         = each.value.environment_short
  host_name           = each.value.origin_hostname
}
