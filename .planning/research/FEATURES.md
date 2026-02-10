# Feature Landscape

**Domain:** Couple movie night decision app
**Researched:** 2026-02-10
**Confidence:** MEDIUM (based on training data knowledge of existing apps like Letterboxd, Plex, JustWatch, and couple decision apps)

## Table Stakes

Features users expect. Missing = product feels incomplete or frustrating.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Personal watchlist/shortlist | Core UX pattern - users expect to save movies for later | Low | Standard CRUD operations on user-movie associations |
| Shared watchlist view | Primary use case - seeing what both want to watch | Medium | Query intersection of two users' watchlists |
| Individual movie rating/interest | Users expect to mark "I want this" vs "Partner wants this" | Low | Simple binary or 3-state (want/neutral/no) per user |
| Remove from watchlist | Users expect to clean up their lists | Low | Delete operation with undo option recommended |
| Platform filtering per user | Each person has different streaming subscriptions | Medium | User-specific platform selection affects shared view |
| Search within watchlist | Once lists grow past 20-30 items, search becomes essential | Low | Filter existing data client-side or server-side |
| Sort shared results | Users expect to sort by ratings, release date, runtime | Low | Already implemented in browsing view, extend to watchlist |
| Mobile responsive watchlist | Movie night happens on couch with phones/tablets | Low | Already implemented in browsing view, extend to watchlist |
| Basic authentication | Must distinguish between two users | Medium | Email/password or OAuth (Google/Apple) |
| Session persistence | Users shouldn't re-login every visit | Low | Standard session management with tokens |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Pick for us" algorithm | Solves the "I don't know, what do you want?" loop | High | Match algorithm considering both users' preferences, ratings overlap, mood factors |
| Swipe/voting interface | Gamifies decision making, makes it fun not tedious | Medium | Tinder-like UX where both swipe, then show matches |
| Decision deadline/scheduler | "We're watching in 2 hours, pick by then" creates urgency | Medium | Scheduled notifications, countdown timer, auto-pick if no decision |
| Mood-based filtering | "We want something funny and under 2 hours" | Medium | Tag-based filtering combined with runtime/genre |
| Watch history tracking | "We've already seen that" prevention | Low | Mark as watched, hide from future results |
| Streaming availability alerts | "That movie you wanted is now on Netflix!" | High | Requires external API monitoring or webhooks for catalog changes |
| Compromise score | Shows how much each person wanted the pick | Low | Visual indicator: "80% yours, 60% theirs" based on ratings |
| Veto power | One person can hard-no a movie | Low | Binary flag that removes from shared pool |
| Genre balance tracking | "We've watched 5 action movies, time for a comedy" | Medium | Analytics on watch history with nudges |
| Quick decision mode | "Just pick something good in the next 30 seconds" | Low | Filters to highest-rated mutual matches with random pick |
| Individual notes | "You'd like the soundtrack" or "Reminds me of X" | Low | Simple text field per user per movie |
| Scheduled movie nights | "Every Friday is movie night" with auto-reminders | Medium | Calendar integration, recurring events, notification system |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Public social features | This is intimate couple decision-making, not social networking | Keep it private between the two users |
| Friend recommendations | Adds complexity, dilutes focus on couple experience | Surface IMDB/RT/Metacritic scores instead |
| In-app messaging/chat | Couples already have messaging apps, redundant | Use notifications for key events only |
| Movie playback | Reinventing the wheel, complex licensing | Deep link to streaming platform apps |
| Detailed movie database management | JustWatch/IMDB do this better | Pull from existing APIs, don't maintain catalog |
| Support for groups >2 users | Exponentially increases complexity of matching | Hard limit to 2 users, separate app if needed |
| AI-generated recommendations ignoring user input | Users want agency in decisions | Use AI to surface options from their existing preferences |
| Gamification badges/achievements | Can create pressure/competition in relationship | Keep it lightweight, focus on utility not engagement metrics |
| Watch time tracking | Feels surveillance-y in relationship context | Track completion status only (watched/not watched) |
| Premium tiers with feature restrictions | Couples expect equal access | Monetize differently (ads, tips, optional features) or keep free |

## Feature Dependencies

```
Authentication
  → Personal watchlist
    → Shared watchlist view
      → "Pick for us" algorithm
      → Compromise score
      → Veto power

  → Platform filtering per user
    → Shared results filtering
    → Streaming availability alerts

  → Watch history
    → Genre balance tracking
    → "Already seen" filtering

Swipe/voting interface
  → Shared watchlist population
  → Match detection

Scheduled movie nights
  → Decision deadline
  → Auto-pick if no decision
```

## MVP Recommendation

**Prioritize (Phase 1 - Core Decision Making):**

1. **Authentication** - Required foundation (email/password, keep simple)
2. **Personal watchlist** - Individual movie saving with add/remove
3. **Shared watchlist view** - The core value prop (intersection of both lists)
4. **Platform filtering per user** - Critical for practical use (only show what's accessible)
5. **Basic sorting** - By rating, release date, runtime
6. **Watch history** - Mark as watched, hide from future

**Defer to Phase 2 (Enhanced Decision Making):**

- **Veto power** - Simple but not essential for MVP validation
- **Individual ratings** - Nice to have for compromise score
- **Compromise score** - Requires ratings infrastructure first
- **Search within watchlist** - Add when lists grow (can monitor usage)

**Defer to Phase 3+ (Advanced Features):**

- **"Pick for us" algorithm** - High complexity, validate manual decision-making first
- **Swipe/voting interface** - Different UX paradigm, test interest first
- **Decision deadline/scheduler** - Useful but not core to movie selection
- **Mood-based filtering** - Requires tag infrastructure
- **Streaming availability alerts** - High complexity, questionable ROI
- **Genre balance tracking** - Analytics play, not core utility
- **Scheduled movie nights** - Calendar integration complexity
- **Individual notes** - Low value relative to clutter

## Critical Success Factors

Based on the stated success metric ("they actually use this instead of scrolling Netflix on movie night"):

1. **Speed to decision** - Must be faster than scrolling Netflix together
   - Implement: Quick add to watchlist from browsing, fast shared view loading
   - Avoid: Too many clicks, slow API calls, complex decision flows

2. **Mobile-first experience** - Movie night happens on the couch
   - Implement: Touch-optimized controls, fast mobile load times
   - Avoid: Desktop-only features, small touch targets

3. **Reduced decision paralysis** - Help narrow choices, don't expand them
   - Implement: Start with shared watchlist (pre-filtered), limit results
   - Avoid: Showing entire catalog, analysis paralysis features

4. **Low friction onboarding** - Must be usable within first movie night
   - Implement: Guest mode or simple signup, inline tutorials
   - Avoid: Lengthy profile setup, forced tutorials before use

5. **Persistent value** - Give reasons to return between movie nights
   - Implement: "Add to watchlist" as default action while browsing
   - Avoid: Features that only work during active decision making

## Complexity Assessment

| Feature Category | Estimated Effort | Risk Level | Notes |
|------------------|------------------|------------|-------|
| Authentication | 1-2 days | Low | Use established libraries (Supabase Auth) |
| Personal watchlist CRUD | 2-3 days | Low | Standard database operations |
| Shared watchlist query | 1 day | Low | SQL intersection query |
| Platform filtering per user | 2-3 days | Medium | User preferences + filtered queries |
| Watch history | 1 day | Low | Additional boolean field + filtering |
| Veto power | 1 day | Low | Boolean flag + filter logic |
| Ratings/compromise score | 2-3 days | Low | Rating storage + display calculation |
| "Pick for us" algorithm | 5-10 days | High | Algorithm design, testing, tuning |
| Swipe interface | 3-5 days | Medium | New UI paradigm, gesture handling |
| Decision scheduler | 3-5 days | Medium | Notification system, scheduling logic |
| Streaming alerts | 10+ days | High | External API monitoring, change detection |

## Research Confidence Notes

**HIGH confidence areas (based on established patterns):**
- Personal/shared watchlist patterns (proven in Letterboxd, Goodreads, etc.)
- Platform filtering expectations (standard in JustWatch, Reelgood)
- Authentication requirements (universal pattern)

**MEDIUM confidence areas (based on training data):**
- Swipe/voting interface value (popularized by apps like Smash or Decide, but market penetration unclear)
- Decision scheduler utility (logical extension but unverified user demand)
- Compromise score visibility (could be relationship friction point)

**LOW confidence areas (training data limitations):**
- Current state of couple decision apps in 2026 (training cutoff January 2025)
- Streaming availability alert API accessibility (vendor APIs change frequently)
- Mobile usage patterns post-2024 (behavior may have shifted)

**Gaps requiring validation:**
- Do couples prefer collaborative list-building or swipe-to-match?
- Is the decision bottleneck finding options or agreeing on one?
- How often do couples use these apps vs. ad-hoc Netflix scrolling?

## Sources

**Note:** Research conducted using training data knowledge (cutoff January 2025) due to tool access limitations. Confidence levels reflect verification status.

**Reference apps analyzed (from training data):**
- Letterboxd (social watchlist patterns)
- JustWatch (streaming platform filtering)
- Plex (watch history tracking)
- Smash/Decide (swipe-based couple decision apps)
- Google Calendar (scheduling patterns)

**Recommended validation:**
- User interviews with target couple users
- Competitive analysis of 2026 couple decision apps
- A/B testing of swipe vs. list-based UX
- Analytics on watchlist growth rates to trigger search feature
