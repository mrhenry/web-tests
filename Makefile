.DEFAULT_GOAL := all

feature_dirs := $(wildcard ./specifications/*/*/*)

scripts: 
	@$(MAKE) -C ./scripts

features: $(feature_dirs) scripts

$(feature_dirs): scripts
	@$(MAKE) -C $@

build-mapping: scripts features
	web-tests-build-mapping

all: scripts features build-mapping

.PHONY: scripts all features $(feature_dirs) build-mapping
