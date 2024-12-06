ARM_TEMPLATE_TAG=1.1.10
RG_TAGS={"Product" : "Teacher services cloud"}
REGION=UK South
SERVICE_NAME=technical-guidance
SERVICE_SHORT=techg
DOCKER_REPOSITORY=ghcr.io/dfe-digital/technical-guidance

help:
	@grep -E '^[a-zA-Z\._\-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

review: test-cluster
	$(if ${PR_NUMBER},,$(error Missing PR_NUMBER))
	$(eval ENVIRONMENT=${PR_NUMBER})
	$(eval TF_VAR_ENVIRONMENT=${PR_NUMBER})
	$(eval include global_config/review.sh)

production: production-cluster
	$(if $(or ${SKIP_CONFIRM}, ${CONFIRM_PRODUCTION}), , $(error Missing CONFIRM_PRODUCTION=yes))
	$(eval include global_config/production.sh)

domains:
	$(eval include global_config/domains.sh)

composed-variables:
	$(eval RESOURCE_GROUP_NAME=${AZURE_RESOURCE_PREFIX}-${SERVICE_SHORT}-${CONFIG_SHORT}-rg)
	$(eval KEYVAULT_NAMES='("${AZURE_RESOURCE_PREFIX}-${SERVICE_SHORT}-${CONFIG_SHORT}-app-kv", "${AZURE_RESOURCE_PREFIX}-${SERVICE_SHORT}-${CONFIG_SHORT}-inf-kv")')
	$(eval STORAGE_ACCOUNT_NAME=${AZURE_RESOURCE_PREFIX}${SERVICE_SHORT}${CONFIG_SHORT}tfsa)

ci:
	$(eval AUTO_APPROVE=-auto-approve)
	$(eval SKIP_AZURE_LOGIN=true)
	$(eval SKIP_CONFIRM=true)

set-azure-account:
	[ "${SKIP_AZURE_LOGIN}" != "true" ] && az account set -s ${AZURE_SUBSCRIPTION} || true

terraform-init: composed-variables set-azure-account
	$(if ${DOCKER_IMAGE_TAG}, , $(eval DOCKER_IMAGE_TAG=main))

	rm -rf terraform/application/vendor/modules/aks
	git -c advice.detachedHead=false clone --depth=1 --single-branch --branch ${TERRAFORM_MODULES_TAG} https://github.com/DFE-Digital/terraform-modules.git terraform/application/vendor/modules/aks

	terraform -chdir=terraform/application init -upgrade -reconfigure \
		-backend-config=resource_group_name=${RESOURCE_GROUP_NAME} \
		-backend-config=storage_account_name=${STORAGE_ACCOUNT_NAME} \
		-backend-config=key=${ENVIRONMENT}_kubernetes.tfstate
	$(eval export TF_VAR_environment=${ENVIRONMENT})
	$(eval export TF_VAR_azure_resource_prefix=${AZURE_RESOURCE_PREFIX})
	$(eval export TF_VAR_config_short=${CONFIG_SHORT})
	$(eval export TF_VAR_service_name=${SERVICE_NAME})
	$(eval export TF_VAR_service_short=${SERVICE_SHORT})
	$(eval export TF_VAR_docker_image=${DOCKER_REPOSITORY}:${DOCKER_IMAGE_TAG})

terraform-plan: terraform-init
	terraform -chdir=terraform/application plan -var-file "config/${CONFIG}.tfvars.json"

terraform-apply: terraform-init
	terraform -chdir=terraform/application apply -var-file "config/${CONFIG}.tfvars.json" ${AUTO_APPROVE}

terraform-destroy: terraform-init
	terraform -chdir=terraform/application destroy -var-file "config/${CONFIG}.tfvars.json" ${AUTO_APPROVE}

set-what-if:
	$(eval WHAT_IF=--what-if)

arm-deployment: composed-variables set-azure-account
	$(if ${DISABLE_KEYVAULTS},, $(eval KV_ARG=keyVaultNames=${KEYVAULT_NAMES}))
	$(if ${ENABLE_KV_DIAGNOSTICS}, $(eval KV_DIAG_ARG=enableDiagnostics=${ENABLE_KV_DIAGNOSTICS} logAnalyticsWorkspaceName=${LOG_ANALYTICS_WORKSPACE_NAME}),)

	az deployment sub create --name "resourcedeploy-tsc-$(shell date +%Y%m%d%H%M%S)" \
		-l "${REGION}" --template-uri "https://raw.githubusercontent.com/DFE-Digital/tra-shared-services/${ARM_TEMPLATE_TAG}/azure/resourcedeploy.json" \
		--parameters "resourceGroupName=${RESOURCE_GROUP_NAME}" 'tags=${RG_TAGS}' \
		"tfStorageAccountName=${STORAGE_ACCOUNT_NAME}" "tfStorageContainerName=terraform-state" \
		${KV_ARG} \
		${KV_DIAG_ARG} \
		"enableKVPurgeProtection=${KV_PURGE_PROTECTION}" \
		${WHAT_IF}

deploy-arm-resources: arm-deployment ## Validate ARM resource deployment. Usage: make domains validate-arm-resources

validate-arm-resources: set-what-if arm-deployment ## Validate ARM resource deployment. Usage: make domains validate-arm-resources

test-cluster:
	$(eval CLUSTER_RESOURCE_GROUP_NAME=s189t01-tsc-ts-rg)
	$(eval CLUSTER_NAME=s189t01-tsc-test-aks)

production-cluster:
	$(eval CLUSTER_RESOURCE_GROUP_NAME=s189p01-tsc-pd-rg)
	$(eval CLUSTER_NAME=s189p01-tsc-production-aks)

get-cluster-credentials: set-azure-account
	az aks get-credentials --overwrite-existing -g ${CLUSTER_RESOURCE_GROUP_NAME} -n ${CLUSTER_NAME}
	kubelogin convert-kubeconfig -l $(if ${GITHUB_ACTIONS},spn,azurecli)

bin/konduit.sh:
	curl -s https://raw.githubusercontent.com/DFE-Digital/teacher-services-cloud/main/scripts/konduit.sh -o bin/konduit.sh \
		&& chmod +x bin/konduit.sh
server:
	bundle exec middleman server --verbose

.PHONY: build
build:
	rm -rf build && bundle exec middleman build --verbose

check-links: build
	bundle exec ruby -rhtml-proofer -e "HTMLProofer.check_directory('./build',{:hydra => { :max_concurrency => 1 }}).run"

domains-infra-init: domains composed-variables set-azure-account
	rm -rf terraform/domains/infrastructure/vendor/modules/domains
	git -c advice.detachedHead=false clone --depth=1 --single-branch --branch ${TERRAFORM_MODULES_TAG} https://github.com/DFE-Digital/terraform-modules.git terraform/domains/infrastructure/vendor/modules/domains

	terraform -chdir=terraform/domains/infrastructure init -reconfigure -upgrade \
		-backend-config=resource_group_name=${RESOURCE_GROUP_NAME} \
		-backend-config=storage_account_name=${STORAGE_ACCOUNT_NAME} \
		-backend-config=key=domains_infrastructure.tfstate

domains-infra-plan: domains composed-variables domains-infra-init
	terraform -chdir=terraform/domains/infrastructure plan -var-file config/zones.tfvars.json

domains-infra-apply: domains composed-variables domains-infra-init
	terraform -chdir=terraform/domains/infrastructure apply -var-file config/zones.tfvars.json ${AUTO_APPROVE}

domains-init: domains  composed-variables set-azure-account
	rm -rf terraform/domains/environment_domains/vendor/modules/domains
	git -c advice.detachedHead=false clone --depth=1 --single-branch --branch ${TERRAFORM_MODULES_TAG} https://github.com/DFE-Digital/terraform-modules.git terraform/domains/environment_domains/vendor/modules/domains

	terraform -chdir=terraform/domains/environment_domains init -upgrade -reconfigure \
		-backend-config=resource_group_name=${RESOURCE_GROUP_NAME} \
		-backend-config=storage_account_name=${STORAGE_ACCOUNT_NAME} \
		-backend-config=key=${ENVIRONMENT}.tfstate

domains-plan: domains-init
	terraform -chdir=terraform/domains/environment_domains plan -var-file config/${CONFIG}.tfvars.json

domains-apply: domains-init
	terraform -chdir=terraform/domains/environment_domains apply -var-file config/${CONFIG}.tfvars.json ${AUTO_APPROVE}

domains-destroy: domains-init
	terraform -chdir=terraform/domains/environment_domains destroy -var-file config/${CONFIG}.tfvars.json ${AUTO_APPROVE}
