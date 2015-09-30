.PHONY: docs

build:
	npm install

docs:
	apidoc -i src/ -o docs/

test:
	FS_ROOT="`pwd`/src" ./node_modules/mocha/bin/mocha --opts tests/unit/mocha.opts --recursive tests/unit
