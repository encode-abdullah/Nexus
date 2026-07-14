# Design System & Visual Guidelines

## Color Theme

### Primary (Blue)
Used for: primary buttons, links, active states, focus rings, brand accents

| Shade | Hex | Usage |
|---|---|---|
| 50 | #EFF6FF | Light backgrounds |
| 100 | #DBEAFE | Hover backgrounds, icon backgrounds |
| 200 | #BFDBFE | Borders |
| 300 | #93C5FD | Light text on dark |
| 400 | #60A5FA | Icons, dark mode accents |
| 500 | #3B82F6 | Base primary color |
| 600 | #2563EB | Primary buttons, active states |
| 700 | #1D4ED8 | Button hover states |
| 800 | #1E40AF | Dark mode backgrounds |
| 900 | #1E3A8A | Dark mode text, stat cards |

### Secondary (Teal)
Used for: secondary buttons, connections, related actions

| Shade | Hex | Usage |
|---|---|---|
| 50 | #F0FDFA | Light backgrounds |
| 100 | #CCFBF1 | Icon backgrounds |
| 500 | #14B8A6 | Base secondary color |
| 600 | #0D9488 | Secondary buttons |
| 700 | #0F766E | Button hover |

### Accent (Amber)
Used for: accent elements, highlights, calendar events

| Shade | Hex | Usage |
|---|---|---|
| 50 | #FFFBEB | Light backgrounds |
| 100 | #FEF3C7 | Icon backgrounds |
| 500 | #F59E0B | Base accent color |
| 600 | #D97706 | Accent buttons |
| 700 | #B45309 | Button hover |

### Success (Green)
Used for: success messages, positive actions, completed states

| Shade | Hex |
|---|---|
| 50 | #F0FDF4 |
| 500 | #22C55E |
| 700 | #15803D |

### Warning (Amber)
Used for: warning messages, pending states

| Shade | Hex |
|---|---|
| 50 | #FFFBEB |
| 500 | #F59E0B |
| 700 | #B45309 |

### Error (Red)
Used for: error messages, destructive actions, failed states

| Shade | Hex |
|---|---|
| 50 | #FEF2F2 |
| 500 | #EF4444 |
| 700 | #B91C1C |

### Neutral (Gray)
Used for: text, borders, backgrounds, disabled states

| Shade | Hex | Usage |
|---|---|---|
| 50 | #F9FAFB | Page background |
| 100 | #F3F4F6 | Card backgrounds |
| 200 | #E5E7EB | Borders, dividers |
| 300 | #D1D5DB | Disabled borders |
| 400 | #9CA3AF | Placeholder text, icons |
| 500 | #6B7280 | Secondary text |
| 600 | #4B5563 | Body text |
| 700 | #374151 | Headings |
| 800 | #1F2937 | Dark mode backgrounds |
| 900 | #111827 | Primary text, dark mode body |

## Dark Mode

Dark mode uses the `class` strategy. When the `dark` class is applied to the root element:

| Light | Dark |
|---|---|
| bg-white | dark:bg-gray-800 |
| bg-gray-50 | dark:bg-gray-800 |
| bg-gray-100 | dark:bg-gray-700 |
| text-gray-900 | dark:text-gray-100 |
| text-gray-700 | dark:text-gray-300 |
| text-gray-600 | dark:text-gray-400 |
| text-gray-500 | dark:text-gray-400 |
| border-gray-200 | dark:border-gray-700 |
| border-gray-300 | dark:border-gray-600 |

Colored backgrounds use opacity in dark mode:
- `bg-primary-50` becomes `dark:bg-primary-900/20`
- `bg-green-50` becomes `dark:bg-green-900/30`

## Typography

### Font Family
- **Primary:** Inter (loaded via Google Fonts / rsms.me CDN)
- **Fallback:** system-ui, -apple-system, sans-serif

### Font Sizes
| Class | Size | Weight | Usage |
|---|---|---|---|
| text-xs | 0.75rem (12px) | 400 | Metadata, timestamps |
| text-sm | 0.875rem (14px) | 400/500 | Secondary text, labels |
| text-base | 1rem (16px) | 400 | Body text |
| text-lg | 1.125rem (18px) | 500/600 | Section headings |
| text-xl | 1.25rem (20px) | 600/700 | Page titles |
| text-2xl | 1.5rem (24px) | 700 | Main headings |
| text-4xl | 2.25rem (36px) | 700 | Hero numbers (balance) |

## Spacing & Layout

### Page Layout
- Max content width: `max-w-7xl` (1280px) centered
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `space-y-6` (24px between sections)
- Card padding: `p-6` (24px)

### Grid System
- Dashboard stat cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- Content + sidebar: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- Two-column content: `grid grid-cols-1 lg:grid-cols-2 gap-6`

### Border Radius
| Class | Size | Usage |
|---|---|---|
| rounded-md | 6px | Buttons, inputs, badges |
| rounded-lg | 8px | Cards, modals |
| rounded-full | 9999px | Avatars, icon circles |

## Shadows
| Class | Usage |
|---|---|
| shadow-sm | Cards, dropdowns |
| shadow-md | Navbar |
| shadow-lg | Modals (implicit) |

## Animations
| Name | Effect | Duration |
|---|---|---|
| fade-in | Opacity 0 to 1 | 0.5s ease-in-out |
| slide-in | translateY(10px) + opacity to translateY(0) + opacity 1 | 0.3s ease-out |

## Component Patterns

### Buttons
- Primary: `bg-primary-600 text-white hover:bg-primary-700`
- Outline: `border border-gray-300 text-gray-700 hover:bg-gray-50`
- Ghost: `text-gray-500 hover:text-gray-700 hover:bg-gray-100`
- Sizes: sm (8px 12px), md (10px 16px), lg (12px 24px)

### Cards
- Default: `bg-white rounded-lg shadow-sm border border-gray-200`
- Colored: Add background color class (e.g., `bg-primary-50`)

### Inputs
- Default: `w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500`
- Dark mode: Add `dark:bg-gray-700 dark:border-gray-600 dark:text-white`

### Badges
- Use semantic variants: primary, secondary, accent, success, warning, error, gray
- Sizes: sm (text-xs, px-2 py-0.5), md (text-sm, px-2.5 py-0.5)
