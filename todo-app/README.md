# Todo App

An Angular 19 single-page application for managing a personal todo list, with full server-side rendering (SSR) support via Express and localStorage persistence.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Components](#components)
  - [AppComponent](#appcomponent)
  - [AddTodoComponent](#addtodocomponent)
  - [TodoItemComponent](#todoitemcomponent)
- [Services](#services)
  - [TodoService](#todoservice)
- [Models](#models)
  - [Todo](#todo-interface)
  - [FilterType](#filtertype)
- [State Management](#state-management)
- [Routing](#routing)
- [SSR Server](#ssr-server)
- [Build & Scripts](#build--scripts)
- [Known Limitations](#known-limitations)

---

## Overview

The todo app supports standard CRUD operations, client-side filtering (All / Active / Completed), inline editing, a progress bar, and localStorage persistence. There is no backend API — all data is stored in the browser's localStorage under the key `angular17-todos`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 19.2 |
| Language | TypeScript 5.8 |
| Rendering | Angular SSR (`@angular/ssr`) |
| SSR server | Express 4.18 |
| Forms | `FormsModule` (template-driven, two-way binding) |
| State | Service + localStorage (no RxJS, no signals) |
| Testing | Karma + Jasmine |
| Build | Angular CLI 19.2 / Vite |

---

## Project Structure

```
todo-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts        # Root component — layout, filtering, stats
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.config.ts           # Application providers (hydration)
│   │   ├── app.config.server.ts    # Server-side provider merge
│   │   ├── components/
│   │   │   ├── add-todo/
│   │   │   │   └── add-todo.component.ts   # Add-todo form
│   │   │   └── todo-item/
│   │   │       └── todo-item.component.ts  # Single todo row (view + edit mode)
│   │   ├── models/
│   │   │   └── todo.model.ts       # Todo interface + FilterType
│   │   └── services/
│   │       └── todo.service.ts     # All CRUD operations + localStorage
│   ├── main.ts                     # Browser bootstrap
│   ├── main.server.ts              # Server bootstrap
│   ├── server.ts                   # Express SSR server
│   └── styles.css                  # Global styles
├── angular.json
├── tsconfig.json
└── package.json
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development server (http://localhost:4200)
npm start

# Production build
npm run build

# Run SSR server (after build)
npm run serve:ssr:todo-app    # http://localhost:4000

# Unit tests
npm test
```

---

## Architecture

### Data Flow

```
User action in template
  → Component event handler (onAdd / onToggle / onDelete / onUpdate)
  → TodoService mutation method
  → Service updates in-memory array + persists to localStorage
  → Component calls refresh()
  → Template re-renders with new data
```

### Component Hierarchy

```
AppComponent
├── AddTodoComponent          (emits addTodo: string)
├── [filter tab buttons]
└── TodoItemComponent × n     (emits toggle / delete / update)
```

There is no routing — the app is a single view; filtering is pure local state.

---

## Components

### AppComponent

**Selector:** `app-root`
**File:** [src/app/app.component.ts](src/app/app.component.ts)

Root component. Owns the full application state: the todo list, active filter, and stats. Coordinates between `TodoService` and the two child components.

#### Properties

| Name | Type | Default | Description |
|---|---|---|---|
| `todos` | `Todo[]` | `[]` | Full list of todos loaded from the service |
| `filter` | `FilterType` | `'all'` | Active filter: `'all'`, `'active'`, or `'completed'` |
| `stats` | `{ total, completed, active }` | `{0,0,0}` | Summary counts from the service |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `ngOnInit` | `() => void` | Loads initial todos and stats via `refresh()` |
| `refresh` | `() => void` | Re-reads todos and stats from `TodoService` |
| `filtered` | `get filtered(): Todo[]` | Returns todos filtered by the current `filter` value |
| `onAdd` | `(title: string) => void` | Calls `TodoService.add()` then refreshes |
| `onToggle` | `(id: number) => void` | Calls `TodoService.toggle()` then refreshes |
| `onDelete` | `(id: number) => void` | Calls `TodoService.delete()` then refreshes |
| `onUpdate` | `(event: { id: number; title: string }) => void` | Calls `TodoService.update()` then refreshes |
| `onClearCompleted` | `() => void` | Calls `TodoService.clearCompleted()` then refreshes |
| `setFilter` | `(f: FilterType) => void` | Changes the active filter |
| `trackById` | `(_: number, todo: Todo) => number` | `ngFor` track-by function |

---

### AddTodoComponent

**Selector:** `app-add-todo`
**File:** [src/app/components/add-todo/add-todo.component.ts](src/app/components/add-todo/add-todo.component.ts)

Renders a single text input and submit button. Emits the new todo title and clears itself — it holds no persistent state.

#### Outputs

| Name | Payload | Description |
|---|---|---|
| `addTodo` | `string` | Emits the trimmed title when the form is submitted |

#### Internal Properties

| Name | Type | Default | Description |
|---|---|---|---|
| `inputValue` | `string` | `''` | Two-way bound to the input field via `[(ngModel)]` |

#### Methods

| Method | Description |
|---|---|
| `onSubmit()` | Guards against empty input, emits `addTodo` with the trimmed value, then resets `inputValue` |

#### Usage

```html
<app-add-todo (addTodo)="onAdd($event)" />
```

---

### TodoItemComponent

**Selector:** `app-todo-item`
**File:** [src/app/components/todo-item/todo-item.component.ts](src/app/components/todo-item/todo-item.component.ts)

Renders a single todo row. Supports two modes — **view** and **edit** — toggled by double-clicking the title or clicking the edit button.

#### Inputs

| Name | Type | Required | Description |
|---|---|---|---|
| `todo` | `Todo` | Yes | The todo object to display |

#### Outputs

| Name | Payload | Description |
|---|---|---|
| `toggle` | `number` | Emits the todo's `id` when the checkbox is clicked |
| `delete` | `number` | Emits the todo's `id` when the delete button is clicked |
| `update` | `{ id: number; title: string }` | Emits the updated id and title on save |

#### Internal Properties

| Name | Type | Default | Description |
|---|---|---|---|
| `editing` | `boolean` | `false` | Whether the row is in edit mode |
| `editValue` | `string` | `''` | Holds the in-progress edit text |

#### Methods

| Method | Description |
|---|---|
| `startEdit()` | Sets `editing = true` and copies `todo.title` into `editValue` |
| `saveEdit()` | If `editValue` is non-empty after trimming, emits `update` and exits edit mode; otherwise cancels |
| `cancelEdit()` | Sets `editing = false` without emitting |

#### Keyboard Shortcuts (in edit mode)

| Key | Action |
|---|---|
| `Enter` | Save |
| `Escape` | Cancel |

#### Usage

```html
<app-todo-item
  [todo]="todo"
  (toggle)="onToggle($event)"
  (delete)="onDelete($event)"
  (update)="onUpdate($event)"
/>
```

---

## Services

### TodoService

**File:** [src/app/services/todo.service.ts](src/app/services/todo.service.ts)
**Provided in:** `root`

Single source of truth for all todo data. Manages an in-memory array and keeps it synchronised with localStorage on every mutation.

#### localStorage

| Key | Value |
|---|---|
| `angular17-todos` | JSON-serialised `Todo[]` |

Date fields are reconstructed as `Date` objects on load.

#### Public Methods

| Method | Signature | Description |
|---|---|---|
| `getAll` | `() => Todo[]` | Returns a shallow copy of the todos array |
| `add` | `(title: string) => Todo` | Creates a new todo (ID from `Date.now()`), prepends it to the array, persists, returns the new todo |
| `toggle` | `(id: number) => void` | Flips `completed` on the matching todo and persists |
| `delete` | `(id: number) => void` | Removes the matching todo and persists |
| `update` | `(id: number, title: string) => void` | Sets a new (trimmed) title on the matching todo and persists |
| `clearCompleted` | `() => void` | Removes all todos where `completed === true` and persists |
| `getStats` | `() => { total: number; completed: number; active: number }` | Derives counts from the current array without side effects |

---

## Models

### Todo Interface

**File:** [src/app/models/todo.model.ts](src/app/models/todo.model.ts)

```typescript
export interface Todo {
  id: number;        // Unique ID — generated from Date.now()
  title: string;     // Task description
  completed: boolean;
  createdAt: Date;
}
```

### FilterType

Defined in [src/app/app.component.ts](src/app/app.component.ts):

```typescript
type FilterType = 'all' | 'active' | 'completed';
```

---

## State Management

The app uses a **service + manual refresh** pattern — no signals, no RxJS observables.

```
TodoService.todos[]   ←→   localStorage['angular17-todos']
       ↓
AppComponent.todos[]  (populated by refresh())
       ↓
Filtered view via get filtered()
```

After every mutation, the component calls `this.refresh()` to pull fresh data from the service. This is intentionally synchronous and simple.

---

## Routing

There is no Angular Router configured. Filtering (All / Active / Completed) is handled by local component state — the URL does not change.

---

## SSR Server

**File:** [src/server.ts](src/server.ts)

An Express server that handles SSR for production deployments.

| Concern | Behaviour |
|---|---|
| Static assets | Served from `dist/todo-app/browser/` with 1-year `Cache-Control` |
| SSR rendering | All unmatched routes are handled by Angular's `CommonEngine` |
| Port | `process.env.PORT` or `4000` |

Run after building:

```bash
node dist/todo-app/server/server.mjs
```

---

## Build & Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `ng serve` | Local dev server on port 4200 |
| `build` | `ng build` | Production build to `dist/todo-app/` |
| `watch` | `ng build --watch --configuration development` | Incremental dev build |
| `test` | `ng test` | Karma + Jasmine unit tests |
| `serve:ssr:todo-app` | `node dist/todo-app/server/server.mjs` | SSR server on port 4000 |

---

## Known Limitations

- No error handling if localStorage is unavailable (e.g. private-browsing quota exceeded)
- No unit tests exist (Angular CLI default `skipTests` was used during generation)
- Filter state is not reflected in the URL — deep-linking to a filtered view is not possible
- Manual `refresh()` calls could be replaced with Angular signals for automatic reactivity
- No loading indicators — all operations are synchronous
- No i18n support

---

*Documentation generated from source — update this file when the public API of any component or service changes.*
