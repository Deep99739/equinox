# Equinox interface direction

This file records the product and design decisions behind the October 2026 redesign. It is a guide for future UI work, not a list of unbuilt feature promises.

## Product truth

Equinox currently has tasks, notes, a general and wellness chat endpoint, manual wellness logging with readiness feedback, generated briefings, Google sign-in, and a Google connection. A briefing can be sent by email on request. The UI must not imply automatic calendar rescheduling, wearable integrations, Slack or Notion integrations, or scheduled 8 a.m. delivery.

## Experience model

The first signed-in screen is **Today**. It answers three questions in order: what needs attention, how am I feeling, and where can I get a wider view? From there people can add or complete a task, go to a check-in, generate a briefing, or open chat. This reduces the need to choose among seven equally weighted destinations before doing anything.

The shared workspace groups navigation by use: Today, Chat, Tasks, Notes; then Wellness, Briefing, and an explanation of the assistant. Settings and sign-out are separated from daily work. The same hierarchy collapses into an accessible mobile drawer.

Each route has a distinct job:

| Route | Primary task | Important state |
| --- | --- | --- |
| Today | Begin and focus | Empty tasks, partial API failure |
| Chat | Ask and continue a conversation | New thread, sending, retryable error |
| Tasks | Capture, complete, filter | Empty, completed, loading, failure |
| Notes | Write and return | No notes, autosaving, save failure |
| Wellness | Check in deliberately | No entry, saved entry, readiness |
| Briefing | Request a summary | Before generation, generated, send status |
| How it works | Understand and try the assistant | Example response and request failure |
| Settings | Inspect account and connections | Unavailable connection, theme preference |

The daily wellness check-in is voluntary. Opening an unrelated route does not interrupt people with a health form.

## Visual language

A warm white canvas, deep green ink, one green accent, restrained borders, and generous spacing create a calm consumer workspace. DM Sans carries controls and body copy; Newsreader is limited to display headings. The app favors readable lists, clear labels, and narrow content widths over decorative dashboards. Marketing and product share the same type, color, shape, and wording. The hero uses a screenshot of the implemented Today screen with synthetic tasks, labeled as sample data.

## Motion

The landing hero enters once to establish hierarchy. The mobile drawer moves from its trigger side to preserve spatial context. Buttons use short, interruptible hover feedback. Chat shows activity only while waiting for a response. Frequent task and note actions update immediately. Movement respects `prefers-reduced-motion`; the app does not animate every route or every list row.

## Research applied

- [Jo (YC)](https://www.ycombinator.com/companies/jo) and [its product](https://askjo.ai/) reinforced a human, day-level entry point and concrete briefing language. Equinox does not copy its autopilot or memory claims.
- [Nori (YC)](https://www.ycombinator.com/companies/nori) showed the value of one clear daily health story. Equinox keeps manual logging explicit because wearable and lab connections are not present.
- [Akiflow (YC)](https://www.ycombinator.com/companies/akiflow) and [Motion (YC)](https://www.ycombinator.com/companies/motion) were useful for task-centered product framing; their calendar automation claims do not fit Equinox.
- [Pally (YC)](https://www.ycombinator.com/companies/pally) reinforced direct language and a single first action, while [Sunsama](https://www.sunsama.com/) reinforced a calm daily ritual.
- [Linear's Inbox documentation](https://linear.app/docs/inbox) informed the task list's clear filtering and action affordances. Equinox is a personal workspace, so it stays much lighter than a team issue tracker.

The implementation used the installed design-taste guidance for the landing page, Impeccable's distinction between persuasive and operating surfaces, Vercel's Web Interface Guidelines for interaction and accessibility checks, and the animate/review-animations guidance for purposeful motion. These were inputs to judgment, not templates to reproduce.
