.PHONY: verify ci scaffold-check contract-test contract-build deploy-check agent-test agent-build agent-demo agent-json mcp-check oracle-test demo-evidence competition-assets diff-check fill-artifacts-dry-run submission-check export-package

verify:
	./scripts/final-verify.sh

ci:
	./scripts/ci-quick-check.sh

scaffold-check:
	./scripts/verify-phase0.sh

contract-test:
	cd contracts/rwa-oracle && cargo odra test

contract-build:
	cd contracts/rwa-oracle && DYLD_LIBRARY_PATH="$$(rustc --print sysroot)/lib" cargo odra build -c RwaOracle

deploy-check:
	cd contracts/rwa-oracle && cargo check --features livenet --bin deploy

agent-test:
	cd agent-backend && npm test

agent-build:
	cd agent-backend && npm run build

agent-demo:
	cd agent-backend && npm run agent:mock

agent-json:
	cd agent-backend && npm run agent:json

mcp-check:
	cd agent-backend && npm run mcp:check

oracle-test:
	cd oracle-server && npm test

demo-evidence:
	./scripts/capture-demo-evidence.sh

competition-assets:
	node scripts/generate-competition-assets.mjs

diff-check:
	git diff --check

fill-artifacts-dry-run:
	node scripts/fill-submission-artifacts.mjs --dry-run --repo-url https://github.com/example/casper-rwa-oracle-agent --demo-url https://example.com/demo --contract-package-hash hash-1111111111111111111111111111111111111111111111111111111111111111 --deploy-hash 2222222222222222222222222222222222222222222222222222222222222222

submission-check:
	node scripts/check-submission-ready.mjs

export-package:
	./scripts/export-submission-package.sh
