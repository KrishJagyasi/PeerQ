# CSS Styles Organization

This directory contains all the CSS styles for the PeerQ application, organized by page and component.

## Structure

```
styles/
├── pages/           # Page-specific styles
│   ├── index.css    # Imports all page styles
│   ├── Home.css     # Home page styles
│   ├── Login.css    # Login page styles
│   ├── Register.css # Register page styles
│   ├── Profile.css  # Profile page styles
│   ├── AskQuestion.css # Ask question page styles
│   ├── QuestionDetail.css # Question detail page styles
│   ├── Admin.css    # Admin dashboard styles
│   └── Notifications.css # Notifications page styles
└── README.md        # This file
```

## Design System

All styles use CSS custom properties (CSS variables) defined in `App.css` for consistent theming:

### Colors
- `--color-primary`: Primary brand color
- `--color-secondary`: Secondary color
- `--color-success`: Success states
- `--color-warning`: Warning states
- `--color-danger`: Error states
- `--color-text-primary`: Main text color
- `--color-text-secondary`: Secondary text color
- `--color-text-muted`: Muted text color
- `--color-surface`: Surface backgrounds
- `--color-background`: Page backgrounds

### Typography
- `--font-size-xs`: 0.75rem
- `--font-size-sm`: 0.875rem
- `--font-size-base`: 1rem
- `--font-size-lg`: 1.125rem
- `--font-size-xl`: 1.25rem
- `--font-size-2xl`: 1.5rem
- `--font-size-3xl`: 1.875rem
- `--font-size-4xl`: 2.25rem

### Spacing
- `--spacing-xs`: 0.25rem
- `--spacing-sm`: 0.5rem
- `--spacing-md`: 0.75rem
- `--spacing-lg`: 1rem
- `--spacing-xl`: 1.5rem
- `--spacing-2xl`: 2rem
- `--spacing-3xl`: 3rem

### Shadows
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

## Features

### Dark Mode Support
All styles include dark mode variants using `[data-theme="dark"]` selectors.

### Responsive Design
All pages include responsive breakpoints:
- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`
- Desktop: `max-width: 1024px`

### Animations
- Smooth transitions using `var(--transition-normal)`
- Hover effects with transform and shadow changes
- Loading spinners with CSS animations
- Slide-in animations for dynamic content

## Usage

To use these styles in your components:

1. Import the main CSS file in your component:
```javascript
import '../styles/pages/Home.css';
```

2. Use the CSS classes in your JSX:
```jsx
<div className="home-container">
  <h1 className="home-title">Welcome to PeerQ</h1>
</div>
```

## Naming Convention

CSS classes follow a consistent naming pattern:
- `{page-name}-container`: Main container
- `{page-name}-header`: Page header section
- `{page-name}-title`: Page title
- `{page-name}-subtitle`: Page subtitle
- `{page-name}-content`: Main content area
- `{page-name}-form`: Form elements
- `{page-name}-button`: Button styles
- `{page-name}-card`: Card components
- `{page-name}-loading`: Loading states
- `{page-name}-error`: Error states

## Best Practices

1. **Use CSS Variables**: Always use the design system variables for colors, spacing, and typography
2. **Mobile First**: Write styles for mobile first, then add desktop enhancements
3. **Semantic Class Names**: Use descriptive class names that reflect the purpose
4. **Consistent Spacing**: Use the spacing variables for consistent margins and padding
5. **Accessibility**: Ensure sufficient color contrast and focus states
6. **Performance**: Keep CSS files focused and avoid deep nesting

## Adding New Pages

To add styles for a new page:

1. Create a new CSS file in `styles/pages/` (e.g., `NewPage.css`)
2. Follow the naming convention for CSS classes
3. Include responsive design and dark mode support
4. Import the new file in `styles/pages/index.css`
5. Update this README with the new page

## Maintenance

- Keep styles modular and focused on specific pages
- Use consistent naming conventions
- Test on different screen sizes and themes
- Remove unused styles regularly
- Document any new design patterns or components 