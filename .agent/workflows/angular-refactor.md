---
description: AI-assisted refactoring — modernise existing Angular code to current best practices without changing behaviour
---

# Angular Refactor Workflow

This workflow modernises existing Angular code to current best practices — standalone components, signals, `inject()`, functional guards, typed HTTP, and new control flow syntax — without changing the application's external behaviour. Each file is verified with TypeScript and lint checks before moving on.

**Trigger:** `/angular-refactor` in AI chat
**Required input:** The file, folder, or feature to refactor

---

## Step 1 — Define the Scope

Ask the user:
1. **Scope** — a single file, a feature folder, or the entire `src/app`
2. **Target patterns** — which modernisations to apply (or apply all by default):
   - [ ] NgModule → standalone components
   - [ ] Constructor injection → `inject()` function
   - [ ] `BehaviorSubject` / `Subject` → `signal()` / `computed()`
   - [ ] `.subscribe()` with cleanup → `toSignal()` or `httpResource()`
   - [ ] `takeUntil` + destroy subject → `takeUntilDestroyed()`
   - [ ] Class-based guards / resolvers → functional
   - [ ] `*ngIf` / `*ngFor` / `*ngSwitch` → `@if` / `@for` / `@switch`
   - [ ] `toPromise()` → `firstValueFrom()` / `lastValueFrom()`
   - [ ] Remove `CommonModule` from standalone components that don't need it

---

## Step 2 — Audit the Scope

Scan the target files for outdated patterns before making any changes:

```bash
# NgModule usage
grep -rn "NgModule\|declarations:" src/app --include="*.ts"

# Constructor injection
grep -rn "constructor(" src/app --include="*.ts"

# BehaviorSubject / Subject for state
grep -rn "BehaviorSubject\|new Subject" src/app --include="*.ts"

# takeUntil pattern
grep -rn "takeUntil\|Subject.*destroy\|ngOnDestroy" src/app --include="*.ts"

# Old structural directive syntax
grep -rn "\*ngIf\|\*ngFor\|\*ngSwitch" src/app --include="*.html"

# toPromise
grep -rn "toPromise()" src/app --include="*.ts"

# Class-based guards
grep -rn "implements CanActivate\|implements CanDeactivate\|implements CanMatch" src/app --include="*.ts"

# CommonModule in standalone components
grep -rn "CommonModule" src/app --include="*.ts"
```

Produce a findings table and **present it to the user for confirmation before making any changes**:

| File | Pattern Found | Refactor To |
|---|---|---|
| `auth.guard.ts` | `implements CanActivate` | Functional `CanActivateFn` |
| `user.service.ts` | `BehaviorSubject<User[]>` | `signal<User[]>()` |
| `products.component.html` | `*ngFor` | `@for` with `track` |

> ⚠️ Do NOT make any changes until the user confirms the scope.

---

## Step 3 — Refactor File by File

Process one file at a time. For each file:
1. Read the current file fully
2. Apply the relevant refactors (patterns below)
3. Run `npx tsc --noEmit` — fix any type errors before continuing to the next file
4. Run `npx ng lint {filepath}` — fix lint errors before continuing
5. Move to the next file

---

### Pattern: NgModule → Standalone

Remove the `@NgModule` class. For each component in `declarations`:
- Add `standalone: true` to `@Component`
- Move required imports from the NgModule's `imports` array into the component's own `imports` array
- If the NgModule had routing, convert to a `Routes` array in `{feature}.routes.ts`

---

### Pattern: Constructor Injection → `inject()`

```typescript
// Before
constructor(private userService: UserService, private router: Router) {}

// After
private readonly userService = inject(UserService);
private readonly router = inject(Router);
// Remove the constructor entirely if it only contained injection
```

---

### Pattern: `BehaviorSubject` → `signal()`

```typescript
// Before
private readonly _items$ = new BehaviorSubject<Item[]>([]);
readonly items$ = this._items$.asObservable();
setItems(items: Item[]) { this._items$.next(items); }

// After
readonly items = signal<Item[]>([]);
setItems(items: Item[]) { this.items.set(items); }
```

---

### Pattern: `takeUntil` → `takeUntilDestroyed()`

```typescript
// Before
private readonly destroy$ = new Subject<void>();
ngOnInit() { this.service.data$.pipe(takeUntil(this.destroy$)).subscribe(...); }
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

// After
private readonly destroyRef = inject(DestroyRef);
ngOnInit() { this.service.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...); }
// Remove ngOnDestroy if it only contained destroy subject cleanup
```

---

### Pattern: Class-based Guard → Functional

```typescript
// Before
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(): boolean { return this.auth.isAuthenticated(); }
}

// After
export const authGuard: CanActivateFn = () => inject(AuthService).isAuthenticated();
```

Update `app.routes.ts` to reference the function instead of the class.

---

### Pattern: Structural Directives → Control Flow

```html
<!-- Before -->
<div *ngIf="user; else loading">{{ user.name }}</div>
<ng-template #loading>Loading...</ng-template>

<!-- After -->
@if (user) {
  <div>{{ user.name }}</div>
} @else {
  Loading...
}
```

```html
<!-- Before -->
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>

<!-- After -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

---

### Pattern: `toPromise()` → `firstValueFrom()`

```typescript
// Before
const user = await this.userService.getUser(id).toPromise();

// After
import { firstValueFrom } from 'rxjs';
const user = await firstValueFrom(this.userService.getUser(id));
```

---

### Pattern: Remove `CommonModule` from Standalone Components

For standalone components that use `CommonModule` only for `NgIf`, `NgFor`, or `AsyncPipe`:
- After migrating templates to control flow syntax (`@if`, `@for`), remove `CommonModule`
- If `AsyncPipe` is still needed, import it directly: `imports: [AsyncPipe]`

---

## Step 4 — Final Verification

After all files in the scope are processed:

```bash
npx tsc --noEmit
npx ng build --configuration=development
npx ng lint
```

Report pass / fail for each check.

---

## Step 5 — Present the Refactor Summary

Write `REFACTOR_SUMMARY.md` with:
- Files changed and what was changed in each
- Patterns applied (counts: e.g. "12 structural directives → control flow")
- TypeScript / lint / build results
- Any files skipped and why (e.g. "skipped — complex shared NgModule, manual review recommended")

---

## Usage Examples

```
/angular-refactor
→ src/app/auth/
→ Apply all modernisations
```

```
/angular-refactor
→ src/app/services/user.service.ts
→ Only: BehaviorSubject → signal, takeUntil → takeUntilDestroyed
```

```
/angular-refactor
→ src/app/
→ Only: *ngIf/*ngFor → @if/@for across all templates
```

```
/angular-refactor
→ src/app/
→ Only: constructor injection → inject() across all components and services
```
