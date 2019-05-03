---
category: Building software
expires: 2018-01-31
---
# Storing source code

All our source code is open by default, and stored on well-known,
public code hosting services. At the DfE, we use GitHub.

We follow the principles set out in the service manual for managing the
code that we write:

- [use version control](https://www.gov.uk/service-manual/technology/maintaining-version-control-in-coding)
- [make source code open](https://www.gov.uk/service-manual/technology/making-source-code-open-and-reusable)

You should keep secrets separate from source code, and keep them private.

## GitHub

New repositories for products and services live in the
[Department for Education Digital organisation](https://github.com/DfE-Digital)
on GitHub. New repositories must be created within the Department for Education Digital organisation, whether they contain service production code or prototypes. Work created outside of the DfE Digital organisation should be transferred into the DfE Digital organisation at the earliest opportunity. [Guide to transferring a repository](https://help.github.com/en/articles/transferring-a-repository).

You can use your personal GitHub account (but you should [add your DfE
email address to your account](https://help.github.com/articles/adding-an-email-address-to-your-github-account/),
and maybe [use that for notifications](https://help.github.com/articles/managing-notification-emails-for-organizations/)).
Ask your delivery manager to request you being added to the Github organisation.

Repositories should be [clearly named]({{ '/standards/naming-things' | relative_url }}),
and have an [appropriate licence]({{ '/standards/licencing-software-or-code' | relative_url }})
and enough documentation that someone new can get started with the
project.

Private repositories are not a good way to protect secrets, and should only be used where access to the code might reveal draft policy decisions.  Secrets should be managed at the platform level.
