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

DfE Digital uses Azure as its primary hosting capability.  New services should request an Azure account via the AO project, which will create a number of subscriptions and allocate permissions.  We recommend using 2 or 3 subscriptions to represent the developer, staging and production environments.

### Infrastructure as code

DfE Digital uses Terraform and ARM Templates for scripting the azure environments.

### CI/CD pipelines

DfE Digital uses Travis CI and Azure DevOps for building build and deployment pipelines.

```
