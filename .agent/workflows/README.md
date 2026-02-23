# AI Workflow Index

AI-assisted workflows for Angular projects. Each workflow is a structured prompt file that any AI assistant (Claude, Copilot, Cursor, Gemini, etc.) can follow when triggered by a slash command in chat.

All workflows are **generic** — copy them into any Angular project and they work without modification.

---

## Available Workflows

### Development

| Workflow | Trigger | Purpose |
|---|---|---|
| [angular-generate.md](./angular-generate.md) | `/angular-generate` | Scaffold components, services, pipes, guards — matching the project's own patterns |
| [angular-feature-plan.md](./angular-feature-plan.md) | `/angular-feature-plan` | Design a feature's architecture (component tree, services, models, routing) before writing any code |
| [angular-api-integration.md](./angular-api-integration.md) | `/angular-api-integration` | Scaffold a typed HTTP layer from an OpenAPI spec or endpoint description |
| [angular-test-generate.md](./angular-test-generate.md) | `/angular-test-generate` | Generate `.spec.ts` unit tests for existing components, services, pipes, and guards |
| [angular-docs-generate.md](./angular-docs-generate.md) | `/angular-docs-generate` | Generate JSDoc, component API tables, feature READMEs, and Storybook stories |

### Quality & Review

| Workflow | Trigger | Purpose |
|---|---|---|
| [ai-code-review.md](./ai-code-review.md) | `/ai-code-review` | Review staged changes, a file, or a PR diff against Angular best practices |
| [angular-security-audit.md](./angular-security-audit.md) | `/angular-security-audit` | Scan for XSS, secrets, broken auth, insecure data binding, and dependency vulnerabilities |

### Maintenance & Migration

| Workflow | Trigger | Purpose |
|---|---|---|
| [angular-refactor.md](./angular-refactor.md) | `/angular-refactor` | Modernise code to current Angular patterns (standalone, signals, inject(), control flow syntax) |
| [angular-migration.md](./angular-migration.md) | `/angular-migration` | Upgrade Angular to a new major version end-to-end (plan → execute → verify) |
| [angular-debug.md](./angular-debug.md) | `/angular-debug` | Diagnose and fix errors, failed builds, failing tests, and unexpected runtime behaviour |

---

## Workflow Map — When to Use What

```
Starting a new feature?
  → /angular-feature-plan   (design first)
  → /angular-generate        (scaffold artefacts from the plan)
  → /angular-api-integration (if the feature calls an API)

Working on existing code?
  → /angular-refactor        (modernise patterns)
  → /ai-code-review          (review before committing)
  → /angular-security-audit  (before a release)

Something is broken?
  → /angular-debug           (diagnose and fix)

Need tests or docs?
  → /angular-test-generate   (generate .spec.ts files)
  → /angular-docs-generate   (generate JSDoc, README, Storybook)

Upgrading Angular version?
  → /angular-migration       (full upgrade workflow)
```

---

## How to Use

1. Open your AI assistant (Claude Code, GitHub Copilot Chat, Cursor, etc.)
2. Type the trigger command (e.g. `/angular-generate`)
3. The AI reads this workflow file and follows the steps
4. Provide the required input when asked

Each workflow file is self-contained and describes exactly what the AI should do, step by step.

---

## Adding to a New Project

Copy the entire `.agent/workflows/` folder into the root of any Angular project. No configuration required.

For AI tools that support custom instructions or system prompts, reference the workflows folder path so the AI knows these files exist.
