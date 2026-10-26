# SettleK

A personal settlement navigator for foreign residents in Korea. SettleK connects a person's situation with official information, preparation candidates and their next action.

This Build With AI project reimplements the existing personal SettleK experience in new application code. Its audience includes working residents, job seekers, students and other long-term residents. The separate HR application is outside this project.

## Working application

Watch the [English narrated demo (2 minutes 56 seconds)](https://youtu.be/KHORzTeLq6I). It shows the working app, a real AI request, situation-change comparison, official sources, reminders and account saving.

All nine screens are implemented: home, situation, follow-up questions, plan, documents, records, official sources, reminders and installation. The interface supports Korean and English, including mobile navigation.

- Personal plans adapt to housing, work, study and integration answers. Existing answers are reused; conflicting facts are confirmed.
- A before/after panel shows added, removed, recheck and carried-forward documents after a situation update. The previous completed plan remains on this device, with notes excluded.
- Detailed official-check cards cover E-7-1, E-7-4, D-10-1, F-2 and F-6; 15 reviewed sources state their scope. F-2/F-6 do not automatically receive generic E employer candidates. Overseas D-10 material is explicitly a reference, not domestic requirements.
- Document cards show preparation steps, where to obtain documents, official sources and bilingual request text. Ownership, current preparation and confirmed reuse are separate states.
- Device progress persists across refreshes. Signed-in users can explicitly save, load and delete an account snapshot, export a JSON backup, and clear device records. Original notes and document files are excluded from account storage.
- Dates are user-confirmed. Reminders support editing, completion, undo, task links and ICS export with optional calendar alarms.
- Installable web-app metadata, icons and a static offline notice are included. Actual installation depends on browser support; personal pages and API responses are never cached by the service worker.

Two local fictional scenarios and a hosted fictional scenario have been verified against **NVIDIA Nemotron 3 Super on Nebius Token Factory** through this app's server. The model extracts situation facts and a summary; reviewed rules select documents and official references. An explicit example mode uses no model call. Ordinary tests use mocked model responses and do not establish live integration.

## Run locally

Requirements: Node.js 24 and npm.

```sh
cd web
npm ci
cp .dev.vars.example .dev.vars
# Add your own NEBIUS_API_KEY and set NEBIUS_AI_ENABLED=true in .dev.vars.
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_worthless_iron_lad.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_violet_praxagora.sql
npm run dev -- --port 4189 --hostname 127.0.0.1
```

Open http://127.0.0.1:4189. You can use the fictional example without an AI key. Apply a migration only once to a given local database. The preview's sign-in uses a development identity and does not prove hosted account authentication. The production Site uses its platform-managed identity.

## Judge walkthrough

1. Switch to English and choose **Try an example**. This explicitly labeled example does not contact an AI provider.
2. In the follow-up questions, choose **Lease in my name** and finish the plan. The fictional case is a D-10-1 job seeker in Seoul.
3. Open the lease agreement instructions and official source. Mark the lease ready, held and reusable.
4. Return to **My situation**, change Employment to **Have a new job offer**, and choose **Update from answers (no AI call)**.
5. Inspect the comparison: two preparation candidates added, one removed, and two carried forward. The lease keeps its ready state. These are preparation candidates, not an immigration permission decision.
6. Add a reminder with a fictional date, export it to a calendar, and save progress in **My records**. Local account storage uses the development identity described above.

Try the [public hosted app](https://settlek-buildai.sally127506.chatgpt.site). The example and local preparation work without sign-in. Real AI analysis and account snapshots require signing in with your own ChatGPT account; no personal password or API key is supplied as a testing credential. The hosted AI uses the project's existing shared request allowance, shown in the app. If that allowance is exhausted, example/answer-based planning still works and the recorded live-inference evidence remains available.

For local actual note analysis, configure your own server-side Nebius key, explicitly consent to sending a fictional note, and choose **Create my AI plan**. The app labels real inference, example data and answer-only updates separately. Recorded hosted inference and real account-save evidence are in [verification](docs/verification.md). Never enter real identity or document numbers for a demo.

## Check the app

```sh
cd web
npm test
npm run typecheck
npm run build
```

`node scripts/verify-live.mjs --live` explicitly makes two paid model requests against the running local server using fictional inputs. It checks extracted facts and resulting document differences, then records model/request metadata in `docs/live-verification.json`. Ordinary tests mock provider responses and are not evidence of live integration.

The app permits at most 20 reserved provider requests per database with a single concurrent reservation. Failed attempts count toward the limit; there is no automatic paid retry. This is not an account-wide spending cap.

## Data and boundaries

API credentials remain server-side in ignored environment files or production secrets. Notes are optional; sending the full note to Nebius requires explicit consent. Avoid names, exact addresses, contact details, identification numbers and original documents. Automated checks cannot identify all sensitive information.

A user's preparation or reuse confirmation does not mean an authority has accepted an application. The app does not issue documents, submit applications, grant immigration permission, decide eligibility, or calculate a legal final filing date. Documents are labeled by the scope of the reviewed sources; subtype-specific requirements need confirmation.

Sources include Government24, HiKorea, the Ministry of Justice, the Ministry of Foreign Affairs, the National Law Information Center, NIIED and Socinet. Historical references are labeled. Official sources may be updated after review.

## Project map

- `devpost/`: scope, product definition, technical plan, feature comparison and build checklist. The approved Korean planning files have English counterparts: `scope.en.md`, `prd.en.md` and `spec.en.md`; build and parity records also have `.en.md` counterparts.
- `web/app/`: screens and server endpoints.
- `web/lib/`: situation rules, model integration and validation.
- `web/data/catalog.ts`: reviewed sources and document preparation guidance.
- `web/tests/`: meaningful behavior and input-validation tests.
- `docs/`: verification evidence.

The ignored learner profile is private and is not part of the public repository. The framework foundation is the Sites Vinext starter; its retained licenses and notices apply to those files. SettleK application logic and screens were written for this project.

The public review package is a source snapshot. Its provenance and excluded local material are described in [publication provenance](docs/publication-provenance.md).

## Hosting and disclosure

The [hosted app](https://settlek-buildai.sally127506.chatgpt.site) was made public with the creator's authorization on 2026-10-27 KST. Protected AI and account endpoints still require the visitor's own sign-in; public access does not expose another person's saved records. Source and submission status are tracked in `docs/submission-checklist.md`.

The SettleK name, concept, design direction and product flow predate this project. They are reused as reference with the creator’s direction. Application source was newly written during this Build With AI project; the existing SettleK application source was not copied. The Sites Vinext starter and its dependencies are retained foundation code. This disclosure does not guarantee organizer eligibility approval.
