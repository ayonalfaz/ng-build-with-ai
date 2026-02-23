# Copilot Instructions - Todo App

## Project Overview

Angular 17 todo application using standalone components (no NgModules). Features local storage persistence, inline editing, and filtering.

## Build, Test, and Development Commands

```bash
# Development server (http://localhost:4200)
npm start
# or
ng serve

# Build for production
npm run build

# Build with watch mode (development)
npm run watch

# Run all tests
npm test

# Run tests for a specific file
ng test --include='**/todo.service.spec.ts'
```

## Architecture

### Component Structure
- **App Component** (`app.component.ts`): Root component that orchestrates the todo list, handles filtering (all/active/completed), and manages statistics
- **Add Todo Component** (`add-todo.component.ts`): Inline template component for adding new todos
- **Todo Item Component** (`todo-item.component.ts`): Inline template component for displaying and editing individual todo items

### Data Flow
1. All components are **standalone** (no NgModules)
2. **TodoService** is the single source of truth, managing state and localStorage
3. App component calls `refresh()` after every state change to sync with service
4. Components emit events upward; parent component calls service methods
5. Service returns new copies of data (`[...this.todos]`) to maintain immutability

### State Management Pattern
- TodoService handles all CRUD operations and localStorage sync
- App component refreshes from service after every mutation
- No reactive programming (RxJS) for state - uses simple method calls and refresh pattern

## AI Workflows

Structured AI workflows are available in `.agent/workflows/`. Use these slash commands in any AI chat to run a guided workflow:

| Command | Purpose |
|---|---|
| `/angular-generate` | Scaffold components, services, pipes, guards matching existing patterns |
| `/angular-feature-plan` | Design a feature's architecture before writing any code |
| `/angular-api-integration` | Scaffold a typed HTTP layer from an OpenAPI spec or endpoint list |
| `/angular-test-generate` | Generate `.spec.ts` unit tests for existing files |
| `/angular-docs-generate` | Generate JSDoc, API tables, README sections |
| `/ai-code-review` | Review staged changes or a file against Angular best practices |
| `/angular-security-audit` | Scan for XSS, secrets, broken auth, and dependency vulnerabilities |
| `/angular-refactor` | Modernise code to current Angular patterns (signals, standalone, control flow) |
| `/angular-migration` | Upgrade Angular to a new major version end-to-end |
| `/angular-debug` | Diagnose and fix errors, build failures, and failing tests |

See [`.agent/workflows/README.md`](../.agent/workflows/README.md) for the full index.

---

## Key Conventions

### Component Style
- All new components generated without test files (`skipTests: true` in angular.json)
- Prefer inline templates for small components (see `AddTodoComponent`, `TodoItemComponent`)
- Use standalone components with explicit imports array

### TypeScript Configuration
- Strict mode enabled with additional checks:
  - `noImplicitReturns`
  - `noFallthroughCasesInSwitch`
  - `noPropertyAccessFromIndexSignature`
- Strict Angular template checking enabled

### Todo ID Generation
- Uses `Date.now()` for generating unique IDs
- New todos are added at the beginning of the list (`unshift`)

### Event Patterns
- Components use `@Output() eventName = new EventEmitter<Type>()`
- Parent component handles all service interactions
- Events bubble up with specific payloads (e.g., `{id: number, title: string}`)

### Local Storage
- Storage key: `'angular17-todos'`
- Dates are serialized/deserialized manually in service constructor
- Service auto-loads from localStorage on initialization
