---
description: AI-assisted feature planning — design the architecture of a new feature before writing any code, producing a reviewable plan and component tree
---

# Angular Feature Plan Workflow

This workflow designs the complete architecture of a new Angular feature before any code is written. The AI reads your project's existing structure and conventions, then produces a detailed plan — component tree, services, models, routing, and state shape — for your review and approval.

**Trigger:** `/angular-feature-plan` in AI chat
**Required input:** A description of the feature to build

---

## Step 1 — Gather the Feature Brief

Ask the user for:
1. **Feature name** — e.g. `user-profile`, `checkout-flow`, `notification-centre`
2. **Feature description** — what it should do from the user's perspective (1–5 sentences)
3. **Scope** — is this a new page/route, a shared widget, or an enhancement to an existing feature?
4. **Known constraints** — any specific libraries, APIs, or patterns that must be used

If any of these are missing, ask before proceeding.

---

## Step 2 — Read Existing Project Structure

Before designing anything, read the project to understand its conventions:

```bash
# List the feature folders
ls src/app/
```

Read:
- `src/app/app.routes.ts` or the main routing file — to understand routing conventions
- 1–2 existing feature folders — to understand folder structure
- `src/app/app.config.ts` or `app.module.ts` — to understand how providers are registered
- `angular.json` — to detect path aliases, project name, and build configuration

Note:
- Folder structure convention (feature folders, shared folder, core folder)
- Whether the project uses lazy-loaded routes or eager routes
- Whether state is managed via a service, NgRx/NGXS/Akita, or signals
- Naming conventions for files and classes

---

## Step 3 — Design the Feature Architecture

Design the feature using the conventions discovered in Step 2.

Produce the following sections in `FEATURE_PLAN.md`:

### Section 1: Component Tree

A text diagram of all components and their parent-child relationships:

```
FeatureShellComponent (routed entry point)
├── FeatureHeaderComponent
├── FeatureListComponent
│   └── FeatureListItemComponent (×N)
└── FeatureDetailComponent (conditional)
```

For each component, specify:
- **Purpose** — one sentence
- **Inputs / Outputs** — key `@Input()` and `@Output()` bindings
- **Standalone or declared** — matching the project's convention

### Section 2: Services

For each new service:
- **Name and purpose**
- **Methods** — names, parameters, return types
- **HTTP endpoints used** (if any)
- **State it owns** (signals, observables, or plain properties)

### Section 3: Models / Interfaces

List all new TypeScript interfaces needed:

```typescript
interface FeatureItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

### Section 4: Routing

```typescript
{
  path: 'feature-name',
  loadComponent: () => import('./feature/feature-shell.component')
    .then(m => m.FeatureShellComponent),
  children: [...]
}
```

### Section 5: State Shape

Describe how state is managed:
- What data lives in the service vs component
- How components receive data (input bindings, injected service, async pipe, signals)
- What triggers re-renders

### Section 6: File Structure

```
src/app/feature-name/
├── components/
│   ├── feature-list/
│   └── feature-detail/
├── services/
│   └── feature-name.service.ts
├── models/
│   └── feature-name.model.ts
└── feature-name.routes.ts
```

### Section 7: Open Questions

List any decisions that require user input before implementation can begin.

---

## Step 4 — Write and Present the Plan

Write the plan to `FEATURE_PLAN.md` in the project root (overwritten each run).

Present to the user:
- Summary of what will be built
- Count of components, services, and models
- Any open questions from Section 7
- **Ask for explicit approval before any code is generated**

> ⚠️ Do NOT generate any code until the user approves the plan.

---

## Step 5 — Hand Off to Code Generation (Optional)

If the user approves, proceed file by file using the same approach as `angular-generate.md`, creating each artefact listed in the plan in dependency order:
1. Models / interfaces
2. Services
3. Shell / container components
4. Child / presentational components
5. Route configuration

---

## Usage Examples

```
/angular-feature-plan
→ Feature: User profile page
→ Users can view and edit their name, email, and avatar
→ It should be a new route at /profile
```

```
/angular-feature-plan
→ Feature: Global notification centre
→ A slide-out panel showing recent notifications, with read/unread state
→ Triggered from a bell icon in the header
```

```
/angular-feature-plan
→ Feature: Search with filters
→ Full-text search over products with category, price range, and in-stock filters
→ Results update as filters change (no submit button)
→ Constraint: must use the existing ProductService
```
