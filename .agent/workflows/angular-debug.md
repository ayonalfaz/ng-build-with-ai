---
description: AI-assisted debugging — systematically diagnose errors, failed builds, failing tests, and unexpected runtime behaviour in Angular applications
---

# Angular Debug Workflow

This workflow takes an error, a failing test, or a description of unexpected behaviour and systematically traces it to its root cause. It reads the relevant source files, checks Angular-specific failure patterns, and produces a concrete fix — not just a guess.

**Trigger:** `/angular-debug` in AI chat
**Required input:** The error message, stack trace, or description of the problem

---

## Step 1 — Capture the Problem

Ask the user to provide:
1. **The error** — paste the full error message and stack trace (console, terminal, or test output)
2. **Where it appears** — browser console / `ng serve` / `ng build` / `ng test` / a specific page or action
3. **When it started** — was it always broken, or did it break after a recent change?
4. **What was tried** — any fixes already attempted

If a stack trace is provided, identify the first line that references a project file (not `node_modules`) — that is the starting point.

---

## Step 2 — Categorise the Error

Classify the error into one of these categories to guide the investigation:

| Category | Symptoms |
|---|---|
| **Dependency Injection** | `NullInjectorError`, `No provider for X`, `NG0201`, `NG0203` |
| **Change Detection** | Stale UI, `ExpressionChangedAfterItHasBeenCheckedError`, `NG0100` |
| **Template / Compilation** | `NG8xxx` errors, property does not exist on type, template parse errors |
| **Routing** | Blank page on navigation, route not matched, guard redirect loop |
| **HTTP / Async** | Observable never completes, request fired multiple times, CORS errors |
| **Build / Bundle** | `Cannot find module`, circular dependency, chunk size warnings |
| **Test** | `TestBed not configured`, spy not called, async not awaited |
| **Runtime / Logic** | Wrong output, null reference errors, unexpected state |

---

## Step 3 — Read the Relevant Files

Starting from the file identified in the stack trace, read:
- The component or service where the error originates
- Its template (if the error is template-related)
- Its parent component (if the error involves `@Input()` / `@Output()`)
- The routing configuration (if the error involves navigation)
- The test file (if the error is in a `.spec.ts`)

For each category, also run targeted searches:

**Dependency Injection errors:**
```bash
grep -rn "provide\|providers\|providedIn" src/app --include="*.ts"
```

**Change Detection errors:**
```bash
grep -rn "ChangeDetectionStrategy.OnPush" src/app --include="*.ts"
```

**Build errors:**
```bash
npx tsc --noEmit
```

**Routing errors:**
```bash
cat src/app/app.routes.ts
```

---

## Step 4 — Apply Angular-Specific Diagnostic Checks

Run through this checklist based on the error category:

### Dependency Injection
- [ ] Is the service decorated with `@Injectable({ providedIn: 'root' })` or added to `providers`?
- [ ] Is `inject()` called outside of an injection context (constructor, field initialiser, or `runInInjectionContext`)?
- [ ] Is a standalone component missing a required import in its `imports` array?
- [ ] Is `HttpClient` used without `provideHttpClient()` in the app config?

### Change Detection
- [ ] Is an `OnPush` component receiving mutated objects instead of new object references?
- [ ] Is `async` / `await` used inside Angular lifecycle hooks without triggering change detection?
- [ ] Is a signal being updated inside `ngAfterViewInit` or `ngAfterViewChecked`?

### Template / Compilation
- [ ] Does the template reference a property that does not exist on the component class?
- [ ] Is a pipe, directive, or component missing from the `imports` array (standalone) or `declarations` (NgModule)?
- [ ] Is a two-way binding `[(ngModel)]` used without importing `FormsModule`?

### Routing
- [ ] Is a lazy-loaded route path correct and does the import resolve?
- [ ] Is a guard returning `false` or redirecting in a loop?
- [ ] Is `RouterOutlet` missing in the component that hosts the outlet?

### HTTP / Async
- [ ] Is the observable subscribed to? (Missing `subscribe()`, `async` pipe, or `toSignal()`)
- [ ] Is `switchMap` used where `mergeMap` is needed (or vice versa)?
- [ ] Are multiple subscriptions created without cleanup, causing multiple requests?

### Tests
- [ ] Is `TestBed.configureTestingModule` missing the component or a required provider?
- [ ] Is an async operation not awaited (`fixture.whenStable()`, `tick()`, `fakeAsync`)?
- [ ] Is a spy set up after the component is created instead of before?

---

## Step 5 — Produce the Fix

State clearly:
1. **Root cause** — one sentence explaining WHY the error occurs
2. **Fix** — the exact code change(s) needed
3. **Explanation** — why this fix resolves the root cause
4. **Verification** — how to confirm the fix worked

Apply the fix directly to the source file(s).

After applying:
```bash
npx tsc --noEmit
npx ng build --configuration=development
```

If the problem was in a test, re-run the test to confirm it passes.

---

## Step 6 — Prevent Recurrence (Optional)

If the root cause reveals a pattern likely to recur, note:
- What lint rule or tsconfig flag would have caught this earlier
- Whether a similar issue exists elsewhere in the codebase (suggest running `ai-code-review.md`)
- Whether the fix should be generalised across similar files

---

## Usage Examples

```
/angular-debug
→ Error: NullInjectorError: No provider for HttpClient!
→ Appears in browser console on app load
→ Started after I moved a service to a feature module
```

```
/angular-debug
→ ExpressionChangedAfterItHasBeenCheckedError on UserCardComponent
→ Only happens after navigating back to the home page
```

```
/angular-debug
→ ng test is failing: "Cannot read properties of undefined (reading 'subscribe')"
→ src/app/services/data.service.spec.ts line 42
```

```
/angular-debug
→ The page is blank when I navigate to /dashboard — no errors in the console
```
