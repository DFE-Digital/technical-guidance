require 'govuk_tech_docs'

GovukTechDocs.configure(self)

set :layout, 'custom'

configure :build do
    activate :asset_hash
end
