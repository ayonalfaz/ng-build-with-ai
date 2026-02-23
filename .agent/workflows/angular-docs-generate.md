---
description: AI-assisted documentation generation — write JSDoc, component API tables, feature README sections, and Storybook stories from existing source code
---

# Angular Docs Generate Workflow

This workflow reads existing Angular source code and generates accurate documentation — JSDoc comments, component API tables (inputs/outputs/methods), feature README sections, and Storybook stories. Documentation is generated from the actual implementation, not invented.

**Trigger:** `/angular-docs-generate` in AI chat
**Required input:** The file, component, service, or feature folder to document

---

## Step 1 — Identify the Documentation Target

Ask the user:
1. **Target** — a specific file, component name, service name, or feature folder
2. **Output format** — one or more of:
   - JSDoc comments inline in the source file
   - Markdown API table (inputs, outputs, public methods)
   - A `README.md` section for the feature
   - A Storybook story (`.stories.ts`) — only if Storybook is detected
3. **Audience** — internal team docs, or public-facing library docs?

---

## Step 2 — Detect What Documentation Already Exists

```bash
# Check for Storybook
ls .storybook/ 2>/dev/null || echo "No Storybook detected"
```

- Read any existing `README.md` in the feature folder to avoid duplicating or contradicting existing docs
- Check if the target file already has JSDoc comments — if so, update rather than overwrite

---

## Step 3 — Read the Source Files

Read the target file(s) fully. For a component, also read its:
- HTML template (for template-level behaviour)
- Associated service (for data contracts)
- Child components it renders (for a complete API picture)

Identify and list:
- All `@Input()` / `input()` signal properties (name, type, default value, required flag, purpose)
- All `@Output()` / `output()` EventEmitters (name, event type, when it fires)
- All public methods (name, parameters, return type, purpose)
- The component's purpose (inferred from class name, template, and existing comments)
- Notable behaviour: lifecycle hooks used, subscriptions, state management pattern

---

## Step 4 — Generate Documentation

### JSDoc Comments

Add JSDoc to the component class, each `@Input()`, each `@Output()`, and each public method:

```typescript
/**
 * Displays a user's avatar with a fallback to their initials when no image is available.
 * Clicking the avatar emits an `avatarClick` event.
 */
@Component({ ... })
export class UserAvatarComponent {
  /** The URL of the user's profile image. If null or empty, initials are shown instead. */
  @Input() imageUrl: string | null = null;

  /** The user's display name, used to derive initials when no image is available. */
  @Input({ required: true }) name!: string;

  /** Size of the avatar in pixels. Defaults to 40. */
  @Input() size: number = 40;

  /** Emits when the user clicks the avatar. */
  @Output() avatarClick = new EventEmitter<void>();
}
```

Rules:
- Do NOT add a JSDoc comment that only restates the property name — only add one if it provides information
- Keep comments concise — one sentence is usually enough
- Document edge cases, defaults, and required flags

---

### Markdown API Table

```markdown
## UserAvatarComponent

Displays a user's avatar with fallback initials.

**Selector:** `app-user-avatar`

### Inputs

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `imageUrl` | `string \| null` | `null` | No | Profile image URL. Shows initials when null or empty. |
| `name` | `string` | — | **Yes** | Display name used to derive initials. |
| `size` | `number` | `40` | No | Avatar diameter in pixels. |

### Outputs

| Name | Payload | Description |
|---|---|---|
| `avatarClick` | `void` | Emitted when the user clicks the avatar. |

### Usage

```html
<app-user-avatar
  [imageUrl]="user.avatarUrl"
  [name]="user.displayName"
  [size]="48"
  (avatarClick)="onAvatarClick()"
/>
```
```

---

### Feature README Section

For a feature folder, generate a `README.md` (or a section to append to an existing one):

```markdown
## {Feature Name}

**Location:** `src/app/{feature-name}/`

### What it does
{2–4 sentences explaining the feature from a user perspective}

### Components

| Component | Selector | Purpose |
|---|---|---|
| `FeatureShellComponent` | `app-feature-shell` | Routed entry point, hosts layout |
| `FeatureListComponent` | `app-feature-list` | Renders the list of items |

### Services

| Service | Purpose |
|---|---|
| `FeatureService` | Fetches and caches feature data from the API |

### Routes

| Path | Component | Guard |
|---|---|---|
| `/feature` | `FeatureShellComponent` | `authGuard` |
| `/feature/:id` | `FeatureDetailComponent` | `authGuard` |

### Key dependencies
- `SharedModule` — for common UI components
- `AuthService` — for permission checks
```

---

### Storybook Story (if Storybook is present)

```typescript
// user-avatar.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { UserAvatarComponent } from './user-avatar.component';

const meta: Meta<UserAvatarComponent> = {
  component: UserAvatarComponent,
  title: 'Shared/UserAvatar',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<UserAvatarComponent>;

export const WithImage: Story = {
  args: { imageUrl: 'https://example.com/avatar.jpg', name: 'Jane Doe', size: 48 },
};

export const WithInitials: Story = {
  args: { imageUrl: null, name: 'Jane Doe', size: 48 },
};

export const Small: Story = {
  args: { imageUrl: null, name: 'JD', size: 24 },
};
```

---

## Step 5 — Write the Output

- **JSDoc**: Edit the source file in place
- **API table / README section**: Write to `src/app/{feature}/README.md` (create if it doesn't exist)
- **Root-level feature summary**: Append to the project root `README.md` under a `## Features` section
- **Storybook story**: Write to the same folder as the component

---

## Step 6 — Present Output

Show the user:
1. Files created or modified
2. Any inputs or outputs that could not be fully documented due to unclear types (ask the user to clarify)
3. Reminder: "Documentation reflects the code at the time of generation — update it when the public API changes"

---

## Usage Examples

```
/angular-docs-generate
→ src/app/shared/components/user-avatar/user-avatar.component.ts
→ Output: JSDoc + Markdown API table
```

```
/angular-docs-generate
→ src/app/checkout/
→ Output: feature README section
```

```
/angular-docs-generate
→ src/app/shared/components/data-table/data-table.component.ts
→ Output: Storybook story + JSDoc
```

```
/angular-docs-generate
→ src/app/auth/services/auth.service.ts
→ Output: JSDoc for all public methods
```
