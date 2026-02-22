---
description: Automated Angular version migration with planning, execution, blocker resolution, testing, and recommendations
---

# Angular Migration Workflow

This workflow automates Angular version migrations end-to-end. It follows a strict 4-phase lifecycle:
**Plan → Confirm → Execute → Verify → Recommend**

---

## Phase 1: Discovery & Planning

### Step 1.1 — Gather migration context

Read the following from the project:
- `package.json` (current Angular version and all dependency versions)
- `angular.json` (workspace configuration, builders, schematics)
- `tsconfig.json` / `tsconfig.base.json` (TypeScript version and strict flags)
- Any `.eslintrc` / `eslint.config.*` files
- `src/app/app.module.ts` or `app.config.ts` to detect module vs standalone architecture

Also check the migration target version specified by the user. If not specified, ask:
> "What Angular version are you migrating TO? (e.g., 17, 18, 19)"

### Step 1.2 — Research the migration path

For each version jump (e.g., 16 → 17 → 18), read the official Angular Update Guide:
`https://update.angular.io/?l=3&v={FROM}-{TO}`

Also check the Angular CHANGELOG for breaking changes:
`https://github.com/angular/angular/blob/main/CHANGELOG.md`

Key things to identify:
- Required Node.js version range
- TypeScript version requirements
- Removed / deprecated APIs used in the codebase
- New schematic migrations available (`ng update`)
- Third-party library compatibility (Angular Material, NgRx, RxJS, etc.)

### Step 1.3 — Audit the codebase for known risks

Run these commands and record the output:
```bash
npx ng version
```
```bash
# Find deprecated API usages
grep -rn "ComponentFactoryResolver\|Renderer\b\|ModuleWithProviders\|APP_INITIALIZER\|HttpClientModule\|BrowserAnimationsModule" src/ --include="*.ts"
```
```bash
# Count standalone vs module-based components
grep -rn "standalone: true" src/ --include="*.ts" | wc -l
grep -rn "NgModule" src/ --include="*.ts" | wc -l
```

### Step 1.4 — Create the Migration Plan artifact

Write a detailed plan to `implementation_plan.md` covering:

**Sections required:**
1. **Current State** — versions table (Angular, Node, TypeScript, RxJS, Material, etc.)
2. **Target State** — new versions for each package
3. **Breaking Changes** — list every breaking change relevant to THIS codebase
4. **Migration Steps** — ordered list of exact commands and file changes
5. **Risk Assessment** — High / Medium / Low risk items with mitigation strategies
6. **Estimated Effort** — rough time estimate per step
7. **Rollback Plan** — how to revert if something goes catastrophically wrong

### Step 1.5 — Request user review

Call `notify_user` with:
- Path to the `implementation_plan.md`
- A summary of the key risks identified
- BlockedOnUser: **true**

> ⚠️ Do NOT proceed to Phase 2 until the user explicitly approves the plan.

---

## Phase 2: Pre-execution Setup

### Step 2.1 — Create a checkpoint

Before making ANY changes, create a git commit or stash if git is available:
```bash
git status
```
If there are uncommitted changes, stash them:
```bash
git stash push -m "pre-migration-stash-$(date +%Y%m%d_%H%M%S)"
```
If git is not initialized, skip this step and note it in the task log.

### Step 2.2 — Check Node.js compatibility

```bash
node --version
```
If the Node.js version does not meet the target Angular version's requirement, notify the user immediately and pause. Do NOT proceed with an incompatible Node.js version.

---

## Phase 3: Execution

Execute migration steps in the exact order specified in the approved plan. For each step:

1. Mark the step as `[/]` in `task.md`
2. Run the step
3. If it succeeds → mark as `[x]`
4. If it fails → follow the **Blocker Resolution Protocol** below

### Core Migration Commands (ordered)

#### Step 3.1 — Update Angular core packages
```bash
npx ng update @angular/core@{TARGET} @angular/cli@{TARGET} --allow-dirty --force
```

#### Step 3.2 — Update Angular Material (if used)
```bash
npx ng update @angular/material@{TARGET} --allow-dirty --force
```

#### Step 3.3 — Update Angular CDK (if used)
```bash
npx ng update @angular/cdk@{TARGET} --allow-dirty --force
```

#### Step 3.4 — Update RxJS (if needed)
```bash
npm install rxjs@{TARGET_VERSION}
```

#### Step 3.5 — Update TypeScript (if needed)
```bash
npm install typescript@{TARGET_VERSION} --save-dev
```

#### Step 3.6 — Update third-party Angular-related packages
For each identified third-party package, run:
```bash
npm install {PACKAGE}@latest
```

#### Step 3.7 — Run automatic schematics
```bash
npx ng generate @angular/core:standalone  # if migrating from modules to standalone
npx ng generate @angular/material:mdc-migration  # if Material MDC migration needed
```

#### Step 3.8 — Fix TypeScript configuration
Update `tsconfig.json` to match target version requirements (strict flags, `target`, `lib`, etc.)

---

## Blocker Resolution Protocol

When a step FAILS, follow this decision tree:

### Level 1 — Auto-resolve (try automatically)
- **Peer dependency conflicts** → retry with `--legacy-peer-deps` or `--force`
- **TypeScript type errors** → fix imports, update API calls per migration guide
- **Deprecated API errors** → replace with new equivalents per Angular docs
- **Missing module errors** → check if module was renamed/moved in new version

### Level 2 — Research and resolve
If Level 1 fails, search for the specific error:
1. Read Angular GitHub issues for the exact error message
2. Read the Angular migration guide for the specific version
3. Apply the documented fix

### Level 3 — Partial completion (escalate to user)
If after Level 1 + Level 2 the blocker CANNOT be resolved:
1. Stop execution at the current step
2. Create a `REMAINING_TASKS.md` file documenting:
   - ✅ Completed steps
   - ❌ The blocker step with the exact error
   - 📋 Remaining steps not yet attempted
   - 💡 Possible manual fixes the user can try
3. Run Phase 4 (Verification) on the partial state anyway
4. Call `notify_user` with BlockedOnUser: **true**, path to `REMAINING_TASKS.md`

---

## Phase 4: Automated Verification Suite

Run ALL of the following checks after migration (or partial migration). Record pass/fail for each.

### Check 1 — TypeScript Type Checking
```bash
npx tsc --noEmit
```
✅ Pass: exit code 0, no errors
❌ Fail: record exact errors, attempt auto-fix if < 10 errors

### Check 2 — Build (development mode)
```bash
npx ng build --configuration=development
```
✅ Pass: "Application bundle generation complete" with 0 errors
❌ Fail: record errors, attempt to fix common ones

### Check 3 — Build (production mode)
```bash
npx ng build --configuration=production
```
✅ Pass: production bundle generated successfully
❌ Fail: record errors (often AOT compilation issues)

### Check 4 — Lint
```bash
npx ng lint
```
If no lint config exists:
```bash
npx eslint "src/**/*.ts" --ext .ts
```
✅ Pass: 0 errors (warnings are acceptable)
❌ Fail: record errors; auto-fix with `--fix` flag if applicable

### Check 5 — Dev Server Runtime Check
```bash
# Start the dev server in background, wait 15s, then check if it's still running
npx ng serve --port 4299 &
sleep 15
# Check the process is still alive (no crash)
```
✅ Pass: server is running and accessible
❌ Fail: server crashed — record startup error

### Check 6 — Bundle Size Check
After a successful production build, check for any unusual bundle size increases:
```bash
ls -lh dist/**/main*.js 2>/dev/null || dir dist /s /b *.js
```
Report the main bundle size in the verification summary.

### Verification Summary

After all checks, create a verification table:

| Check | Status | Notes |
|---|---|---|
| TypeScript types | ✅/❌ | ... |
| Dev build | ✅/❌ | ... |
| Prod build | ✅/❌ | ... |
| Lint | ✅/❌ | ... |
| Dev server | ✅/❌ | ... |
| Bundle size | ℹ️ | X MB |

---

## Phase 5: Recommendations

After verification, generate a `RECOMMENDATIONS.md` file with:

### Format:
```markdown
# Post-Migration Recommendations

## High Priority (Recommended to do soon)
- [ ] [Specific action] — [Why it matters]

## Medium Priority (Do when possible)
- [ ] [Specific action] — [Why it matters]

## Low Priority (Nice to have)
- [ ] [Specific action] — [Why it matters]
```

Common recommendation areas:
- Migrate remaining NgModule-based components to standalone (if partial)
- Enable stricter TypeScript flags now that migration is done
- Update deprecated RxJS operators (`toPromise` → `firstValueFrom`, etc.)
- Remove `CommonModule` from standalone components that don't need it
- Enable Angular's new control flow syntax (`@if`, `@for`, `@switch`)
- Set up `@angular/build` (esbuild) if still on webpack builder
- Add Angular DevTools browser extension for debugging
- Update unit test setup if using Karma → migrate to Jest or Web Test Runner

### Step 5.1 — Present recommendations to user

Call `notify_user` with:
- Path to `RECOMMENDATIONS.md`
- Summary of high-priority items
- BlockedOnUser: **false** (user can choose to act or not)

> The user decides whether to execute recommendations. If they say yes, start a NEW migration workflow run focused only on recommendations.

---

## How to Trigger This Workflow

The user says:
> `/angular-migration` or "run the angular migration workflow"

Then provide:
1. The **target Angular version** (e.g., "migrate to Angular 19")
2. The **project path** (defaults to current workspace)
3. Any **specific concerns** (e.g., "we use NgRx 14", "we have a custom webpack config")

---

## Workflow Files Created During Execution

| File | Purpose |
|---|---|
| `implementation_plan.md` | The migration plan for user review |
| `task.md` | Live checklist updated during execution |
| `REMAINING_TASKS.md` | Created ONLY if blocked; lists what's left |
| `RECOMMENDATIONS.md` | Post-migration optional improvements |
| `walkthrough.md` | Final summary of what was migrated |
