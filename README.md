# DfE Technical Guidance

How we build and operate products at the Department for Education. This repo
is inspired by (and steals shamelessly from) the [GDS Way](https://gds-way.cloudapps.digital) and the
[Ministry of Justice Technical Guidance](https://ministryofjustice.github.io/technical-guidance/#moj-technical-guidance).

It's built using the GOV.UK [tech-docs-template](https://github.com/alphagov/tech-docs-template), and hosted on [GOV.UK PaaS][].

## Getting started

To preview the site locally, we need to use the terminal.

Install Ruby and [Bundler][bundler], preferably with a [Ruby version
manager][rvm].

[rvm]: https://www.ruby-lang.org/en/documentation/installation/#managers
[bundler]: http://bundler.io/

Once you have Ruby and Bundler set up, you can install this project's
dependencies by running the following in this directory:

```bash
bundle install
```

## Making documentation changes

To make changes edit the source files in the `source` folder.

Although a single page of HTML is generated the markdown is spread across
multiple files to make it easier to manage. They can be found in
`source/documentation`.

Make sure to make changes in a branch, and issue a pull request when you want them to be reviewed and published.

## Previewing

Whilst writing documentation we can run a middleman server to preview how the
published version will look in the browser. After saving a change the preview in
the browser will automatically refresh.

The preview is only available on our own computer. Others will not be able to
access it if they are given the link.

Type the following to start the server:

```
make server
```

If all goes well something like the following output will be displayed:

```
== The Middleman is loading
== LiveReload accepting connections from ws://192.168.0.8:35729
== View your site at "http://Laptop.local:4567", "http://192.168.0.8:4567"
== Inspect your site configuration at "http://Laptop.local:4567/__middleman", "http://192.168.0.8:4567/__middleman"
```

You should now be able to view a live preview at http://localhost:4567.

## Build

If you want to publish the website without using a build script you may need to
build the static HTML files. This will also allow you to preview the site exactly how it is published.

Type the following to build the HTML:

```
make build
```

This will create a `build` subfolder in the application folder which contains
the HTML and asset files ready to be published.

## Publishing changes

Every change should be reviewed in a pull request, no matter how minor, and we've enabled [branch protection][] to enforce this.
Once the pull request is merged, the deploy Github action workflow runs the build and pushes the static site to GOV.UK PaaS.

[branch protection]: https://help.github.com/articles/about-protected-branches/

## GOV.UK PaaS set-up
The application is called `dfe-technical-guidance` and is supported by the [Staticfile buildpack][] . It is deployed in the space
`technical-architecture`, in the `dfe` organisation.

The custom domain, SSL certificate and CDN are provided by the `technical-guidance` [cdn-route][] service.

The deploy workflow connects to paas using service account technical-architecture-paas@digital.education.gov.uk (a Google group).
## Licence

The documentation is [© Crown copyright][copyright] and available under the terms
of the [Open Government 3.0][ogl] licence.

[rvm]: https://www.ruby-lang.org/en/documentation/installation/#managers
[bundler]: http://bundler.io/
[mit]: LICENCE
[copyright]: http://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/
[ogl]: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
[GOV.UK PaaS]: https://www.cloud.service.gov.uk/
[Staticfile buildpack]: https://docs.cloudfoundry.org/buildpacks/staticfile/index.html
[cdn-route]: https://docs.cloud.service.gov.uk/deploying_services/use_a_custom_domain/#managing-custom-domains-using-the-cdn-route-service
