# Changelog

## [✨ Feature detected: 1.14.2 -> 1.15.0
1.15.0] - 2025-11-20
### Added
- **ci**: add new report template files
## [1.14.2] - 2025-11-19

### Fixed

- **ci**: add missing env setup in preflight workflow

## [1.14.1] - 2025-11-18

### Fixed

- **tests**: add COLOR_SCHEME to browser-project test setup

## [1.14.0] - 2025-11-18

### Added

- **tests**: add AuditTarget interface to environment configuration

## [1.13.1] - 2025-11-18

### Fixed

- **tests**: set required environment variables in unit tests

## [1.13.0] - 2025-11-18

### Added

- rename project and improve README

## [1.12.1] - 2025-11-13

### Fixed

- **automationexercise**: resolve linting errors in POM pages

### Documentation

- capture automationexercise progress and commands

## [1.12.0] - 2025-11-13

### Added

- **audit**: pin external targets and config

## [1.11.0] - 2025-11-13

### Added

- **automationexercise**: automate authentication flows

### Chore

- update config and tooling for new architecture

## [1.10.0] - 2025-11-12

### Added

- add automated coverage badge tooling

### Documentation

- update for challenge-based architecture

## [1.9.0] - 2025-11-12

### Added

- implement challenge-based test architecture

## [1.8.11] - 2025-11-12

### Refactored

- remove cable-guy implementation

## [1.8.10] - 2025-11-05

### Fixed

- **ci**: add Dependabot check to child workflows

## [1.8.9] - 2025-11-05

### Fixed

- **ci**: include bun.lock in Dependabot pin-versions commit

## [1.8.8] - 2025-11-05

### Fixed

- **ci**: fix Dependabot workflow and remove missing label

## [1.8.7] - 2025-11-05

### Fixed

- **ci**: skip E2E/audit tests on Dependabot PRs

## [1.5.6] - 2025-11-05

### Refactored

- **ci**: rename unit tests to Pre-flight Checks

### Added

- **ci**: add descriptive annotations for each test workflow
- **ci**: add clickable report links in job summary
- **ci**: add automatic git tagging and release management

### Fixed

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
