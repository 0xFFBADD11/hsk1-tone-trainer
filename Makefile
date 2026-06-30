.PHONY: install test lint fuzz dev deploy check

install:
	pnpm install

test:
	node --test

lint:
	pnpm run lint

fuzz:
	pnpm run fuzz

dev:
	pnpm run dev

deploy:
	pnpm run deploy

# Aggregate gate mirrored by CI: lint + unit tests must pass.
check: lint test
