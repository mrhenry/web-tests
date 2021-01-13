.DEFAULT_GOAL := all

ecma262_dirs := $(wildcard ./ecma262/*)

ecma262: $(ecma262_dirs)

$(ecma262_dirs):
	@$(MAKE) -C $@

url_dirs := $(wildcard ./url/*)

url: $(url_dirs)

$(url_dirs):
	@$(MAKE) -C $@

scripts: 
	@$(MAKE) -C ./scripts

all: ecma262 url scripts

.PHONY: all ecma262 $(ecma262_dirs) url $(url_dirs) scripts
