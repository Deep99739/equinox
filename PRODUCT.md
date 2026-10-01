# Equinox product context

## Purpose

Equinox is a personal workspace for keeping everyday tasks, notes, wellbeing check-ins, and AI assistance in one place. The redesign should make it easier to start a day, do a task, ask for help, and return later without relearning the interface.

## Audience and scene

Assumption from the product and the user's brief: the primary user is an individual balancing work and personal plans on desktop and mobile web. They may arrive with no tasks or health entry, or with data from an earlier day. They should not have to understand the backend's agent architecture to use the product.

## Current capabilities

- Google sign-in and an optional Google connection for email-backed briefing functions.
- Tasks that can be created, completed, and deleted.
- Notes that can be created, edited, autosaved, and deleted.
- General and wellness chat endpoints with saved conversation threads.
- Manual wellness check-in and a readiness view when available.
- Briefing generation and user-initiated email sending.
- A supervisor assistant endpoint that can respond to a fatigue question.

## Product boundaries

Do not promise automatic calendar changes, passive health tracking, wearable connections, Slack/Notion integrations, scheduled briefing delivery, or background agent activity unless those capabilities are actually implemented. A wellness check-in is optional and never blocks navigation.

## Success criteria for this redesign

A first-time visitor can understand what Equinox does and take one clear action. A signed-in user can find and act on open tasks within one screen, reach chat/notes/check-in/briefing without searching, and understand loading, empty, error, and saved states. The same flow works at phone width and with keyboard navigation. Motion explains hierarchy or state and respects reduced-motion preferences. The marketing page and app must describe the same product.

## Source of assumptions

The user requested a full UI and UX redesign informed by YC and related startup research, with purposeful animation and no PR before explicit approval. Product capabilities above were checked against the current repository; audience and success criteria are implementation assumptions made from that request and the existing feature set.
