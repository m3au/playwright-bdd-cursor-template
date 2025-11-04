# Act Configuration for Local GitHub Actions Testing

This guide explains how to test GitHub Actions workflows locally using [act](https://github.com/nektos/act) before pushing changes to GitHub. Act runs workflows in Docker containers, simulating the GitHub Actions environment on your local machine.

![Placeholder](https://placecats.com/neo/400/200)

## Prerequisites

- Docker installed and running (`docker ps` should work)
- `act` installed (`brew install act` or see [act repository](https://github.com/nektos/act))

**Note:** If Docker isn't running, start it first:

- Docker Desktop: Open Docker Desktop app
- Colima: `colima start`
- Other: Start your Docker daemon according to your setup

## Usage

```bash
# Show available commands (or just run 'make')
make help
# or simply:
make

# List all available workflows (use act directly)
act -l

# Test individual workflows
make test          # Test E2E tests workflow
make lighthouse     # Test Lighthouse audit workflow
make axe           # Test Axe audit workflow
make publish       # Test publish reports workflow

# Test main CI workflow (push event)
make ci

# Dry run (list what would run without executing)
make test-dryrun
```

## Secrets

Workflows use `BASE_URL` from GitHub Actions secrets (`${{ secrets.BASE_URL }}`). For local testing with act, ensure your `.env` file contains `BASE_URL`.

## Limitations

- Reusable workflows (`workflow_call`) are not fully supported by act
- Use individual workflow files directly for testing
- The main `ci.yml` workflow uses reusable workflows, so test individual workflows separately

## Platform Configuration

The `.actrc` file specifies the platform image (`catthehacker/ubuntu:act-latest`) for better compatibility.

Common act flags (`--secret-file .env --container-architecture linux/amd64`) are centralized in the `ACT_FLAGS` Makefile variable, ensuring consistent configuration across all targets. The `--container-architecture linux/amd64` flag provides Apple Silicon Mac compatibility.

## Troubleshooting

- **Docker not running**:

  - Check with `docker ps`
  - See Prerequisites section for Docker startup instructions

- **Platform image fails**:
  - Try `act -P ubuntu-latest=ubuntu:latest`
  - The `.actrc` file already configures `catthehacker/ubuntu:act-latest`
