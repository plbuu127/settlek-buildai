---
doc: spec
language: en
status: translation-of-approved
source: spec.md
source_status: approved
source_approved: 2026-10-26
translated: 2026-10-26
---

# SettleK — Technical Specification

This is an English counterpart of the approved Korean specification in `spec.md`. It preserves that design and its boundaries. Small implementation notes identify differences between the proposed structure and the current source tree. It is not a new user approval or a production acceptance report.

## How This Works, In Plain Language

Rebuild the existing personal SettleK app's design, nine screens, menus, and behavior with new code. When users enter their situation, AI organizes the explanation and the app provides preparation connected to official materials. Users confirm document preparation and reuse, save records on their device or account, and continue later. They can export dates they have personally confirmed to a calendar.

Preserve the existing app. The new app uses a separate address and storage. Do not copy existing code or user records, and recheck the current applicability of official materials.

## Where It Runs and How Someone Tries It

- **Development:** run from this project's `web/` using Node 24. The approved development command is `npm run dev -- --port 4189 --hostname 127.0.0.1`, with `http://127.0.0.1:4189` as the local address. The README must contain verified setup and run instructions.
- **Deployment:** create a separate Sites web app and initially deploy it privately for the owner. Do not modify the existing site or its records.
- **Account:** use ChatGPT sign-in in the deployed environment. Distinguish local development sign-in from actual deployed-account verification.
- **AI:** use NVIDIA Nemotron through Nebius, as in the existing app. Record a successful connection only after checking a real response from the new app.
- **Submission:** prepare a public repository with runnable source and planning documents, plus a short demonstration video. Deployment alone does not complete the submission.

**Implementation note:** `web/package.json` currently declares Node `>=22.13.0`; Node 24 remains the documented development choice. The `dev` and `build` scripts use `scripts/run-framework.mjs`. The `start` script runs the built Worker through Wrangler. See `docs/verification.md` for completed build and hosted-browser checks.

## Stack

| Area | Approved implementation choice | Purpose |
|---|---|---|
| Interface | Sites Vinext/React starter, TypeScript, custom CSS | Recreate the design and nine screens |
| Server | Cloudflare Workers | Protect the AI key and process user-specific requests |
| Account records | Sites D1 with a Drizzle schema and migrations | Save and load account records |
| Device records | Versioned browser-storage format | Continue without signing in |
| AI | NVIDIA Nemotron through Nebius | Organize facts from the explanation for personalization |
| Calendar | User-entered dates and iCalendar files | Use reminders in ordinary calendars |
| Installation | Web-app manifest and device-specific guidance | Access from a phone's home screen |

Official references retained from the approved design: [Vinext](https://github.com/cloudflare/vinext), [React](https://react.dev/learn), [Workers](https://developers.cloudflare.com/workers/), [Drizzle and D1](https://orm.drizzle.team/docs/get-started/d1-new), [browser storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [web-app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), and [iCalendar](https://www.rfc-editor.org/rfc/rfc5545).

**Implementation note:** the original AI stack description included priorities and reasons. The current model contract is narrower: bilingual summaries and facts in four categories. The application rules supply tasks, document candidates, their reasons, and task order.

## Look and Feel

Implements `prd.md > Screens and Layout` and `Look and Feel`.

Reproduce the existing app's gray-white background `#f7f8f4`, dark text `#14211b`, green buttons `#173f36`, lime accents `#bdf56a`, and light blue `#dbe8ff`. Compare the SettleK logo, large home heading, right-hand journey card, rounded white cards, and spacing. Use a vertical layout and bottom navigation on mobile. Do not include HR menus in the personal interface.

## Components

### Navigation and Screens

Implements `prd.md > Screens and Layout` and `Installation and Two Languages`.

Provide `/`, `/planner`, `/questions`, `/plan`, `/documents`, `/records`, `/sources`, `/reminders`, and `/install`. Support direct access, refresh, and browser back navigation while maintaining input and language across screens. Clearly label the fictional example; opening it must not trigger paid AI.

### Situation and Questions

Implements `prd.md > Situation Input and Editing` and `Understanding the Situation and Follow-up Confirmation`.

Normalize current situation, residence category, expiry, goal, region, life changes, selected answers, and preparation records. Do not limit the audience to students. Keep unknown values distinct and avoid asking for known information again. If facts inferred from a note conflict with existing answers, confirm only the conflicting value. Obtain separate consent before sending the note to an external service.

### AI Analysis and Source-based Plans

Implements `prd.md > Understanding the Situation and Follow-up Confirmation` and `A Personalized, Complete Preparation List`.

The approved architecture validates a bounded AI response and combines it with preparation rules linked to official materials. AI must not independently establish URLs, statutory deadlines, or required documents. Distinguish actual success, explicit example mode, and connection failure. On failure, preserve existing input and the previous result without presenting it as a new success.

**Current contract:** `lib/ai.ts` requests `summaryKo`, `summaryEn`, and a `facts` array. Each fact has `field`, `value`, and a verbatim `evidence` substring from the consented note. Allowed fields are `housing`, `employment`, `study`, and `integration`, with enumerated values defined in `lib/validation.ts`. The server checks response shape, nonempty summaries, allowed field/value pairs, and evidence matching the note. It returns bilingual summary text, accepted facts, and provider metadata. It does not return tasks, document requirements, legal deadlines, priorities, or eligibility decisions. `lib/planner.ts` builds the questions, tasks, document candidates, and context fingerprints from the resulting profile and the reviewed catalog.

### Document Preparation

Implements `prd.md > A Personalized, Complete Preparation List`, `Official Sources and Preparation Instructions`, and `Held Documents and Preparation Status`.

Provide the full relevant document list with duplicates combined and an incomplete-items filter; each card explains its related purposes. Link each item to its reason, where to obtain it, preparation steps, official links, and any request text. Distinguish To do, In progress, and Done from possession and reuse confirmation for this application. Reconfirm only affected items when conditions change. Provide printing and saved-state restoration.

### Personal Records and Account Storage

Implements `prd.md > Account Storage and Backups` and `Held Documents and Preparation Status`.

Save device state as it changes; save account records only when the user chooses. Restrict server reads and writes using the server-supplied user ID, never a client-submitted user ID. Detect conflicts through record versions. Exclude notes, raw AI responses, and keys from account records. Separate backup, browser deletion, and account deletion, and show the affected scope before loading or deleting.

**Implementation note:** browser persistence lives in `app/state.tsx`, using the versioned `settlek-buildai-v1` localStorage entry. Original note retention is opt-in. Account payload validation, plan reconstruction, version checks, and persistence are in `lib/records.ts`; the UI is in `app/components/records.tsx`. There is no `lib/storage.ts`.

### Source Library

Implements `prd.md > Finding Official Sources and Comparing Applicability` and `Official Sources and Preparation Instructions`.

Maintain institution, title, URL, review date, applicable conditions, and related items. Search and applicability comparison use reviewed official materials. Do not describe this as live whole-web search. Do not turn ambiguous or outdated materials into definitive requirements.

**Implementation note:** `app/settlek.tsx` imports and filters the `sources` collection from `data/catalog.ts` in the browser. No `/api/sources` endpoint exists.

### Reminders and Calendar

Implements `prd.md > Reminders and Calendar`.

Store user-confirmed dates, reminder type, related task, advance-notice interval, and source link. Support add, edit, completion, and undo. Export an iCalendar file with safely escaped titles. The app itself sends no push notifications, texts, or emails; imported-calendar notifications follow the user's calendar settings.

### Installation and Language

Implements `prd.md > Installation and Two Languages`.

Declare the name, icons, and start route in the manifest. Enable an install button in browsers that provide the installation event; show home-screen instructions for iPhone. Provide Korean and English navigation, questions, results, save states, and errors. Do not claim offline AI or account storage.

**Implementation note:** bilingual strings currently live alongside their components and catalog/rule entries, commonly as `{ ko, en }` values or a local `tr(ko, en)` helper. There is no `lib/i18n.ts`. The service worker provides a connection notice when offline; it is not a claim of full offline application functionality.

## Data Model

| Data | Main contents | Storage boundary |
|---|---|---|
| Profile / Answers | Residence category, goals, life changes, confirmed values and their context | Browser and explicitly saved account snapshot |
| Note | Optional explanation | Memory or opted-in browser storage; excluded from account storage |
| Plan | Items, reasons, sources, next actions, generation state | Browser; account data retains limited reconstruction state |
| Preparation | Progress, possession, reuse confirmation, application context | Browser and account |
| Reminder | Title, date, type, related item, completion | Browser and account |
| Source | Official material, applicability, review date | Public catalog file |
| Generation / Usage | Provider, model, request ID, token count, request reservation | Returned analysis metadata and server-side request budget, as clarified below |

**Implementation note:** the proposed specification placed generation/usage evidence in D1. The current D1 schema contains `ai_budget` (shared used count and busy-until reservation) and `records` (user ID, payload, version, update time). Provider request ID, model, token count, timestamp, and duration are returned as analysis metadata; there is no dedicated D1 table for per-request evidence. Account snapshots exclude raw AI responses. Current storage behavior should not be described as a full server-side AI audit log.

## File Structure

The tree below reflects the implementation, replacing the original proposed `storage.ts`, `i18n.ts`, and source API entries with their actual locations.

```text
build ai 대회/
├── devpost/
│   ├── learner-profile.md       # Excluded from public distribution
│   ├── scope.md / prd.md / spec.md
│   ├── scope.en.md / prd.en.md / spec.en.md
│   ├── parity.md                # Feature implementation and verification comparison
│   └── checklist.md             # Build steps and direct-use checks
├── web/                         # Separate Sites application
│   ├── app/
│   │   ├── page.tsx             # Home route
│   │   ├── [screen]/page.tsx    # Eight working-screen routes
│   │   ├── layout.tsx          # Application layout
│   │   ├── settlek.tsx         # Main screens, navigation, and source filtering
│   │   ├── state.tsx           # Shared state and versioned browser persistence
│   │   ├── chatgpt-auth.ts     # Authentication integration
│   │   ├── components/         # Documents, records, reminders, installation
│   │   ├── api/
│   │   │   ├── analyze/route.ts
│   │   │   ├── records/route.ts
│   │   │   └── status/route.ts
│   │   └── globals.css         # Visual design
│   ├── lib/
│   │   ├── planner.ts          # Questions and conditional preparation rules
│   │   ├── preparation.ts      # Context-sensitive progress and history
│   │   ├── records.ts          # Account payload validation and persistence
│   │   ├── validation.ts       # Profile validation and allowed AI facts
│   │   ├── ai.ts               # Server-side AI request and response checks
│   │   ├── calendar.ts         # Reminders and iCalendar export
│   │   ├── utils.ts            # Shared utility
│   │   └── connector-* / connectors.ts  # Sites connector support
│   ├── data/catalog.ts         # Reviewed sources and bilingual document guidance
│   ├── db/                     # D1 schema and connection
│   ├── drizzle/                # Sequential migrations
│   ├── public/                 # Icons, manifest, service worker, offline notice
│   ├── tests/                  # Main behavior checks
│   ├── scripts/                # Runtime, build, and real-connection verification
│   ├── .openai/hosting.json    # New app identifier
│   ├── .dev.vars.example       # Server-setting example without secret values
│   └── package.json
├── docs/verification.md         # Only checks actually performed
├── README.md / LICENSE
└── .gitignore
```

Include planning documents and runnable source in the public submission repository. Include publishable planning documents in Sites deployment source as well, excluding private learner-start records. Do not import the existing application's implementation, Git history, or user data.

## External Services and Dependencies

### Nebius Token Factory

- Server request: `POST https://api.tokenfactory.nebius.com/v1/chat/completions`.
- Server-only key: `NEBIUS_API_KEY`; model: `nvidia/nemotron-3-super-120b-a12b`.
- Send the structured situation and answers. Include the original note only with separate consent.
- Validate the JSON structure and allowed facts, then connect accepted facts to reviewed rules. Record returned model, request ID, and usage as evidence of a real call.
- Limit request duration, body size, and concurrency. Do not automatically retry paid requests. Opening a screen, changing language, marking completion, and saving do not invoke AI.
- The approved initial cap was 20 real requests across the new app. The current `MAX_REQUESTS` is 20. Reserve requests atomically in D1 so concurrent requests and process restarts cannot bypass the count. Do not increase the cap or add credit arbitrarily. A request-count cap does not guarantee an account-wide dollar-spend cap.

References retained from the approved design: [requests and authentication](https://docs.tokenfactory.nebius.com/api-reference/introduction), [JSON responses](https://docs.tokenfactory.nebius.com/ai-models-inference/json), and [rate limits](https://docs.tokenfactory.nebius.com/ai-models-inference/rate-limits). Check model availability and account configuration before real calls.

**Implementation note:** the current request contains the cleaned profile and consented note, not a separate held-document inventory. It uses a 60-second provider timeout, a 75-second shared reservation, and `max_tokens: 1800`. The app checks `NEBIUS_AI_ENABLED === "true"` as well as the key. Each reserved attempt consumes the shared request count; it is not a success-only counter.

### Identity and API

- `GET /api/status`: configuration, storage readiness, sign-in/local flags, model, and remaining request count. Never return the key.
- `POST /api/analyze`: validate authentication, same-origin request, situation input, and consent before real analysis.
- `GET/PUT/DELETE /api/records`: handle only the authenticated user's records. Mutations verify same origin; writes and deletion use expected versions.
- **Source search:** performed client-side against the reviewed catalog. The original proposed `GET /api/sources` is not implemented.
- Use `Cache-Control: no-store` for account and AI responses, and do not print original request content to operational logs.

## Preserving Input and Retrying

Retain input and the last plan when AI or storage connectivity fails. Do not label an old result as a new success. Block duplicate requests and allow deliberate user retries. Do not report a failed save as completed.

## What Was Simplified and Why

The approved design does not intentionally remove existing personal-app features. It retains the same boundaries: no automatic reading of original documents, institutional application submission, complete visa-eligibility determination, live whole-web search, or app-generated push notifications. Account persistence uses explicit save/load rather than real-time collaborative editing.

## Verification Method

1. Compare the nine screens, design, menus, direct access, and browser-back behavior with the existing app.
2. Check real AI responses and list differences for distinct fictional scenarios, including workers and job seekers.
3. Check the complete document list, preparation instructions, request text, possession, reuse, and undoing completion.
4. Check returning to the app, account save/load, blocked cross-user access, backups, and scoped deletion.
5. Check reminder creation/editing/completion and exported dates/titles.
6. Check Korean, English, mobile layouts, and installation settings.
7. Check that public source and logs exclude keys and original personal content.
8. Incorporate direct-use feedback, then record the completed flow.

## Decisions and Open Issues

- **Product baseline:** the same personal features, design, and journey as the existing SettleK, for foreign residents in Korea generally.
- **Implementation direction:** a separate Sites application, D1 account records, Nebius/Nemotron, and newly written code.
- **Verification status:** the approved Korean specification was written before the new app's real integrations, account storage, and deployment checks. That historical statement must not be read as the current verification status. The repository now contains implementation and recorded checks; consult `parity.md` and `../docs/verification.md` for their scope and remaining gaps.
- Recheck official materials for each feature. Do not turn uncertain conditions into definitive requirements.
- Reimplementing equivalent behavior does not mean copying existing code or records, or changing dates of earlier work.

## Implementation alignment — 2026-10-26

The Korean technical specification now names the actual state, records and catalog modules and the bounded summary/fact AI contract. Current environment-specific checks are recorded in `docs/verification.md`. Internal navigation uses a local anchor component with a statically imported router in `app/components/link.tsx`.


## Final-review refinement — 2026-10-26

At the creator's request, compare the previous completed plan with updated documents as added, removed, recheck and carried forward. The comparison profile excludes notes and stays on the device; account loading and a new example reset it. Add scoped official-check guidance for E-7-1, E-7-4, D-10-1, F-2 and F-6. F-2/F-6 do not automatically receive generic E-category employer candidates. The library has 15 reviewed references with scope and review dates. External foreign-resident usability testing remains unperformed because no participant was available; technical verification is recorded separately.


## Sharing instructions — 2026-10-27

- Public source and planning documents: https://github.com/plbuu127/settlek-buildai
- Public app: https://settlek-buildai.sally127506.chatgpt.site
- English narrated/captioned demo (176.20 seconds): https://youtu.be/KHORzTeLq6I
- Examples and answer-based preparation work without sign-in. Real AI and account snapshots require the visitor's own ChatGPT sign-in and use the existing shared AI request allowance. Never share a personal password or API key as testing credentials.
- YouTube Public visibility and signed-in browser playback were verified. A separate signed-out playback check remains outstanding. After the creator's final review and explicit instruction, Devpost submission was completed on 2026-10-27 KST and the “Project submitted!” confirmation was verified: https://devpost.com/software/settlek-qp8vld.
