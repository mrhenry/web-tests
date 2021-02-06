.DEFAULT_GOAL := all

feature_dirs := $(wildcard ./specifications/*/*/*)

clean:
	@rm -rf ./tests
	@mkdir ./tests
	@touch ./tests/.gitkeep
	@echo "*.html" > ./tests/.gitignore
	@rm -rf ./test-assets
	@mkdir ./test-assets
	@touch ./test-assets/.gitkeep
	@echo "*.js" > ./test-assets/.gitignore

scripts: 
	@$(MAKE) -C ./scripts

features: $(feature_dirs) scripts

$(feature_dirs): scripts
	@$(MAKE) -C $@

build-mapping: scripts features
	web-tests-build-mapping

all: scripts features build-mapping

.PHONY: clean scripts all features $(feature_dirs) build-mapping
