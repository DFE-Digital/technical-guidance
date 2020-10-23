---
category: Development Guides
expires: 2020-05-01
---

# GOV.UK Platform as a Service

GOV.UK Platform as a Service (PaaS) is a platform developed by [Government Digital Service (GDS)](https://www.gov.uk/government/organisations/government-digital-service) and available for government departments to deploy applications and backend services. It is based on the widely used open source platform [Cloud Foundry](https://www.cloudfoundry.org/) and built on [Amazon Web Services](https://aws.amazon.com/).

Several production applications are already running on GOV.UK PaaS but production usage still needs to be approved by the DfE architecture and security teams on a case-by-case basis. This is currently being progressed. In the meantime, please speak with your architecture partner or contact architecture.services@education.gov.uk.

## Suitability

[Azure CIP](/guides/default-technology-stack/#azure) is the strategic and default platform for hosting in DfE. When does it make sense to use GOV.UK PaaS?

### Standard web applications

GOV.UK PaaS runs applications in horizontally scalable, stateless Linux containers. It is not adapted to large stateful enterprise applications.

It is mainly aimed at [12-factor applications](https://docs.cloud.service.gov.uk/architecture.html#12-factor-application-principles), which is a set of good practices for web applications to ensure smooth operations, scalability and consistency across environments. The service manual [recommends](https://www.gov.uk/service-manual/technology/deploying-software-regularly#managing-variable-configuration) this architecture.

Native Windows applications will not run. However, .NET Core is supported as it runs on Linux.

### Rapid development

The strategic Azure platform may take time and resource to set up, requiring specialised engineers to set up and manage. PaaS provides the ability to spin environments up/down without infrastructure expertise, enabling prototyping and fast iteration, which is particularly useful in Discovery and Alpha. Some teams use [Heroku](https://heroku.com/) to deploy a prototype quickly. PaaS provides similar features but government hosted and cheaper.

Also, it allows short lived environments created for the unique purpose of validating a new feature, similar to [Heroku review apps](https://devcenter.heroku.com/articles/github-integration-review-apps). This allows for ephemeral/temporary environments to be created and disposed "on the fly" and removes the contention usually observed when sharing environments.

### Low cost

PaaS is particularly adapted to services with budget constraints as total cost is lower than full IaaS. Cost of hosting is usually lower than Azure but most of the savings will come from the lower dependency on dedicated infrastructure engineers.

Specialist engineers may still be requested on an ad hoc basis for guidance and to make sure the application is production ready.

### Simple infrastructure

Setting up a web application in the cloud involves a significant number of non-functional requirements such as providing internet access, container scheduling, load balancing, scalability, monitoring, user access management, billing etc.
A platform-as-a-service [includes them already](https://docs.cloudfoundry.org/concepts/overview.html) so the developer doesn't have to implement them.

As a result, setting up an application does not require full time infrastructure specialists or ops engineers. However, the set-up is limited to what is available in the platform: see [application development](https://www.cloud.service.gov.uk/application-development/) and [constraints](https://www.cloud.service.gov.uk/constraints/).

A limited number of [backing services](https://www.cloud.service.gov.uk/application-development/#backing-services) are provided: PostgreSQL, MySQL, Redis, Elasticsearch, AWS S3, and InfluxDB. They run in the platform and cannot be accessed externally but can be easily linked to your application in a PaaS container.

Application logs and performance metrics are [available in the platform](https://docs.cloud.service.gov.uk/monitoring_apps.html#monitoring-apps) in standard format and can be accessed manually, via the web portal or via external tools. The platform itself doesn't provide log storage or custom visualisations.

### Security: Up to OFFICIAL data

The platform is [assured for use at OFFICIAL](https://www.cloud.service.gov.uk/security/#our-safety-measures). As the data owner for a service [you must ensure that appropriate controls are in place when handling Official data](https://www.gov.uk/guidance/official-sensitive-data-and-it).

The platform is multi tenant: the resources are shared between different users and each one has dedicated access to the resources, with clear access control policies. Users are other government departments. Some very specific applications might require total isolation which the platform does not provide.

### Connectivity: Internet only

The platform runs in a public cloud: inbound and outbound connections are exclusively via public Internet. Traditional network based security via dedicated network links, VPN, IP restrictions cannot be used.

Instead, transport security is achieved by using HTTPS/TLS and authentication via username/password or a single-sign-on integration such as with OAuth or SAML (DfE Sign-in is supported), or several types of API authentication. This is handled at the application level. This is a "cloud first" approach as specified in the Technology Code of Practice.

## Links
* [Features](https://www.cloud.service.gov.uk/features)
* [Documentation](https://docs.cloud.service.gov.uk/)
* [Pricing](https://www.cloud.service.gov.uk/pricing)
* [Cloud Foundry](https://docs.cloudfoundry.org/)

## Contact

If you are interested in adopting this platform please contact [digital-tools-support@digital.education.gov.uk](mailto:digital-tools-support@digital.education.gov.uk)
