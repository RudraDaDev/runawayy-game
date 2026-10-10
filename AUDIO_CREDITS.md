# Small Hours soundtrack credits

BrokenHours Studio · v1.5

All three compositions are by **Scott Buckley**, released under **Creative Commons Attribution 4.0 International**.

Licence: https://creativecommons.org/licenses/by/4.0/
Artist usage guidance: https://www.scottbuckley.com.au/library/using-this-music/

## Included tracks

- **‘The Long Dark’ by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au**
  - Source: https://www.scottbuckley.com.au/library/the-long-dark/
  - Original download: https://www.scottbuckley.com.au/library/wp-content/uploads/2023/01/TheLongDark.mp3
  - Local copy: `assets/audio/the-long-dark.mp3`
  - Original duration: 439.823673 seconds.
- **‘There is a Place’ by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au**
  - Source: https://www.scottbuckley.com.au/library/there-is-a-place/
  - Original download: https://www.scottbuckley.com.au/library/wp-content/uploads/2019/04/sb_thereisaplace.mp3
  - Local copy: `assets/audio/there-is-a-place.mp3`
  - Original duration: 325.537959 seconds.
- **‘Intervention’ (No Piano Melody mix) by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au**
  - Source: https://www.scottbuckley.com.au/library/intervention/
  - Original download: https://www.scottbuckley.com.au/library/wp-content/uploads/2019/01/sb_intervention_nomelody.mp3
  - Local copy: `assets/audio/intervention.mp3`
  - Original duration: 258.455510 seconds.

## Acquisition and modifications

Downloaded from the official URLs by the isolated GitHub Actions job on 2026-10-10. Direct sandbox downloads were blocked; Actions acquired the originals and delivered the game copies on the session branch. `assets/audio/SOURCE_SHA256SUMS` records original hashes; source JSON files record original duration and size. `assets/audio/SHA256SUMS` verifies the included game encodes.

Game copies are **96 kbps MP3**, transcoded with FFmpeg/libmp3lame, with metadata stripped. No composition edits or alternate music substitutions. Runtime applies low-volume fades and repeat-boundary fade-outs/fade-ins. These are full compositions, **not seamless loops**. Total installed audio is approximately 12.3 MB (decimal).

Small notification/navigation sound effects are synthesized by the game; no external sample pack is included.

## Release packaging

The source page resolves `../assets/audio/`. The built `SmallHours.html` resolves `./assets/audio/`. The HTML now needs the accompanying `assets/audio` folder for music; the built HTML alone remains playable silently. Keep this credits document with downloadable releases. No audio is streamed from the artist's website at runtime.

Do not sell these tracks separately or submit them to Content ID/audio fingerprinting. For a YouTube trailer or gameplay video, put the track credits and licence in the **video description**, not only the in-game credits. Artist claim guidance: https://www.scottbuckley.com.au/library/copyright-claims-release/
