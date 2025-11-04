.PHONY: help test lighthouse axe ci publish test-dryrun

# Act configuration
ACT_FLAGS = --secret-file .env --container-architecture linux/amd64

# Default target
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "GitHub Actions Workflow Testing with Act"
	@echo "=========================================="
	@echo ""
	@echo "Purpose:"
	@echo "  This Makefile provides convenient targets for testing CI/CD workflows"
	@echo "  defined in .github/workflows/ locally using act."
	@echo ""
	@echo "  Use these targets to validate workflow changes before pushing to GitHub,"
	@echo "  debug workflow issues locally, and ensure workflows work correctly in"
	@echo "  your environment before committing changes."
	@echo ""
	@echo "Available targets:"
	@echo ""
	@echo "  make test         - Test E2E tests workflow locally"
	@echo "  make lighthouse   - Test Lighthouse audit workflow locally"
	@echo "  make axe          - Test Axe audit workflow locally"
	@echo "  make ci           - Test main CI workflow locally (push event)"
	@echo "  make publish      - Test publish reports workflow locally"
	@echo "  make test-dryrun  - Dry run E2E tests workflow (list what would run)"
	@echo ""
	@echo "Requirements:"
	@echo "  • Docker must be running (act uses Docker containers to simulate GitHub Actions)"
	@echo "  • act must be installed (brew install act or see https://github.com/nektos/act)"
	@echo "  • .env file with BASE_URL configured (copy .env.example to .env)"
	@echo "  • .actrc file for platform configuration"
	@echo ""
	@echo "Tip: Use 'make <target>' to run a specific workflow locally"
	@echo "     Run 'make help' (or simply: make) to see this help again"
	@echo "     Use 'act -l' to list all available workflows"
	@echo ""
	@echo "Note: To run tests or the project itself, refer to package.json scripts"
	@echo "      or run 'bun run' for a list of available commands"
	@echo ""
	@echo "For more information, see docs/act-testing.md"
	@echo ""

test:
	@act -W .github/workflows/test.yml $(ACT_FLAGS) -v

lighthouse:
	@act -W .github/workflows/lighthouse.yml $(ACT_FLAGS)

axe:
	@act -W .github/workflows/axe.yml $(ACT_FLAGS)

ci:
	@act push $(ACT_FLAGS)

publish:
	@act -W .github/workflows/publish.yml $(ACT_FLAGS)

test-dryrun:
	@act -W .github/workflows/test.yml $(ACT_FLAGS) --dryrun

