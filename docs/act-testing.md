# Act Configuration for Local GitHub Actions Testing

This guide explains how to test GitHub Actions workflows locally using [act](https://github.com/nektos/act) before pushing changes to GitHub. Act runs workflows in Docker containers, simulating the GitHub Actions environment on your local machine.

![Placeholder](https://placecats.com/400/200)

## Prerequisites

- **Docker** installed and running (`docker ps` should work)
- **Act** installed (tested with **0.2.82+**)
  - _macOS/Linux (Homebrew):_ `brew install act`
  - _Other:_ Follow the official [act installation guide](https://github.com/nektos/act#installation)
- **GNU Make** (required to use the convenience targets in the `Makefile`)

**Note:** If Docker isn't running, ensure your Docker daemon is started (`docker ps` should work).

## Usage

All local tests are run via `make` targets defined in the root `Makefile`.

### Helper Commands

```shell
# Show all available 'make' targets
make help

# List all available workflows that 'act' can detect
act -l

# Dry run: Show what steps would execute without running the workflow
make test-dryrun
```

### Run Workflows

```shell
# Test the primary E2E tests workflow (test.yml)
make test

# Run the performance audit (lighthouse.yml)
make lighthouse

# Run the accessibility audit (axe.yml)
make axe

# Test the main CI pipeline (for 'push' events)
make ci
```

## ⚙️ Local Configuration

### Environment Variables

Workflows use environment variables from `.env.production` (committed to repo). To run these locally, **you must ensure the required variables are defined** in your local [`.env`](../.env) file. `act` is configured to automatically read environment variables from this file via the `ACT_FLAGS` variable in the `Makefile`.

- **Mandatory Variables:** Ensure all `BASE_URL_<CHALLENGE>` variables are defined in `.env` (e.g., `BASE_URL_UITESTINGPLAYGROUND`, `BASE_URL_AUTOMATIONEXERCISE`)
- **Note:** `BASE_URL` for audit tests comes from `.env.production` (committed to repo)

### Platform Compatibility

The `.actrc` file centralizes platform settings for consistent execution:

- **Docker Image:** Specifies a specific image (`catthehacker/ubuntu:act-latest`) for better stability and feature support
- **Apple Silicon (M1/M2/M3) Support:** The `--container-architecture linux/amd64` flag is added to `ACT_FLAGS` in the `Makefile` to ensure proper execution on Apple Silicon machines

## Limitations

- **Reusable Workflows Not Fully Supported:** The main `ci.yml` workflow orchestrates other workflows using `workflow_call`. Since `act` does not fully support these reusable workflows, you should test the target workflows (e.g., `test.yml`, `lighthouse.yml`) **individually** using the respective `make` targets
- Use individual workflow files directly for testing rather than the main CI workflow

## Troubleshooting

- **Docker Not Running:** All `act` commands will fail if Docker is not active
  - **Fix:** Start your Docker daemon (e.g., open Docker Desktop, run `colima start`, etc.)
- **Platform Image Fails:** If the configured image is problematic, you can override it directly
  - **Fix:** Try running `act -P ubuntu-latest=ubuntu:latest` or update the image in `.actrc`
