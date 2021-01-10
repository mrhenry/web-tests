ecma262_dirs := $(wildcard ./ecma262/*)

ecma262: $(ecma262_dirs)

$(ecma262_dirs):
	@$(MAKE) -C $@

.PHONY: ecma262 $(ecma262_dirs)
