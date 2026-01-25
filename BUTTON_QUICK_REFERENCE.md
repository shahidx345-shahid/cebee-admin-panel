# 🎨 Button System Quick Reference

## Button Sizes (Desktop → Mobile)

```
Small:  32px → 36px  (Compact actions)
Medium: 40px → 44px  (Default, most common)
Large:  48px → 52px  (Primary CTAs)
```

## Icon Button Sizes (Desktop → Mobile)

```
Small:  32×32px → 36×36px
Medium: 40×40px → 44×44px
Large:  48×48px → 52×52px
```

## CSS Variables

```css
/* Heights */
var(--button-height-small)     /* 32px → 36px */
var(--button-height-medium)    /* 40px → 44px */
var(--button-height-large)     /* 48px → 52px */

/* Padding */
var(--button-padding-small)    /* 6px 16px → 8px 16px */
var(--button-padding-medium)   /* 10px 24px */
var(--button-padding-large)    /* 12px 32px → 14px 32px */

/* Border Radius */
var(--button-radius-small)     /* 8px */
var(--button-radius-medium)    /* 10px */
var(--button-radius-large)     /* 12px */
var(--button-radius-rounded)   /* 100px (pill shape) */

/* Icon Sizes */
var(--button-icon-small)       /* 16px */
var(--button-icon-medium)      /* 20px */
var(--button-icon-large)       /* 24px */
```

## MUI Button Variants

```jsx
// Contained (Filled) - Primary actions
<Button variant="contained" color="primary">
  Primary Action
</Button>

// Outlined - Secondary actions
<Button variant="outlined" color="primary">
  Secondary Action
</Button>

// Text (Ghost) - Tertiary actions
<Button variant="text" color="primary">
  Tertiary Action
</Button>
```

## Button Sizes

```jsx
// Small (32px)
<Button size="small" variant="contained">
  Small Button
</Button>

// Medium (40px) - Default
<Button variant="contained">
  Medium Button
</Button>

// Large (48px)
<Button size="large" variant="contained">
  Large Button
</Button>
```

## Buttons with Icons

```jsx
import { Save, ArrowForward, Delete } from '@mui/icons-material';

// Start Icon
<Button variant="contained" startIcon={<Save />}>
  Save
</Button>

// End Icon
<Button variant="contained" endIcon={<ArrowForward />}>
  Next
</Button>

// Icon Only
<IconButton color="primary">
  <Delete />
</IconButton>
```

## Icon Button Sizes

```jsx
// Small (32×32px)
<IconButton size="small">
  <Edit />
</IconButton>

// Medium (40×40px) - Default
<IconButton>
  <Edit />
</IconButton>

// Large (48×48px)
<IconButton size="large">
  <Edit />
</IconButton>
```

## Color Variants

```jsx
<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="success">Success</Button>
<Button variant="contained" color="error">Error</Button>
<Button variant="contained" color="warning">Warning</Button>
<Button variant="contained" color="info">Info</Button>
```

## Utility Classes

```html
<!-- Size Classes -->
<button class="btn-small">Small</button>
<button class="btn-medium">Medium</button>
<button class="btn-large">Large</button>

<!-- Shape Classes -->
<button class="btn-rounded">Rounded Pill</button>
<button class="btn-square">Square</button>

<!-- Width Classes -->
<button class="btn-full-width">Full Width</button>

<!-- Icon Button Classes -->
<button class="icon-btn-small">Icon</button>
<button class="icon-btn-medium">Icon</button>
<button class="icon-btn-large">Icon</button>
```

## Button Groups

```jsx
import { ButtonGroup } from '@mui/material';

<ButtonGroup variant="contained">
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>
```

## Full Width Buttons

```jsx
<Button variant="contained" fullWidth>
  Full Width Button
</Button>
```

## Disabled Buttons

```jsx
<Button variant="contained" disabled>
  Disabled Button
</Button>
```

## Loading Buttons

```jsx
import { LoadingButton } from '@mui/lab';

<LoadingButton 
  loading 
  variant="contained"
  loadingPosition="start"
  startIcon={<Save />}
>
  Saving...
</LoadingButton>
```

## Common Patterns

### Form Actions
```jsx
<Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
  <Button variant="contained" color="primary" size="large">
    Submit
  </Button>
  <Button variant="outlined" size="large">
    Cancel
  </Button>
</Box>
```

### Toolbar Actions
```jsx
<Box sx={{ display: 'flex', gap: 1 }}>
  <Button variant="contained" size="small" startIcon={<Add />}>
    Add New
  </Button>
  <IconButton size="small">
    <Refresh />
  </IconButton>
  <IconButton size="small">
    <MoreVert />
  </IconButton>
</Box>
```

### Card Actions
```jsx
<CardActions>
  <Button size="small">View Details</Button>
  <Button size="small">Share</Button>
</CardActions>
```

### Stacked Buttons (Mobile)
```jsx
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2 
}}>
  <Button variant="contained" fullWidth>Primary</Button>
  <Button variant="outlined" fullWidth>Secondary</Button>
</Box>
```

## Accessibility

```jsx
// Icon buttons need aria-label
<IconButton aria-label="delete">
  <Delete />
</IconButton>

// Disabled state
<Button disabled aria-label="submit form">
  Submit
</Button>

// Loading state
<Button disabled aria-busy="true">
  Loading...
</Button>
```

## Spacing Guidelines

```
Tight:    gap: 1  (8px)  - Button groups, toolbars
Normal:   gap: 2  (12px) - Form buttons, action bars
Relaxed:  gap: 3  (16px) - Section actions, CTAs
```

## Button Hierarchy

```
1. Primary (Contained)   ━━━ Main action
2. Secondary (Outlined)  ━━━ Alternative action
3. Tertiary (Text)       ━━━ Minimal action
4. Icon Button           ━━━ Utility action
```

## Rules

✅ **DO:**
- Use size variants (small/medium/large)
- Use proper color for context
- Add icons for clarity
- Provide aria-labels for icon buttons
- Test on mobile (44px minimum)

❌ **DON'T:**
- Hardcode button sizes
- Mix different styles
- Create buttons smaller than 32px
- Ignore accessibility
- Use too many primary buttons

## Responsive Breakpoint: 1024px

All buttons automatically scale to touch-friendly sizes on mobile (<1024px).

---

**Quick Tip**: Use `size="medium"` (default) for most buttons. Reserve `large` for primary CTAs and `small` for compact UIs.

**Last Updated**: January 25, 2026
