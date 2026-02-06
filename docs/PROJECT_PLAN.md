# CreativeFlow PM - Project Plan

> 18-Week Development Plan for Creative Studio Project Management

## Project Overview

**CreativeFlow PM** is a comprehensive project management application designed for studios specializing in interior design, conference decor, exhibitions, abstract installations, and experiential activations.

The application handles the full lifecycle of creative projects: from scoping and budgeting, through execution with expense tracking and milestone management, to invoicing, payment collection, and financial reporting.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Client State | Zustand |
| Server State | TanStack Query |
| Backend | Next.js API Routes (App Router) |
| Database | PostgreSQL, Prisma ORM |
| Authentication | NextAuth.js |
| Validation | Zod |
| Email | Resend |
| PDF Generation | @react-pdf/renderer |
| Testing | Vitest |

---

## UI/UX Design System

### Design Philosophy

**Modern Elegance for Creative Professionals**

CreativeFlow serves interior designers, event producers, and installation artists -- people with refined aesthetic sensibilities. The interface should feel like a premium tool worthy of their craft: clean, sophisticated, and intentionally designed with generous whitespace and subtle details.

### Design Principles

1. **Restrained Luxury** - Premium feel without ostentation
2. **Purposeful Whitespace** - Let content breathe
3. **Subtle Motion** - Micro-interactions that delight without distracting
4. **Visual Hierarchy** - Guide the eye naturally
5. **Data as Art** - Make numbers and charts beautiful

---

### Color System

#### Primary Palette - "Atelier"

A warm, sophisticated palette inspired by architect studios and gallery spaces.

```css
:root {
  /* Core Brand */
  --ink: #1a1a2e;              /* Primary text, headings */
  --charcoal: #2d2d44;         /* Secondary text */
  --slate: #4a4a68;            /* Tertiary text */
  --stone: #6b6b8a;            /* Muted text */

  /* Warm Neutrals */
  --canvas: #fafaf8;           /* Page background */
  --paper: #ffffff;            /* Card background */
  --linen: #f5f5f2;            /* Section background */
  --parchment: #eeeee8;        /* Hover states */

  /* Accent - Terracotta */
  --terracotta-50: #fdf6f3;
  --terracotta-100: #fae8e0;
  --terracotta-200: #f5cfc0;
  --terracotta-300: #eeab94;
  --terracotta-400: #e58361;   /* Primary accent */
  --terracotta-500: #d96941;
  --terracotta-600: #c85436;
  --terracotta-700: #a6432d;
  --terracotta-800: #873a2b;
  --terracotta-900: #6e3328;

  /* Secondary Accent - Sage */
  --sage-50: #f6f7f4;
  --sage-100: #e8ebe3;
  --sage-200: #d1d8c8;
  --sage-300: #b3bea4;
  --sage-400: #94a37f;         /* Secondary accent */
  --sage-500: #778762;
  --sage-600: #5d6b4d;
  --sage-700: #4a5540;
  --sage-800: #3d4536;
  --sage-900: #343b2f;

  /* Semantic Colors */
  --success: #4a9c6d;          /* Paid, approved, on track */
  --success-soft: #e8f5ed;
  --warning: #d4a03a;          /* Pending, approaching limit */
  --warning-soft: #fef8e7;
  --error: #c75450;            /* Overdue, over budget */
  --error-soft: #fdf0ef;
  --info: #5b8ec9;             /* Draft, informational */
  --info-soft: #eff5fc;
}
```

#### Dark Mode - "Gallery After Hours"

```css
[data-theme="dark"] {
  /* Neutrals */
  --canvas: #121218;
  --paper: #1a1a24;
  --linen: #222230;
  --parchment: #2a2a3a;

  --ink: #f5f5f2;
  --charcoal: #d4d4d0;
  --slate: #a8a8a4;
  --stone: #7c7c78;

  /* Terracotta Accent - Dark Mode */
  --terracotta-50: #2a1f1a;
  --terracotta-100: #3d2a1f;
  --terracotta-200: #5c3a28;
  --terracotta-300: #8b5438;
  --terracotta-400: #e58361;      /* Primary - unchanged */
  --terracotta-500: #f09878;
  --terracotta-600: #f5b09a;
  --terracotta-700: #f8c8b8;
  --terracotta-800: #fbe0d6;
  --terracotta-900: #fdf0eb;

  /* Sage Accent - Dark Mode */
  --sage-50: #1a1f18;
  --sage-100: #242c20;
  --sage-200: #344030;
  --sage-300: #4d5f44;
  --sage-400: #94a37f;             /* Secondary - unchanged */
  --sage-500: #a8b697;
  --sage-600: #bcc9af;
  --sage-700: #d0dcc7;
  --sage-800: #e4ebdf;
  --sage-900: #f2f5ef;

  /* Semantic Colors - Dark Mode */
  --success: #5ab87e;
  --success-soft: #1a2e22;
  --warning: #e0b04a;
  --warning-soft: #2e2a1a;
  --error: #e06b67;
  --error-soft: #2e1a1a;
  --info: #6ea0d8;
  --info-soft: #1a222e;

  /* Focus Ring - Dark Mode */
  --focus-ring: var(--terracotta-400);
  --focus-ring-offset: var(--canvas);
}
```

#### Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 2px 8px rgba(0, 0, 0, 0.06), 0 12px 24px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 4px 12px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.08);

  /* Warm-tinted shadows (terracotta influence) */
  --shadow-warm-sm: 0 1px 2px rgba(229, 131, 97, 0.06);
  --shadow-warm-md: 0 1px 3px rgba(229, 131, 97, 0.06), 0 6px 16px rgba(229, 131, 97, 0.06);
  --shadow-warm-lg: 0 2px 8px rgba(229, 131, 97, 0.08), 0 12px 24px rgba(229, 131, 97, 0.08);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 2px 8px rgba(0, 0, 0, 0.25), 0 12px 24px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 4px 12px rgba(0, 0, 0, 0.3), 0 20px 40px rgba(0, 0, 0, 0.25);

  --shadow-warm-sm: 0 1px 2px rgba(229, 131, 97, 0.1);
  --shadow-warm-md: 0 1px 3px rgba(229, 131, 97, 0.1), 0 6px 16px rgba(229, 131, 97, 0.08);
  --shadow-warm-lg: 0 2px 8px rgba(229, 131, 97, 0.12), 0 12px 24px rgba(229, 131, 97, 0.1);
}
```

#### Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-tooltip: 600;
  --z-notification: 700;
  --z-command-palette: 800;
}
```

#### Named Breakpoints

```css
:root {
  --breakpoint-sm: 640px;       /* Mobile landscape */
  --breakpoint-md: 768px;       /* Tablet portrait */
  --breakpoint-lg: 1024px;      /* Tablet landscape / small desktop */
  --breakpoint-xl: 1280px;      /* Desktop */
  --breakpoint-2xl: 1536px;     /* Large desktop */
}

/* Sidebar collapse: < lg */
/* Table horizontal scroll: < md */
/* KPI grid: 4-col >= xl, 2-col >= sm, 1-col < sm */
/* Chart responsive: resize observer, min-width 300px */
/* Modal full-screen: < md */
```

#### Chart Color Palette

```css
:root {
  --chart-1: #e58361;            /* Terracotta - primary */
  --chart-2: #94a37f;            /* Sage - secondary */
  --chart-3: #5b8ec9;            /* Info blue */
  --chart-4: #d4a03a;            /* Warning gold */
  --chart-5: #c75450;            /* Error red */
  --chart-6: #8b6fc0;            /* Purple accent */
  --chart-7: #4a9c6d;            /* Success green */
  --chart-8: #d4836f;            /* Muted terracotta */
}

[data-theme="dark"] {
  --chart-1: #f09878;
  --chart-2: #a8b697;
  --chart-3: #6ea0d8;
  --chart-4: #e0b04a;
  --chart-5: #e06b67;
  --chart-6: #a48dd4;
  --chart-7: #5ab87e;
  --chart-8: #e0a090;
}
```

#### Print-Safe Overrides

```css
@media print {
  :root {
    --canvas: #ffffff;
    --paper: #ffffff;
    --linen: #f5f5f5;
    --parchment: #eeeeee;
    --ink: #000000;
    --charcoal: #333333;
    --slate: #666666;
    --stone: #999999;
  }

  /* Hide non-printable elements */
  .no-print,
  nav,
  aside,
  .sidebar,
  .top-bar,
  .toast-container { display: none !important; }

  /* Reset shadows and rounded corners for print */
  * { box-shadow: none !important; }
  .rounded-2xl, .rounded-xl { border-radius: 4px !important; }

  /* Ensure financial tables print cleanly */
  table { page-break-inside: avoid; }
  tr { page-break-inside: avoid; }
}

---

### Typography

#### Font Stack

```css
:root {
  /* Display - For heroes and large headings */
  --font-display: 'Fraunces', Georgia, serif;

  /* Headings - For section titles */
  --font-heading: 'Inter', -apple-system, sans-serif;

  /* Body - For all content */
  --font-body: 'Inter', -apple-system, sans-serif;

  /* Mono - For numbers and code */
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

#### Type Scale

```css
/* Display */
.text-display-xl { font: 600 3.5rem/1.1 var(--font-display); letter-spacing: -0.02em; }
.text-display-lg { font: 600 2.5rem/1.15 var(--font-display); letter-spacing: -0.02em; }

/* Headings */
.text-h1 { font: 600 1.875rem/1.2 var(--font-heading); letter-spacing: -0.01em; }
.text-h2 { font: 600 1.5rem/1.25 var(--font-heading); letter-spacing: -0.01em; }
.text-h3 { font: 600 1.25rem/1.3 var(--font-heading); }
.text-h4 { font: 600 1.125rem/1.4 var(--font-heading); }

/* Body */
.text-body-lg { font: 400 1.125rem/1.6 var(--font-body); }
.text-body { font: 400 1rem/1.6 var(--font-body); }
.text-body-sm { font: 400 0.875rem/1.5 var(--font-body); }

/* Utility */
.text-label { font: 500 0.75rem/1.4 var(--font-body); letter-spacing: 0.025em; text-transform: uppercase; }
.text-caption { font: 400 0.75rem/1.4 var(--font-body); color: var(--stone); }

/* Numbers - Always monospace for alignment */
.text-number { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.text-currency { font: 500 1rem/1 var(--font-mono); }
.text-currency-lg { font: 600 1.5rem/1 var(--font-mono); }
```

---

### Spacing & Layout

#### Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-8: 3rem;      /* 48px */
  --space-10: 4rem;     /* 64px */
  --space-12: 6rem;     /* 96px */
}
```

#### Container Widths

```css
.container-sm { max-width: 640px; }   /* Forms, modals */
.container-md { max-width: 896px; }   /* Content pages */
.container-lg { max-width: 1152px; }  /* Dashboard */
.container-xl { max-width: 1408px; }  /* Full layouts */
```

#### Grid System

```css
/* Dashboard grid - 12 columns with generous gaps */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Responsive breakpoints */
@media (max-width: 1024px) { gap: var(--space-5); }
@media (max-width: 768px) { gap: var(--space-4); }
```

---

### Component Patterns

#### Cards

```tsx
// Elevated Card - Primary content
<div className="
  bg-paper rounded-2xl
  border border-stone/10
  shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.04)]
  hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.06)]
  transition-shadow duration-300
">

// Flat Card - Secondary content
<div className="
  bg-linen rounded-xl
  border border-stone/5
">

// Interactive Card - Clickable items
<div className="
  group bg-paper rounded-xl
  border border-transparent
  hover:border-terracotta-200
  hover:bg-terracotta-50/30
  transition-all duration-200
  cursor-pointer
">
```

#### Buttons

```tsx
// Primary Button
<button className="
  px-5 py-2.5 rounded-xl
  bg-ink text-paper
  font-medium text-sm
  hover:bg-charcoal
  active:scale-[0.98]
  transition-all duration-150
  shadow-[0_1px_2px_rgba(0,0,0,0.1)]
">

// Secondary Button
<button className="
  px-5 py-2.5 rounded-xl
  bg-paper text-ink
  border border-stone/20
  font-medium text-sm
  hover:bg-linen hover:border-stone/30
  active:scale-[0.98]
  transition-all duration-150
">

// Accent Button (CTAs)
<button className="
  px-5 py-2.5 rounded-xl
  bg-terracotta-400 text-white
  font-medium text-sm
  hover:bg-terracotta-500
  active:scale-[0.98]
  transition-all duration-150
  shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_8px_rgba(229,131,97,0.25)]
">

// Ghost Button
<button className="
  px-4 py-2 rounded-lg
  text-slate
  font-medium text-sm
  hover:bg-parchment hover:text-ink
  transition-all duration-150
">
```

#### Form Elements

```tsx
// Input Field
<div className="space-y-1.5">
  <label className="text-label text-slate">Project Name</label>
  <input className="
    w-full px-4 py-3 rounded-xl
    bg-paper border border-stone/20
    text-ink placeholder:text-stone
    focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
    transition-all duration-150
  " />
</div>

// Select with custom styling
<div className="relative">
  <select className="
    appearance-none w-full px-4 py-3 pr-10 rounded-xl
    bg-paper border border-stone/20
    text-ink
    focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
  ">
  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone pointer-events-none" />
</div>

// Textarea
<textarea className="
  w-full px-4 py-3 rounded-xl
  bg-paper border border-stone/20
  text-ink placeholder:text-stone
  min-h-[120px] resize-y
  focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
" />
```

#### Status Badges

```tsx
// Badge variants with subtle backgrounds
const badgeVariants = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  error: "bg-error-soft text-error border-error/20",
  info: "bg-info-soft text-info border-info/20",
  neutral: "bg-parchment text-slate border-stone/10",
};

<span className={`
  inline-flex items-center gap-1.5
  px-2.5 py-1 rounded-full
  text-xs font-medium
  border
  ${badgeVariants[status]}
`}>
  <span className="w-1.5 h-1.5 rounded-full bg-current" />
  {label}
</span>
```

#### Toast / Notification System

```tsx
// Toast container - fixed bottom-right
<div className="fixed bottom-6 right-6 z-[var(--z-notification)] space-y-3 max-w-md">
  {toasts.map(toast => (
    <div key={toast.id} className={`
      flex items-start gap-3 p-4 rounded-xl
      bg-paper border shadow-lg
      animate-in slide-in-from-right duration-300
      ${toast.variant === 'success' ? 'border-success/20' : ''}
      ${toast.variant === 'error' ? 'border-error/20' : ''}
      ${toast.variant === 'warning' ? 'border-warning/20' : ''}
      ${toast.variant === 'info' ? 'border-info/20' : ''}
    `}>
      <ToastIcon variant={toast.variant} />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-ink">{toast.title}</p>
        {toast.description && (
          <p className="text-caption mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className="text-stone hover:text-ink transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ))}
</div>
```

#### Command Palette (Cmd+K)

```tsx
// Command palette overlay
<div className="fixed inset-0 z-[var(--z-command-palette)] flex items-start justify-center pt-[20vh]">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

  {/* Palette */}
  <div className="
    relative w-full max-w-lg
    bg-paper rounded-2xl
    shadow-xl border border-stone/10
    overflow-hidden
  ">
    {/* Search input */}
    <div className="flex items-center gap-3 px-5 py-4 border-b border-stone/10">
      <Search className="w-5 h-5 text-stone" />
      <input
        className="flex-1 bg-transparent text-body text-ink placeholder:text-stone outline-none"
        placeholder="Search projects, invoices, vendors..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />
      <kbd className="text-xs text-stone bg-linen px-2 py-1 rounded">Esc</kbd>
    </div>

    {/* Results */}
    <div className="max-h-80 overflow-y-auto py-2">
      {groups.map(group => (
        <div key={group.label}>
          <div className="px-5 py-2 text-label text-stone">{group.label}</div>
          {group.items.map(item => (
            <button
              key={item.id}
              className="
                w-full flex items-center gap-3 px-5 py-3
                text-left text-body-sm text-ink
                hover:bg-linen/50 focus:bg-linen/50
                transition-colors
              "
              onClick={() => navigate(item.href)}
            >
              <item.icon className="w-4 h-4 text-slate" />
              <span className="flex-1">{item.label}</span>
              {item.meta && <span className="text-caption">{item.meta}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>

    {/* Footer shortcuts */}
    <div className="flex items-center gap-4 px-5 py-3 border-t border-stone/10 bg-linen/30">
      <span className="text-caption flex items-center gap-1">
        <ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigate
      </span>
      <span className="text-caption flex items-center gap-1">
        <CornerDownLeft className="w-3 h-3" /> Open
      </span>
    </div>
  </div>
</div>
```

#### Confirmation Dialog

```tsx
// Confirmation dialog for destructive actions
<div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
  <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />
  <div className="
    relative w-full max-w-md mx-4
    bg-paper rounded-2xl shadow-xl
    p-6
  ">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-error-soft">
        <AlertTriangle className="w-5 h-5 text-error" />
      </div>
      <div className="flex-1">
        <h3 className="text-h4 text-ink">{title}</h3>
        <p className="text-body-sm text-slate mt-2">{description}</p>
      </div>
    </div>
    <div className="flex justify-end gap-3 mt-6">
      <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate hover:bg-linen transition-colors" onClick={onCancel}>
        Cancel
      </button>
      <button className="px-4 py-2 rounded-xl text-sm font-medium bg-error text-white hover:bg-error/90 transition-colors" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </div>
</div>
```

#### Pagination

```tsx
// Pagination component
<div className="flex items-center justify-between px-4 py-3">
  <p className="text-caption">
    Showing <span className="font-medium text-ink">{from}</span> to{' '}
    <span className="font-medium text-ink">{to}</span> of{' '}
    <span className="font-medium text-ink">{total}</span> results
  </p>
  <div className="flex items-center gap-1">
    <button
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
      className="p-2 rounded-lg text-slate hover:bg-linen disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    {pageNumbers.map(num => (
      <button
        key={num}
        onClick={() => setPage(num)}
        className={`
          w-9 h-9 rounded-lg text-sm font-medium transition-colors
          ${num === page
            ? 'bg-ink text-paper'
            : 'text-slate hover:bg-linen'
          }
        `}
      >
        {num}
      </button>
    ))}
    <button
      disabled={page === totalPages}
      onClick={() => setPage(page + 1)}
      className="p-2 rounded-lg text-slate hover:bg-linen disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
</div>
```

#### Breadcrumbs

```tsx
// Breadcrumb navigation
<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-sm">
  {items.map((item, i) => (
    <Fragment key={item.href}>
      {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone" />}
      {i === items.length - 1 ? (
        <span className="font-medium text-ink" aria-current="page">{item.label}</span>
      ) : (
        <a href={item.href} className="text-slate hover:text-ink transition-colors">
          {item.label}
        </a>
      )}
    </Fragment>
  ))}
</nav>
```

#### Empty State

```tsx
// Empty state for lists and pages
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-linen rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-stone" />
      </div>
      <h3 className="text-h4 text-ink">{title}</h3>
      <p className="text-body-sm text-slate mt-2 max-w-sm">{description}</p>
      {action && (
        <button className="mt-6 px-5 py-2.5 rounded-xl bg-ink text-paper font-medium text-sm hover:bg-charcoal transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}

// Usage:
<EmptyState
  icon={FolderOpen}
  title="No projects yet"
  description="Create your first project to start tracking budgets, milestones, and invoices."
  action={{ label: "Create Project", onClick: () => router.push('/projects/new') }}
/>
```

#### Tabs Component

```tsx
// Tabs with underline indicator
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-stone/10" role="tablist">
      <div className="flex gap-0 -mb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-5 py-3 text-sm font-medium
              border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-terracotta-400 text-ink'
                : 'border-transparent text-slate hover:text-ink hover:border-stone/20'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-linen text-slate">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### Dropdown Menu

```tsx
// Dropdown menu
<div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="p-2 rounded-lg text-slate hover:bg-linen transition-colors"
  >
    <MoreHorizontal className="w-5 h-5" />
  </button>
  {open && (
    <div className="
      absolute right-0 top-full mt-1
      min-w-[180px] py-1
      bg-paper rounded-xl
      shadow-lg border border-stone/10
      z-[var(--z-dropdown)]
    " role="menu">
      {items.map(item => (
        <button
          key={item.label}
          role="menuitem"
          onClick={() => { item.onClick(); setOpen(false); }}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5
            text-sm text-left transition-colors
            ${item.destructive
              ? 'text-error hover:bg-error-soft'
              : 'text-ink hover:bg-linen'
            }
          `}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </button>
      ))}
    </div>
  )}
</div>
```

#### Date Picker

```tsx
// Date picker with calendar popover
<div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="
      w-full flex items-center gap-3 px-4 py-3 rounded-xl
      bg-paper border border-stone/20
      text-body-sm text-left
      hover:border-stone/30
      focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
      transition-all
    "
  >
    <Calendar className="w-4 h-4 text-stone" />
    <span className={value ? 'text-ink' : 'text-stone'}>
      {value ? formatDate(value) : placeholder}
    </span>
  </button>
  {open && (
    <div className="
      absolute left-0 top-full mt-2
      bg-paper rounded-xl shadow-xl border border-stone/10
      p-4 z-[var(--z-popover)]
    ">
      <CalendarGrid value={value} onChange={handleChange} />
    </div>
  )}
</div>
```

#### Checkbox and Radio Groups

```tsx
// Checkbox
<label className="flex items-center gap-3 cursor-pointer group">
  <div className={`
    w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
    ${checked
      ? 'bg-terracotta-400 border-terracotta-400'
      : 'border-stone/30 group-hover:border-stone/50'
    }
  `}>
    {checked && <Check className="w-3.5 h-3.5 text-white" />}
  </div>
  <span className="text-body-sm text-ink">{label}</span>
</label>

// Radio group
<fieldset className="space-y-3" role="radiogroup" aria-label={groupLabel}>
  {options.map(option => (
    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
      <div className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${selected === option.value
          ? 'border-terracotta-400'
          : 'border-stone/30 group-hover:border-stone/50'
        }
      `}>
        {selected === option.value && (
          <div className="w-2.5 h-2.5 rounded-full bg-terracotta-400" />
        )}
      </div>
      <span className="text-body-sm text-ink">{option.label}</span>
    </label>
  ))}
</fieldset>
```

#### Tooltip and Popover

```tsx
// Tooltip
<div className="relative group">
  {trigger}
  <div className="
    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
    px-3 py-1.5 rounded-lg
    bg-ink text-paper text-xs
    opacity-0 group-hover:opacity-100
    pointer-events-none
    transition-opacity duration-150
    z-[var(--z-tooltip)]
    whitespace-nowrap
  " role="tooltip">
    {content}
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-ink rotate-45" />
  </div>
</div>

// Popover
<div className="relative">
  <button onClick={() => setOpen(!open)} className={triggerClassName}>
    {triggerContent}
  </button>
  {open && (
    <div className="
      absolute left-0 top-full mt-2
      min-w-[280px] p-4
      bg-paper rounded-xl shadow-xl
      border border-stone/10
      z-[var(--z-popover)]
    ">
      {children}
    </div>
  )}
</div>
```

#### Accordion / Collapsible

```tsx
// Accordion component
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-stone/10 border border-stone/10 rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-linen/30 transition-colors"
            aria-expanded={openIndex === i}
          >
            <span className="text-body-sm font-medium text-ink">{item.title}</span>
            <ChevronDown className={`
              w-4 h-4 text-stone transition-transform duration-200
              ${openIndex === i ? 'rotate-180' : ''}
            `} />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-body-sm text-slate animate-in fade-in duration-200">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### Error Pages (404, 500)

```tsx
// 404 Not Found
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-display-xl text-stone/20 font-bold">404</div>
        <h1 className="text-h2 text-ink mt-4">Page not found</h1>
        <p className="text-body text-slate mt-3">
          The page you are looking for does not exist or has been moved.
        </p>
        <a href="/" className="
          inline-flex items-center gap-2 mt-8
          px-5 py-2.5 rounded-xl
          bg-ink text-paper font-medium text-sm
          hover:bg-charcoal transition-colors
        ">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

// 500 Server Error
function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="p-4 bg-error-soft rounded-2xl inline-block mb-4">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-h2 text-ink">Something went wrong</h1>
        <p className="text-body text-slate mt-3">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-ink text-paper font-medium text-sm hover:bg-charcoal transition-colors">
            Try again
          </button>
          <a href="/" className="px-5 py-2.5 rounded-xl border border-stone/20 text-ink font-medium text-sm hover:bg-linen transition-colors">
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
```

#### Avatar Component

```tsx
// Avatar with size variants and fallback
function Avatar({ src, name, size = 'md' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colorIndex = name.charCodeAt(0) % 5;
  const bgColors = [
    'bg-terracotta-100 text-terracotta-700',
    'bg-sage-100 text-sage-700',
    'bg-info-soft text-info',
    'bg-warning-soft text-warning',
    'bg-success-soft text-success',
  ];

  return (
    <div className={`
      ${sizes[size]} rounded-full
      flex items-center justify-center
      font-medium overflow-hidden
      ring-2 ring-paper
      ${!src ? bgColors[colorIndex] : ''}
    `}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
```

#### Progress / Step Indicator

```tsx
// Step indicator for multi-step forms
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0" role="list" aria-label="Progress">
      {steps.map((step, i) => (
        <Fragment key={i}>
          <div className="flex items-center gap-3" role="listitem">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
              ${i < currentStep ? 'bg-success text-white' : ''}
              ${i === currentStep ? 'bg-terracotta-400 text-white' : ''}
              ${i > currentStep ? 'bg-linen text-stone' : ''}
            `}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-body-sm ${i <= currentStep ? 'text-ink font-medium' : 'text-stone'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-4
              ${i < currentStep ? 'bg-success' : 'bg-stone/20'}
            `} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
```

#### Input with Icon/Adornment

```tsx
// Input with leading icon
<div className="relative">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone pointer-events-none">
    <DollarSign className="w-4 h-4" />
  </div>
  <input
    className="
      w-full pl-10 pr-4 py-3 rounded-xl
      bg-paper border border-stone/20
      text-ink text-number placeholder:text-stone
      focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
      transition-all
    "
    placeholder="0.00"
  />
</div>

// Input with trailing adornment
<div className="relative">
  <input
    className="
      w-full px-4 pr-16 py-3 rounded-xl
      bg-paper border border-stone/20
      text-ink placeholder:text-stone
      focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100
      transition-all
    "
    placeholder="Search..."
  />
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    <kbd className="text-xs text-stone bg-linen px-2 py-1 rounded">Cmd+K</kbd>
  </div>
</div>
```

#### Loading Overlay / Backdrop

```tsx
// Full-page loading overlay
function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-canvas/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-linen" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-t-terracotta-400 animate-spin" />
        </div>
        {message && <p className="text-body-sm text-slate">{message}</p>}
      </div>
    </div>
  );
}

// Section loading overlay (relative to parent)
function SectionLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-paper/60 backdrop-blur-[2px] rounded-xl">
      <Spinner size="lg" />
    </div>
  );
}
```

#### Mobile Navigation Drawer

```tsx
// Slide-out navigation drawer for mobile
<div className="lg:hidden">
  {/* Backdrop */}
  {open && (
    <div className="fixed inset-0 z-[var(--z-overlay)] bg-ink/40" onClick={onClose} />
  )}

  {/* Drawer */}
  <aside className={`
    fixed left-0 top-0 bottom-0 w-72
    z-[var(--z-modal)]
    bg-paper border-r border-stone/10
    transform transition-transform duration-300
    ${open ? 'translate-x-0' : '-translate-x-full'}
  `}>
    <div className="h-16 px-6 flex items-center justify-between border-b border-stone/5">
      <Logo className="h-8" />
      <button onClick={onClose} className="p-2 rounded-lg hover:bg-linen transition-colors">
        <X className="w-5 h-5 text-slate" />
      </button>
    </div>
    <nav className="px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <NavItem key={item.href} {...item} onClick={onClose} />
      ))}
    </nav>
    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-stone/5">
      <UserMenu />
    </div>
  </aside>
</div>
```

---

### Layout Templates

#### App Shell

```tsx
<div className="min-h-screen bg-canvas">
  {/* Sidebar - Fixed */}
  <aside className="
    fixed left-0 top-0 bottom-0 w-64
    bg-paper border-r border-stone/10
    flex flex-col
  ">
    {/* Logo */}
    <div className="h-16 px-6 flex items-center border-b border-stone/5">
      <Logo className="h-8" />
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <NavItem icon={Home} label="Dashboard" active />
      <NavItem icon={Folder} label="Projects" />
      <NavItem icon={DollarSign} label="Finance" hasSubmenu />
      <NavItem icon={FileText} label="Invoices" />
      <NavItem icon={BarChart3} label="Reports" />
    </nav>

    {/* User Menu */}
    <div className="p-3 border-t border-stone/5">
      <UserMenu />
    </div>
  </aside>

  {/* Main Content */}
  <main className="ml-64">
    {/* Top Bar */}
    <header className="
      sticky top-0 z-40 h-16
      bg-canvas/80 backdrop-blur-md
      border-b border-stone/5
      px-8 flex items-center justify-between
    ">
      <Breadcrumb />
      <div className="flex items-center gap-4">
        <SearchCommand />
        <NotificationBell />
      </div>
    </header>

    {/* Page Content */}
    <div className="p-8">
      {children}
    </div>
  </main>
</div>
```

#### Dashboard Layout

```tsx
<div className="space-y-8">
  {/* Page Header */}
  <div className="flex items-end justify-between">
    <div>
      <h1 className="text-h1 text-ink">Dashboard</h1>
      <p className="text-body text-slate mt-1">
        Welcome back. Here is what is happening today.
      </p>
    </div>
    <Button variant="accent">
      <Plus className="w-4 h-4 mr-2" />
      New Project
    </Button>
  </div>

  {/* KPI Cards - 4 column grid */}
  <div className="grid grid-cols-4 gap-6">
    <KPICard
      label="Active Projects"
      value="12"
      change="+2 this month"
      trend="up"
    />
    <KPICard
      label="Total Revenue"
      value="$284,520"
      change="+18.2%"
      trend="up"
    />
    <KPICard
      label="Outstanding"
      value="$42,180"
      change="3 overdue"
      trend="warning"
    />
    <KPICard
      label="Cash Position"
      value="$156,340"
      change="30-day forecast"
      trend="neutral"
    />
  </div>

  {/* Main Content Grid */}
  <div className="grid grid-cols-12 gap-6">
    {/* Projects List - 8 columns */}
    <div className="col-span-8">
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardAction href="/projects">View all</CardAction>
        </CardHeader>
        <ProjectsTable />
      </Card>
    </div>

    {/* Sidebar - 4 columns */}
    <div className="col-span-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
        </CardHeader>
        <MilestonesList />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <ActivityFeed />
      </Card>
    </div>
  </div>
</div>
```

---

### Key Component Designs

#### KPI Card

```tsx
function KPICard({ label, value, change, trend, icon: Icon }) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    warning: "text-warning",
    neutral: "text-slate",
  };

  return (
    <div className="
      bg-paper rounded-2xl p-6
      border border-stone/10
      shadow-[0_1px_3px_rgba(0,0,0,0.04)]
    ">
      <div className="flex items-start justify-between">
        <span className="text-label text-slate">{label}</span>
        <div className="p-2 bg-linen rounded-lg">
          <Icon className="w-4 h-4 text-slate" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-currency-lg text-ink">{value}</span>
      </div>

      <div className={`mt-2 text-caption ${trendColors[trend]}`}>
        {trend === 'up' && <TrendingUp className="inline w-3 h-3 mr-1" />}
        {trend === 'down' && <TrendingDown className="inline w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
  );
}
```

#### Project Card

```tsx
function ProjectCard({ project }) {
  return (
    <div className="
      group bg-paper rounded-xl p-5
      border border-stone/10
      hover:border-terracotta-200 hover:shadow-md
      transition-all duration-200
      cursor-pointer
    ">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Project Type Icon */}
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${projectTypeStyles[project.type]}
          `}>
            <ProjectTypeIcon type={project.type} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-ink group-hover:text-terracotta-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-caption">{project.client}</p>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-caption mb-2">
          <span>Budget utilization</span>
          <span className="text-number">{project.budgetUsed}%</span>
        </div>
        <div className="h-2 bg-linen rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              project.budgetUsed > 90 ? 'bg-error' :
              project.budgetUsed > 75 ? 'bg-warning' : 'bg-sage-400'
            }`}
            style={{ width: `${project.budgetUsed}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-stone/5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.team.slice(0, 3).map(member => (
            <Avatar key={member.id} src={member.avatar} size="sm" />
          ))}
          {project.team.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-linen flex items-center justify-center text-xs text-slate">
              +{project.team.length - 3}
            </div>
          )}
        </div>
        <span className="text-caption">
          Due {formatDate(project.endDate)}
        </span>
      </div>
    </div>
  );
}
```

#### Data Table

```tsx
function DataTable({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone/10">
      <table className="w-full">
        <thead>
          <tr className="bg-linen/50">
            {columns.map(col => (
              <th key={col.key} className="
                px-4 py-3 text-left
                text-label text-slate
                border-b border-stone/10
              ">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/5">
          {data.map((row, i) => (
            <tr key={i} className="
              bg-paper hover:bg-linen/30
              transition-colors duration-150
            ">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-4 text-body-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Invoice Preview

```tsx
function InvoicePreview({ invoice }) {
  return (
    <div className="bg-paper rounded-2xl shadow-xl overflow-hidden max-w-2xl">
      {/* Header with gradient accent */}
      <div className="
        px-8 py-6
        bg-gradient-to-r from-ink to-charcoal
        text-paper
      ">
        <div className="flex justify-between items-start">
          <div>
            <Logo variant="light" className="h-8" />
            <p className="text-paper/60 text-sm mt-2">
              {organization.address}
            </p>
          </div>
          <div className="text-right">
            <span className="text-label text-paper/60">Invoice</span>
            <p className="text-xl font-semibold mt-1">{invoice.number}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <span className="text-label text-slate">Bill To</span>
            <p className="text-body font-medium mt-2">{invoice.client.name}</p>
            <p className="text-body-sm text-slate">{invoice.client.address}</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <span className="text-caption">Issue Date</span>
              <p className="text-body-sm">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <span className="text-caption">Due Date</span>
              <p className="text-body-sm font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-stone/10">
                <th className="text-left py-3 text-label text-slate">Description</th>
                <th className="text-right py-3 text-label text-slate">Qty</th>
                <th className="text-right py-3 text-label text-slate">Rate</th>
                <th className="text-right py-3 text-label text-slate">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/5">
              {invoice.lineItems.map(item => (
                <tr key={item.id}>
                  <td className="py-4 text-body-sm">{item.description}</td>
                  <td className="py-4 text-body-sm text-right text-number">{item.quantity}</td>
                  <td className="py-4 text-body-sm text-right text-number">{formatMoney(item.rate)}</td>
                  <td className="py-4 text-body-sm text-right text-number font-medium">{formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 pt-6 border-t border-stone/10">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-slate">Subtotal</span>
                <span className="text-number">{formatMoney(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-slate">Tax ({invoice.taxRate}%)</span>
                <span className="text-number">{formatMoney(invoice.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone/10">
                <span className="font-semibold">Total Due</span>
                <span className="text-currency-lg text-terracotta-600">
                  {formatMoney(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Financial UI Patterns

#### Budget Editor (Spreadsheet-Like)

```tsx
// Budget category editor with inline editing
function BudgetEditor({ categories, totalBudgetCents, onUpdate }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone/10">
      <table className="w-full">
        <thead>
          <tr className="bg-linen/50">
            <th className="px-4 py-3 text-left text-label text-slate w-[40%]">Category</th>
            <th className="px-4 py-3 text-right text-label text-slate w-[15%]">Allocation %</th>
            <th className="px-4 py-3 text-right text-label text-slate w-[15%]">Budgeted</th>
            <th className="px-4 py-3 text-right text-label text-slate w-[15%]">Spent</th>
            <th className="px-4 py-3 text-right text-label text-slate w-[15%]">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/5">
          {categories.map(cat => {
            const variance = cat.allocatedCents - cat.spentCents;
            const overBudget = variance < 0;
            return (
              <tr key={cat.id} className="bg-paper hover:bg-linen/20 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.colorClass}`} />
                    <span className="text-body-sm text-ink">{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    value={cat.allocationPercent}
                    onChange={e => onUpdate(cat.id, 'allocationPercent', e.target.value)}
                    className="
                      w-16 text-right text-number text-body-sm
                      bg-transparent border border-transparent
                      group-hover:border-stone/20 focus:border-terracotta-300
                      rounded-lg px-2 py-1 outline-none
                      transition-colors
                    "
                  />
                </td>
                <td className="px-4 py-3 text-right text-number text-body-sm text-ink">
                  {formatMoney(cat.allocatedCents)}
                </td>
                <td className="px-4 py-3 text-right text-number text-body-sm text-ink">
                  {formatMoney(cat.spentCents)}
                </td>
                <td className={`px-4 py-3 text-right text-number text-body-sm font-medium ${overBudget ? 'text-error' : 'text-success'}`}>
                  {formatMoney(Math.abs(variance))}
                  {overBudget && <span className="text-xs ml-1">over</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-linen/30 border-t-2 border-stone/10">
            <td className="px-4 py-3 text-body-sm font-semibold text-ink">Total</td>
            <td className="px-4 py-3 text-right text-number text-body-sm font-semibold">100%</td>
            <td className="px-4 py-3 text-right text-currency text-ink">{formatMoney(totalBudgetCents)}</td>
            <td className="px-4 py-3 text-right text-currency text-ink">{formatMoney(totalSpent)}</td>
            <td className="px-4 py-3 text-right text-currency text-ink">{formatMoney(totalRemaining)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

#### Expense Approval Workflow UI

```tsx
// Expense card with approval actions
function ExpenseCard({ expense, canApprove }) {
  const statusStyles = {
    DRAFT: { bg: 'bg-linen', text: 'text-stone', label: 'Draft' },
    SUBMITTED: { bg: 'bg-info-soft', text: 'text-info', label: 'Pending Approval' },
    APPROVED: { bg: 'bg-success-soft', text: 'text-success', label: 'Approved' },
    REJECTED: { bg: 'bg-error-soft', text: 'text-error', label: 'Rejected' },
  };
  const status = statusStyles[expense.status];

  return (
    <div className="bg-paper rounded-xl border border-stone/10 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body-sm font-medium text-ink">{expense.description}</p>
          <p className="text-caption mt-1">{expense.category} - {expense.vendorName}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-currency-lg text-ink">{formatMoney(expense.amountCents)}</span>
        <span className="text-caption">{formatDate(expense.date)}</span>
      </div>

      {/* Receipt thumbnail */}
      {expense.receipt && (
        <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-stone/10 cursor-pointer hover:opacity-80 transition-opacity">
          <img src={expense.receipt.thumbnailUrl} alt="Receipt" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Approval actions - only for SUBMITTED status and authorized users */}
      {expense.status === 'SUBMITTED' && canApprove && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone/10">
          <button
            onClick={() => onApprove(expense.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => onReject(expense.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-error/30 text-error text-sm font-medium hover:bg-error-soft transition-colors"
          >
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      )}

      {/* Status progression */}
      {expense.status !== 'DRAFT' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone/10">
          {['SUBMITTED', 'APPROVED'].map((step, i) => (
            <Fragment key={step}>
              {i > 0 && <div className="flex-1 h-0.5 bg-stone/10" />}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${getStepStyle(expense.status, step)}
              `}>
                {isStepComplete(expense.status, step) ? <Check className="w-3 h-3" /> : i + 1}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Invoice Builder (Editable Line Items)

```tsx
// Invoice line item editor
function InvoiceLineItemEditor({ items, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-3 text-label text-slate">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1" />
      </div>

      {/* Draggable line items */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="line-items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        grid grid-cols-12 gap-3 items-center
                        p-3 rounded-xl border
                        ${snapshot.isDragging ? 'border-terracotta-200 shadow-lg bg-paper' : 'border-stone/10 bg-paper'}
                        transition-shadow
                      `}
                    >
                      <div className="col-span-5 flex items-center gap-2">
                        <div {...provided.dragHandleProps} className="cursor-grab text-stone hover:text-ink">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <input
                          value={item.description}
                          onChange={e => onUpdate(index, 'description', e.target.value)}
                          className="w-full text-body-sm bg-transparent outline-none"
                          placeholder="Line item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => onUpdate(index, 'quantity', e.target.value)}
                          className="w-full text-right text-number text-body-sm bg-transparent border border-stone/10 rounded-lg px-2 py-1.5 outline-none focus:border-terracotta-300"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone text-xs">$</span>
                          <input
                            type="number"
                            value={item.rateDollars}
                            onChange={e => onUpdate(index, 'rate', e.target.value)}
                            className="w-full text-right text-number text-body-sm bg-transparent border border-stone/10 rounded-lg pl-5 pr-2 py-1.5 outline-none focus:border-terracotta-300"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-number text-body-sm font-medium text-ink">
                        {formatMoney(item.amountCents)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg text-stone hover:text-error hover:bg-error-soft transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add line item button */}
      <button onClick={onAdd} className="w-full py-3 rounded-xl border border-dashed border-stone/20 text-sm text-slate hover:border-terracotta-300 hover:text-terracotta-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add line item
      </button>
    </div>
  );
}
```

#### AR Aging Visualization

```tsx
// AR aging bucket bars
function ARAgingChart({ buckets }) {
  const maxAmount = Math.max(...buckets.map(b => b.amountCents));

  return (
    <div className="space-y-4">
      {buckets.map(bucket => {
        const widthPercent = maxAmount > 0 ? (bucket.amountCents / maxAmount) * 100 : 0;
        const colorMap = {
          current: 'bg-success',
          '1-30': 'bg-sage-400',
          '31-60': 'bg-warning',
          '61-90': 'bg-terracotta-400',
          '90+': 'bg-error',
        };
        return (
          <div key={bucket.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-slate">{bucket.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-caption">{bucket.count} invoices</span>
                <span className="text-number text-body-sm font-medium text-ink">
                  {formatMoney(bucket.amountCents)}
                </span>
              </div>
            </div>
            <div className="h-3 bg-linen rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorMap[bucket.key]} transition-all duration-500`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div className="pt-3 border-t border-stone/10 flex items-center justify-between">
        <span className="text-body-sm font-medium text-ink">Total Outstanding</span>
        <span className="text-currency-lg text-ink">
          {formatMoney(buckets.reduce((sum, b) => sum + b.amountCents, 0))}
        </span>
      </div>
    </div>
  );
}
```

#### Cash Flow Forecast Chart

```tsx
// Cash flow area chart with forecast overlay
const CashFlowChart = ({ historicalData, forecastData, scenarios }) => {
  const chartConfig = {
    data: [
      // Historical - solid fill
      {
        name: 'Actual',
        data: historicalData,
        fill: 'url(#actualGradient)',
        stroke: 'var(--chart-1)',
        strokeWidth: 2,
      },
      // Forecast - dashed line with translucent fill
      {
        name: 'Expected',
        data: forecastData.expected,
        fill: 'url(#forecastGradient)',
        stroke: 'var(--chart-1)',
        strokeWidth: 2,
        strokeDasharray: '6 3',
      },
      // Best/Worst scenarios - thin boundary lines
      {
        name: 'Best Case',
        data: forecastData.best,
        stroke: 'var(--chart-7)',
        strokeWidth: 1,
        strokeDasharray: '4 4',
        fill: 'none',
      },
      {
        name: 'Worst Case',
        data: forecastData.worst,
        stroke: 'var(--chart-5)',
        strokeWidth: 1,
        strokeDasharray: '4 4',
        fill: 'none',
      },
    ],
    gradients: {
      actualGradient: { from: 'var(--chart-1)', to: 'transparent', opacity: [0.2, 0] },
      forecastGradient: { from: 'var(--chart-1)', to: 'transparent', opacity: [0.1, 0] },
    },
    // Dividing line between historical and forecast
    referenceLine: {
      x: 'today',
      stroke: 'var(--stone)',
      strokeDasharray: '4 4',
      label: 'Today',
    },
    // Low cash alert threshold
    alertLine: {
      y: lowCashThresholdCents,
      stroke: 'var(--error)',
      strokeDasharray: '8 4',
      label: 'Low Cash Alert',
    },
  };

  return (
    <div className="bg-paper rounded-2xl border border-stone/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 text-ink">Cash Flow Forecast</h3>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-2 text-caption">
            <div className="w-3 h-0.5 bg-[var(--chart-1)]" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2 text-caption">
            <div className="w-3 h-0.5 bg-[var(--chart-1)] border-b border-dashed" />
            <span>Forecast</span>
          </div>
        </div>
      </div>
      <ResponsiveChart config={chartConfig} height={300} />
    </div>
  );
};
```

#### P&L Expandable Row Pattern

```tsx
// Expandable P&L row with drill-down
function PLRow({ label, amountCents, children, level = 0, isTotal = false }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = children && children.length > 0;
  const indent = level * 24;

  return (
    <>
      <tr className={`
        ${isTotal ? 'bg-linen/30 font-semibold' : 'bg-paper'}
        ${hasChildren ? 'cursor-pointer hover:bg-linen/20' : ''}
        transition-colors border-b border-stone/5
      `}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <td className="py-3 px-4" style={{ paddingLeft: `${16 + indent}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <ChevronRight className={`w-4 h-4 text-stone transition-transform ${expanded ? 'rotate-90' : ''}`} />
            )}
            <span className={`text-body-sm ${isTotal ? 'text-ink' : level === 0 ? 'text-ink' : 'text-slate'}`}>
              {label}
            </span>
          </div>
        </td>
        <td className={`py-3 px-4 text-right text-number text-body-sm ${amountCents < 0 ? 'text-error' : 'text-ink'}`}>
          {formatMoney(amountCents)}
        </td>
      </tr>
      {expanded && hasChildren && children.map(child => (
        <PLRow key={child.label} {...child} level={level + 1} />
      ))}
    </>
  );
}

// P&L Statement
function PLStatement({ data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone/10">
      <table className="w-full">
        <thead>
          <tr className="bg-linen/50">
            <th className="px-4 py-3 text-left text-label text-slate">Category</th>
            <th className="px-4 py-3 text-right text-label text-slate">Amount</th>
          </tr>
        </thead>
        <tbody>
          <PLRow label="Revenue" amountCents={data.totalRevenueCents} children={data.revenueCategories} />
          <PLRow label="Cost of Services" amountCents={data.totalCostsCents} children={data.costCategories} />
          <PLRow label="Gross Profit" amountCents={data.grossProfitCents} isTotal />
          <PLRow label="Operating Expenses" amountCents={data.totalOpexCents} children={data.opexCategories} />
          <PLRow label="Net Profit" amountCents={data.netProfitCents} isTotal />
        </tbody>
      </table>
    </div>
  );
}
```

---

### Micro-interactions & Motion

#### Animation Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easings */
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

#### Key Animations

```tsx
// Page transitions
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.33, 1, 0.68, 1] }
};

// Card hover lift
const cardHover = `
  transition-all duration-200 ease-out
  hover:-translate-y-0.5 hover:shadow-lg
`;

// Button press
const buttonPress = `
  active:scale-[0.98]
  transition-transform duration-150
`;
```

```css
/* Skeleton loading pulse */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--linen) 25%, var(--parchment) 50%, var(--linen) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

```tsx
// Number counting animation
const AnimatedNumber = ({ value }) => {
  const spring = useSpring(value, { stiffness: 100, damping: 30 });
  return <motion.span>{spring}</motion.span>;
};
```

#### Loading States

```tsx
// Skeleton Card
function ProjectCardSkeleton() {
  return (
    <div className="bg-paper rounded-xl p-5 border border-stone/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg skeleton" />
        <div className="space-y-2">
          <div className="w-32 h-4 rounded skeleton" />
          <div className="w-20 h-3 rounded skeleton" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="w-full h-2 rounded-full skeleton" />
      </div>
    </div>
  );
}

// Inline loading spinner
function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

---

### Phase-Specific UI Recommendations

#### Phase 1: Foundation (Weeks 1-3)

**Focus: App Shell & Dashboard Scaffold**

```
Priority Components:
-- Sidebar navigation with collapsible state
-- Top bar with search command (Cmd+K)
-- Breadcrumb navigation
-- Empty states for all sections
-- Toast notification system
```

**Key Decisions:**
- Implement dark mode toggle from day 1
- Set up CSS custom properties for theming
- Create base component library (Button, Input, Card, Badge)
- Design mobile navigation pattern (slide-out drawer)

#### Phase 2: Core PM (Weeks 4-7)

**Focus: Project Views & Team Collaboration**

```
Priority Components:
-- Project list view (table + card toggle)
-- Project detail page layout
-- Milestone timeline (vertical + Gantt option)
-- Team member selector with avatars
-- File upload dropzone
-- Activity feed with real-time updates
-- Vendor database interface
```

**Key Patterns:**
- **Project Cards**: Visual type indicators (color-coded icons)
- **Milestone View**: Vertical timeline with phase groupings
- **File Gallery**: Grid view with preview thumbnails
- **Activity Feed**: Grouped by day, expandable details

#### Phase 3: Financial Core (Weeks 8-11)

**Focus: Budget, Expenses, Invoicing**

```
Priority Components:
-- Budget editor with category breakdown
-- Budget vs Actual visualization (bar chart)
-- Expense form with receipt upload
-- Expense approval workflow UI
-- Invoice builder (drag-drop line items)
-- Invoice preview (print-ready)
-- Payment recording modal
-- AR aging table with visual indicators
```

**Key Patterns:**
- **Budget Editor**: Spreadsheet-like with inline editing
- **Expense Cards**: Status-driven coloring, receipt thumbnail
- **Invoice Builder**: Live preview, template selection
- **Money Display**: Always monospace, right-aligned, colored by context

#### Phase 4: Reporting (Weeks 12-14)

**Focus: Data Visualization & Dashboards**

```
Priority Components:
-- P&L statement view (expandable rows)
-- Cash flow chart (area chart with forecast)
-- Project profitability comparison
-- KPI widgets (configurable)
-- Date range picker
-- Export options (PDF, CSV)
-- Custom report builder
```

**Chart Styling:**

```tsx
const chartTheme = {
  colors: ['#e58361', '#94a37f', '#5b8ec9', '#d4a03a', '#c75450'],
  axis: {
    stroke: '#e5e5e0',
    tickColor: '#6b6b8a',
  },
  tooltip: {
    background: '#1a1a2e',
    color: '#ffffff',
    borderRadius: 8,
  },
  grid: {
    stroke: '#f5f5f2',
    strokeDasharray: '4 4',
  },
};
```

#### Phase 5: Polish & Launch (Weeks 15-18)

**Focus: Refinement & Performance**

```
Priority Enhancements:
-- Global search with filters
-- Bulk actions (select multiple)
-- Keyboard shortcuts throughout
-- Print stylesheets
-- PDF export styling
-- Onboarding flow / empty states
-- Error boundaries with friendly messages
-- Performance optimizations (virtualization)
```

**Polish Checklist:**
- [ ] All hover/focus states defined
- [ ] Loading states for every async action
- [ ] Empty states with helpful CTAs
- [ ] Error states with recovery actions
- [ ] Confirmation dialogs for destructive actions
- [ ] Undo capability where possible
- [ ] Consistent icon usage (Lucide throughout)
- [ ] Responsive at all breakpoints
- [ ] Print styles for invoices/reports

---

### Accessibility Guidelines

#### Color Contrast
- All text meets WCAG 2.1 AA (4.5:1 for normal, 3:1 for large)
- Do not rely on color alone (use icons, patterns)
- Test with color blindness simulators

#### Keyboard Navigation
- Visible focus rings (2px solid terracotta-400)
- Logical tab order
- Skip links for main content
- Escape closes modals/dropdowns

#### Screen Readers
- Semantic HTML (main, nav, section, article)
- ARIA labels where needed
- Announce dynamic content changes
- Descriptive link text (not "click here")

```css
/* Focus ring utility */
.focus-ring {
  outline: none;
}
.focus-ring:focus-visible {
  outline: 2px solid var(--terracotta-400);
  outline-offset: 2px;
}
```

---

### UI File Organization

```
src/
  styles/
    globals.css          -- CSS variables, base styles
    typography.css       -- Font imports, type scale
    animations.css       -- Keyframes, transitions
  components/
    ui/                  -- Base components (shadcn customized)
      button.tsx
      card.tsx
      input.tsx
      ...
    layout/
      sidebar.tsx
      top-bar.tsx
      page-header.tsx
    projects/
    finance/
    charts/
  lib/
    design-tokens.ts     -- Exported values for JS usage
```

---

### Design DNA Summary

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Primary Color** | Terracotta (#e58361) | Warm, creative, stands out from typical SaaS blue |
| **Typography** | Fraunces + Inter | Display elegance + UI readability |
| **Border Radius** | 12-20px (xl-2xl) | Soft, modern, approachable |
| **Shadows** | Subtle, layered | Depth without heaviness |
| **Motion** | Fast, purposeful | Responsive feel, not distracting |
| **Density** | Generous spacing | Breathable, premium feel |

This design system positions CreativeFlow PM as a **premium tool for creative professionals** -- not another generic project management app, but a thoughtfully designed workspace that respects the aesthetic sensibilities of its users.

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1 - Project Scaffolding & Database Design

**Goal**: Establish the project structure, database schema, and development environment.

**Tasks**:
- [ ] Initialize Next.js 14+ project with TypeScript strict mode
- [ ] Configure Tailwind CSS + shadcn/ui component library
- [ ] Set up Prisma ORM with PostgreSQL connection
- [ ] Design and implement the core database schema:
  - `Organization` - multi-tenant root entity
  - `User` - with roles (ADMIN, MANAGER, FINANCE, MEMBER, VIEWER)
  - `Team` - team groupings within orgs
  - `TeamMember` - user-team associations
- [ ] Set up ESLint, Prettier, and Husky pre-commit hooks
- [ ] Configure environment variables (.env.example)
- [ ] Initialize Git repository with branching strategy

**Agents**: `architect`, `devops-engineer`

**Deliverables**:
- Working Next.js project skeleton
- Prisma schema with core tables migrated
- CI-ready development environment

---

### Week 2 - Authentication & Authorization

**Goal**: Implement secure multi-tenant authentication and role-based access control.

**Tasks**:
- [ ] Configure NextAuth.js with credentials provider
- [ ] Implement sign-up / sign-in / sign-out flows
- [ ] Build auth middleware for API route protection
- [ ] Create `requireAuth()` and `requireRole()` utility functions
- [ ] Implement organization-scoped data isolation (all queries filter by `organizationId`)
- [ ] Build auth UI pages: Login, Register, Forgot Password
- [ ] Add session management and token refresh
- [ ] Implement invite-based user onboarding

**Agents**: `fullstack-developer`, `security-auditor`

**Deliverables**:
- Functional auth system with RBAC
- Protected API routes and pages
- Organization-level data isolation

---

### Week 3 - Layout, Navigation & Dashboard Shell

**Goal**: Build the application shell with navigation, layout, and an initial dashboard.

**Tasks**:
- [ ] Create the main app layout (sidebar + top bar + content area)
- [ ] Build responsive sidebar navigation with role-based menu items
- [ ] Implement breadcrumb navigation
- [ ] Create the dashboard page shell with widget placeholders
- [ ] Build reusable page layout components (PageHeader, PageContent, etc.)
- [ ] Set up Zustand store for UI state (sidebar collapsed, theme, etc.)
- [ ] Add loading skeletons and error boundary components
- [ ] Implement mobile-responsive navigation (drawer pattern)

**Agents**: `ui-designer`, `fullstack-developer`

**Deliverables**:
- Complete app shell with navigation
- Responsive layout working on desktop and mobile
- Dashboard page with placeholder widgets

---

## Phase 2: Core Project Management (Weeks 4-7)

### Week 4 - Project CRUD & Project Types

**Goal**: Implement the core project entity with type-specific templates.

**Tasks**:
- [ ] Design project database schema:
  - `Project` - core entity with status workflow
  - `ProjectType` - enum: INTERIOR_DESIGN, CONFERENCE_DECOR, EXHIBITION, INSTALLATION, EXPERIENTIAL, OTHER
- [ ] Build project list page with filtering, sorting, and search
- [ ] Create project detail page with tabbed layout
- [ ] Implement project creation form with type-specific field templates
- [ ] Build project status workflow: DRAFT → ACTIVE → ON_HOLD → COMPLETED → ARCHIVED
- [ ] Add project cards with status badges, progress indicators
- [ ] Implement project archiving and soft-delete

**Agents**: `architect`, `fullstack-developer`, `ui-designer`

**Deliverables**:
- Full project CRUD with type-specific templates
- Project list with search/filter/sort
- Project detail page with status management

---

### Week 5 - Milestones & Task Management

**Goal**: Add milestone tracking and task management within projects.

**Tasks**:
- [ ] Design milestone schema:
  - `Milestone` - ordered phases within a project
  - `Task` - actionable items within milestones
- [ ] Build milestone timeline view (visual progress bar)
- [ ] Create milestone CRUD with drag-and-drop reordering
- [ ] Implement task list with status tracking (TODO, IN_PROGRESS, REVIEW, DONE)
- [ ] Add task assignment to team members
- [ ] Build due date tracking with overdue indicators
- [ ] Create milestone completion percentage calculation
- [ ] Link milestones to billing (milestone-based invoicing prep)

**Agents**: `fullstack-developer`, `ui-designer`

**Deliverables**:
- Milestone timeline within project detail
- Task management with assignments and status tracking
- Progress tracking and overdue alerts

---

### Week 6 - Team & Vendor Management

**Goal**: Build team assignment and vendor/subcontractor management.

**Tasks**:
- [ ] Implement team management:
  - Team CRUD within organizations
  - Member assignment with roles
  - Team-to-project assignment
- [ ] Design vendor schema:
  - `Vendor` - subcontractors, suppliers, service providers
  - `VendorContact` - contact persons
  - `VendorCategory` - FABRICATION, PRINTING, CATERING, AV, FLORAL, LIGHTING, etc.
- [ ] Build vendor directory with search and category filtering
- [ ] Create vendor detail page with project history
- [ ] Implement vendor assignment to projects
- [ ] Add vendor rating/notes system

**Agents**: `fullstack-developer`, `architect`

**Deliverables**:
- Team management with project assignments
- Vendor directory with categorization
- Vendor-project relationship tracking

---

### Week 7 - File Attachments & Activity Log

**Goal**: Add file management and activity tracking to projects.

**Tasks**:
- [ ] Implement file upload system (project attachments, mood boards, proposals)
- [ ] Build file gallery view with thumbnails
- [ ] Create activity log schema:
  - `ActivityLog` - tracks all entity changes
  - Actor, action, entity, timestamp, metadata
- [ ] Build activity feed component for project detail
- [ ] Add automated activity logging for key events (status changes, assignments, budget updates)
- [ ] Implement @mentions in project comments
- [ ] Create project notes/comments section

**Agents**: `fullstack-developer`, `devops-engineer`

**Deliverables**:
- File upload and gallery within projects
- Comprehensive activity log and feed
- Project comments with mentions

---

## Phase 3: Financial Core (Weeks 8-11)

### Week 8 - Budget Management

**Goal**: Implement project budget creation, category management, and variance tracking.

**Tasks**:
- [ ] Design budget schema:
  - `Budget` - linked to project, with total and status
  - `BudgetCategory` - categories with allocated amounts
  - Budget category structure per financial-domain-expert spec:
    - Design & Creative (15-25%)
    - Materials & Supplies (20-40%)
    - Vendor Services (15-30%)
    - Equipment Rental (5-15%)
    - Labor & Installation (15-25%)
    - Travel & Transport (5-10%)
    - Permits & Insurance (2-5%)
    - Contingency (10%)
- [ ] Build budget creation form with category templates per project type
- [ ] Implement budget summary dashboard (allocated vs. spent vs. remaining)
- [ ] Create budget variance analysis view
- [ ] Add contingency validation (8-15% of total)
- [ ] Implement budget approval workflow
- [ ] Store all monetary values as integers (cents) per financial best practices
- [ ] Use Decimal.js for complex financial calculations

**Agents**: `fullstack-developer`, `financial-domain-expert`, `architect`

**Deliverables**:
- Budget CRUD with category templates
- Budget vs. actual variance tracking
- Financial calculation accuracy (integer-based)

---

### Week 9 - Expense Tracking

**Goal**: Build expense entry, categorization, and approval workflows.

**Tasks**:
- [ ] Design expense schema:
  - `Expense` - with amount, category, date, vendor link
  - `ExpenseAttachment` - receipts and supporting docs
  - Status workflow: DRAFT → SUBMITTED → APPROVED → REJECTED → REIMBURSED
- [ ] Build expense entry form with receipt upload
- [ ] Create expense list with filtering by project, category, status, date range
- [ ] Implement expense approval workflow (role-based)
- [ ] Auto-link expenses to budget categories for variance tracking
- [ ] Build expense summary by category with chart visualization
- [ ] Add recurring expense support
- [ ] Implement expense export (CSV)

**Agents**: `fullstack-developer`, `financial-domain-expert`, `ui-designer`

**Deliverables**:
- Expense CRUD with receipt upload
- Approval workflow with role-based permissions
- Budget integration and variance updates

---

### Week 10 - Invoice Generation

**Goal**: Implement invoice creation, PDF generation, and email delivery.

**Tasks**:
- [ ] Design invoice schema:
  - `Invoice` - header with client info, terms, dates
  - `InvoiceLineItem` - line items with amounts
  - Status workflow per financial-domain-expert spec:
    - DRAFT → SENT → VIEWED → PARTIALLY_PAID → PAID
    - SENT → OVERDUE → WRITTEN_OFF
- [ ] Build invoice creation form with line item editor
- [ ] Implement payment terms: DUE_ON_RECEIPT, NET_15, NET_30, NET_60, MILESTONE
- [ ] Create PDF invoice generation with @react-pdf/renderer
- [ ] Implement invoice email delivery via Resend
- [ ] Build invoice list with status filtering and overdue highlighting
- [ ] Add invoice numbering system (configurable format)
- [ ] Implement payment recording (partial and full payments)
- [ ] Add invoice validation:
  - Line items sum to subtotal
  - Tax = round(subtotal * taxRate)
  - Total = subtotal + tax
  - Due date > invoice date

**Agents**: `fullstack-developer`, `financial-domain-expert`, `ui-designer`

**Deliverables**:
- Invoice CRUD with line items
- PDF generation and email delivery
- Payment tracking with partial payment support

---

### Week 11 - Payment Tracking & Accounts Receivable

**Goal**: Build payment recording, AR aging, and payment reminders.

**Tasks**:
- [ ] Implement payment recording against invoices
- [ ] Build accounts receivable aging report:
  - Current (not yet due)
  - 1-30 days overdue
  - 31-60 days overdue
  - 61-90 days overdue
  - 90+ days overdue (write-off risk)
- [ ] Create payment reminder system (automated emails)
- [ ] Implement overdue invoice detection (scheduled job)
- [ ] Build client statement generation (all invoices for a client)
- [ ] Add payment probability scoring per financial-domain-expert spec
- [ ] Create AR dashboard widget with aging visualization

**Agents**: `fullstack-developer`, `financial-domain-expert`

**Deliverables**:
- Payment recording and tracking
- AR aging report with risk indicators
- Automated overdue detection and reminders

---

## Phase 4: Reporting & Analytics (Weeks 12-14)

### Week 12 - Project Profitability & P&L

**Goal**: Build project-level profitability analysis and profit/loss reporting.

**Tasks**:
- [ ] Implement project profitability calculation:
  - Revenue (invoiced amounts, payments received)
  - Costs (expenses, vendor payments)
  - Gross margin calculation
  - Margin percentage
- [ ] Build profit & loss report:
  - Revenue by project/client/period
  - Expenses by category/project/period
  - Gross profit / net profit
- [ ] Create comparative P&L (period over period)
- [ ] Add project profitability dashboard widget
- [ ] Build data visualization charts (bar, line, pie charts)
- [ ] Implement report date range selection
- [ ] Add report export (PDF, CSV)

**Agents**: `fullstack-developer`, `financial-domain-expert`, `ui-designer`

**Deliverables**:
- Project profitability analysis
- P&L report with period comparison
- Dashboard charts and visualizations

---

### Week 13 - Cash Flow Forecasting

**Goal**: Implement cash flow forecasting with receivables probability modeling.

**Tasks**:
- [ ] Build cash flow forecast engine:
  - Expected inflows (invoices with payment probability)
  - Expected outflows (recurring expenses, upcoming vendor payments)
  - Net cash flow projection
- [ ] Implement payment probability algorithm per financial-domain-expert spec:
  - Not yet due: 90% probability
  - 1-30 days overdue: 70%
  - 31-60 days overdue: 50%
  - 60+ days overdue: 30%
- [ ] Create cash flow forecast visualization (12-week forward view)
- [ ] Add scenario modeling (best case / expected / worst case)
- [ ] Build cash flow dashboard widget
- [ ] Implement low cash balance alerts

**Agents**: `fullstack-developer`, `financial-domain-expert`

**Deliverables**:
- Cash flow forecast with probability weighting
- 12-week forward projection
- Scenario modeling and alerts

---

### Week 14 - Dashboard & KPIs

**Goal**: Complete the main dashboard with real-time KPIs and widgets.

**Tasks**:
- [ ] Build dashboard KPI widgets:
  - Active projects count and total value
  - Revenue this month / quarter / year
  - Outstanding invoices (amount and count)
  - Overdue invoices (amount and count)
  - Budget utilization across projects
  - Cash flow forecast summary
  - Project pipeline (by status)
- [ ] Create customizable dashboard layout (widget arrangement)
- [ ] Implement real-time data refresh with TanStack Query
- [ ] Add date range selector for KPI periods
- [ ] Build mini-charts for trend indicators
- [ ] Create role-specific dashboard views:
  - Admin: full financial overview
  - Manager: project-focused view
  - Finance: invoicing and cash flow
  - Member: assigned tasks and projects

**Agents**: `fullstack-developer`, `ui-designer`

**Deliverables**:
- Complete dashboard with KPI widgets
- Role-specific views
- Real-time data with trend indicators

---

## Phase 5: Polish & Production (Weeks 15-18)

### Week 15 - Search, Filters & Bulk Operations

**Goal**: Enhance usability with global search, advanced filters, and bulk actions.

**Tasks**:
- [ ] Implement global search (projects, invoices, vendors, expenses)
- [ ] Build advanced filter system with saved filter presets
- [ ] Add bulk operations:
  - Bulk expense approval
  - Bulk invoice sending
  - Bulk project status updates
- [ ] Implement data export across all modules (CSV, PDF)
- [ ] Add keyboard shortcuts for power users
- [ ] Build notification system (in-app notifications)
- [ ] Implement email notifications for key events

**Agents**: `fullstack-developer`, `ui-designer`

**Deliverables**:
- Global search across all entities
- Advanced filtering with presets
- Bulk operations and exports

---

### Week 16 - Testing & Quality Assurance

**Goal**: Comprehensive testing coverage and bug fixing.

**Tasks**:
- [ ] Write unit tests for all financial calculations (budget, invoice, cash flow)
- [ ] Create integration tests for API routes
- [ ] Build E2E tests for critical user flows:
  - User registration and login
  - Project creation with budget
  - Expense entry and approval
  - Invoice creation, sending, and payment
- [ ] Perform accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Performance testing and optimization
- [ ] Security audit:
  - SQL injection protection (Prisma parameterized queries)
  - XSS prevention
  - CSRF protection
  - Auth bypass testing
  - Financial data integrity validation

**Agents**: `qa-expert`, `security-auditor`, `code-reviewer`

**Deliverables**:
- >80% test coverage on financial modules
- E2E tests for critical flows
- Security audit report with remediations

---

### Week 17 - Performance, SEO & Optimization

**Goal**: Optimize performance, implement caching, and prepare for production.

**Tasks**:
- [ ] Implement database query optimization:
  - Add indexes for common queries
  - Optimize N+1 queries with Prisma includes
  - Add pagination to all list endpoints
- [ ] Set up caching strategy (TanStack Query stale times)
- [ ] Implement image optimization (Next.js Image component)
- [ ] Add loading state optimizations (optimistic updates)
- [ ] Configure Next.js static generation where applicable
- [ ] Set up error tracking (Sentry or similar)
- [ ] Implement rate limiting on API routes
- [ ] Add request logging and monitoring

**Agents**: `devops-engineer`, `fullstack-developer`

**Deliverables**:
- Optimized database queries with proper indexing
- Caching and performance improvements
- Error tracking and monitoring setup

---

### Week 18 - Deployment & Launch

**Goal**: Deploy to production and prepare for launch.

**Tasks**:
- [ ] Set up production infrastructure:
  - Production PostgreSQL database (e.g., Supabase, Neon, or RDS)
  - Hosting platform (Vercel)
  - Environment variable configuration
- [ ] Configure CI/CD pipeline:
  - Automated tests on PR
  - Preview deployments for branches
  - Production deployment on merge to main
- [ ] Set up database backup strategy
- [ ] Configure custom domain and SSL
- [ ] Implement health check endpoints
- [ ] Create admin seeding script (initial organization + admin user)
- [ ] Write deployment documentation
- [ ] Final smoke test on production
- [ ] Launch!

**Agents**: `devops-engineer`, `security-auditor`

**Deliverables**:
- Production deployment on Vercel
- CI/CD pipeline with automated testing
- Database backups and monitoring
- Launch-ready application

---

## Development Conventions

### Code Style
| Convention | Standard |
|------------|----------|
| Language | TypeScript (strict mode) |
| Components | Functional, PascalCase |
| Functions | camelCase |
| Constants | SCREAMING_SNAKE_CASE |
| Component files | kebab-case.tsx |
| Utility files | kebab-case.ts |
| Type files | kebab-case.types.ts |

### No-Emoji Policy (STRICT)
- **Emojis are strictly prohibited** across the entire codebase and application
- Applies to: source code, UI text, comments, commit messages, documentation, log messages, error messages, toast notifications, placeholder text, database seeds, and test descriptions
- Use `lucide-react` icons for visual indicators in the UI
- Use shadcn/ui badge variants and color-coded status dots for status displays
- Use plain descriptive text for all labels and messages
- Enforced by a custom ESLint `no-emoji` rule that runs in CI and pre-commit hooks
- See `CLAUDE.md` and `.eslintrc.emoji.js` for full details

### Financial Rules
- All monetary values stored as **integers (cents)**
- Use **Decimal.js** for complex calculations
- Rounding: **round half up**
- Financial records are **soft-deleted** (never hard-delete)
- All changes to financial data create **audit trail** entries

### API Conventions
- All routes validate input with **Zod**
- All routes check **authentication** and **authorization**
- All queries scope to **organizationId** for multi-tenancy
- Error responses follow consistent format
- Financial endpoints require **ADMIN** or **FINANCE** role

### RBAC Permission Matrix

| Feature / Action | ADMIN | MANAGER | FINANCE | MEMBER | VIEWER |
|-----------------|:-----:|:-------:|:-------:|:------:|:------:|
| **Organization** | | | | | |
| View org settings | Yes | No | No | No | No |
| Edit org settings | Yes | No | No | No | No |
| Manage users/roles | Yes | No | No | No | No |
| **Projects** | | | | | |
| Create project | Yes | Yes | No | No | No |
| Edit project | Yes | Yes | No | No | No |
| Delete/archive project | Yes | Yes | No | No | No |
| View all projects | Yes | Yes | Yes | No | No |
| View assigned projects | Yes | Yes | Yes | Yes | Yes |
| Change project status | Yes | Yes | No | No | No |
| **Milestones & Tasks** | | | | | |
| Create/edit milestones | Yes | Yes | No | No | No |
| Create tasks | Yes | Yes | No | Yes | No |
| Edit own tasks | Yes | Yes | No | Yes | No |
| Edit any task | Yes | Yes | No | No | No |
| Assign tasks to others | Yes | Yes | No | No | No |
| Update task status | Yes | Yes | No | Yes | No |
| **Teams** | | | | | |
| Create/edit teams | Yes | Yes | No | No | No |
| Assign members to teams | Yes | Yes | No | No | No |
| View team members | Yes | Yes | Yes | Yes | Yes |
| **Vendors** | | | | | |
| Create/edit vendors | Yes | Yes | Yes | No | No |
| Delete vendors | Yes | No | No | No | No |
| View vendor directory | Yes | Yes | Yes | Yes | Yes |
| Assign vendors to projects | Yes | Yes | No | No | No |
| **Budgets** | | | | | |
| Create budget | Yes | Yes | Yes | No | No |
| Edit budget categories | Yes | Yes | Yes | No | No |
| Approve budget | Yes | No | Yes | No | No |
| View budget | Yes | Yes | Yes | Yes | Yes |
| View budget details (amounts) | Yes | Yes | Yes | No | No |
| **Expenses** | | | | | |
| Submit expense | Yes | Yes | Yes | Yes | No |
| Edit own expense (draft) | Yes | Yes | Yes | Yes | No |
| Approve/reject expenses | Yes | Yes | Yes | No | No |
| Cannot self-approve | -- | -- | -- | -- | -- |
| View all expenses | Yes | Yes | Yes | No | No |
| View own expenses | Yes | Yes | Yes | Yes | No |
| Export expenses (CSV) | Yes | Yes | Yes | No | No |
| **Invoices** | | | | | |
| Create invoice | Yes | No | Yes | No | No |
| Edit draft invoice | Yes | No | Yes | No | No |
| Send invoice | Yes | No | Yes | No | No |
| Record payment | Yes | No | Yes | No | No |
| Void/write-off invoice | Yes | No | Yes | No | No |
| View all invoices | Yes | Yes | Yes | No | No |
| **Reports & Dashboard** | | | | | |
| View full financial dashboard | Yes | No | Yes | No | No |
| View project-focused dashboard | Yes | Yes | No | No | No |
| View member dashboard | Yes | Yes | Yes | Yes | Yes |
| P&L reports | Yes | No | Yes | No | No |
| Cash flow forecast | Yes | No | Yes | No | No |
| Project profitability | Yes | Yes | Yes | No | No |
| Export reports (PDF/CSV) | Yes | Yes | Yes | No | No |
| **Files & Activity** | | | | | |
| Upload files | Yes | Yes | Yes | Yes | No |
| Delete files | Yes | Yes | No | No | No |
| View activity feed | Yes | Yes | Yes | Yes | Yes |
| Post comments | Yes | Yes | Yes | Yes | No |
| **System** | | | | | |
| View audit log | Yes | No | Yes | No | No |
| Manage integrations | Yes | No | No | No | No |
| Bulk operations | Yes | Yes | Yes | No | No |

**Key rules:**
- Expense submitter cannot approve their own expense (enforced server-side)
- Financial data (exact amounts) hidden from MEMBER and VIEWER roles
- All data queries scoped by organizationId regardless of role
- ADMIN has full access to everything within their organization
- VIEWER is read-only across all features they can access

### Agent Workflows (Corrected)

| Workflow | Pipeline |
|----------|----------|
| Feature Development | architect - fullstack-developer - qa-expert - code-reviewer - security-auditor (conditional) |
| Financial Module | architect - fullstack-developer - financial-domain-expert - qa-expert - code-reviewer - security-auditor |
| UI Development | ui-designer - fullstack-developer - qa-expert - code-reviewer |
| Code Review | code-reviewer - security-auditor |
| Deployment | devops-engineer - security-auditor - qa-expert |
| Database Migration | architect - fullstack-developer - qa-expert - security-auditor |
| Documentation | architect - fullstack-developer - code-reviewer |
| Performance Optimization | fullstack-developer - devops-engineer - qa-expert |
| Hotfix/Incident | fullstack-developer - qa-expert - security-auditor - devops-engineer |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Financial calculation errors | High | Integer storage, Decimal.js, extensive unit tests, financial-domain-expert review |
| Data leakage between organizations | Critical | organizationId on all queries, middleware enforcement, security audit |
| Invoice PDF rendering issues | Medium | Test with various data lengths, cross-browser PDF preview |
| Performance with large datasets | Medium | Pagination, indexed queries, caching strategy |
| Auth bypass | Critical | NextAuth.js, middleware checks, security-auditor review on all auth code |

---

## Success Metrics

- **Budget accuracy**: Variance between budget and actual < 5% calculation error
- **Invoice delivery**: 99%+ successful email delivery rate
- **Page load time**: < 2 seconds for dashboard, < 1 second for list pages
- **Test coverage**: > 80% on financial modules, > 60% overall
- **Accessibility**: WCAG 2.1 AA compliance
- **Uptime**: 99.9% availability target

---

## Post-MVP Feature Roadmap

Features deferred from MVP scope, organized by priority and estimated effort.

### Priority 1 - Near-Term (Post-Launch Quarter 1)

| Feature | Description | Estimated Effort | Dependencies |
|---------|-------------|-----------------|--------------|
| Client Portal | Read-only client-facing views for project status, invoices, and shared files | 3-4 weeks | Auth system extension, new role type |
| Kanban Task View | Drag-and-drop Kanban board for tasks (column per status) | 1 week | Task status already supports it |
| Calendar/Scheduling View | Calendar view of milestones, tasks, and deadlines | 2 weeks | Milestone and task data |
| Recurring Invoices | Auto-generate invoices on a schedule (monthly retainers) | 2 weeks | Invoice system |
| Time Tracking | Track hours per task/project for billing and profitability | 3 weeks | Task system, new schema |

### Priority 2 - Medium-Term (Post-Launch Quarter 2)

| Feature | Description | Estimated Effort | Dependencies |
|---------|-------------|-----------------|--------------|
| Payment Processing (Stripe) | Accept online payments via invoice links | 3-4 weeks | Invoice system, Stripe integration |
| Proposal/Quote Generation | Create and send project proposals with approval workflow | 3 weeks | Client data, PDF generation |
| Gantt Chart with Dependencies | Interactive Gantt view with task dependencies | 3-4 weeks | Task/milestone system, charting library |
| Credit Notes / Refunds | Issue credit notes against invoices, track refunds | 2 weeks | Invoice + payment system |
| Multi-Currency Support | Support invoicing and expenses in multiple currencies | 3 weeks | Financial system refactor, exchange rate API |
| Resource/Capacity Planning | Team workload visualization, availability tracking | 3-4 weeks | Team + task assignment data |

### Priority 3 - Long-Term (Post-Launch Quarter 3+)

| Feature | Description | Estimated Effort | Dependencies |
|---------|-------------|-----------------|--------------|
| Accounting Integration (QuickBooks/Xero) | Sync invoices, expenses, and payments to accounting software | 4-6 weeks | Financial data, OAuth + API integration |
| API Documentation / Webhooks | Public REST API with docs, webhook subscriptions for events | 3-4 weeks | API stabilization |
| Mobile App (React Native) | Native mobile companion for field teams | 8-12 weeks | API layer, auth tokens |
| AI-Powered Insights | Budget prediction, project risk scoring, anomaly detection | 4-6 weeks | Historical data, ML pipeline |
| Custom Fields | User-defined fields on projects, tasks, vendors | 3 weeks | Schema extension, dynamic forms |
| White-Label / Multi-Brand | Customize branding per organization | 2-3 weeks | Theming system, asset management |

### Feature Request Tracking

Future feature requests should be tracked in GitHub Issues with the label `roadmap` and categorized by priority tier. Each request should include:
- User story / use case
- Impact assessment (number of users affected)
- Technical complexity estimate
- Dependencies on existing features
- Revenue/retention impact estimate
