---
doc: scope
language: en
status: translation-of-approved
source: scope.md
source_status: approved
source_approved: 2026-10-26
translated: 2026-10-26
---

# SettleK — Preparation for Your Life in Korea

This is an English translation of the approved Korean scope in `scope.md`. It records the same approved scope; it is not a new approval or a claim that every requirement has been verified in production.

A personal app that helps foreign residents in Korea describe their situation, organize the preparation and remaining tasks indicated by official guidance, and continue managing that preparation over time.

The basic scope is personalized preparation and record management for foreign residents in Korea. The project draws on the existing idea and usage experience, while implementing the code from scratch. Product design defines the detailed screens, behavior, and procedures that the app will actually cover.

## The Unique Kernel

The core is that **the actual preparation list and next actions change** according to the user's current situation, explanation, and existing preparation. The app does not simply show everyone the same guidance. It avoids asking again for information already provided and explains why an item applies, with its official source.

## Who It's For

**The audience is foreign residents in Korea.** The service is for people who want to understand and manage their own preparation for life changes such as moving, employment, residence, education, and naturalization. International students are included, but the audience is not limited by student status or nationality.

The demonstration considers different situations experienced by foreign residents in Korea and makes the applicability of the initial version's reviewed procedures and materials clear.

## The Core Loop

1. The user enters their current situation and any additional explanation needed.
2. The app uses information already known and asks only about missing or conflicting information.
3. It shows the full preparation list relevant to that situation. Each item explains why it is relevant, where or how to obtain it, its official source, and anything that still needs confirmation.
4. The user marks documents they already have and their preparation status. Several items can be prepared at the same time.
5. When the user returns or changes their situation, the app carries forward their records and shows the remaining preparation and next actions.

## Inspiration & Identity

The app aims for concise, understandable personal guidance. It reduces repeated input and makes current progress and next actions easy to find. Users can first see the full preparation list, then expand an item when they need a longer explanation. The main flow is available in Korean and English.

The goal is to retain the screen organization, colors, menus, and usage flow of the existing personal SettleK app. It provides separate screens for Home, My situation, Follow-up questions, My plan, Documents, My records, Official sources, Reminders, and Install. Screens and features are implemented with new code. The business HR dashboard is a separate project.

## Why This Matters to the Learner

The approved Korean scope records that the idea arose from conversations about life in Korea with an American friend and from seeing many international students nearby. The starting motivation was to make complicated visa and document preparation for living in Korea easier to navigate.

This translates the motivation already recorded in the source document; it adds no user research, testimonial, or measured outcome.

## What "Working" Looks Like

A fictional foreign-resident scenario works from initial input through saving preparation status and returning to it. When the same user changes a supported condition, such as employment circumstances or whether they have moved, the preparation list and next actions actually change. Previously answered information and preparation records are retained. Changed items are linked to an explanation and source. Detailed demonstration scenarios are chosen together with supporting materials; a particular residence status is not treated as the entire audience.

This is the prototype's demonstration criterion. Success metrics and effects on real users have not yet been measured and are not claimed. A short video will show the flow, and a public repository will provide instructions for running it.

## The POC Boundary

The following is the approved baseline scope. The PRD specifies support conditions for each source and detailed behavior. Unverified legal requirements must not be treated as implemented facts.

- Keep foreign residents in Korea as the audience and complete the shared flow: situation input → personalized preparation list → record progress and continue later.
- State exactly which life changes and procedures the first version supports after checking the applicability of official materials. Outside the reviewed scope, explain what needs further confirmation. This is not a promise to fully cover every visa or naturalization requirement in the first version.
- Include minimal situation input, follow-up questions, situation-specific preparation lists, sources and preparation instructions, and records of documents held and preparation status.
- Use AI to organize relevant facts from the user's explanation and connect those facts to personalization. Handle official documents and conditions within the bounds of reviewed sources; leave unknown conditions for further confirmation.
- Show the full set of relevant documents at a glance and allow users to prepare several items simultaneously.
- Let users continue preparation on the same device. After signing in, users can explicitly save to and load from their account. The new app's account storage is separate from the existing app. Do not collect original documents or identifiers such as passport numbers.
- Let users register dates they have confirmed, manage completion, and export calendar files. App-generated push notifications, texts, and emails while the app is closed are excluded.
- Provide a web app that can be added to a phone's home screen, with Korean and English screens.
- Users personally confirm document reusability and preparation completion.
- Distinguish real AI integration, simulated operation, and failure. The technical design determines the service and cost limits; planning a connection is not evidence that it is already connected.
- Show official sources' applicability and review dates. AI must not independently determine residence eligibility or statutory deadlines.

## Later

- Add detailed residence-status categories, life changes, and regional procedures beyond the initial support boundary, together with official materials.
- Add push notifications while the app is closed and further calendar-service integrations.
- Expand supported languages and official materials.
- Improve the product through review and feedback from real users.

## Explicitly Cut

- **Issuing certificates or applying to institutions on the user's behalf:** not needed to demonstrate the core preparation flow and would require separate institutional integrations.
- **Automatically determining visa eligibility or approving document reuse:** the product keeps the creator's principle of user confirmation.
- **Business HR screens:** outside this BuildAI personal-user flow.
- **Reusing the existing app's code:** the competition calls for a new project started with the Skill Pack, so the existing implementation is not copied.

## Implementation Note

The current implementation uses AI for bilingual situation summaries and extraction of four bounded fact categories: housing, employment, study, and integration. Reviewed preparation rules then create the tasks and document candidates. Official-source search runs in the browser over the reviewed catalog; it is not live web search. These are implementation clarifications, not changes to the approved scope or evidence of production acceptance. Current verification belongs in `parity.md` and `../docs/verification.md`.


## Final-review refinement — 2026-10-26

At the creator's request, compare the previous completed plan with updated documents as added, removed, recheck and carried forward. The comparison profile excludes notes and stays on the device; account loading and a new example reset it. Add scoped official-check guidance for E-7-1, E-7-4, D-10-1, F-2 and F-6. F-2/F-6 do not automatically receive generic E-category employer candidates. The library has 15 reviewed references with scope and review dates. External foreign-resident usability testing remains unperformed because no participant was available; technical verification is recorded separately.
