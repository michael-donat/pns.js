.PHONY: docs

build:
	npm install

docs:
	apidoc -i src/ -o docs/
