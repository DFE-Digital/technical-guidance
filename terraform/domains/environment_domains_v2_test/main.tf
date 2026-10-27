module "domains" {
  source = "./vendor/modules/domains//domains2/environment_domains_v2"
  
  environment             = var.environment
  front_door_profile_name = "s189p01-techg-test-fd"
  resource_group_name     = "s189p01-techg-dom-rg"
  
  endpoint_configuration = {
    strategy = "per_environment"  # Simple strategy for single zone
  }
  
  domains = var.domains
  
  rate_limit_rules = var.rate_limit != null ? {
    "global-limit" = {
      domain              = "technical-guidance.education.gov.uk"
      duration_in_minutes = var.rate_limit.duration_in_minutes
      threshold           = var.rate_limit.threshold
      action              = var.rate_limit.action
    }
  } : {}
  
  tags = {
    Service     = "TechnicalGuidance"
    Environment = var.environment
    Module      = "domains2"
  }
}