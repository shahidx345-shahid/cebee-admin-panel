# 📝 Typography System Documentation

## Overview

The CeeBee Predict Admin Panel uses a **standardized typography system** with consistent font sizes, weights, and spacing across all components. This ensures visual harmony, maintainability, and accessibility.

---

## 🎯 Design Principles

1. **Single Base Font Size**: 16px (1rem)
2. **Consistent Scale**: Major Third ratio (1.25x)
3. **Responsive Typography**: Scales down on mobile devices
4. **CSS Variables**: Global typography tokens
5. **No Random Sizes**: All sizes come from the design system

---

## 📐 Typography Scale

### Font Sizes (Desktop)

| Token | Size | rem | Use Case |
|-------|------|-----|----------|
| `--font-display` | 64px | 4rem | Hero sections (rarely used in admin) |
| `--font-h1` | 32px | 2rem | Page titles, main headings |
| `--font-h2` | 28px | 1.75rem | Section headings |
| `--font-h3` | 24px | 1.5rem | Subsection headings |
| `--font-h4` | 20px | 1.25rem | Card titles, minor headings |
| `--font-h5` | 18px | 1.125rem | List headers, small titles |
| `--font-h6` | 16px | 1rem | Smallest heading size |
| `--font-body` | 16px | 1rem | **Base body text** |
| `--font-body-large` | 18px | 1.125rem | Emphasized body text |
| `--font-body-small` | 14px | 0.875rem | Secondary text, descriptions |
| `--font-caption` | 12px | 0.75rem | Captions, footnotes, timestamps |
| `--font-overline` | 11px | 0.6875rem | Labels, tags, overlines |
| `--font-button` | 14px | 0.875rem | Button text |
| `--font-button-large` | 16px | 1rem | Large button text |
| `--font-input` | 16px | 1rem | Input field text |
| `--font-label` | 14px | 0.875rem | Form labels |

### Mobile Sizes (<1024px)

| Token | Mobile Size | Change |
|-------|-------------|--------|
| `--font-display` | 40px | -24px |
| `--font-h1` | 24px | -8px |
| `--font-h2` | 22px | -6px |
| `--font-h3` | 20px | -4px |
| `--font-h4` | 18px | -2px |
| `--font-h5` | 16px | -2px |
| `--font-h6` | 14px | -2px |
| `--font-body` | 15px | -1px |
| `--font-body-small` | 13px | -1px |
| `--font-caption` | 11px | -1px |

---

## ⚖️ Font Weights

| Token | Value | Use Case |
|-------|-------|----------|
| `--font-weight-light` | 300 | Rarely used, decorative |
| `--font-weight-regular` | 400 | Body text, paragraphs |
| `--font-weight-medium` | 500 | Emphasis, labels |
| `--font-weight-semibold` | 600 | Buttons, minor headings |
| `--font-weight-bold` | 700 | Headings (H1-H3), important text |
| `--font-weight-extrabold` | 800 | Hero text, rare emphasis |

---

## 📏 Line Heights

| Token | Value | Use Case |
|-------|-------|----------|
| `--line-height-tight` | 1.2 | Headings (H1-H3) |
| `--line-height-normal` | 1.5 | Body text, UI elements |
| `--line-height-relaxed` | 1.75 | Long-form content |
| `--line-height-loose` | 2 | Spaced content, rarely used |

---

## 📐 Letter Spacing

| Token | Value | Use Case |
|-------|-------|----------|
| `--letter-spacing-tight` | -0.8px | Large headings (H1-H3) |
| `--letter-spacing-normal` | 0px | Body text, most UI |
| `--letter-spacing-wide` | 0.5px | Uppercase labels, overlines |
| `--letter-spacing-wider` | 1px | Very spaced text |

---

## 🎨 Font Families

```css
--font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
--font-mono: 'Monaco', 'Courier New', monospace;
```

---

## 💻 Usage

### 1. Using CSS Variables

```css
.custom-heading {
  font-size: var(--font-h2);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.custom-body {
  font-size: var(--font-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}
```

### 2. Using MUI Typography Components

```jsx
import { Typography } from '@mui/material';

// Headings
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2">Section Title</Typography>
<Typography variant="h3">Subsection</Typography>

// Body text
<Typography variant="body1">Main content text</Typography>
<Typography variant="body2">Secondary text</Typography>

// Special text
<Typography variant="caption">Small caption text</Typography>
<Typography variant="subtitle1">Emphasized subtitle</Typography>
<Typography variant="overline">Label Text</Typography>
```

### 3. Using Utility Classes

```jsx
// Font sizes
<div className="text-h1">Large Heading</div>
<div className="text-body">Body text</div>
<div className="text-caption">Small text</div>

// Font weights
<span className="font-bold">Bold text</span>
<span className="font-semibold">Semibold text</span>
<span className="font-regular">Regular text</span>

// Line heights
<p className="leading-tight">Tight line spacing</p>
<p className="leading-normal">Normal line spacing</p>

// Letter spacing
<span className="tracking-tight">Tight tracking</span>
<span className="tracking-wide">Wide tracking</span>

// Text alignment
<div className="text-center">Centered text</div>
<div className="text-right">Right-aligned text</div>

// Text transform
<span className="text-uppercase">UPPERCASE TEXT</span>
<span className="text-capitalize">Capitalized Text</span>
```

---

## 📦 Component-Specific Typography

### Buttons

```css
/* Standard button */
font-size: var(--font-button);      /* 14px */
font-weight: var(--font-weight-semibold);  /* 600 */

/* Large button */
font-size: var(--font-button-large);  /* 16px */

/* Small button */
font-size: var(--font-caption);  /* 12px */
```

### Input Fields

```css
/* Input text */
font-size: var(--font-input);  /* 16px */
font-weight: var(--font-weight-regular);  /* 400 */

/* Input label */
font-size: var(--font-label);  /* 14px */
font-weight: var(--font-weight-medium);  /* 500 */
```

### Tables

```css
/* Table cells */
font-size: var(--font-body-small);  /* 14px */
font-weight: var(--font-weight-regular);  /* 400 */

/* Table headers */
font-size: var(--font-body-small);  /* 14px */
font-weight: var(--font-weight-bold);  /* 700 */
```

### Chips

```css
font-size: var(--font-caption);  /* 12px */
font-weight: var(--font-weight-semibold);  /* 600 */
```

### Links

```css
font-size: inherit;  /* Inherits from parent */
font-weight: var(--font-weight-medium);  /* 500 */
color: #D71920;  /* Brand red */
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use the typography scale** - Always use predefined sizes
2. **Use CSS variables** - `var(--font-h1)` instead of hardcoded sizes
3. **Use MUI Typography components** - Let the theme handle styling
4. **Use utility classes** - For quick styling adjustments
5. **Test responsiveness** - Verify text scales properly on mobile

### ❌ DON'T

1. **Don't hardcode font sizes** - No `font-size: 17px`
2. **Don't use random weights** - Stick to the weight scale
3. **Don't override system fonts** - Use the design tokens
4. **Don't create custom font sizes** - Use what's available
5. **Don't ignore mobile scaling** - Always test on small screens

---

## 🔧 Customization

### Changing Base Font Size

```css
/* In index.css */
:root {
  --font-body: 18px;  /* Increase base size */
}

html {
  font-size: 18px;  /* Update root size */
}
```

### Adjusting Scale Ratio

To change the entire scale, update all sizes proportionally:

```javascript
// In theme.js
export const typography = {
  fontSize: {
    h1: '36px',  // Instead of 32px
    h2: '30px',  // Instead of 28px
    // ... update all sizes
  },
};
```

### Adding New Sizes

```css
/* In index.css */
:root {
  --font-custom: 15px;
}

/* Create utility class */
.text-custom {
  font-size: var(--font-custom) !important;
}
```

---

## 📱 Responsive Behavior

### Automatic Scaling

All typography automatically scales down on mobile (<1024px):

```css
/* Desktop */
h1 { font-size: 32px; }

/* Mobile (< 1024px) */
@media (max-width: 1023px) {
  h1 { font-size: 24px; }
}
```

### Manual Responsive Control

```jsx
// Using MUI responsive syntax
<Typography 
  variant="h1" 
  sx={{ 
    fontSize: { xs: '24px', sm: '28px', md: '32px' } 
  }}
>
  Responsive Heading
</Typography>
```

---

## 🧪 Testing Typography

### Visual Hierarchy Test

1. Create a page with all heading levels (H1-H6)
2. Verify visual distinction between each level
3. Ensure proper sizing and spacing

### Readability Test

1. Test body text at different viewport sizes
2. Verify line length stays between 50-75 characters
3. Check line height for comfortable reading

### Consistency Test

1. Compare same elements across different pages
2. Verify font sizes match exactly
3. Check for any hardcoded sizes

---

## 📋 Typography Checklist

### For Developers

- [ ] Use CSS variables for all font sizes
- [ ] Use MUI Typography components when possible
- [ ] Apply utility classes for quick adjustments
- [ ] Test on mobile devices (<1024px)
- [ ] Verify text doesn't overflow containers
- [ ] Check text contrast ratios (WCAG AA)
- [ ] Ensure consistent spacing around text
- [ ] Remove any hardcoded font sizes
- [ ] Update old components to use the system
- [ ] Document any custom typography needs

### For Designers

- [ ] All designs use the typography scale
- [ ] Font sizes match the design tokens
- [ ] Weights come from the available options
- [ ] Line heights follow the system
- [ ] Mobile sizes are specified
- [ ] Text hierarchy is clear
- [ ] Spacing is consistent

---

## 🎓 Examples

### Page Header

```jsx
<Box>
  <Typography variant="h1" className="font-bold tracking-tight">
    Dashboard
  </Typography>
  <Typography variant="body2" color="textSecondary">
    Welcome back to your admin panel
  </Typography>
</Box>
```

### Card Title

```jsx
<Card>
  <CardContent>
    <Typography variant="h4" className="font-semibold" gutterBottom>
      Total Users
    </Typography>
    <Typography variant="h2" className="font-bold">
      1,234
    </Typography>
    <Typography variant="caption" color="textSecondary">
      +12% from last month
    </Typography>
  </CardContent>
</Card>
```

### Table Headers

```jsx
<TableHead>
  <TableRow>
    <TableCell className="font-bold text-body-small">
      Name
    </TableCell>
    <TableCell className="font-bold text-body-small">
      Email
    </TableCell>
  </TableRow>
</TableHead>
```

---

## 🔗 Related Files

- `src/config/theme.js` - Typography configuration
- `src/index.css` - CSS variables and global styles
- `RESPONSIVE_DESIGN.md` - Responsive breakpoints
- `TYPOGRAPHY_SYSTEM.md` - This file

---

## 📞 Support

For typography-related questions:

1. Check this documentation first
2. Verify the CSS variable exists
3. Test in browser DevTools
4. Check for conflicting styles
5. Ensure MUI theme is loaded

---

**Last Updated**: January 25, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
