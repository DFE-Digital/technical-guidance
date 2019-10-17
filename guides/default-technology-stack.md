---
category: Development Guides
expires: 2019-07-01
---

# The DfE Digital Technology Stack

At DfE Digital, we believe that boring decisions are good decisions.  We therefore provide some default options for technology choices that are well supported within the community and well tested.

These recommendations are purely that, recommendations, rather than standards that you must meet.  There are often reasons from deviating from these recommendations, but as a team you should be prepared to justify why you made these decisions, and to trace that back to a user need the drives the decision.

## Application Stacks
### The Ruby Stack

DfE Digital has a strong preference for a Ruby on Rails stack for development.  We recommend using the latest stable version of Ruby on Rails (5.2 at time of writing) on the latest stable version of Ruby (2.5 at the time of writing).

We recommend that teams look at the [boilerplate project](https://github.com/DFE-Digital/govuk-rails-boilerplate) when starting their projects.

### The Node.JS stack

DfE Digital has some services built in node.js, and will continue to build and support more.  We recommend using the latest stable version of Node (8.x at time of writing) and the express framework (version 4.x at time of writing).

We recommend that teams look at the [node boilerplate project](https://github.com/DFE-Digital/login.dfe.node-boilerplate) when starting their projects

## Hosting Stack
### Azure

DfE Digital uses Microsoft Azure as its primary hosting platform. New services should request an Azure account via the Cloud Infrastructure Platform (CIP) team.

For more information about CIP and the onboarding process of services and users you can contact the team on:

<CloudPlatform.ENGINEERING@education.gov.uk> or (https://ukgovernmentdfe.slack.com/app_redirect?channel=C7L4D0LM9)

CIP Docs - (http://docs.platform.education.gov.uk)
DfE Architecture Docs - (https://dfe-digital.github.io/enterprise-architecture/common-components/#1-cloud-infrastructure-platform)

Support for Azure use in general can also be gained from the community in ['cloud-platform](https://ukgovernmentdfe.slack.com/app_redirect?channel=C7L4D0LM9)

### Infrastructure as code

DfE Digital uses [Azure Resource Manager (ARM)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates) templates for automating and scripting Azure infrastructure creation and changes.



### CI/CD pipelines

DfE Digital [Azure DevOps](https://azure.microsoft.com/en-gb/services/devops/) (formerly VSTS) for build and deployment pipelines. Configuration is via a YAML definition. Access to Azure DevOps can be granted as part of onboarding onto the Cloud Infrastructure Platform.

### Containerisation

DfE Digital uses Docker to isolate and package up application depedencies from infrastructure and environment concerns. All repositories should be added to the [`dfedigital`](https://hub.docker.com/u/dfedigital) Docker Hub organisation.

When intergrating Dockerhub in CI/CD it's best to use an appropriately named generic Dockerhub account (e.g. `your-project-name`) set up specifically for your project and documented in your team's runbook / opsmanual. This saves problems caused when users move on from a project.

Ask in the [`#digital-tools-support`](https://ukgovernmentdfe.slack.com/messages/CMS9V0JQL) channel on the DfE Slack to have members added to the DfE Docker Hub organisation and for help adding credentials to use with your CI/CD pipeline.

## Logging, monitoring and alerting

DfE Digital uses [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview) for logging and monitoring, with the ability to send custom telemetry - for Ruby applications this can be achieved via the [ApplicationInsights-Ruby](https://github.com/Microsoft/ApplicationInsights-Ruby) gem.

The alerting is limited to 5 minimum minute windows during which alert events are aggregated. If more "real-time" alerting is required than solutions such as [Sentry](https://sentry.io/welcome/) can be used.

Methods for exporting logs from containers are currently being explored and log aggregators such as [Logit](https://logit.io/) (used by GDS) are being considered.
