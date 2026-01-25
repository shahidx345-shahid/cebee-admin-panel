# 🎨 Button System Documentation

## Overview

The CeeBee Predict Admin Panel uses a **standardized button system** with consistent sizes, styles, and behavior across all components. This ensures uniform appearance, better UX, and easy maintenance.

---

## 🎯 Design Principles

1. **Uniform Heights**: All buttons of the same size have identical heights
2. **Consistent Padding**: Standard horizontal padding for all button types
3. **Touch-Friendly**: Minimum 44px height on mobile devices
4. **Accessible**: Proper contrast ratios and focus states
5. **Responsive**: Automatically scales for mobile devices

---

## 📐 Button Sizes

### Desktop Sizes

| Size | Height | Padding | Font Size | Border Radius | Use Case |
|------|--------|---------|-----------|---------------|----------|
| **Small** | 32px | 6px 16px | 12px | 8px | Compact actions, dense UIs |
| **Medium** | 40px | 10px 24px | 14px | 10px | **Default**, most common |
| **Large** | 48px | 12px 32px | 16px | 12px | Primary CTAs, emphasis |

### Mobile Sizes (<1024px)

| Size | Height | Padding | Touch-Friendly |
|------|--------|---------|----------------|
| **Small** | 36px | 8px 16px | ✅ |
| **Medium** | 44px | 10px 24px | ✅ Apple/Android standard |
| **Large** | 52px | 14px 32px | ✅ |

---

## 🔘 Icon Button Sizes

### Desktop Sizes

| Size | Width × Height | Icon Size | Border Radius |
|------|----------------|-----------|---------------|
| **Small** | 32px × 32px | 16px | 8px |
| **Medium** | 40px × 40px | 20px | 10px |
| **Large** | 48px × 48px | 24px | 12px |

### Mobile Sizes (<1024px)

| Size | Width × Height | Touch-Friendly |
|------|----------------|----------------|
| **Small** | 36px × 36px | ✅ |
| **Medium** | 44px × 44px | ✅ Standard |
| **Large** | 52px × 52px | ✅ |

---

## 🎨 Button Variants

### 1. Contained (Filled)

```jsx
<Button variant="contained" color="primary">
  Primary Action
</Button>
<Button variant="contained" color="secondary">
  Secondary Action
</Button>
```

**Use for:**
- Primary actions
- Call-to-action buttons
- Submit buttons
- Emphasized actions

### 2. Outlined

```jsx
<Button variant="outlined" color="primary">
  Secondary Action
</Button>
<Button variant="outlined">
  Cancel
</Button>
```

**Use for:**
- Secondary actions
- Cancel buttons
- Alternative options
- Less prominent actions

### 3. Text (Ghost)

```jsx
<Button variant="text" color="primary">
  Learn More
</Button>
<Button variant="text">
  Skip
</Button>
```

**Use for:**
- Tertiary actions
- Navigation links
- Minimal emphasis
- Dense layouts

---

## 💻 Usage

### Basic Button

```jsx
import { Button } from '@mui/material';

// Default (Medium)
<Button variant="contained" color="primary">
  Save Changes
</Button>

// Small
<Button variant="contained" color="primary" size="small">
  Apply
</Button>

// Large
<Button variant="contained" color="primary" size="large">
  Get Started
</Button>
```

### Button with Icons

```jsx
import { Save, ArrowForward, Delete } from '@mui/icons-material';

// Start Icon
<Button 
  variant="contained" 
  startIcon={<Save />}
>
  Save Changes
</Button>

// End Icon
<Button 
  variant="contained" 
  endIcon={<ArrowForward />}
>
  Next Step
</Button>

// Icon Only
<IconButton color="primary">
  <Delete />
</IconButton>
```

### Full Width Button

```jsx
<Button 
  variant="contained" 
  color="primary" 
  fullWidth
>
  Submit Form
</Button>
```

### Icon Button

```jsx
import { IconButton } from '@mui/material';
import { Edit, Delete, MoreVert } from '@mui/icons-material';

// Default (Medium)
<IconButton color="primary">
  <Edit />
</IconButton>

// Small
<IconButton size="small">
  <MoreVert />
</IconButton>

// Large
<IconButton size="large" color="error">
  <Delete />
</IconButton>
```

### Button Group

```jsx
import { ButtonGroup } from '@mui/material';

<ButtonGroup variant="contained">
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>
```

---

## 🎨 CSS Variables

All button dimensions are available as CSS variables:

```css
/* Button Heights */
--button-height-small: 32px;
--button-height-medium: 40px;
--button-height-large: 48px;

/* Button Padding */
--button-padding-small: 6px 16px;
--button-padding-medium: 10px 24px;
--button-padding-large: 12px 32px;

/* Border Radius */
--button-radius-small: 8px;
--button-radius-medium: 10px;
--button-radius-large: 12px;
--button-radius-rounded: 100px;

/* Icon Button Sizes */
--icon-button-small: 32px;
--icon-button-medium: 40px;
--icon-button-large: 48px;

/* Icon Sizes */
--button-icon-small: 16px;
--button-icon-medium: 20px;
--button-icon-large: 24px;
```

---

## 🛠️ Utility Classes

### Size Classes

```html
<!-- Button Sizes -->
<button class="btn-small">Small Button</button>
<button class="btn-medium">Medium Button</button>
<button class="btn-large">Large Button</button>

<!-- Icon Button Sizes -->
<button class="icon-btn-small">
  <svg>...</svg>
</button>
<button class="icon-btn-medium">
  <svg>...</svg>
</button>
<button class="icon-btn-large">
  <svg>...</svg>
</button>
```

### Shape Classes

```html
<!-- Rounded (Pill Shape) -->
<button class="btn-rounded">Rounded Button</button>

<!-- Square (No Radius) -->
<button class="btn-square">Square Button</button>
```

### Width Classes

```html
<!-- Full Width -->
<button class="btn-full-width">Full Width Button</button>
```

---

## 📏 Spacing Guidelines

### Button Groups

```jsx
// Horizontal spacing
<Box sx={{ display: 'flex', gap: 2 }}>
  <Button variant="contained">Save</Button>
  <Button variant="outlined">Cancel</Button>
</Box>

// Vertical spacing
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <Button variant="contained" fullWidth>Submit</Button>
  <Button variant="outlined" fullWidth>Reset</Button>
</Box>
```

### Recommended Gaps

| Context | Gap | Use Case |
|---------|-----|----------|
| **Tight** | 8px | Compact toolbars, button groups |
| **Normal** | 12px | Form buttons, action bars |
| **Relaxed** | 16px | Section actions, CTAs |

---

## 🎯 Best Practices

### ✅ DO

1. **Use size variants** - Small, Medium, Large
2. **Use MUI Button components** - Consistent styling
3. **Add icons for clarity** - Improve recognition
4. **Use proper colors** - Primary for main actions
5. **Maintain hierarchy** - Contained > Outlined > Text
6. **Test on mobile** - Verify touch targets

### ❌ DON'T

1. **Don't hardcode sizes** - Use size prop
2. **Don't mix styles** - Keep consistent variants
3. **Don't create tiny buttons** - Minimum 32px height
4. **Don't ignore accessibility** - Provide aria-labels
5. **Don't use too many CTAs** - One primary per section
6. **Don't make buttons too wide** - Use max-width

---

## 🎨 Button Hierarchy

```
Primary (Contained) ━━━━ Main action
    ┃
Secondary (Outlined) ━━ Alternative action
    ┃
Tertiary (Text) ━━━━━━━ Minimal action
    ┃
Icon Button ━━━━━━━━━━━ Utility action
```

### Example: Form Actions

```jsx
<Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
  {/* Primary */}
  <Button variant="contained" color="primary" size="large">
    Submit
  </Button>
  
  {/* Secondary */}
  <Button variant="outlined" size="large">
    Save Draft
  </Button>
  
  {/* Tertiary */}
  <Button variant="text">
    Cancel
  </Button>
</Box>
```

---

## 📱 Responsive Behavior

### Automatic Mobile Scaling

All buttons automatically become touch-friendly on mobile:

```jsx
// Desktop: 40px height
// Mobile: 44px height (automatic)
<Button variant="contained" color="primary">
  Save Changes
</Button>
```

### Manual Responsive Control

```jsx
// Custom responsive sizing
<Button 
  variant="contained"
  sx={{
    height: { xs: '44px', md: '40px' },
    padding: { xs: '10px 20px', md: '10px 24px' },
  }}
>
  Responsive Button
</Button>
```

### Stack on Mobile

```jsx
// Horizontal on desktop, vertical on mobile
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2 
}}>
  <Button variant="contained" fullWidth>
    Primary Action
  </Button>
  <Button variant="outlined" fullWidth>
    Secondary Action
  </Button>
</Box>
```

---

## 🎨 Color Variants

### Primary (Brand Red)

```jsx
<Button variant="contained" color="primary">
  Primary Action
</Button>
```

### Secondary (Black)

```jsx
<Button variant="contained" color="secondary">
  Secondary Action
</Button>
```

### Success (Green)

```jsx
<Button variant="contained" color="success">
  Approve
</Button>
```

### Error (Red)

```jsx
<Button variant="contained" color="error">
  Delete
</Button>
```

### Warning (Orange)

```jsx
<Button variant="contained" color="warning">
  Warning Action
</Button>
```

### Info (Blue)

```jsx
<Button variant="contained" color="info">
  More Info
</Button>
```

---

## 🧪 Examples

### Form Buttons

```jsx
<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
  <Button 
    type="submit"
    variant="contained" 
    color="primary" 
    size="large"
    startIcon={<Save />}
  >
    Save Changes
  </Button>
  <Button 
    variant="outlined" 
    size="large"
    onClick={handleCancel}
  >
    Cancel
  </Button>
</Box>
```

### Action Toolbar

```jsx
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Button 
    variant="contained" 
    size="small"
    startIcon={<Add />}
  >
    Add New
  </Button>
  <IconButton size="small">
    <Refresh />
  </IconButton>
  <IconButton size="small">
    <FilterList />
  </IconButton>
  <IconButton size="small">
    <MoreVert />
  </IconButton>
</Box>
```

### Card Actions

```jsx
<CardActions>
  <Button size="small" color="primary">
    View Details
  </Button>
  <Button size="small">
    Share
  </Button>
</CardActions>
```

### Loading Button

```jsx
import { LoadingButton } from '@mui/lab';

<LoadingButton
  loading={isLoading}
  variant="contained"
  color="primary"
  loadingPosition="start"
  startIcon={<Save />}
>
  Save Changes
</LoadingButton>
```

### Floating Action Button (FAB)

```jsx
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

<Fab 
  color="primary" 
  aria-label="add"
  sx={{ 
    position: 'fixed', 
    bottom: 24, 
    right: 24 
  }}
>
  <Add />
</Fab>
```

---

## ♿ Accessibility

### Required Attributes

```jsx
// Text description for icon buttons
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

### Keyboard Navigation

- `Tab` - Move between buttons
- `Enter` or `Space` - Activate button
- Focus states automatically applied

### Screen Reader Support

```jsx
// Provide context for screen readers
<Button 
  variant="contained"
  aria-describedby="save-description"
>
  Save
</Button>
<span id="save-description" hidden>
  Save your changes to the database
</span>
```

---

## 🔧 Customization

### Custom Button Size

```jsx
// Create a custom button size
<Button
  variant="contained"
  sx={{
    height: '56px',
    minHeight: '56px',
    padding: '16px 40px',
    fontSize: '18px',
    borderRadius: '14px',
  }}
>
  Extra Large Button
</Button>
```

### Custom Icon Size

```jsx
<Button
  variant="contained"
  startIcon={<Save sx={{ fontSize: 28 }} />}
>
  Save
</Button>
```

### Custom Border Radius

```jsx
// Pill shape (fully rounded)
<Button 
  variant="contained"
  sx={{ borderRadius: '100px' }}
>
  Rounded Button
</Button>

// Square
<Button 
  variant="contained"
  sx={{ borderRadius: 0 }}
>
  Square Button
</Button>
```

---

## 📋 Button Checklist

### For Developers

- [ ] Use MUI Button component
- [ ] Specify size variant (small/medium/large)
- [ ] Choose appropriate variant (contained/outlined/text)
- [ ] Add icons for common actions
- [ ] Provide aria-label for icon buttons
- [ ] Test on mobile devices
- [ ] Verify touch target size (minimum 44px)
- [ ] Check color contrast
- [ ] Test keyboard navigation
- [ ] Verify disabled states

### For Designers

- [ ] Define button hierarchy
- [ ] Use standard sizes
- [ ] Maintain consistent spacing
- [ ] Choose appropriate colors
- [ ] Consider loading states
- [ ] Design hover states
- [ ] Design focus states
- [ ] Account for mobile sizes

---

## 🔗 Related Files

- `src/config/theme.js` - Button configuration
- `src/index.css` - Button CSS variables and styles
- `TYPOGRAPHY_SYSTEM.md` - Typography system
- `RESPONSIVE_DESIGN.md` - Responsive breakpoints

---

## 📞 Support

For button-related questions:

1. Check this documentation
2. Verify size variant is set
3. Check CSS variables in DevTools
4. Test on mobile devices
5. Verify MUI theme is loaded

---

**Last Updated**: January 25, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
