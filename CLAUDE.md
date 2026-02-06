# CreativeFlow PM - Project Instructions

## No-Emoji Policy (STRICT)

This project enforces a **zero-emoji policy** across the entire codebase and application.

### What this means

Emojis are **never** permitted in:

- Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- UI text, labels, buttons, headings, descriptions
- Toast notifications and alert messages
- Error messages and validation feedback
- Placeholder text and input hints
- Comments and JSDoc annotations
- Log messages (`console.log`, logger calls)
- Commit messages and PR descriptions
- Documentation files (`.md`)
- Database seed data and fixtures
- Test descriptions and assertions
- Config files

### What to use instead

| Instead of emoji | Use this |
|-----------------|----------|
| Status icons (checkmarks, warnings, errors) | `lucide-react` icons (`Check`, `AlertTriangle`, `XCircle`) |
| Visual indicators in UI | shadcn/ui badge variants, color-coded status dots, icon components |
| Emphasis in text | Bold text, capitalization, or clear descriptive language |
| Bullet decorators | Standard list markers (`-`, `*`, numbered lists) |

### ESLint enforcement

The project includes a custom ESLint rule (`no-emoji`) that flags any emoji characters in source files. This runs in CI and as a pre-commit hook.

### Examples

```tsx
// BAD - never do this
const successMessage = "Project created successfully! 🎉";
const STATUS_LABELS = { active: "✅ Active", paused: "⏸️ Paused" };
// Toast: "Invoice sent! 📧"

// GOOD - do this instead
const successMessage = "Project created successfully.";
const STATUS_LABELS = { active: "Active", paused: "Paused" };
// Toast: "Invoice sent." (with a lucide-react Mail icon in the toast component)
```

## Code Conventions

- TypeScript strict mode
- Functional React components
- Zod validation on all API inputs
- Prisma for all database operations
- All queries scoped by `organizationId`
- Monetary values stored as integers (cents)
- `Decimal.js` for financial calculations
