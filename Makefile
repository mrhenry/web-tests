.DEFAULT_GOAL := all

ecma262_dirs := $(wildcard ./ecma262/*)

ecma262: $(ecma262_dirs)

$(ecma262_dirs):
	@$(MAKE) -C $@

scripts: 
	@$(MAKE) -C ./scripts

all: ecma262 scripts

.PHONY: all ecma262 $(ecma262_dirs) scripts
