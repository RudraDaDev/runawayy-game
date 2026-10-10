# Small Hours changelog

## v1.5 preview · 2026-10-10 · BrokenHours Studio

### Animated scene refinement
- Replaced the static memory artwork with layered SVG scenes, separate staging for school, library, diner, home, motel, road stops, underpasses, camps, barns and abandoned buildings.
- Seated/crouched/lying poses, conversation gestures, gaze, clothing details and finite arrivals. Walking moves through the scene once instead of looping in place. Environmental rain, snow, ripples, curtains, clouds, dust and steam have a shared pause state.
- Construction snapshots show only completed shack parts. A camp is not automatically a tent; a town edge is not automatically a camp. Base scenes require an actual base action in its own town.
- Completed base/motel sleep callbacks now earn records directly. Street sleep records the elapsed rest without claiming an uninterrupted full night.
- Village kid, farmer and diner tales carry explicit cast/location metadata; identical names do not substitute unrelated Harlow NPCs. Bike-kid and returned-dog visual details appear only in those rendered events.
- Multiple milestone offers queue without overwriting one another; stale-world offers are discarded. Archived replay no longer initializes tale state from a delayed gameplay callback.
- Added scene-prop/import bounds, corrupt-look fallback, source/built visual tests, completed-action integration tests and clearly labelled renderer screenshots. Final artistic/device acceptance remains open.

### Play and presentation
- New dark-only olive/lamplight palette, split-line title motif and responsive main menu.
- Main menu: New Game, Continue, Saves, Previous Runs, Memories, Settings and Credits.
- Separate browser preferences for music, SFX, mute, volumes, reading size, reply speed and reduced motion.
- Settled endings: outcome title, last recorded visual scene, earned text/visual memories, then expanded original ending text.
- Previous/continue/skip/pause/reduced-motion scene controls; no reading timer.
- Local completed-run archive, read-only ending replay, per-story memory browser, history export/merge import.
- Existing Keep living it, second endings and clean rewind retained.

### People and writing
- Sam's appearance deterministic per story seed and stable across saves. Equipped clothes reflected in figures/portraits and retained in historical scene records.
- Established NPC looks preserved; missing NPC appearances generated and cached per story.
- Travelling party and runaway kids share presence and scene visibility beyond Harlow. In-person talk restored where away-town action lists bypassed it.
- Contextual co-present replies and quiet shared moments; nearby companions still do not send phone messages to Sam.
- Corrected old homesick split option and three never-found epilogues that contradicted the no-splits rule.
- More ending detail from recorded conversations, companions and departure; original ending registry/identities retained.
- Player-facing em dashes edited into sentence punctuation, pauses, signatures or display placeholders. Comments remain historical.

### Audio and packaging
- Three official Scott Buckley tracks installed locally: The Long Dark, There is a Place, Intervention (No Piano Melody mix).
- 96 kbps game encodes (~12.3 MB total), source hashes/durations and CC BY 4.0 credits. No runtime third-party music stream.
- Lazy loading, bounded crossfade players, fade-out/in repeat boundaries, mute/background/scene-pause handling, retry and silent failure path.
- Replaced procedural lofi overlap; synthesized SFX retain separate control.
- Built HTML needs the adjacent `assets/audio` folder for music; playable silently without it. `package_release.py` builds a portable zip.

### Reliability
- Fixed Continue's detached-button binding, checked read-only replay against live-state mutations, and blocked late phone messages from changing settled runs.
- Completed-save continuation rejected; history is separate from playable saves. Save-slot/autosave replacement warnings added.
- History import strips executable HTML, validates records and merges without duplicates. No silent eviction on quota failure.
- Older saves migrate with an explicit incomplete visual-history notice rather than invented memories.
- Popup/readable text panels, mobile/landscape sizing, hidden-scrollbar scrollable lists and reading-position preservation.
- Reduced-motion/background render work; title canvas avoids needless resize work. Local stroke icons for phone apps/navigation/actions avoid reliance on emoji fonts.

### Verification and remaining acceptance
- Automated source + built offline browser suite: 90 checks passed on 2026-10-10 (desktop and narrow/mobile/landscape).
- Checks include menus, saves, historical outfits, companions, village police/exhaustion exemption, burner/old-phone rules, charger/bank behaviour, settlement, both ending chapters, archive/read-only replay/import, audio decode/fades/repeat/mute, and uncaught browser errors.
- Human listening/mix approval and real-device keyboard/background behaviour are still recommended before final paid release. Automated audio decode does not claim subjective mix quality.
- See `V1_5.md` for acceptance checklist and `RELEASE_TESTS.md` for evidence/published-build status.
