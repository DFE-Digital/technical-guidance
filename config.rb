require 'govuk_tech_docs'
require 'json'

GovukTechDocs.configure(self)

set :layout, 'custom'

# Helpers for the tech radar. All content comes from data/tech_radar.yml.
helpers do
  def radar_ring(id)
    data.tech_radar['rings'].find { |ring| ring['id'] == id }
  end

  def radar_quadrant(id)
    data.tech_radar['quadrants'].find { |quadrant| quadrant['id'] == id }
  end

  def radar_area(id)
    data.tech_radar['areas'].find { |area| area['id'] == id }
  end

  # Entries sorted by name, optionally limited to one area and/or the core stack.
  def radar_entries(area_id = nil, core_only = false)
    list = data.tech_radar['entries'].to_a
    list = list.select { |entry| entry['area'] == area_id } if area_id
    list = list.select { |entry| entry['core'] } if core_only
    list.sort_by { |entry| entry['name'].to_s.downcase }
  end

  # Escapes text from the data file before it is written into HTML.
  def radar_h(text)
    ERB::Util.html_escape(text.to_s)
  end

  # JSON for the interactive radar. "<" is escaped so the data can never close
  # the surrounding <script> element.
  def radar_json
    JSON.generate(data.tech_radar.to_hash).gsub('<') { '\u003c' }
  end
end

configure :build do
    activate :asset_hash
end
