.DEFAULT_GOAL := all

feature_dirs := $(wildcard ./specifications/*/*/*)

features: $(feature_dirs) scripts

$(feature_dirs): scripts
	@$(MAKE) -C $@

scripts: 
	@$(MAKE) -C ./scripts

build-mapping: scripts features
	web-tests-build-mapping

all: scripts features build-mapping

.PHONY: scripts all features $(feature_dirs) build-mapping
