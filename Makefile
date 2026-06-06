.PHONY: verify scaffold-check contract-test contract-build deploy-check agent-test agent-build agent-demo mcp-check oracle-test diff-check

verify:
	./scripts/final-verify.sh

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

mcp-check:
	cd agent-backend && npm run mcp:check

oracle-test:
	cd oracle-server && npm test

diff-check:
	git diff --check
