.PHONY: help test lighthouse axe ci publish test-dryrun

# Act configuration
ACT_FLAGS = --secret-file .secrets --container-architecture linux/amd64

# Default target
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "GitHub Actions Workflow Testing with Act"
	@echo "=========================================="
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
	@echo "Act - Local GitHub Actions Testing"
	@echo "  • Requires Docker to be running and act installed"
	@echo "  • Use 'act -l' to list all available workflows"
	@echo "  • Secrets are loaded from .secrets file (gitignored)"
	@echo "  • Platform configured via .actrc file"
	@echo ""
	@echo "Tip: Use 'make <target>' to run a specific workflow locally"
	@echo "     Run 'make help' (or simply: make) to see this help again"
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

