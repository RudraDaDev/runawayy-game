# v1.5 preview verification

2026-10-10 · BrokenHours Studio

## Automated browser suite

Run `LD_LIBRARY_PATH=/tmp/lib:/tmp node tests/v15.test.js` in this sandbox. It uses installed Playwright Core and `/tmp/chromium` (or `CHROMIUM`).

**90 checks passed** on the separate-file source at desktop size and built HTML opened through `file://` at 390×844, then 844×390 landscape. No uncaught page errors in either run.

Covered:
- Main menu/empty states, independent persistent preferences, Continue, appearance/outfit persistence, actual historical outfit difference, honest old-save migration.
- Party+rkids presence, away stage figures, in-person send redirection, contextual replies, no nearby incoming messages, shared moments.
- Village police/emergency-dial/exhaustion exemption, burner keeps weightless old phone, unknown-number incoming hold, three-charge bank use, bank lifespan/charger reuse, first collapse/grace period.
- No title card during an unresolved found event; settled title → scene → memories, pause/skip, completed archive, unchanged live state on replay, backup validation/duplicate merge, completed-save rejection.
- Keep living it and its second ending, separate archived chapters.
- Local MP3 decode/playback, music-off/global mute/zero volume, bounded rapid-transition players/disposal, full-track repeat resumption.
- Mobile horizontal bounds and landscape overlay bounds.

Additional verification:
- `node --check` on every source JS and the test suite; `git diff --check`.
- `sha256sum -c assets/audio/SHA256SUMS`: all three files OK.
- Official-source Actions acquired files, FFprobe validated original durations and FFmpeg transcoded them. Intervention original hash matches the independently documented no-melody mix hash.
- Portable package built by `python3 package_release.py`: 12 files, about 12.89 MB. The source and built audio paths differ intentionally.
- Screenshots visually inspected for mobile main menu and long conversation layout; no visible scrollbar added.

## Published/HTTP checks

**GitHub Pages deployment succeeded** for preview commit `cf0bfe7` (run `38054669328`). The HTTP-served built HTML passed **44 additional browser checks**. Public URL browser smoke was attempted but blocked by `net::ERR_CONNECTION_CLOSED` in this sandbox; that is not a game error or a verified public smoke test. Repository owner is now **RudraDaDev**; Pages reports `https://rudradadev.github.io/runawayy-game/`. The old owner URL may redirect. Never assume an old page has the latest built HTML without checking its content.

## Remaining final acceptance (honest limits)

- Human audition of all three tracks at final mix level. Decode/playback checks cannot certify subjective mood or smoothness.
- Physical Android/iOS keyboard, audio interruption/background/resume and browser storage behaviour. Playwright viewport emulation is not a phone.
- Longer organic gameplay across a base/shack, travel/remote-friend invitation and police lie/release loop. The suite checks representative paths, not every one of the 129 existing endings.
- Remaining typography/icon consistency on rarely used browser/phone screens and a long-history/quota stress pass. HTML fallback sanitization/import bounds are checked in code, not a complete security audit.

The preview is usable, backed up and tested, but this document does not call the paid release fully accepted.


## Reproductions fixed during implementation
- Away-town `Actions.list` returned town-only actions, bypassing friend additions: restored co-present talk at the final additive wrapper. Verified party+rkids appear and respond in a village.
- Main menu Continue captured its button after moving setup rows to a detached section: captured before moving. Verified full load, outfit and face persistence.
- Early fade frame timestamp could be slightly before its start: clamped interpolation to 0–1; rapid crossfades bounded to two players. Verified repeat, mute and zero-volume.
- Delayed phone message from a prior action arrived after settlement while viewing the archive: settled messages discarded; read-only live-story messages held until an actual subsequent gameplay action. State equality verified on replay.
- Older homesick option and three companion epilogues split the group: reported and removed/reworded without introducing jealousy or new endings.

Final local rerun after Previous navigation, overlay guards and deferred reply protection: **90/90 checks passed**, no uncaught browser errors.

## Animated-scene refinement verification · 2026-10-10

Fresh local results after the refinement:
- `tests/v15.test.js`: **90/90 source + built checks passed**.
- `tests/cinema.test.js` on source and built HTML: motion layers, exact animation-time freeze on Pause, SVG identity across pause, reduced-motion cancellation, live-state equality, distinct sets, lying pose, finite translated walking, eight-person bounds and mobile viewport checks passed.
- `tests/cinema_capture.test.js` on source and built: real shack-build, base-sleep and private motel-sleep callbacks; no imaginary frame at a cleared spot; no remote/unvisited base upgrades; explicit same-name local actors; malformed scene props; queued/stale offers passed. Random event selection is suppressed in these deterministic integration fixtures, not in the shipped game.
- One intermediate run timed out clicking Begin on the second browser page. A clean rerun passed both pages; this was not treated as a successful test run.
- Rain stop, bedroom, lying/rest, diner, completed-parts shack and mobile library screenshots were visually opened during work. Screenshots in `docs/screenshots/cinema-*.png` are **renderer fixtures**, not evidence of earned player history. The integration tests verify earned capture separately.
- Pause's former one-frame drift was fixed with explicit animation hold times. Explicitly resumed CSS animation objects are cancelled too when reduced motion is enabled.

Not certified: every story-event illustration, every generated building layout, physical-phone behaviour, human audio/art acceptance, and the newest public Pages deployment. Scene refinement is a tested preview, not a claim that the paid release is accepted.
