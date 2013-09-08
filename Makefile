
test:
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--require should \
		--bail

.PHONY: test