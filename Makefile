.PHONY: docs

build:
	npm install

docs:
	apidoc -i src/ -o docs/

test:
	FS_ROOT="`pwd`/src" ./node_modules/mocha/bin/mocha --opts tests/unit/mocha.opts --recursive tests/unit

dev:
	DEBUG=apn pm2 startOrRestart pm2.json
	pm2 logs --raw | bunyan -o short

docker:
	docker build -t michaeldonat/pns.js .
