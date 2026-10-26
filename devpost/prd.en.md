---
doc: prd
language: en
status: translation-of-approved
source: prd.md
source_status: approved
source_approved: 2026-10-26
translated: 2026-10-26
---

# SettleK — Product Requirements

This is an English translation of the approved Korean PRD in `prd.md`. Requirements and acceptance criteria describe the approved product behavior, not a new approval or a declaration that every criterion has passed in production. Implementation clarifications are labeled separately.

A personal service that helps foreign residents in Korea see preparation relevant to their situation and continue with the remaining work while retaining what they have already prepared.

Basis: `scope.md > Who It's For`, `The Unique Kernel`, and `The Core Loop`.

## The Core Journey

1. **Get started:** use Korean or English. New users enter their situation; returning users continue their saved preparation.
2. **Describe the situation:** select the current residence situation and the help needed, then add text for details that selections alone cannot express. Users can select overlapping topics, including moving, employment, residence, education, and naturalization.
3. **Confirm only what is needed:** the app organizes facts from selected answers and the explanation. It reuses known information and asks only about missing or conflicting details. Users can correct the information.
4. **View the personalized preparation list:** see the situation summary, what to check now, and the full relevant document list together. Multiple items can be prepared simultaneously.
5. **Check how to prepare:** expand each item to see why it is relevant, where and how to obtain it, its official source, and outstanding conditions to confirm.
6. **Record progress:** mark documents already held and manage items as To do, In progress, or Done. Users confirm reuse themselves.
7. **Continue the next preparation:** reopening restores the saved situation and progress. Changes to the situation refresh the relevant list and explain changed items.

The normal completion state is that a user receives a relevant preparation list, changes preparation status, and can reopen the app to continue the remaining work.

## Screens and Layout

Basis: `scope.md > The Core Loop` and `Inspiration & Identity`.

Follow the existing personal SettleK app's menu and screen organization. Give each screen one purpose and preserve input and preparation status when users open a route directly or navigate back.

| Screen / stage | First visible content | Main actions |
|---|---|---|
| **Home `/`** | SettleK introduction, life-in-Korea journey, start and example actions | Enter a situation; continue a saved plan |
| **My situation `/planner`** | Residence status, goal, region, life changes, explanation, existing records | Edit the situation; review analysis input |
| **Follow-up questions `/questions`** | Missing or conflicting information and why it matters | Answer, select Not sure, correct information, create the plan |
| **My plan `/plan`** | Situation, next action, tasks, full document summary | Mark done or undo; open Documents; refresh the plan |
| **Documents `/documents`** | Documents across procedures and their progress | Check preparation steps and conditions; mark held/reusable; save and print |
| **My records `/records`** | Save status, account, held documents, completed procedures | Save/load account records; download a backup; delete |
| **Official sources `/sources`** | Official guidance, applicability, review dates | Search, compare with the situation, open evidence and originals |
| **Reminders `/reminders`** | Confirmed dates, upcoming and completed reminders | Add, edit, complete, download a calendar file |
| **Install `/install`** | Installation instructions and operating limits | Install on supported devices; follow iPhone home-screen instructions |

Show the three stages: My situation → Follow-up questions → My plan. The six main menus are accessible at the top on desktop and at the bottom on mobile. Collapse long document explanations and generation evidence, while keeping the complete preparation list visible.

## Look and Feel

- Use readable text and sufficient whitespace. Put document names, status, and next actions before long explanations.
- Keep the complete preparation list visible; expand details only when needed.
- Distinguish confirmation and save states with words as well as color.
- Make item names and primary controls readable and usable on a phone.
- Keep menus, questions, states, and buttons consistent in the selected Korean or English language. Identify the original source's language separately.
- Reproduce the existing app's light gray-white background, dark green text and buttons, lime accents, rounded cards, and SettleK logo composition. Use its large home heading, journey cards, spacing, and information order as references.

## Features and Behavior

### Situation Input and Editing

Basis: `scope.md > The Core Loop` and `The POC Boundary`.

- Express help in terms of life changes such as moving, employment, residence, education, and naturalization. Do not restrict access to students.
- Ask only for information needed to distinguish guidance, such as residence status, relevant dates, employment, and housing. Briefly explain why each question is needed.
- Allow Not sure answers. Do not require invented values to continue.
- Allow a free-text explanation and let users review what will be sent to AI. Do not request passport numbers, registration numbers, exact addresses, or original documents.
- Preserve input in the edit screen so users do not need to start again.

Acceptance criterion: editing an existing situation shows its current values and allows users to change only what needs updating.

### Understanding the Situation and Follow-up Confirmation

Basis: `scope.md > The Unique Kernel` and `The Core Loop`.

- Combine AI-extracted facts with selected answers. If the explanation conflicts with a selected answer, ask specifically which value to use.
- Acknowledge an answer and show the next relevant question. When questions are complete, clearly distinguish the action that opens the preparation list.
- Do not ask for the same meaning again across screens.
- Conditions answered Not sure can remain as questions for the responsible institution. Explain what to confirm and why.
- Make it possible to tell whether actual AI was used. Do not present a test response or temporary connection issue as successful AI analysis.

Acceptance criterion: facts already present in the explanation affect the list, and conflicting information causes a focused confirmation of that item.

**Implementation note:** the current AI contract produces Korean and English summaries plus supported facts in four categories: housing, employment, study, and integration. It does not generate legal requirements or the task/document list. The rule engine constructs the list from confirmed profile values and reviewed catalog entries.

### A Personalized, Complete Preparation List

Basis: `scope.md > The Unique Kernel` and `What "Working" Looks Like`.

- Gather preparation relevant to the situation and selected life changes. When the same document serves several purposes, show those purposes instead of requesting duplicates.
- Each item initially shows a **specific name, why it is relevant, preparation status, and next action**.
- Distinguish items supported by official guidance and confirmed conditions, candidates needing further applicability checks, and things to request or discuss in consultation.
- Changes to employment, housing, or held documents must change the relevant list, follow-up questions, or next actions.
- Do not hide one item until another is complete. Emphasize priorities while keeping the whole list accessible.
- When circumstances change, explain additions, changes, and items no longer applicable. Preserve unrelated records.
- Do not silently reuse a completion or reuse confirmation for a different application or changed circumstances. Clearly identify what needs another check.

Acceptance criterion: changing the same fictional user's situation changes the actual preparation content while preserving unrelated preparation records.

### Official Sources and Preparation Instructions

Basis: `scope.md > The Core Loop` and `The POC Boundary`.

- Identify the issuing institution or contact and how to start preparing each document.
- Link directly to an official issuing or guidance page when verified. For documents requested from an employer, school, or similar organization, identify the recipient and provide a short copyable request.
- Show evidence alongside the item: institution, material title, supported content, review date, and applicability.
- Do not represent the list as equally mandatory for every visa or every person. State the supported relationship between the user's conditions and the source.
- For insufficiently supported conditions, offer specific confirmation questions and an official inquiry route. Do not invent required documents or statutory deadlines without evidence.
- Do not imply that copying a request or opening an official site has sent a request, issued a document, or completed an application.

Acceptance criterion: each preparation item exposes its official source and instructions, and a copied request can actually be pasted for use.

### Held Documents and Preparation Status

Basis: `scope.md > The Core Loop` and `The POC Boundary`.

- Mark a document as held directly on its list item, without asking users to select the procedure and document type again.
- Separate possession from confirmation that the document can be reused for this preparation. Users confirm reuse themselves.
- Allow To do, In progress, and Done states, including undo. Several items can be In progress at once.
- Carry forward only user-confirmed records. AI must not decide that an item is complete or reusable.
- Restore saved data in the same device/browser and allow optional account saving after sign-in. Display browser-save and account-save states separately.
- Preserve the situation, confirmed answers, list, and progress. Ask separately whether the original free-text explanation should be retained. Confirmed facts and preparation records remain usable without retaining that original text.
- Before starting over or clearing records, explain the deletion scope and obtain confirmation.

Acceptance criterion: after marking two items In progress and one Done, reopening retains those states. Undoing completion also updates the remaining preparation.

### Account Storage and Backups

- Let a signed-in user review and explicitly save the profile, confirmed answers, held/preparation states, and reminders, then load them in another browser. Provide explicit save/load rather than automatic overwriting.
- Exclude original notes, identity-document numbers, original documents, and API keys from account storage. Display the transmission scope before saving.
- Allow separate deletion of account data and this browser's data. Confirm the scope before deletion and offer backup download.
- Users who are not signed in can still continue on the same device. Account-save controls provide a sign-in route.
- Do not automatically migrate records from the existing app. Verify per-account access boundaries.

Acceptance criterion: a fictional scenario saved to an account can be loaded in another browser session and is not visible to another user.

### Finding Official Sources and Comparing Applicability

- Search government and public-institution materials and see the guidance and conditions connected to the current situation.
- Show reviewed excerpts or summaries with applicable conditions. Finding a source does not establish that all legal requirements are met.
- State whether results come from newly collected live information or a previously reviewed collection. The initial implementation searches and compares a reviewed catalog.

Acceptance criterion: different situations, such as moving and employment, lead to different relevant materials and confirmation points, and users can open the originals.

**Implementation note:** search and the relevance filter currently operate client-side on `web/data/catalog.ts`. There is no `/api/sources` route and no live whole-web retrieval.

### Reminders and Calendar

- Let users enter a title, confirmed date, reminder type, and advance-notice interval. AI must not independently calculate and confirm a statutory deadline.
- Create a reminder from a plan task, edit its date, and undo completion.
- Download reminders in a format supported by ordinary calendars. After import, notifications depend on the user's calendar settings.
- Clearly distinguish reminders shown in the app from push messages or texts sent while the app is closed.

Acceptance criterion: a fictional reminder's added, edited, and completed states persist, and the exported calendar file has the matching date and title.

### Installation and Two Languages

- Offer web-app installation in supported browsers and home-screen instructions for iPhone.
- Configure the app name, icons, and start route, and make main screens usable on mobile.
- Provide menus, questions, guidance, status, error, and save messages in Korean and English. Additional languages remain future work.
- Do not claim that live AI or account saving works without a network connection.

Acceptance criterion: installation configuration is valid; primary actions remain usable at phone width; switching language preserves inputs and progress.

## States and Boundaries

| Situation | What the user sees and how the app behaves |
|---|---|
| First visit | Brief guidance and situation entry; examples are labeled fictional. |
| More answers needed | Relevant questions and reasons, with existing input retained. |
| Analysis in progress | A processing state; repeated clicks must not create duplicate requests. |
| Preparation list ready | Situation summary, full list, priority checks, evidence, and generation mode. |
| Saved data exists | Options to continue or edit the situation. |
| Conditions change | Changed preparation and items to reconfirm, with unrelated completion records retained. |
| Temporary connection failure | Input and the last saved list remain. Retry is available; the old result is identified as an old result. |
| Saving unavailable | No success claim; current screen contents remain available for another save attempt. |
| Official information is insufficient | Specific questions and official contact routes; an empty list does not mean all preparation is finished. |
| Every listed item is prepared | Completion of this list, clearly separate from an institution's application or approval result. |

These definitions support reliable continuation of input and preparation records. The submission demonstration must show an actually completed normal flow.

## Product Decisions

### Principles to Retain

- Serve foreign residents in Korea.
- Make personalization change the actual preparation content.
- Connect prior input with possession and completion records.
- Let users see all documents and prepare them in parallel.
- Require user confirmation for document reuse and completion.
- Make the main journey understandable in Korean and English.
- Verify actual operation of core features before submission.

### Structure Retained from the Existing App

- Retain the nine screens and six main menus.
- Include account save/load, reminders, calendar export, and web-app installation alongside same-device saving.
- Distinguish retaining the original explanation from recording confirmed facts and preparation status.
- Reproduce colors, cards, headings, and navigation flow with newly written code. Recheck detailed conditions in the official materials.

## What We're Building

One working flow that combines situation input/editing, necessary follow-up confirmation, actual AI-assisted situation organization, a personalized preparation list linked to official sources, item-level instructions, possession/progress records, account saving and backups, source search and applicability comparison, reminders/calendar export, web-app installation, and Korean/English switching.

Supported official materials and applicability conditions must be visible in the documentation and interface. Selecting a topic must not be confused with automatically determining every detailed legal requirement.

## Deferred From the POC

- **Real-time collaborative editing and automatic synchronization:** users explicitly choose account save and load.
- **App-generated push, text, or email while closed:** as in the existing app, provide an in-app reminder list and calendar export.
- **Original-document uploads and automatic reading:** demonstrate the core flow through explanations and held-document status first.
- **Complete support for all residence statuses, regions, and exceptions:** accurately support reviewed official material first.

## Possible Later Enhancements

Expand guidance coverage, languages, and external calendar integrations based on feedback from real users.

## Non-Goals

- Issue government documents or submit applications on the user's behalf.
- Make final decisions about residence, work, or naturalization eligibility.
- Confirm document reuse or preparation completion for the user.
- Include business HR management in this personal product.

## Completion Criteria

Basis: `scope.md > What "Working" Looks Like`.

1. Complete situation entry through preparation-list creation using a fictional foreign-resident scenario.
2. Verify evidence that a real AI response was used to organize the situation.
3. Confirm that changing circumstances changes preparation items or follow-up questions.
4. Avoid repeated entry or loss of previously entered information and unrelated preparation records.
5. See the full document list and prepare multiple items concurrently.
6. Inspect each item's reason, issuing/request location, preparation method, and official source.
7. Save records, reopen them, continue preparation, and undo completion.
8. Complete the same main flow in Korean, English, and a phone-sized layout.
9. Make a short demonstration video without actual personal information.
10. Verify account save/load and separation between users.
11. Verify reminder creation, editing, completion, and calendar download.
12. Provide the existing app's nine screens with the same purposes and menus, and check installation settings.

## Open Questions

- **Research for technical design:** document the intended audiences, freshness, and conditional preparation items of the initial sources. Do not implement unverified legal requirements, deadlines, or documents as definitive.
- **Technical design decisions:** determine how to implement and verify equivalent web deployment, account storage, and Nebius integration in the new project.
- **Comparison record:** maintain feature implementation and actual verification status in `parity.md`. A screen alone or a simulated response is not completion.

## Implementation Status Note

The preceding open questions and acceptance criteria are preserved from the approved design. The repository now contains an implementation and verification records, so these planning statements are not a current test report. Refer to `parity.md` and `../docs/verification.md` for evidence and remaining checks.


## Final-review refinement — 2026-10-26

At the creator's request, compare the previous completed plan with updated documents as added, removed, recheck and carried forward. The comparison profile excludes notes and stays on the device; account loading and a new example reset it. Add scoped official-check guidance for E-7-1, E-7-4, D-10-1, F-2 and F-6. F-2/F-6 do not automatically receive generic E-category employer candidates. The library has 15 reviewed references with scope and review dates. External foreign-resident usability testing remains unperformed because no participant was available; technical verification is recorded separately.
