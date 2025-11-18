# Changelog

## [1.5.6] - 2025-11-05

### Refactored

- remove cable-guy implementation

- **ci**: rename unit tests to Pre-flight Checks

### Added
- **tests**: add AuditTarget interface to environment configuration
- rename project and improve README

- **audit**: pin external targets and config
- **automationexercise**: automate authentication flows
- add automated coverage badge tooling
- implement challenge-based test architecture

- **ci**: add descriptive annotations for each test workflow
- **ci**: add clickable report links in job summary
- **ci**: add automatic git tagging and release management

### Fixed
- **tests**: add COLOR_SCHEME to browser-project test setup
- **tests**: set required environment variables in unit tests

- **automationexercise**: resolve linting errors in POM pages
- **ci**: add Dependabot check to child workflows
- **ci**: include bun.lock in Dependabot pin-versions commit
- **ci**: fix Dependabot workflow and remove missing label
- **ci**: skip E2E/audit tests on Dependabot PRs
- **ci**: remove remaining concurrency groups from child workflows
- **ci**: remove concurrency from child workflows to prevent deadlock
- **ci**: prevent shard cancellation and stop duplicate runs
- add test documentation
- **ci**: use diff-tree to detect files in post-commit hook

- **changelog**: remove brackets from version headers to fix markdown linting
- **ci**: use HUSKY=0 to prevent post-commit loop

## [1.5.5] - 2025-11-05

### Fixed

- **ci**: add loop-safe post-commit hook for version bumping

## [1.5.4] - 2025-11-05

### Refactored

- **tests**: simplify basket notification check - remove backend wait

## [1.5.3] - 2025-11-05

### Fixed

- **tests**: wait for notification to be attached to DOM before checking visibility

## [1.5.2] - 2025-11-05

### Fixed

- **tests**: verify basket notification immediately before auto-dismiss

## [1.5.1] - 2025-11-05

### Fixed

- **ci**: correct GitHub Pages URL to playwright-bdd-cursor-template

## [1.5.0] - 2025-11-05

### Added

- **ci**: add test reports dashboard link annotation

## [1.4.2] - 2025-11-05

### Fixed

- **lighthouse**: remove unsupported pwa category

## [1.4.1] - 2025-11-05

### Refactored

- **e2e**: update POMs and test configurations

## [1.4.0] - 2025-11-05

### Added

- **scripts**: add lint script and enhance tooling

## [1.3.6] - 2025-11-05

### Refactored

- **tests**: consolidate test utilities

## [1.3.5] - 2025-11-05

### Refactored

- **config**: migrate to ESM format

## [1.3.4] - 2025-11-04

### Fixed

- **ci**: remove version specifier from local reusable workflow calls

## [1.3.3] - 2025-11-04

### Fixed

- **ci**: fix reusable workflow references and artifact access

## [1.3.2] - 2025-11-04

### Fixed

- **ci**: add missing refs to reusable workflow calls

## [1.3.1] - 2025-11-04

### Refactored

- **tests**: update test files and page objects

## [1.3.0] - 2025-11-04

### Added

- **ci**: add unit tests workflow with HTML report

## [1.2.0] - 2025-11-04

### Added

- **tests**: add test utilities for attachments, bug reporting, and step decorators

## [1.1.2] - 2025-11-04

### Fixed

- **tests**: use AJAX response count instead of paginating through pages

## [1.0.3] - 2025-11-03

### Fixed

- add prettierignore for bunfig.toml and fix test linting

## [1.0.2] - 2025-11-03

### Fixed

- remove unused variable and unnecessary eslint-disable

## [1.0.1] - 2025-11-03

### Fixed

- **rules**: correct utility import example in pom.mdc

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
