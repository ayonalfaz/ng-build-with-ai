---
description: AI-assisted code review — summarise changes, flag issues, check Angular best practices, and leave actionable feedback
---

# AI Code Review Workflow

This workflow runs an automated code review on staged changes, a specific file, or a pull request diff. It summarises what changed, checks Angular best practices, flags potential bugs, and produces a structured review report.

**Trigger:** `/ai-code-review` in AI chat  
**Required input:** What to review — staged changes / a file path / a PR diff

---

## Step 1 — Gather What to Review

Ask the user which scope to review:

1. **Staged git changes** (most common — review before committing)
2. **A specific file or folder**
3. **A PR diff** — user pastes the diff or provides a branch name

### For staged changes:
```bash
git diff --staged
```

### For unstaged working-tree changes:
```bash
git diff
```

### For a branch comparison:
```bash
git diff main...{BRANCH_NAME}
```

### For a specific file:
Read the file directly using the file path provided.

---

## Step 2 — Understand Context

Before reviewing, read the surrounding code to understand intent:

- Read `README.md` or feature-level docs if present
- For each changed file, read 20–30 lines of context around the changes
- If a service or component was modified, check how it is used in templates or parent components

---

## Step 3 — Run Static Checks

Run these automatically and include results in the report:

```bash
# Type check
npx tsc --noEmit

# Lint
npx ng lint
```

Note: only report errors and warnings that are in the **changed files**, not pre-existing issues in the rest of the codebase.

---

## Step 4 — Review Against Angular Best Practices

Check each changed file against the following, and flag violations explicitly:

### Component checks
- [ ] No logic in the constructor (use `ngOnInit` or `inject()` for setup)
- [ ] `OnPush` change detection used where appropriate
- [ ] No direct DOM manipulation (use Renderer2 or Angular animations instead)
- [ ] No `any` types in component class
- [ ] Subscriptions are cleaned up (`takeUntilDestroyed`, `async` pipe, or `unsubscribe` in `ngOnDestroy`)
- [ ] Template expressions are simple — no complex logic in templates
- [ ] `trackBy` used in `*ngFor` / `@for` loops

### Service checks
- [ ] No UI logic in services (no `Router.navigate` from a data service, no `alert()`)
- [ ] HTTP calls return typed `Observable<T>` — no bare `any`
- [ ] Error handling present (`pipe(catchError(...))`)
- [ ] No memory leaks from subscriptions that are never unsubscribed

### General TypeScript checks
- [ ] No implicit `any` — all variables and function returns are typed
- [ ] No `!` non-null assertions without a comment explaining why it is safe
- [ ] No commented-out code left in
- [ ] No `console.log` / `console.error` statements left in (use a logging service)
- [ ] No hardcoded API URLs or credentials in source files
- [ ] No `toPromise()` usage — use `firstValueFrom()` or `lastValueFrom()` instead

### Modern Angular pattern checks
- [ ] No `*ngIf` / `*ngFor` in templates — use `@if` / `@for` control flow instead
- [ ] No `BehaviorSubject` used as component/service state — prefer `signal()`
- [ ] No `takeUntil` + destroy subject pattern — prefer `takeUntilDestroyed()`
- [ ] No class-based guards — use functional `CanActivateFn`

### Security checks
- [ ] No API keys, tokens, or secrets in any file
- [ ] No use of `bypassSecurityTrust*` without a comment explaining the justification
- [ ] `innerHTML` binding is not used with user-controlled content without sanitisation

---

## Step 5 — Produce the Review Report

Write a structured review to `CODE_REVIEW.md` (in the project root, overwritten each run):

```markdown
# Code Review — {date}

## Summary
{1–3 sentence summary of what changed and the overall quality}

## Files Reviewed
- `path/to/file.ts` — {what changed in one line}

## Static Check Results
| Check | Result |
|---|---|
| TypeScript types | ✅ No errors / ❌ N errors |
| Lint | ✅ No errors / ❌ N errors |

## Issues Found

### 🔴 Must Fix (blocks merge)
- **file.ts line N**: {description of issue and how to fix it}

### 🟡 Should Fix (code quality)
- **file.ts line N**: {description}

### 🟢 Suggestions (optional improvements)
- **file.ts line N**: {description}

## Positive Notes
{Mention specific things done well — good typing, clean separation of concerns, etc.}

## Verdict
✅ Approved / 🟡 Approved with comments / 🔴 Changes requested
```

---

## Step 6 — Present to User

After writing `CODE_REVIEW.md`, summarise in the chat:
- Overall verdict
- Count of must-fix / should-fix / suggestions
- Top 2–3 most important issues to address

---

## Usage Examples

```
/ai-code-review
→ Review my staged changes before I commit
```

```
/ai-code-review
→ Review src/app/services/auth.service.ts
```

```
/ai-code-review
→ Review the diff between main and my feature/user-profile branch
```
