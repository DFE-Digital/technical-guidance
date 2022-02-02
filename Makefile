server:
	bundle exec middleman server --verbose

.PHONY: build
build:
	rm -rf build && bundle exec middleman build --verbose

check-links: build
	bundle exec ruby -rhtml-proofer -e "HTMLProofer.check_directory('./build',{:hydra => { :max_concurrency => 1 }}).run"
