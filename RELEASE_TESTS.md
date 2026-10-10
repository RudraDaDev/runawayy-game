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
- Portable package built by `python3 package_release.py`: 12 files, about 12.88 MB. The source and built audio paths differ intentionally.
- Screenshots visually inspected for mobile main menu and long conversation layout; no visible scrollbar added.

## Published/HTTP checks

Pending latest preview commit deployment verification. Repository owner is now **RudraDaDev**; Pages reports `https://rudradadev.github.io/runawayy-game/`. The old owner URL may redirect. Never assume an old page has the latest built HTML without checking its content.

## Remaining final acceptance (honest limits)

- Human audition of all three tracks at final mix level. Decode/playback checks cannot certify subjective mood or smoothness.
- Physical Android/iOS keyboard, audio interruption/background/resume and browser storage behaviour. Playwright viewport emulation is not a phone.
- Longer organic gameplay across a base/shack, travel/remote-friend invitation and police lie/release loop. The suite checks representative paths, not every one of the 129 existing endings.
- Remaining typography/icon consistency on rarely used browser/phone screens and a long-history/quota stress pass. HTML fallback sanitization/import bounds are checked in code, not a complete security audit.

The preview is usable, backed up and tested, but this document does not call the paid release fully accepted.
