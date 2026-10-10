# Small Hours changelog

## v1.5 preview · 2026-10-10 · BrokenHours Studio

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
