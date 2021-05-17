server:
	bundle exec middleman server --verbose

.PHONY: build
build:
	rm -rf build && bundle exec middleman build --verbose

check-links:
	bundle exec ruby -rhtml-proofer -e "HTMLProofer.check_directory('./build').run"
