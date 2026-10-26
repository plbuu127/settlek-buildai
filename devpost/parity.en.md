# SettleK — Existing-app feature comparison

English counterpart of `parity.md`, updated 2026-10-26. The personal SettleK screens, design and interactions are recreated with new application code. Existing application source is not copied.

| Area | Recreated behavior | Verification |
|---|---|---|
| Home | Colors, headline, journey card, start and example | Local and hosted browser |
| Situation | Residence category, goal, region, changes, optional note | Automated and browser checks |
| Questions | Reuse known answers; ask about missing/conflicting facts | Live hosted conflict and missing-answer flow |
| AI | NVIDIA Nemotron through Nebius | Two local recorded cases and a hosted live request |
| Plan | Next action, tasks, document candidates, completion/undo | Automated and browser checks |
| Documents | Combined list, instructions, official links, request text | Hosted preparation controls and clipboard verified |
| Ownership/reuse | Separate possession from confirmation for this application | Hosted browser and context-change tests |
| Device storage | Keep progress across navigation, refresh and return | Local and hosted browser |
| Account storage | Sign-in, explicit save/load, user isolation | Hosted owner save/load; automated isolation tests |
| Records | History, backup, separately scoped deletion | Hosted history/backup; local/automated deletion checks, no hosted account deletion |
| Sources | Reviewed-catalog search, applicability, original links | Hosted search, situation filter and empty result |
| Reminders | Add/edit/complete/undo, task links, calendar export | Hosted controls and downloaded ICS contents |
| Installation | Manifest, icons, platform instructions | Configuration checked; actual phone installation still requires a device check |
| Languages | Korean and English screens, questions, results and controls | Local and hosted browser |
| Navigation | Nine routes, menus, direct access and browser back | Hosted browser after navigation fix |
| Mobile layout | Vertical layout, bottom menu, usable controls | Narrow local viewport; physical iOS/Android check remains |

All rows have implementations. Their verification scope differs as shown. Live AI, local development identity and hosted account identity are distinct evidence.

Agency filing, built-in push notifications, comprehensive visa eligibility decisions and document-file OCR are outside this personal app. Corporate HR is a separate project.
