# Post-Migration Recommendations (Angular 18 → 19)

Generated: 2026-02-22

---

## High Priority (Recommended to do soon)

- [ ] **Add ESLint with `angular-eslint`** — No linter is configured. Run `ng add angular-eslint` to enforce Angular best practices, detect deprecated API usage early, and catch template bugs. Angular 19 has a dedicated ESLint ruleset.

- [ ] **Migrate `*ngIf` / `*ngFor` to new control flow syntax** — The `TodoItemComponent` uses `*ngIf` (2 instances). Angular 17+ introduced built-in `@if` / `@for` / `@switch` which are faster, require no `CommonModule` import, and are the recommended approach going forward. Run the automatic migration: `ng generate @angular/core:control-flow`.

- [ ] **Remove `CommonModule` from standalone components** — After adopting the new control flow syntax (above), `CommonModule` can be removed from all 3 component `imports` arrays (`AppComponent`, `AddTodoComponent`, `TodoItemComponent`). Angular 19 standalone components should import only what they use.

---

## Medium Priority (Do when possible)

- [ ] **Migrate from `@Input()` / `@Output()` decorators to signal-based inputs** — Angular 19 stabilized `input()`, `output()`, and `model()` signals. Example in `TodoItemComponent`: replace `@Input() todo!: Todo` with `todo = input.required<Todo>()`. This improves type safety and works better with `OnPush` change detection.

- [ ] **Enable `zoneless` change detection (experimental)** — Angular 19 made zoneless change detection officially available. Update `app.config.ts` to add `provideExperimentalZonelessChangeDetection()` and remove `zone.js` from polyfills to reduce bundle size.

- [ ] **Migrate from Karma to a modern test runner** — The project uses Karma + Jasmine. Karma is deprecated. Migrate to Jest or Web Test Runner before tests are added.

- [ ] **Fix `moduleResolution` in `tsconfig.json`** — Currently set to `"node"`. Angular 19 recommends `"bundler"`. Update `tsconfig.json`: `"moduleResolution": "bundler"`.

---

## Low Priority (Nice to have)

- [ ] **Add Angular DevTools** — Install the Angular DevTools browser extension for debugging component trees and signal graphs during development.

- [ ] **Run the `provide-initializer` optional migration** — Angular 19 introduced `provideAppInitializer()` as a cleaner replacement for the `APP_INITIALIZER` token. Optional schematic: `ng update @angular/core --name provide-initializer`. Not used in this app currently, but future-proofs it.

- [ ] **Migrate to `@angular/build` builder** — An optional schematic switches from `@angular-devkit/build-angular` to the new first-party `@angular/build` package: `ng update @angular/cli --name use-application-builder`. The current builder already uses esbuild, so the impact is minor.

- [ ] **Consider incremental hydration for SSR** — If SSR is added in the future, Angular 19 stabilized incremental hydration (`withIncrementalHydration()`), enabling lazy hydration of component subtrees on interaction.

---

## Verification Summary

| Check | Status | Notes |
|---|---|---|
| TypeScript types (`tsc --noEmit`) | ✅ | 0 errors |
| Dev build | ✅ | Completed in 23s |
| Prod build | ✅ | Completed in 9s |
| Lint | ⚠️ skipped | No lint config — add `angular-eslint` |
| Dev server | ✅ | Running, HMR enabled |
| Bundle size (prod, raw) | ℹ️ 176 KB | main: 176 KB raw / 50 KB gzipped |
