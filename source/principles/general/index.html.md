---
last_reviewed_on: 2022-01-07
review_in: 3 months
weight: 5
---

# General principles

These pages lay out principles for architecture, coding, and developing frontends for DfE services. On this page, we lay
out more generic principles for technical folk at the department.

## Make things open, it makes things better
All of the code that we produce is classified at OFFICIAL and is paid for by the taxpayer. We have a duty to make that 
code open, to encourage reuse, and in doing so reduce waste. That's why we use GitHub to store our code, unless there's 
a security or policy reason to keep our work secret. Even the spooky folks at the Government Communications Headquarters
(GCHQ) have published a number of [open-source repos](https://github.com/gchq). [We've written guidance on how to use our 
preferred tool, GitHub](../../standards/storing-source-code/index.html.md.erb)

## Continuous integration
We believe code is made better when it's frequently integrated into the work of the rest of our teams. This manifests 
in continuous integration: all developers should be committing into the main branch at least once a day. Feature branches 
are short-lived and we use feature flags to prevent unexpected behaviour. Before merging, all code should be thoroughly 
tested. Unit and integration tests should pass before any code is merged into the main branch.

## Continuous deployment
Closely linked to the idea of continuous integration is continuous deployment. Continuous deployment means deploying 
code into production as frequently as possible. From this flows the idea that test coverage should be high, that smoke 
tests should run frequently to assert that the state of the system is as expected, and that we monitor the system for 
deviations from its expected state.
The continuous deployment pipeline should move an immutable artefact through different deployment stages. For example, 
when using Docker:

- the image should be built once
- it should be versioned: if an image is different, it should have a different version
- it should be passed between deployment stages and never re-built