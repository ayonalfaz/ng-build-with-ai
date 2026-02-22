# Angular POC & Migration Workflow

## What's in This Repository

This workspace contains two things: a sample Angular 17 application built for proof-of-concept, and an AI-driven workflow for automating Angular version migrations.

---

## 1. Todo App (Angular 17 POC)

**Location:** `todo-app/`

A fully functional todo application built with Angular 17 to demonstrate standalone component architecture.

**Features:**
- Add, edit (double-click), toggle, and delete todos
- Filter by All / Active / Completed
- Stats bar and animated progress bar
- localStorage persistence across page reloads
- Dark glassmorphism UI with Inter font

**Run it:**
```bash
cd todo-app
npm install
npm start
```
Then open `http://localhost:4200`

**Key Angular 17 concepts demonstrated:**
- Standalone components (`standalone: true` — no AppModule)
- `app.config.ts` bootstrap
- Component-level imports

---

## 2. AI-Assisted Angular Migration Workflow

**Location:** `.agent/workflows/angular-migration.md`

A reusable AI workflow that automates Angular version upgrades end-to-end. Trigger it by typing `/angular-migration` in the AI chat, specifying the target version and project path.

### Process Overview

| Step | Who acts | What happens |
|---|---|---|
| **1. Plan** | AI | Reads codebase, researches the upgrade path, produces a written migration plan |
| **Gate 1** | You | Review and approve the plan before anything changes |
| **2. Pre-flight** | AI | Creates a git backup snapshot, verifies server compatibility |
| **3. Execute** | AI | Runs the upgrade commands in order; resolves blockers automatically (3-level protocol) |
| **4. Verify** | AI | Runs 6 automated checks; applies error-threshold policy (auto-fix if <10 errors, escalate if >50) |
| **5. Recommend** | AI | Delivers a prioritised optional improvement list |
| **Gate 2** | You | Decide whether to act on any recommendations |

### Blocker Resolution (Phase 3)
If a step fails, the AI tries to fix it at three levels before escalating:
1. Common automatic fixes (retry flags, deprecated API replacements)
2. Research official docs and apply the documented solution
3. Stop, write `REMAINING_TASKS.md`, hand off to you

### Verification Checks (Phase 4)
TypeScript type check · Dev build · Production build · Lint · Dev server startup · Bundle size

**Error threshold policy:** auto-fix if <10 errors · partial fix if 10–50 · stop and escalate if >50

### Files the Workflow Produces

| File | Purpose |
|---|---|
| `implementation_plan.md` | Migration plan — delivered at Gate 1 |
| `task.md` | Live progress checklist |
| `REMAINING_TASKS.md` | Only created if AI is blocked |
| `RECOMMENDATIONS.md` | Post-migration optional improvements |
| `walkthrough.md` | Final completion summary |

---

## 3. Reference Documents

| File | Audience | Description |
|---|---|---|
| `migration-overview.pdf` | Developers | Full technical reference: all phases, exact commands, blocker protocol, verification table |
| `migration-overview-business.pdf` | Business stakeholders | Same content rewritten in plain English — no technical terms |

---

## Directory Structure

```
angular/
├── todo-app/                          # Angular 17 POC application
│   └── src/app/
│       ├── models/todo.model.ts
│       ├── services/todo.service.ts
│       └── components/
│           ├── add-todo/
│           └── todo-item/
├── .agent/
│   └── workflows/
│       └── angular-migration.md       # AI migration workflow definition
├── migration-overview.html            # Source for technical PDF
├── migration-overview.pdf             # Technical reference (developers)
├── migration-overview-business.html   # Source for business PDF
├── migration-overview-business.pdf    # Plain-English reference (stakeholders)
└── README.md                          # This file
```
