---
name: ui-ux-pro-max
description: Design intelligence for building professional UI/UX. Provides 67 UI styles, 100 industry-specific reasoning rules, 96 color palettes, and support for 13 tech stacks. Use when designing new UI components, selecting typography/colors, reviewing code for UX issues, building landing pages/dashboards, or implementing accessibility.
---

# UI/UX Pro Max — Design Intelligence

Reference these guidelines when designing new UI components, selecting typography/colors, reviewing code for UX issues, building landing pages/dashboards, or implementing accessibility requirements.

## Rule Categories by Priority

### 1. Accessibility (CRITICAL)
- Color contrast minimum 4.5:1 ratio (WCAG AA)
- Visible focus states on all interactive elements
- Alt text on all images
- ARIA labels where needed
- Full keyboard navigation support
- Form labels associated with inputs

### 2. Touch & Interaction (CRITICAL)
- 44x44px minimum touch targets
- Tap-based interactions for mobile
- Loading button states (disable + spinner)
- Immediate error feedback
- `cursor: pointer` on all clickable elements

### 3. Performance (HIGH)
- Image optimization: WebP format, srcset for responsive
- Respect `prefers-reduced-motion` media query
- Prevent layout shift (reserve space for async content)

### 4. Layout & Responsive (HIGH)
- Viewport meta tag always present
- 16px minimum body text on mobile
- No horizontal scroll
- z-index management (layered system)
- Floating navbar styling with backdrop-blur

### 5. Typography & Color (MEDIUM)
- Line height 1.5–1.75 for body text
- 65–75 character line length for readability
- Font pairing harmony (display + body)
- Dominant colors with sharp accents > evenly distributed palettes

### 6. Animation (MEDIUM)
- 150–300ms for micro-interactions
- Use `transform` and `opacity` for GPU-accelerated performance
- Loading state indicators on async operations
- Smooth 200ms transitions on hover states

### 7. Style Selection (MEDIUM)
- Match style to product type and industry
- Consistency across all pages
- SVG icons instead of emojis
- Correct brand logos and consistent icon sizing

### 8. Charts & Data Visualization (LOW)
- Chart type must match data type
- Accessible color palettes for charts
- Consider table alternatives for small datasets

## Workflow

### Step 1: Analyze User Requirements
Extract: product type, style keywords, industry, technology stack.

### Step 2: Generate Design System
Create a cohesive design system including:
- **Pattern**: Layout and component structure
- **Style**: Visual aesthetic direction
- **Colors**: Primary, secondary, accent, background, text
- **Typography**: Font pairing (display + body)
- **Effects**: Shadows, gradients, blur, borders
- **Anti-patterns**: What to explicitly avoid

### Step 3: Domain-Specific Research
Search for specifics in these domains when needed:
- **product** — Product type recommendations
- **style** — UI styles, colors, effects
- **typography** — Font pairings, Google Fonts
- **color** — Color palettes by product type
- **landing** — Page structure, CTA strategies
- **chart** — Chart types and library recommendations
- **ux** — Best practices and anti-patterns
- **react** — Performance optimization
- **web** — Interface guidelines

### Step 4: Stack Guidelines
Default to `html-tailwind` if unspecified. Available stacks:
React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, shadcn/ui, Jetpack Compose

## Common Professional UI Rules

### Icons & Elements
- Use SVG icons (never emojis in production)
- Stable hover states (no layout jumping)
- Correct brand logos
- Consistent icon sizing across components

### Interaction
- `cursor: pointer` on all clickable elements
- Visual feedback on every interaction
- Smooth 200ms transitions
- Disabled state styling for inactive elements

### Light/Dark Mode
- Light: `bg-white/80` glass cards, `#0F172A` text, `#475569` min muted text
- Dark: appropriate contrast ratios maintained
- CSS variables for theme switching

### Layout
- Floating navbar with backdrop-blur
- Reserve space for async content (prevent CLS)
- Readable font sizes (never below 14px)
- Consistent spacing scale

## Pre-Delivery Checklist

### Visual Quality
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Typography is readable and harmonious
- [ ] Spacing is consistent
- [ ] No layout shifts during loading

### Interaction
- [ ] All clickables have pointer cursor
- [ ] Hover/focus states on interactive elements
- [ ] Loading states on async actions
- [ ] Error states with clear feedback

### Light/Dark Mode
- [ ] Both modes tested
- [ ] Contrast maintained in both modes
- [ ] No invisible text in either mode

### Layout
- [ ] Responsive across breakpoints
- [ ] No horizontal overflow
- [ ] Touch targets 44px minimum
- [ ] Keyboard navigable

### Accessibility
- [ ] Screen reader tested
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Alt text on images
