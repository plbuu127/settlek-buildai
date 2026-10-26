# SettleK verification

Checked 2026-10-26; updated 2026-10-27 KST with the creator's recorded fictional-data walkthrough and publication checks. This document distinguishes automated tests, local development identity and hosted owner authentication.

## Result

The core journey works in the deployed app: situation → real AI facts → explicit conflict/missing-answer confirmation → rule-based plan → document preparation → account save/load. All nine screens were visited in the hosted browser. Public GitHub publication, a public demo video and final Devpost submission remain separate tasks.

## Automated checks

- 82 tests passed after the situation-comparison/status-guide revision. Coverage includes personalized documents/questions, preparation context and reuse, consent, model-response validation and request budgets, account ownership/concurrency, sanitization, and calendar dates/escaping/Unicode.
- Provider unit tests use mocks. They do not prove live model integration.
- TypeScript and the production build passed.
- Local D1 migrations for the AI budget and account records are applied.

## Actual model integration

`docs/live-verification.json` records two local fictional scenarios using NVIDIA Nemotron on Nebius Token Factory: provided housing/new offer versus own lease/job search. Their facts and document candidates differ as expected.

A further local browser run confirmed note consent and follow-up questions. A hosted owner browser run returned actual live metadata at `2026-10-26T13:02:51.270Z`, request `chatcmpl-39b0d628345d4fb228a33190464391cc`, model `nvidia/nemotron-3-super-120b-a12b`, 428 tokens. The UI displayed the provider/model and exact supporting note excerpts. See `hosted-verification.json`.

The hosted run began with a stored own-lease answer and a fictional note saying the employer provides housing. The app asked which housing answer to use. Choosing provided housing and answering the remaining address-report question produced accommodation confirmation, employment-related candidates and official consultation guidance. Example mode uses no provider call. Account restoration is labeled separately and does not imply a new AI request.

AI extracts a summary and facts in four supported categories. Reviewed rules generate tasks and document candidates. This is not document-file OCR, a legal eligibility decision or an agency approval.

## Hosted browser checks

| Function | Observed result |
|---|---|
| Identity | Owner could access the private Site in Chrome; account controls identified hosted account storage rather than a development identity |
| Navigation | Nine screens, header/menu links, home return and browser back worked after the production navigation correction |
| Preparation | Residence card marked Ready/held/reuse-confirmed; accommodation confirmation independently In progress |
| Request text | Copy button placed the displayed English housing request on the clipboard |
| Account save | First snapshot saved at `2026-10-26T13:05:17.017Z`, version 1 |
| Account restore | Changed local residence-card status to Not started, loaded the account snapshot, and observed Ready plus held/reuse restored; accommodation remained In progress |
| Return visit | A new browser tab retained local preparation and detected the same account snapshot |
| Backup | Downloaded JSON contained 5 preparation entries and 3 history entries; original note blank and raw analysis absent |
| Reminders | Added a task-linked date; changed title/date; completed/undid completion; removed during editing and restored it |
| Calendar export | Actual downloaded ICS contained 2026-10-30, the fictional reminder title and opt-in `TRIGGER:-P7D` |
| Sources | Government24 query and situation filter returned the expected card; unmatched query showed a clear empty-result message |
| Languages | Korean and English controls and journeys inspected; region labels use their English display names in English mode |
| Installation | Hosted instructions rendered; manifest, icons and offline notice checked separately |

The account snapshot was not permanently deleted. The earlier overwrite-confirmation automation check was inconclusive. The creator's later recording independently confirms a successful hosted update to version 4 (see below). Version conflicts, updates and deletes also have automated database/API coverage. Real account isolation across two production users and a second physical device remain separate checks.

## Corrections included in the audit

- Internal links use a statically imported router, resolving the production-only dynamic-import navigation issue.
- Restoring or clearing records also clears pending AI conflict state.
- Removing an edited reminder resets its edit form; undo respects the reminder limit.
- Source search has an empty-result message, and small English labels were corrected.

## Privacy and publication checks

The key is server-only in an ignored local file or a production secret. The built client/archive were checked for the configured key and had no match. The 2026-10-27 publication check covered 174 tracked files and 229 historical Git blobs: no configured key or checked credential/private-key patterns were found, and neither the private learner profile nor local credential files had committed history. This is a bounded publication check, not a comprehensive security audit. Intended additions are checked again before packaging.

Original notes are excluded from account snapshots/backups and from device persistence unless opted in. Account reads/writes use trusted server identity; same-origin changes and optimistic versions are tested. The service worker excludes API/auth responses and personal pages from caches.

Git author metadata contains a local personal/machine identity. It must be reviewed before public Git publication; history has not been rewritten. The review ZIP excludes `.git`, keys, learner profile, runtime databases and dependencies.

Publication update, 2026-10-27 KST: the creator authorized a public source snapshot excluding the original private Git metadata, and separately requested a public website. Sites confirmed access mode `public`, revision 2, at `2026-10-26T17:47:14.367382Z`. Earlier owner-private checks below describe the audience at the time they ran; they are not the current access policy. The existing provider request cap was not increased.

Public verification: an anonymous clone of `https://github.com/plbuu127/settlek-buildai` at source snapshot `0c7edf88af7a22facd8ef911969c158a3f370962` matched all 175 audited files byte-for-byte. The LICENSE was anonymously accessible and GitHub detected MIT. The snapshot author and committer used GitHub noreply addresses. Later documentation-only commits update publication status.

Unauthenticated browser-style HTTP requests to the public app returned 200 for the home page and `/api/status`, with AI configured, storage ready, no signed-in identity and 13 shared requests remaining at check time. `/api/records` returned 401. No additional paid inference was made. A plain Python user agent initially received 403; the browser-style request succeeded. These checks do not replace testing two distinct real production accounts.

## Creator-recorded walkthrough — 2026-10-27 KST

The creator recorded the deployed app with a fictional D-10-1 job seeker in Seoul. This is creator verification, not testing by a recruited foreign resident.

- Real AI metadata: `2026-10-26T16:08:13.372Z`, request `chatcmpl-c7e4722ef663d62f94e33f0a0b70eabd`, model `nvidia/nemotron-3-super-120b-a12b`, 365 tokens.
- Housing follow-up answered with a lease in the person's name. Lease agreement marked ready, held and reusable; Government24 opened from its instructions.
- Employment changed from looking for work to a new job offer using **Update from answers (no AI call)**. The comparison showed two added, one removed, zero recheck and two carried-forward items. Lease readiness was preserved.
- Request text copied; official HiKorea reference opened.
- A fictional reminder dated 2027-03-31 was exported and imported into the native Calendar app. This confirms import, not later notification delivery or a legal filing deadline.
- Hosted account update succeeded at `2026-10-26T16:12:36.749Z`, version 4, displaying “Your preparation is saved to your account.”
- The history and installation-instructions screens were shown. This does not establish a second physical device or completed mobile installation.

The creator's 333.88-second source recording was edited to 176.20 seconds, keeping all nine screens and core result moments. The English-caption version has 200 narration words and no audio track. All 5,286 output frames decoded without errors. A public video upload remains pending; no public URL is asserted.

The 82 automated tests were rerun successfully on 2026-10-27 KST. No paid model request was made during this publication-preparation run.

## Device and external-service limits

Physical iPhone/Android installation, real calendar notification delivery, printer output, every browser, every visa subtype and all linked government attachment contents are not certified by these checks. Narrow local layout and hosted browser behavior were inspected. The app does not send its own SMS/email/push, submit applications or issue documents. Source applicability still requires the user's official confirmation.

## Deployment

Owner-private URL: https://settlek-buildai.sally127506.chatgpt.site

Core hosted audit performed against source commit `50183e4d9e54fe350aedfd18cdde3b2b6783c2c0`, deployed successfully on 2026-10-26. The final package also includes documentation alignment and the English region label correction. Native deployment metadata is retained separately during publication.

Private service checks previously confirmed configured AI/storage and rejected unauthenticated account access with 401. These checks were followed by the actual owner browser checks above. The owner-private URL is not yet a public judging link.

Final native publication succeeded at `2026-10-26T13:22:03.500055+00:00`, source `4dbec23670b7539124ebe843348d116216c0f633`, deployment `appgdep_6adf53eafd9c8191b379733af2af5737`. Owner-private access was preserved.


## Situation-change and residence-status revision — 2026-10-26

Eight added behavioral tests cover housing substitution, region-triggered rechecks, first-plan/example reset, comparison across intermediate questions, subsequent baselines, all selectable status codes through account validation, F-2/F-6 employer-document boundaries, and source traceability/filtering. All 82 tests and type checking pass. These rule tests do not make provider calls.

Local browser, English UI: fictional example → address Not yet → completed plan; residence card marked ready/held/reusable; housing changed from own lease to provided. The comparison showed Accommodation confirmation added, Lease agreement removed, four documents carried forward, and residence card Ready status kept. After refresh, the comparison and ready state persisted. Changing to F-6 showed its guidance, removed two generic employer candidates, and requested a new residence-card check.

Source review: four additional official references (2026 E-7 notice, October 22 E-7-4 announcement, current Article 23, Thai-embassy D-10-1 page). There are 15 sources total and five subtype guidance cards. E-7-4 attachment specifics were not verified; the app does not remove documents based on unspecified announcement details. The D-10-1 consular source is explicitly excluded as a domestic required-document list. Other subtypes remain limited to the reviewed general guidance.

**External-user usability test: not conducted.** No actual foreign resident took part. The five-minute protocol is prepared in usability-protocol.md. Agent browser checks and automated tests are not human participant feedback; no participant count or quotation is asserted.

Native publication of the comparison/status revision succeeded at `2026-10-26T13:58:24.163375+00:00`, source `b0cdf32ba3d544fea53d16d073806102636176f2`, deployment `appgdep_6adf5c70cd608191b9af739baf585a35`. The existing owner-private audience was preserved. The built archive contained 187 files; inspection found no runtime key or private learner-profile file.

Hosted owner Chrome follow-up: E-7-1 selection produced its official-check card. After marking the residence card ready/reusable, changing housing from lease to provided showed one added candidate, one removed candidate, zero rechecks and four carried-forward documents. The residence card displayed Ready status kept. No additional provider call was made; hosted requests remaining stayed at 19.

## Approved job-search demo — 2026-10-26

The built-in fictional example now starts with a D-10-1 resident looking for work in Seoul. It asks for housing before creating a plan. This is a no-AI practice path; the recording plan separately specifies a real AI request.

Hosted owner Chrome verification: Try an example → Lease in my name → plan with three preparation candidates. Marked the lease Ready, held and reuse-confirmed; changed Employment from Looking for work to Have a new job offer; selected Update from answers (no AI call). The comparison showed two added candidates (employment contract and employer business-registration copy), one removed candidate (job-search outline), zero rechecks and two carried-forward items. Lease agreement displayed Ready status kept. The residence status remained D-10-1. These are candidate-list changes, not a permission or mandatory-document determination. No provider request or account-snapshot overwrite was performed for this check.

Type checking and the production build passed. The 187-file deployment archive contained no configured runtime secret or private learner profile. Native deployment succeeded at `2026-10-26T14:35:45.678502+00:00`, source `7ae6331b14e86e98447dad8e03c0eeab72eff011`, deployment `appgdep_6adf65340c3c819188335c8001bc38e5`. Owner-private access was preserved.
