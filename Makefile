.DEFAULT_GOAL := all

feature_dirs := $(wildcard ./specifications/*/*/*)

features: $(feature_dirs)

$(feature_dirs):
	@$(MAKE) -C $@

scripts: 
	@$(MAKE) -C ./scripts

build-mapping: scripts
	web-tests-build-mapping

all: features scripts build-mapping

.PHONY: all features $(feature_dirs) scripts build-mapping
