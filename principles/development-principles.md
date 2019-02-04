---
category: Development Principles
expires: 2019-07-01
---

# Architecture Principles

These principles are based upon the wider [DfE Architecture Principles](https://educationgovuk.sharepoint.com/sites/gp/WorkplaceDocuments/Standards/DfE%20Enterprise%20Architecture%20Principles.docx).
These show the architectural principles as applied to digital services built and operated within DfE Digital.

## General Principles

### 1. User needs have primacy

Systems are built to serve user needs first and foremost.  When making an architectural decision between meeting a user need or meeting a governance or architectural need, the user need should win.  Where possible, meeting user needs will also meet organisational needs anyway.

### 2. We prefer service based architectures

Systems should be built to provide an end to end service for users, not just solve a slice of the problem.  We may divide the service delivery up into different technical systems, but the architecture should be considered as a whole, ensuring that users don't have disjoint experiences or have to repeat themselves multiple times through the journey needlessly.

### 3. Only build what is necessary

We prefer services that work off the shelf as commercial products over building our own.  We prefer to re-use existing services than build new ones and only build where it meets user needs to build custom software.  Custom built solutions require far more complex support and maintenance than commercial solutions do.

We prefer to minimise the operational cost of our systems, preferring Software as a Service (SaaS) over building on a Platform as a Service, which we prefer over building our own platform on Infrastructure as a Service (IaaS)

### 4. Data should have a natural and obvious home

We believe that data should be managed carefully to ensure its accuracy and safe management.  Services should identify clear data owners for data and seek access to data from the owners instead of creating a duplicate data store.  Where the data does not exist elsewhere on the estate, the service should ensure that the data is collected appropriately and made available to other services when needed.  If data is collected from individuals or about individuals, it must be collected under an appropriate set of terms and conditions that allows the appropriate use of the data by other services.

### 5. Build for interoperability

Services should be built using open standards where possible, and designed to be interoperable with other components.  We prefer loose coupling of components which allows the replacement of components at a later date as other options become available.

### 6. Make boring technology decisions

Boring technologies are technologies which are robust, well tested, well understood and just work.  We prefer the use of boring technologies within digital services unless there is an overriding reason for a specific technology.
We encourage teams building production services to consider having "3 innovation tokens", which allows them to pick up to 3 areas in which to experiment or innovate.  These tokens must also take into account innovative service design, innovative support models or unknown business areas as well as technology innovations.
