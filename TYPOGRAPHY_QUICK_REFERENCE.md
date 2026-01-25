# 📝 Typography Quick Reference

## Font Sizes (Desktop → Mobile)

```
Display:  64px → 40px  (Hero text)
H1:       32px → 24px  (Page titles)
H2:       28px → 22px  (Section titles)
H3:       24px → 20px  (Subsections)
H4:       20px → 18px  (Card titles)
H5:       18px → 16px  (Small titles)
H6:       16px → 14px  (Smallest heading)
Body:     16px → 15px  (Base text)
Small:    14px → 13px  (Secondary text)
Caption:  12px → 11px  (Timestamps)
Overline: 11px → 11px  (Labels)
Button:   14px → 14px  (Buttons)
Input:    16px → 16px  (Form fields)
```

## CSS Variables

```css
/* Sizes */
var(--font-h1)
var(--font-h2)
var(--font-h3)
var(--font-body)
var(--font-body-small)
var(--font-caption)
var(--font-button)

/* Weights */
var(--font-weight-regular)    /* 400 */
var(--font-weight-medium)     /* 500 */
var(--font-weight-semibold)   /* 600 */
var(--font-weight-bold)       /* 700 */

/* Line Heights */
var(--line-height-tight)      /* 1.2 - Headings */
var(--line-height-normal)     /* 1.5 - Body */
var(--line-height-relaxed)    /* 1.75 - Content */

/* Letter Spacing */
var(--letter-spacing-tight)   /* -0.8px - Large headings */
var(--letter-spacing-normal)  /* 0px - Most text */
var(--letter-spacing-wide)    /* 0.5px - Labels */
```

## MUI Typography Variants

```jsx
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2">Section</Typography>
<Typography variant="h3">Subsection</Typography>
<Typography variant="h4">Card Title</Typography>
<Typography variant="h5">Small Title</Typography>
<Typography variant="h6">Smallest Heading</Typography>
<Typography variant="body1">Main Text</Typography>
<Typography variant="body2">Secondary Text</Typography>
<Typography variant="caption">Small Caption</Typography>
<Typography variant="overline">LABEL</Typography>
<Typography variant="subtitle1">Emphasized</Typography>
<Typography variant="subtitle2">Small Subtitle</Typography>
```

## Utility Classes

```html
<!-- Sizes -->
<div class="text-h1">Large Heading</div>
<div class="text-h2">Medium Heading</div>
<div class="text-body">Body Text</div>
<div class="text-body-small">Small Text</div>
<div class="text-caption">Tiny Text</div>

<!-- Weights -->
<span class="font-regular">Regular (400)</span>
<span class="font-medium">Medium (500)</span>
<span class="font-semibold">Semibold (600)</span>
<span class="font-bold">Bold (700)</span>

<!-- Line Heights -->
<p class="leading-tight">Tight spacing</p>
<p class="leading-normal">Normal spacing</p>
<p class="leading-relaxed">Relaxed spacing</p>

<!-- Letter Spacing -->
<span class="tracking-tight">Tight</span>
<span class="tracking-normal">Normal</span>
<span class="tracking-wide">Wide</span>

<!-- Alignment -->
<div class="text-left">Left</div>
<div class="text-center">Center</div>
<div class="text-right">Right</div>

<!-- Transform -->
<span class="text-uppercase">UPPERCASE</span>
<span class="text-capitalize">Capitalize</span>
<span class="text-lowercase">lowercase</span>
```

## Common Patterns

### Page Header
```jsx
<Typography variant="h1" className="font-bold">
  Dashboard
</Typography>
```

### Card Title
```jsx
<Typography variant="h4" className="font-semibold">
  Total Users
</Typography>
```

### Body Text
```jsx
<Typography variant="body1">
  This is the main content text.
</Typography>
```

### Secondary Text
```jsx
<Typography variant="body2" color="textSecondary">
  Additional information
</Typography>
```

### Timestamp
```jsx
<Typography variant="caption" color="textSecondary">
  2 hours ago
</Typography>
```

### Label
```jsx
<Typography variant="overline" color="textSecondary">
  Status
</Typography>
```

### Button
```jsx
<Button variant="contained">
  Save Changes
</Button>
<!-- Font: 14px, Weight: 600 -->
```

### Table Header
```jsx
<TableCell>
  <span className="font-bold">Name</span>
</TableCell>
<!-- Font: 14px, Weight: 700 -->
```

### Chip
```jsx
<Chip label="Active" />
<!-- Font: 12px, Weight: 600 -->
```

## Rules

✅ **DO:**
- Use CSS variables: `var(--font-h1)`
- Use MUI Typography components
- Use utility classes for quick styling
- Test on mobile (<1024px)
- Keep text hierarchy clear

❌ **DON'T:**
- Hardcode sizes: `font-size: 17px`
- Use random weights
- Create custom sizes
- Ignore mobile scaling
- Mix different systems

## Breakpoint: 1024px

All typography automatically scales on mobile devices below 1024px.

---

**Quick Tip**: Use browser DevTools to inspect any text element and see which CSS variable it uses.

**Last Updated**: January 25, 2026
