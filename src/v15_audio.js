/* Small Hours v1.5: local soundtrack, bounded players and gentle fades. */
(function (SH) {
  const A = SH.Soundtrack = { unlocked: false, players: [], active: null, wanted: null, error: null, gen: 0, fading: false, cue: null };
  // The build rewrites this base to ./assets/audio/. Source uses ../assets/audio/.
  const BASE = '../assets/audio/';
  const TRACKS = { lonely: ['the-long-dark.mp3', 'The Long Dark'], warm: ['there-is-a-place.mp3', 'There is a Place'], tense: ['intervention.mp3', 'Intervention (No Piano Melody)'] };
  const blocked = () => document.hidden || SH.Settings.values.muted || !SH.Settings.values.music || (SH.Presentation && SH.Presentation.paused);
  const level = () => SH.Settings.values.musicVolume;
  A.status = () => A.error ? 'Music could not play: ' + A.error + '. Retry, or keep playing silently.' : !A.unlocked ? 'Music waits for your first interaction.' : A.active ? 'Playing ' + TRACKS[A.active.key][1] + ' from a local file.' : 'Music is ready. Gameplay never depends on audio.';
  function dispose(p) { p.disposed = true; p.el.pause(); p.el.removeAttribute('src'); p.el.load(); }
  function keep(active) { A.players.filter(p => p !== active).forEach(dispose); A.players = active ? [active] : []; }
  function boundary(p) {
    const e = p.el;
    if (!Number.isFinite(e.duration) || !e.duration) return 1;
    return Math.max(0, Math.min(1, e.currentTime / 3, (e.duration - e.currentTime) / 3));
  }
  function create(key) {
    const el = new Audio(BASE + TRACKS[key][0]); el.preload = 'none'; el.loop = false; el.volume = 0;
    const item = { key, el, failed: false, disposed: false };
    item.fail = e => {
      if (item.disposed || (e && e.name === 'AbortError')) return;
      item.failed = true; el.pause();
      if (item === A.active) A.error = TRACKS[key][1] + ' (' + (e && e.name || 'missing or unsupported file') + ')';
    };
    el.addEventListener('error', () => item.fail());
    el.addEventListener('timeupdate', () => {
      if (item === A.active && !A.fading) el.volume = blocked() ? 0 : level() * boundary(item);
    });
    // These are full compositions, not seamless loops. Fade out/in around their original boundaries.
    el.addEventListener('ended', () => { if (item !== A.active || item.disposed) return; el.currentTime = 0; el.volume = 0; if (!blocked()) el.play().catch(item.fail); });
    A.players.push(item); return item;
  }
  function fade(next) {
    const old = A.active, gen = ++A.gen, start = performance.now(), oldLevel = old ? old.el.volume : 0;
    A.active = next; A.fading = true;
    if (!blocked()) next.el.play().catch(next.fail);
    function tick(now) {
      if (A.gen !== gen) return;
      if (blocked()) { A.fading = false; keep(next); next.el.pause(); return; }
      const n = Math.max(0, Math.min(1, (now - start) / 1800));
      next.el.volume = n * level(); if (old && old !== next && !old.disposed) old.el.volume = (1 - n) * oldLevel;
      if (n < 1) requestAnimationFrame(tick);
      else { A.fading = false; keep(next); }
    }
    requestAnimationFrame(tick);
  }
  A.context = function (cue) {
    A.cue = cue || (SH.Presentation && SH.Presentation.active ? 'reflection' : null);
    const g = SH.G, p = g && g.away && SH.Atlas.here();
    A.wanted = A.cue === 'reflection' ? 'lonely' : !g || g.phase === 'home' ? 'tense' : ((p && p.tier === 'village') || g.hideout || /motel|shelter|grandma|shack/.test(g.loc)) ? 'warm' : 'lonely';
    A.sync();
  };
  A.sync = function () {
    if (!A.unlocked) return;
    if (blocked()) { ++A.gen; A.fading = false; keep(A.active); A.players.forEach(p => p.el.pause()); return; }
    if (!A.wanted) return;
    if (A.active && A.active.key === A.wanted) {
      if (!A.active.failed) {
        if (!A.fading) A.active.el.volume = level() * boundary(A.active);
        if (A.active.el.paused) { A.active.el.volume = 0; keep(A.active); fade(A.active); }
      }
      return;
    }
    if (A.error) return; // Do not repeatedly fetch a failed asset on every redraw.
    ++A.gen; A.fading = false; keep(A.active); // at most current + next, even on rapid context changes
    fade(create(A.wanted));
  };
  A.unlock = function () { A.unlocked = true; A.context(); };
  A.retry = function () { ++A.gen; A.fading = false; keep(null); A.active = null; A.error = null; A.unlock(); };
  SH.Audio.playLofi = () => A.context('reflection'); // never overlap the old procedural music
  document.addEventListener('visibilitychange', A.sync);
  document.addEventListener('pointerdown', () => { if (!A.unlocked) A.unlock(); }, { once: true });
  document.addEventListener('keydown', () => { if (!A.unlocked) A.unlock(); }, { once: true });
})(window.SH);
