# DfE Technical Guidance

How we build and operate products at the Department for Education. This repo
is inspired by (and steals shamelessly from) the [GDS Way](https://gds-way.cloudapps.digital) and the
[Ministry of Justice Technical Guidance](https://ministryofjustice.github.io/technical-guidance/#moj-technical-guidance).

It's built using the GOV.UK [tech-docs-template](https://github.com/alphagov/tech-docs-template), and hosted on [GOV.UK PaaS][].

## Add a new guidance
See the [Adding a new guidance][/guides/adding-new-guidance] section.

## GOV.UK PaaS set-up
The application is called `dfe-technical-guidance` and is supported by the [Staticfile buildpack][] . It is deployed in the space
`technical-architecture`, in the `dfe` organisation.

The custom domain, SSL certificate and CDN are provided by the `technical-guidance` [cdn-route][] service.

The deploy workflow connects to paas using service account technical-architecture-paas@digital.education.gov.uk (a Google group).

The review apps are deployed to the `technical-architecture-dev` space and their name is suffixed by the PR number. There is no
cdn-route service, we simply use the default `.london.cloudapps.digital` domain.

## Licence

The documentation is [© Crown copyright][copyright] and available under the terms of the [Open Government 3.0][ogl] licence.

[rvm]: https://www.ruby-lang.org/en/documentation/installation/#managers
[bundler]: http://bundler.io/
[mit]: LICENCE
[copyright]: http://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/
[ogl]: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
[GOV.UK PaaS]: https://www.cloud.service.gov.uk/
[Staticfile buildpack]: https://docs.cloudfoundry.org/buildpacks/staticfile/index.html
[cdn-route]: https://docs.cloud.service.gov.uk/deploying_services/use_a_custom_domain/#managing-custom-domains-using-the-cdn-route-service
[govuk-tech-docs gem]: https://github.com/alphagov/tech-docs-gem
[middleman]: https://middlemanapp.com/
