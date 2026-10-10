# Small Hours

A narrative life-sim (16+) about a troubled 12-year-old in the weeks before, and after, running away from home.
Vanilla JS + canvas. Free-text conversations, a working in-game phone, a living town, and a procedurally generated country.

**Play:** open `src/index.html` in a browser (or the built `SmallHours.html` with its audio folder).
**Build HTML:** `python3 build.py`

Content note: depicts family conflict, abuse (non-graphic), homelessness and grooming risk. It is fiction, not a guide.
If you need help: US 1-800-786-2929 (National Runaway Safeline) / 988 · UK 116 000 / Childline 0800 1111 · India 1098 / 112.

## v1.5 preview

**BrokenHours Studio** · [Checklist](V1_5.md) · [Changelog](CHANGELOG.md) · [Music credits](AUDIO_CREDITS.md)

New dark-only menu, persistent audio/accessibility preferences, seeded character/outfit visuals, visible travelling companions, earned memories and read-only Previous Runs. Ending scenes start only after the outcome is settled. Existing never-found endings and Keep living it remain.

**Play online:** https://rudradadev.github.io/runawayy-game/ (GitHub renamed the owner; the old address may redirect).

**Offline:** keep `SmallHours.html` beside `assets/audio/`. All CSS/JS is inside the built HTML, but music is packaged separately. The HTML alone works silently. To make a portable package: `python3 package_release.py`, then extract the resulting zip before opening the HTML.

**Local storage:** playable saves, completed-run history and preferences live in this browser. Export playable saves from Saves; export/merge run history and memories from Previous Runs. Back up before clearing browser data or changing devices. Old saves remain loadable; old visual histories are honestly incomplete.

**Tests:** `cd tests && npm ci`; then `LD_LIBRARY_PATH=/tmp/lib:/tmp node tests/v15.test.js` in the test sandbox (or set `CHROMIUM` to a local Chromium binary). See [release verification](RELEASE_TESTS.md).

This is a preview, not a claim that human listening and physical-device acceptance are complete. Intended India release price remains **₹60**. No extra ending definitions were added just for the version number.
