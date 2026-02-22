# Angular POC & AI Tooling

## What's in This Repository

This workspace contains three things:
1. A sample **Angular 17 Todo app** (proof of concept)
2. **AI-powered server features** via Genkit + Gemini (Angular SSR + Express)
3. A set of **AI agent workflows** for automating everyday Angular dev tasks

---

## 1. Todo App (Angular 17 POC)

**Location:** `todo-app/`

A fully functional todo application built with Angular 17 to demonstrate standalone component architecture and Angular SSR.

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

**Run it (SSR mode — needed for AI features):**
```bash
cd todo-app
npm run build
npm run serve:ssr:todo-app
```
Then open `http://localhost:4000`

**Key Angular 17 concepts demonstrated:**
- Standalone components (no AppModule)
- `app.config.ts` bootstrap with `provideHttpClient`
- Angular SSR with Express (`src/server.ts`)

---

## 2. Genkit AI Integration

**Location:** `todo-app/src/ai.flows.ts` · `todo-app/src/server.ts` · `todo-app/src/app/services/ai.service.ts`

Two AI-powered features built with [Genkit](https://genkit.dev) and Gemini 1.5 Flash, exposed as server API endpoints via Angular SSR + Express.

### Setup

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey), then set the environment variable before starting the SSR server:

```bash
# Windows (PowerShell)
$env:GEMINI_API_KEY = "your-key-here"
npm run serve:ssr:todo-app
```

```bash
# macOS / Linux
GEMINI_API_KEY=your-key-here npm run serve:ssr:todo-app
```

> **No key?** The app still runs normally — AI endpoints return a friendly 503 error and the Angular client degrades gracefully (empty results, no crash).

### AI Endpoints

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/ai/suggest` | POST | `{ "title": "Plan team offsite" }` | `{ "subtasks": ["Book venue", "Send invites", ...] }` |
| `/api/ai/prioritise` | POST | `{ "todos": ["Buy milk", "Fix prod bug", ...] }` | `{ "prioritised": [{ "title": "...", "priority": "high", "reason": "..." }] }` |

### How it works

```
Angular Component
      │ calls AiService (HttpClient)
      ▼
POST /api/ai/suggest   ←── Express route in server.ts
      │
      ▼
Genkit flow (ai.flows.ts)
      │ calls Gemini 1.5 Flash
      ▼
Returns structured JSON
```

---

## 3. AI Agent Workflows

**Location:** `.agent/workflows/`

Trigger any workflow by typing its slash command in the AI chat.

### `/angular-migration` — Automated version upgrades

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

### `/angular-generate` — Pattern-aware code scaffolding

Generates components, services, guards, pipes, and more by reading your existing code conventions first — instead of producing generic `ng generate` output.

```
/angular-generate
→ type: service
→ name: notification
→ purpose: show toast messages globally with success/error/info variants
```

The AI reads 2–3 existing examples of the same type to infer:
- Standalone vs NgModule
- `inject()` vs constructor injection
- Signal vs Observable patterns
- `OnPush` change detection usage
- Subscription cleanup approach

---

### `/ai-code-review` — Automated code review

Reviews staged changes, a specific file, or a branch diff against Angular best practices.

```
/ai-code-review
→ Review my staged changes before I commit
```

**Checks:**
- TypeScript types (`tsc --noEmit`)
- Lint (`ng lint`)
- Component: `OnPush`, subscription cleanup, `trackBy`, no DOM manipulation
- Service: typed HTTP calls, error handling, no UI logic in services
- Security: no API keys in source, no unsafe `bypassSecurityTrust*` usage

**Output:** `CODE_REVIEW.md` with Must Fix / Should Fix / Suggestions sections and an overall verdict.

---

## Reference Documents

| File | Audience | Description |
|---|---|---|
| `migration-overview.pdf` | Developers | Full technical reference: phases, commands, blocker protocol, verification table |
| `migration-overview-business.pdf` | Stakeholders | Same content in plain English — no technical terms |

---

## Directory Structure

```
angular/
├── todo-app/                          # Angular 17 POC + Genkit AI
│   └── src/
│       ├── ai.flows.ts                # Genkit flows (suggestSubtasks, prioritiseTodos)
│       ├── server.ts                  # Express SSR server + /api/ai/* endpoints
│       └── app/
│           ├── models/todo.model.ts
│           ├── services/
│           │   ├── todo.service.ts
│           │   └── ai.service.ts      # Angular client for AI endpoints
│           └── components/
│               ├── add-todo/
│               └── todo-item/
├── .agent/
│   └── workflows/
│       ├── angular-migration.md       # /angular-migration — automated upgrades
│       ├── angular-generate.md        # /angular-generate — pattern-aware scaffolding
│       └── ai-code-review.md          # /ai-code-review — automated code review
├── migration-overview.pdf             # Technical migration reference
├── migration-overview-business.pdf    # Business-audience migration reference
└── README.md                          # This file
```
