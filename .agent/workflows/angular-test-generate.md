---
description: AI-assisted test generation — write unit and integration tests for existing Angular components, services, pipes, guards, and resolvers
---

# Angular Test Generate Workflow

This workflow reads an existing Angular file and generates a comprehensive `.spec.ts` test file that matches the project's testing conventions. Tests are verified to pass before being presented.

**Trigger:** `/angular-test-generate` in AI chat
**Required input:** The file path (or folder) to generate tests for

---

## Step 1 — Identify the Test Target

Ask the user for:
1. **File path** — the `.ts` file to test (e.g. `src/app/services/auth.service.ts`)
2. **Scope** — unit tests only, or include integration tests with `TestBed`
3. **Coverage goal** — happy path only, or edge cases and error paths too

If the target is a folder, list all `.ts` files in it and ask which ones to test.

---

## Step 2 — Detect the Test Framework

```bash
# Check which test runner is configured
cat angular.json | grep -A5 '"test"'
```

Look for:
- **Vitest** → `@analogjs/vitest-angular` or `vitest` in `package.json`
- **Jest** → `jest` in `package.json`, `jest.config.*` present
- **Karma/Jasmine** → `karma.conf.js` or `@types/jasmine` in `package.json`

Read 1–2 existing `.spec.ts` files to confirm the framework and note:
- Import style (`describe`/`it` vs `test`)
- `TestBed.configureTestingModule` setup pattern
- Mocking style (`jasmine.createSpyObj`, `jest.fn()`, `vi.fn()`)
- Whether `HttpTestingController` or `HttpClientTestingModule` is used for HTTP mocks

---

## Step 3 — Read the Target File

Read the file under test fully. Identify:
- **Class type**: component / service / pipe / guard / resolver / directive
- **Public API**: all public methods, inputs, outputs, and injected dependencies
- **Side effects**: HTTP calls, localStorage, router navigation, EventEmitter emissions
- **Edge cases**: null/undefined handling, empty arrays, error states

Also read any interface/model files the class depends on.

---

## Step 4 — Generate the Test File

Generate `{filename}.spec.ts` in the same directory as the source file.

### For a Component
- `TestBed.configureTestingModule` with the component and its dependencies
- Mock all injected services using spies or stubs
- Test: component creation, `@Input()` bindings, `@Output()` emissions, template rendering, user interactions (click, input)

### For a Service
- Provide the service in a minimal `TestBed` (or instantiate directly if no DI needed)
- Use `HttpClientTestingModule` + `HttpTestingController` for HTTP services
- Test: each public method, success paths, error paths, observable completion

### For a Pipe
- Instantiate directly: `const pipe = new MyPipe()`
- Test: `transform()` with valid inputs, edge cases, and invalid inputs

### For a Guard / Resolver
- Use `TestBed` with `RouterTestingModule`
- Mock `ActivatedRouteSnapshot` and `RouterStateSnapshot`
- Test: allow / deny / redirect scenarios

### General rules
- Each `describe` block covers one class
- Each `it` has a single assertion intent described in plain English
- Do NOT test private methods directly — test via public API
- Mock all external dependencies — tests must not make real HTTP calls or touch localStorage

---

## Step 5 — Run the Tests

```bash
# For Karma/Jasmine:
npx ng test --watch=false --browsers=ChromeHeadless

# For Jest:
npx jest src/app/path/to/file.spec.ts --no-coverage

# For Vitest:
npx vitest run src/app/path/to/file.spec.ts
```

If tests fail:
- Fix failing tests before presenting the output
- Do NOT mark a test as `xit` or `pending` to silence a failure — fix the root cause
- If a failure reveals a bug in the source code, report it to the user rather than writing a test that accommodates the bug

---

## Step 6 — Present Output

Show the user:
1. Path to the generated `.spec.ts` file
2. Test count and breakdown (component / service / error path / edge case)
3. Any mocks or stubs created and why
4. Any gaps in coverage noted (e.g. "untestable private method, skipped")

---

## Usage Examples

```
/angular-test-generate
→ src/app/services/auth.service.ts
```

```
/angular-test-generate
→ src/app/components/user-profile/user-profile.component.ts
→ include edge cases and error paths
```

```
/angular-test-generate
→ src/app/pipes/
→ generate tests for all pipes in this folder
```
