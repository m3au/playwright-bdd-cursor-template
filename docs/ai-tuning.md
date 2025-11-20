# AI Tuning Documentation <!-- omit from toc -->

This document explains Cursor IDE AI configuration including global hooks, MCP integrations, rule files, and context exclusions that guide and secure AI assistant interactions in the codebase.

![Placeholder](https://placecats.com/neo_2/800/300)

## Table of Contents <!-- omit from toc -->

- [Overview](#overview)
- [Global Cursor Hooks (Manual Installation Required)](#global-cursor-hooks-manual-installation-required)
  - [Installation Steps](#installation-steps)
  - [`block-dangerous-commands.sh`](#block-dangerous-commandssh)
  - [`format-files.sh`](#format-filessh)
- [MCP Integrations](#mcp-integrations)
- [AI Agent Rules Reference](#ai-agent-rules-reference)
  - [Always Applied Rules](#always-applied-rules)
  - [Context-Specific Rules](#context-specific-rules)

---

## Overview

This project uses Cursor IDE rules (`.cursor/rules/*.mdc`) to guide AI assistants in maintaining code quality, following project conventions, and adhering to best practices. These rules ensure consistent code style, proper commit messages, and adherence to project standards.

**Configuration Files**:

- **Rule Files**: Defines standards for AI behavior (project-specific). See [`.cursor/rules/`](../.cursor/rules/)
- **Context Exclusion**: Excludes files from AI context to improve performance. See [`.cursorignore`](../.cursorignore)
- **MCP Servers**: Configures external tool integrations (GitHub, Playwright). See [`.cursor/mcp.json`](../.cursor/mcp.json)
- **Hook Examples**: Example hook scripts (must be copied to `~/.cursor/hooks/` to be active). See [`.cursor/hooks/`](../.cursor/hooks/)
- **Global Hooks Location**: Custom scripts for AI command interception and processing (global Cursor configuration). See `~/.cursor/hooks/`

---

## Global Cursor Hooks (Manual Installation Required)

Custom shell scripts that intercept and process AI assistant commands **globally** across all projects using Cursor IDE.

> **Crucial Installation Note:** Hooks in the project root ([`.cursor/hooks/`](../.cursor/hooks/)) are **example files only** and are **NOT executed** by Cursor IDE. They must be manually copied to your _global_ Cursor configuration directory (`~/.cursor/hooks/` or `%USERPROFILE%\.cursor\hooks\`) to become active.

### Installation Steps

```shell
mkdir -p ~/.cursor/hooks/
cp .cursor/hooks/*.sh ~/.cursor/hooks/
chmod +x ~/.cursor/hooks/*.sh
```

These hooks provide an additional layer of safety by validating and potentially blocking AI-generated commands before they execute.

### Available Hooks

**Configuration:** See [`.cursor/hooks/README.md`](../.cursor/hooks/README.md) for hook configuration. Copy hooks to `~/.cursor/hooks/` and update `~/.cursor/hooks.json` to activate them.

#### [`block-dangerous-commands.sh`](../.cursor/hooks/block-dangerous-commands.sh)

Blocks destructive system commands (file deletion, disk formatting, permission changes) by intercepting and validating AI-generated commands before execution.

**Blocks:** `rm -rf ~/`, `rm -rf /`, `> file`, `mkfs.*`, `dd if=... of=/dev/...`, `chmod -R 777 /`, fork bombs, unsafe pipe execution, etc.

#### [`validate-paths.sh`](../.cursor/hooks/validate-paths.sh)

Validates paths in commands to prefer project-relative paths over absolute. Warns about absolute paths outside project directory, dangerous variable expansions, and special characters that could expand dangerously.

#### [`transform-commands.sh`](../.cursor/hooks/transform-commands.sh)

Suggests built-in Cursor tools instead of terminal commands. Transforms `ls` → `list_dir`, `cat` → `read_file`, `rm -rf` → `delete_file`, `> file` → `write`/`search_replace`.

#### [`format-files.sh`](../.cursor/hooks/format-files.sh)

Formats files before AI operations. Formats markdown files (`.md`, `.mdx`) with markdownlint and prettier, and formats code files (`.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, `.html`, `.yaml`, `.yml`) with prettier.

---

## MCP Integrations

Extends AI assistant capabilities beyond codebase with external tool integrations for browser testing and GitHub operations. Configured in [`.cursor/mcp.json`](../.cursor/mcp.json).

| MCP Name                   | Accessible Via | Capability                                                                                                                                                    |
| :------------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Browser MCP** (Built-in) | `@browser`     | Native **browser automation** (navigation, interaction, screenshot capture). Built into Cursor IDE 2.0+.                                                      |
| **Playwright MCP**         | `@playwright`  | **Playwright-specific test development** (selector finding, test code generation, API interactions). External: [`@ejazullah/mcp-playwright`][playwright-mcp]. |
| **GitHub MCP**             | `@github`      | **GitHub API access** (repo management, issue/PR operations). External: [`@missionsquad/mcp-github`][github-mcp]. Requires `GITHUB_PERSONAL_ACCESS_TOKEN`.    |

[playwright-mcp]: https://github.com/ejazullah/mcp-playwright
[github-mcp]: https://github.com/MissionSquad/mcp-github

---

## AI Agent Rules Reference

These rules guide the AI assistant's behavior based on the file context. Rule files are located in [`.cursor/rules/`](../.cursor/rules/).

### Always Applied Rules

| Rule File                                                   | Responsibility                                                                             |
| :---------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **[`core.mdc`](../.cursor/rules/core.mdc)**                 | Core safety principles, communication style (direct, concise), and reasoning requirements. |
| **[`comments.mdc`](../.cursor/rules/comments.mdc)**         | Comment best practices (explaining WHY, not WHAT) and ESLint disable standards.            |
| **[`dependencies.mdc`](../.cursor/rules/dependencies.mdc)** | Dependency version pinning standards (requires exact `x.y.z` versions).                    |
| **[`commits.mdc`](../.cursor/rules/commits.mdc)**           | Conventional Commits standards for message formatting and semantic versioning.             |

### Context-Specific Rules

| Rule File                                                     | Applies To                     | Focus                                                                                         |
| :------------------------------------------------------------ | :----------------------------- | :-------------------------------------------------------------------------------------------- |
| **[`typescript.mdc`](../.cursor/rules/typescript.mdc)**       | `**/*.ts`, `**/*.tsx`          | Strict TypeScript standards (no `any`, explicit return types, ES modules).                    |
| **[`security.mdc`](../.cursor/rules/security.mdc)**           | `**/*.ts`, `**/*.tsx`          | Security standards and OWASP Top 10 compliance (secrets management, input validation, secure coding). |
| **[`playwright.mdc`](../.cursor/rules/playwright.mdc)**       | `tests/**/*.ts`, `playwright.config.ts` | Best practices: `getByRole()`, avoid redundant waits, prefer `expect()`.                      |
| **[`pom.mdc`](../.cursor/rules/pom.mdc)**                     | `tests/e2e/challenges/*/poms/**/*.ts` | POM structure, decorator usage (`@Fixture`, `@Given`), and internal helper methods (`@Step`). |
| **[`feature.mdc`](../.cursor/rules/feature.mdc)**             | Gherkin feature files          | BDD standards: Given/When/Then structure, user story format, clear steps.                     |
| **[`documentation.mdc`](../.cursor/rules/documentation.mdc)** | Doc files (`md`, `mdx`, `mdc`) | Content quality: direct, factual, accessible, and honest tone.                                |
| **[`markdown.mdc`](../.cursor/rules/markdown.mdc)**           | Markdown files                 | Formatting syntax: tables, code blocks, links, and horizontal rules.                          |
| **[`rules.mdc`](../.cursor/rules/rules.mdc)**                 | Rule files (`*.mdc`)           | Standards for writing the rule files themselves (single responsibility, token minimization).  |
