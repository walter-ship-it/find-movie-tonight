UI Rules (Strict — for AI)

When generating frontend code:

1. ALWAYS follow frontend-guidelines.md exactly


Mobile responsiveness:
- Test both mobile and desktop layouts
- Table → Cards on mobile is mandatory
- Never horizontal scroll

Accessibility:
- Use semantic HTML
- Alt text on images
- Sufficient color contrast

Performance:
- Lazy load images
- No unnecessary re-renders
- Keep bundle size small

Country Selector:
- Use shadcn/ui Select component
- Include these countries: SE, US, GB, DE, CA, AU, FR, IT, ES, NL
- Format: "🇸🇪 Sweden", "🇺🇸 United States", etc.
- Filter happens client-side (no API calls)