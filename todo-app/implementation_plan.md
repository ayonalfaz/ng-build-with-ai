# Angular Migration Plan: v18 → v19

Generated: 2026-02-22

---

## 1. Current State

| Package | Current Version |
|---|---|
| @angular/core | 18.2.14 |
| @angular/cli | 18.2.21 |
| @angular-devkit/build-angular | 18.2.21 |
| TypeScript | 5.4.5 |
| RxJS | 7.8.2 |
| Zone.js | 0.14.10 |
| Node.js | 22.13.1 |

**Architecture:** Fully standalone (3 standalone components, 0 NgModules — no `app.module.ts`)
**Builder:** `@angular-devkit/build-angular:application` (esbuild, already modern)
**No:** Angular Material, CDK, NgRx, ESLint config (project-level)

---

## 2. Target State

| Package | Target Version |
|---|---|
| @angular/core | ^19.x (latest) |
| @angular/cli | ^19.x (latest) |
| @angular-devkit/build-angular | ^19.x (latest) |
| TypeScript | >=5.5.0 <5.9.0 (auto-selected by `ng update`) |
| RxJS | 7.8.2 ✅ (no change — already compatible) |
| Zone.js | ~0.15.x (auto-updated) |
| Node.js | 22.13.1 ✅ (no change — officially supported by Angular 19) |

---

## 3. Breaking Changes Relevant to This Codebase

| # | Breaking Change | Impact | Affected Files |
|---|---|---|---|
| 1 | TypeScript minimum version raised to **5.5.0** (current: 5.4.5) | **MUST UPDATE** — current version is below minimum | `package.json`, `tsconfig.json` |
| 2 | `standalone: true` is now the default for new components | **None** — all 3 components already declare `standalone: true` explicitly | No change needed |
| 3 | `moduleResolution: "node"` deprecated | **Low** — schematics auto-migrate to `"bundler"` | `tsconfig.json` (auto-fixed) |

**Audit result (grep confirmed):** No deprecated API usages found (`ComponentFactoryResolver`, `Renderer`, `HttpClientModule`, etc.). Zero manual code fixes required.

---

## 4. Migration Steps (Ordered)

### Step 4.1 — Git checkpoint
```bash
git stash push -m "pre-migration-stash-$(date +%Y%m%d_%H%M%S)"
```
*(Skip if no uncommitted changes to track)*

### Step 4.2 — Verify Node.js version
```bash
node --version
# Expected: v22.13.1 — officially supported by Angular 19 ✅
```

### Step 4.3 — Run `ng update` (primary migration)
```bash
cd todo-app
npx ng update @angular/core@19 @angular/cli@19 --allow-dirty --force
```
This command will automatically:
- Upgrade all `@angular/*` packages to v19
- Upgrade `@angular-devkit/*` and `@angular/cli` to v19
- Update TypeScript to a v19-compatible version (>=5.5.0)
- Update Zone.js as needed
- Apply schematics: tsconfig `moduleResolution` fix, standalone default metadata

### Step 4.4 — Verify TypeScript version
```bash
npx tsc --version
# Must be >=5.5.0 and <5.9.0
```

### Step 4.5 — Run TypeScript type check
```bash
npx tsc --noEmit
```

### Step 4.6 — Run development build
```bash
npx ng build --configuration=development
```

### Step 4.7 — Run production build
```bash
npx ng build --configuration=production
```

---

## 5. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| TypeScript upgrade (5.4 → 5.7+) may surface new type errors | Medium | Strict mode already enabled; expect 0 issues in this clean codebase |
| `ng update --force` flag | Low | Safe for a single-version hop; needed for peer dep overrides |
| `moduleResolution` auto-change to `"bundler"` | Low | Auto-applied by schematics; may rarely affect path resolution |
| `CommonModule` in standalone components | Low | Still works in Angular 19; no action required now (post-migration recommendation) |

**Overall risk: LOW** — single-version hop (18→19), fully standalone codebase, no third-party Angular libraries, no deprecated APIs.

---

## 6. Estimated Effort

| Step | Estimate |
|---|---|
| Git checkpoint | <1 min |
| `ng update` command (download + schematics) | 2–5 min |
| TypeScript error fixes (if any) | 0–15 min |
| Build verification | 2–3 min |
| **Total** | **~5–25 min** |

---

## 7. Rollback Plan

If migration fails catastrophically:

```bash
# Option A: Restore git stash (if created in Step 4.1)
git stash pop

# Option B: Hard reset to pre-migration commit
git reset --hard d8825d2
npm install

# Option C: Restore node_modules from scratch
rm -rf node_modules package-lock.json
git checkout package.json
npm install
```
