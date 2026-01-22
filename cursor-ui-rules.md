UI Rules (Strict — for AI)

When generating frontend code:

1. ALWAYS follow frontend-guidelines.md exactly
2. Do NOT invent new components beyond what's listed
3. Do NOT change layout structure unless explicitly instructed
4. Prefer simplicity over "cool factor"
5. If unsure between two approaches, choose the simpler one
6. Do NOT add animations, transitions, or effects
7. Every UI decision must have a functional purpose

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