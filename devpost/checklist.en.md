---
doc: checklist
language: en
status: translation-of-approved
source: checklist.md
updated: 2026-10-27
---

# SettleK — Build checklist

English counterpart of the approved Korean checklist. Fast mode combines implementation and verification, with creator feedback on the completed flow. This translation does not create a new approval or mark an unperformed creator activity complete.

## Slices

- [x] **1. Enter a situation and receive a real personalized plan.**
  - Usable result: home, input, questions and plan in the existing design; fictional inputs produce real AI analysis and source-linked preparation.
  - Reason for sequence: verify personalization before documents, records and dates depend on it.
  - PRD: core journey, situation understanding and personalized preparation. Spec: navigation, situation/questions, AI/rules, look and feel.
  - Build: separate runtime, bilingual screens, reviewed sources/rules, Nebius integration, missing/conflicting questions and generation status.
  - Verification: two live cases produce different document lists; known facts are reused; request limits and secret protection; browser home-to-plan journey.
  - Creator check: compare the experience and change a fictional condition to inspect how the list changes.
  - Commit: `Build SettleK situation flow and grounded AI plans`.

- [x] **2. Prepare documents and continue through account records.**
  - Usable result: instructions and sources for the whole list, multiple simultaneous preparation states, ownership/reuse/history and save/load.
  - Reason for sequence: connect verified planning to saved preparation and reduce repeat input.
  - PRD: sources, ownership/preparation, account storage/backup and catalog search. Spec: documents, records, source library and data model.
  - Build: documents/records/sources, request text, reconfirmation after changes, device persistence, account save/load, backup, scoped deletion and user isolation.
  - Verification: two preparation items, completion undo, context-dependent reuse, restoration, isolation and exclusion of original notes.
  - Creator check: change two document states, return to them and assess the instructions and sources.
  - Commit: `Add document preparation and private saved records`.

- [x] **3. Complete reminders, installation and all screens.**
  - Usable result: nine screens with calendar export, installation guidance and two languages.
  - Reason for sequence: connect returning to the app after the core planning/storage flow is verified.
  - PRD: reminders/calendar, installation/languages and acceptance criteria. Spec: calendar, installation and verification.
  - Build: reminder add/edit/complete/export, install metadata, mobile/two-language UI, separate private deployment, README/license and actual verification records.
  - Verification: calendar dates/title/format, icons, language/layout, feature comparison, deployment and environment-specific checks.
  - Creator check: use the complete input-to-save-and-return flow and identify differences or friction.
  - Commit: `Complete reminders install and SettleK parity checks`.

## Hands-on Checkpoints

The first working preview was shown. Intermediate creator checks were combined into a final review; showing a preview does not mean the creator completed testing.

- [x] Creator's final exploration and feedback on all screens, records and reminders. The creator used and recorded the hosted flow; feedback clarified question visibility and button instructions.

## Final Review

- [x] Final app review: the creator approved the job-search-to-job-offer example, recorded the flow and moved on to submission preparation. Public repository, video URL and final submission remain separate gates.

## Code Tour and App Map

- [x] Learning activity: guided practical walkthrough and evidence-based recap of situation input, AI facts, missing questions and preparation. The explanation distinguishes an AI request that reads a consented note from updating selected answers without AI. This was not a code-editing exercise.
- [x] Optional edit and transfer reflection addressed: no additional exercise was added; the creator chose submission preparation after practical feedback and recording.
- [x] Finished-code `app-map.html` generated, checked and shown.

The implementation, private deployment and creator review are complete. The learning wrap-up is a guided practical walkthrough and app-map recap, not a hands-on code-editing session or an external-user study.

## Completion evidence

82 automated tests, type checking and the production build passed. Local browser checks covered preparation, account save/load, reminders and calendar export. Hosted owner checks covered real AI, conflicting facts, documents, account save/load, backups and calendar export. See `docs/verification.md` for exact evidence and limitations. Public repository publication, video and Devpost submission are separate remaining steps.

- The creator's recording shows a real AI response, two added and one removed preparation candidates, retained lease readiness, calendar import, and a successful account update to version 4. See the dated evidence in `docs/verification.md`.
- Situation-change revision: added/removed/recheck/carried-forward comparison and five status-specific official-check cards verified mechanically and in the creator's recorded flow. Actual external-user testing remains unperformed; a protocol is ready.
