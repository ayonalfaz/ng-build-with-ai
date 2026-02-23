# Angular POC & AI Tooling

## What's in This Repository

This workspace contains three things:
1. A sample **Angular 17 Todo app** (proof of concept)
2. A set of **AI agent workflows** for automating everyday Angular dev tasks
3. **Reference PDFs** for technical and non-technical audiences

---

## 1. Todo App (Angular 17 POC)

**Location:** `todo-app/`

A fully functional todo application built with Angular 17 demonstrating standalone component architecture and Angular SSR.

**Features:**
- Add, edit (double-click), toggle, and delete todos
- Filter by All / Active / Completed
- Stats bar and animated progress bar
- localStorage persistence across page reloads
- Dark glassmorphism UI with Inter font
- Angular SSR (server-side rendering via Express)

**Run it (dev mode):**
```bash
cd todo-app
npm install
npm start
```
Then open `http://localhost:4200`

**Run it (SSR mode):**
```bash
cd todo-app
npm run build
npm run serve:ssr:todo-app
```
Then open `http://localhost:4000`

**Key Angular 17 concepts demonstrated:**
- Standalone components (no AppModule)
- `app.config.ts` bootstrap
- Angular SSR with Express (`src/server.ts`)

---

## 2. AI Agent Workflows

**Location:** `.agent/workflows/`

Trigger any workflow by typing its slash command in any AI chat (Claude, Copilot, Cursor, Gemini, etc.). Each workflow is a self-contained instruction file — copy the `.agent/workflows/` folder into any Angular project and all workflows work without modification.

See [`.agent/workflows/README.md`](.agent/workflows/README.md) for the full index and a workflow decision map.

---

### Development workflows

#### `/angular-generate` — Pattern-aware code scaffolding

Generates components, services, guards, pipes, and more by reading your existing code conventions first — instead of producing generic `ng generate` output.

```
/angular-generate
→ type: service
→ name: notification
→ purpose: show toast messages globally with success/error/info variants
```

The AI reads 2–3 existing examples to infer standalone vs NgModule, `inject()` vs constructor injection, signal vs Observable patterns, `OnPush` usage, and subscription cleanup approach.

---

#### `/angular-feature-plan` — Design before you build

Designs the complete architecture of a new feature before any code is written — component tree, services, models, routing, and state shape — and produces a `FEATURE_PLAN.md` for your review and approval.

```
/angular-feature-plan
→ Feature: User profile page
→ Users can view and edit their name, email, and avatar
→ New route at /profile
```

> No code is generated until you approve the plan.

---

#### `/angular-api-integration` — Typed HTTP layer scaffolding

Scaffolds a complete, typed API integration layer from an OpenAPI spec, Swagger URL, or written endpoint description. Generates models, a typed service, interceptors (if needed), and environment variable wiring.

```
/angular-api-integration
→ Endpoints: GET /users/:id, PUT /users/:id, DELETE /users/:id
→ Feature name: user-management
→ Auth: existing auth interceptor
```

---

#### `/angular-test-generate` — Unit test generation

Reads an existing Angular file and generates a comprehensive `.spec.ts` test file matching the project's testing conventions (Karma/Jasmine, Jest, or Vitest). Tests are run and verified before being presented.

```
/angular-test-generate
→ src/app/services/auth.service.ts
→ include edge cases and error paths
```

---

#### `/angular-docs-generate` — Documentation generation

Generates accurate documentation from existing source code — JSDoc comments, component API tables (inputs/outputs/methods), feature README sections, and Storybook stories.

```
/angular-docs-generate
→ src/app/shared/components/user-avatar/user-avatar.component.ts
→ Output: JSDoc + Markdown API table
```

---

### Quality & Review workflows

#### `/ai-code-review` — Automated code review

Reviews staged changes, a specific file, or a branch diff against Angular best practices.

```
/ai-code-review
→ Review my staged changes before I commit
```

**Checks:**
- TypeScript types (`tsc --noEmit`) and lint (`ng lint`)
- Component: `OnPush`, subscription cleanup, `trackBy`, no DOM manipulation
- Service: typed HTTP calls, error handling, no UI logic in services
- Modern patterns: `@if`/`@for` control flow, signals, `takeUntilDestroyed`, functional guards
- Security: no API keys in source, no unsafe `bypassSecurityTrust*` usage

**Output:** `CODE_REVIEW.md` with Must Fix / Should Fix / Suggestions sections and an overall verdict.

---

#### `/angular-security-audit` — Security scan

Scans for XSS risks, hardcoded secrets, broken route guard coverage, insecure token storage, and dependency vulnerabilities. Produces a prioritised `SECURITY_REPORT.md`.

```
/angular-security-audit
→ Full audit of src/
```

---

### Maintenance & Migration workflows

#### `/angular-refactor` — Modernise existing code

Migrates existing Angular code to current best practices — standalone components, signals, `inject()`, functional guards, `@if`/`@for` control flow syntax — without changing behaviour. Verifies each file with TypeScript and lint before moving on.

```
/angular-refactor
→ src/app/auth/
→ Apply all modernisations
```

---

#### `/angular-migration` — Automated version upgrades

Full end-to-end Angular version migration with a human approval gate before execution.

| Step | Who | What |
|---|---|---|
| 1. Plan | AI | Audits codebase, researches breaking changes, writes migration plan |
| Gate 1 | You | Approve before anything changes |
| 2. Pre-flight | AI | Git backup snapshot + Node.js version check |
| 3. Execute | AI | Runs upgrade commands; 3-level blocker resolution protocol |
| 4. Verify | AI | TypeScript · dev build · prod build · lint · dev server · bundle size |
| 5. Recommend | AI | Optional improvement list |

**Error threshold policy (Phase 4):** auto-fix if <10 errors · partial fix if 10–50 · stop + escalate if >50

---

#### `/angular-debug` — Systematic debugging

Diagnoses errors, failed builds, failing tests, and unexpected runtime behaviour by categorising the error type, reading the relevant files, and working through Angular-specific diagnostic checklists to find the root cause.

```
/angular-debug
→ NullInjectorError: No provider for HttpClient!
→ Appears on app load, started after moving a service to a feature module
```

---

## 3. Reference Documents

| File | Audience | Description |
|---|---|---|
| `migration-overview.pdf` | Developers | Full technical reference: phases, commands, blocker protocol, verification table |
| `migration-overview-business.pdf` | Stakeholders | Angular migration workflow in plain English |
| `workflows-overview-business.pdf` | Stakeholders | All AI developer workflows in plain English |

---

## Directory Structure

```
angular/
├── todo-app/                              # Angular 17 POC + SSR
│   └── src/
│       ├── server.ts                      # Express SSR server
│       └── app/
│           ├── models/todo.model.ts
│           ├── services/todo.service.ts
│           └── components/
│               ├── add-todo/
│               └── todo-item/
├── .agent/
│   └── workflows/
│       ├── README.md                      # Workflow index and decision map
│       ├── angular-generate.md            # /angular-generate — pattern-aware scaffolding
│       ├── angular-feature-plan.md        # /angular-feature-plan — design before you build
│       ├── angular-api-integration.md     # /angular-api-integration — typed HTTP layer
│       ├── angular-test-generate.md       # /angular-test-generate — unit test generation
│       ├── angular-docs-generate.md       # /angular-docs-generate — documentation generation
│       ├── ai-code-review.md              # /ai-code-review — automated code review
│       ├── angular-security-audit.md      # /angular-security-audit — security scan
│       ├── angular-refactor.md            # /angular-refactor — modernise code patterns
│       ├── angular-migration.md           # /angular-migration — automated upgrades
│       └── angular-debug.md              # /angular-debug — systematic debugging
├── .github/
│   └── copilot-instructions.md            # GitHub Copilot project context
├── migration-overview.pdf                 # Technical migration reference (developers)
├── migration-overview-business.pdf        # Migration workflow reference (stakeholders)
├── workflows-overview-business.pdf        # AI workflows reference (stakeholders)
└── README.md                              # This file
```
