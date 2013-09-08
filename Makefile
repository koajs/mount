
test:
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--require should \
		--reporter spec \
		--bail

.PHONY: test