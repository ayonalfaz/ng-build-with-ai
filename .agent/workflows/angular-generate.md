---
description: AI-assisted Angular code generation — scaffold components, services, modules, and pipes that follow the project's existing patterns
---

# Angular Generate Workflow

This workflow lets you scaffold Angular building blocks using AI. Instead of running a generic `ng generate` and then hand-editing to match your project's conventions, the AI reads your existing code first and generates output that already follows your patterns.

**Trigger:** `/angular-generate` in AI chat  
**Required input:** What you want to generate (type + name + purpose)

---

## Step 1 — Understand the Request

Ask the user for:
1. **Type** — component / service / pipe / directive / guard / resolver / interface / module
2. **Name** — the name of the artefact (e.g. `user-profile`, `auth`)
3. **Purpose** — one sentence describing what it should do
4. **Location** — which feature folder it belongs to (or ask AI to decide based on existing structure)

If any of these are missing, ask before proceeding.

---

## Step 2 — Read Existing Patterns

Before generating any code, read the following to understand the project's conventions:

### Architecture detection
```bash
# Check if standalone or NgModule
grep -rn "standalone: true" src/app --include="*.ts" | wc -l
grep -rn "NgModule" src/app --include="*.ts" | wc -l
```

### Read 2–3 existing examples of the same type
- For a **component** → read 2 existing components in the same feature area
- For a **service** → read 2 existing services
- For a **guard / resolver** → read existing examples

Note the following conventions from what you read:
- Naming conventions (kebab-case files, PascalCase classes)
- Import style (standalone imports array vs NgModule declarations)
- Whether `OnPush` change detection is used
- Whether `inject()` function or constructor injection is used
- How observables are handled (async pipe, subscribe, signals, takeUntilDestroyed)
- How the service communicates with APIs (HttpClient pattern, error handling style)
- Whether `DestroyRef` / `takeUntilDestroyed` is used for subscription cleanup

---

## Step 3 — Generate the Files

Generate the artefact following the patterns discovered in Step 2.

### Component generation rules
- Match standalone vs NgModule based on what the project uses
- Use `OnPush` change detection if the existing components use it
- Use `inject()` if the existing components use it; use constructor injection otherwise
- If the project uses signals (`signal()`, `computed()`, `effect()`), use them
- Include a skeleton HTML template relevant to the purpose
- Include a skeleton CSS file (or inline styles if the project uses `styles: []`)
- Do NOT generate a `.spec.ts` test file unless the user asks for it

### Service generation rules
- Use `providedIn: 'root'` unless the user specifies otherwise
- Use `inject(HttpClient)` if the project uses inject(); use constructor otherwise
- Return `Observable<T>` from HTTP methods unless the project uses signals-based state
- Add typed interfaces/models for any data the service handles
- Include a basic error handling pattern matching existing services

### Interface / Model rules
- Place in a `models/` folder within the feature, or a shared `models/` if it's shared
- Export a clean TypeScript interface (no class unless the project uses classes for models)

### Guard rules
- Use the functional guard pattern (`export const myGuard: CanActivateFn = ...`) for Angular 15+
- Fall back to class-based guard only if the project uses class-based guards

---

## Step 4 — Verify the Generated Code

After generating, run:

```bash
npx tsc --noEmit
```

If there are type errors in the newly generated files, fix them before presenting the output.

Also check:
```bash
npx ng lint src/app/path/to/new-file.ts
```

---

## Step 5 — Present Output

Show the user:
1. List of files created (with paths)
2. Key decisions made (e.g. "used standalone, OnPush, inject() — matching existing components")
3. Any follow-up steps needed (e.g. "add this component to a route", "register in the parent module")

---

## Examples of Valid Requests

```
/angular-generate
→ type: service
→ name: notification
→ purpose: show toast messages globally, with success/error/info variants
```

```
/angular-generate
→ type: component
→ name: user-avatar
→ purpose: display a user's profile picture with fallback initials
→ location: shared/components
```

```
/angular-generate
→ type: guard
→ name: auth
→ purpose: redirect unauthenticated users to /login
```
