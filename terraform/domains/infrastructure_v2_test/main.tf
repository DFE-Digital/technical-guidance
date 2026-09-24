module "domains_infrastructure" {
  source = "./vendor/modules/domains//domains2/infrastructure_v2"
  
  front_door_name     = "s189p01-techg-test-fd"  # New name for testing
  resource_group_name = "s189p01-techg-dom-rg"
  
  hosted_zones = {
    main = {
      zone_name              = "technical-guidance.education.gov.uk"
      resource_group_name    = "s189p01-techg-dom-rg"
      deploy_default_records = false  # Matching current config
      caa_record_list        = []
      txt_records            = {}
    }
  }
  
  azure_enable_monitoring = false
  
  tags = {
    Service     = "TechnicalGuidance"
    Environment = "Test"
    Module      = "domains2"
  }
}