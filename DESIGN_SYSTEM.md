
# FocusDo Design System

This document outlines the design system for the FocusDo application, ensuring a consistent and high-quality user experience.

## 🎨 Color System

### Primary Palette

```css
/* 主色调 */
:root {
  --primary-50: hsl(241, 62%, 95%);
  --primary-500: hsl(241, 62%, 59%);
  --primary-900: hsl(241, 62%, 20%);
}
```

### Semantic Colors

```css
/* 语义色彩 */
:root {
  --success: hsl(142, 76%, 36%);
  --warning: hsl(45, 93%, 47%);
  --error: hsl(0, 84%, 60%);
  --info: hsl(197, 88%, 48%);
}
```

### Neutral Colors

```css
/* 中性色 */
:root.light {
  --gray-50: hsl(210, 17%, 98%);
  --gray-500: hsl(240, 1%, 54%);
  --gray-900: hsl(240, 4%, 11%);
}
```

## ✨ Animation System

### Easing Functions

```css
/* 缓动函数 */
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-back: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Durations

```css
/* 持续时间 */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

##  boxShadow System

```css
:root {
  --shadow-subtle: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-soft: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-medium: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-strong: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-fab: 0 8px 25px -5px rgb(0 0 0 / 0.3);
}
```
