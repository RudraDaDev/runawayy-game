/* Small Hours v1.5: browser preferences, independent from a story save. */
(function (SH) {
  const defaults = { music: true, sfx: true, muted: false, musicVolume: 0.22, sfxVolume: 0.45, fontSize: 16, textSpeed: 'normal', reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches };
  const KEY = 'smallhours_preferences';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { return {}; } };
  const S = SH.Settings = { values: Object.assign({}, defaults, read()) };
  S.set = function (key, value) {
    if (!(key in defaults)) return;
    S.values[key] = value;
    S.apply();
    try { localStorage.setItem(KEY, JSON.stringify(S.values)); } catch (_) {}
  };
  S.apply = function () {
    const v = S.values;
    v.fontSize = Math.min(22, Math.max(14, Number(v.fontSize) || 16));
    ['musicVolume', 'sfxVolume'].forEach(k => v[k] = Math.min(1, Math.max(0, Number(v[k]) || 0)));
    if (!['instant', 'normal', 'slow'].includes(v.textSpeed)) v.textSpeed = 'normal';
    document.documentElement.style.setProperty('--reading-size', v.fontSize + 'px');
    document.documentElement.classList.toggle('reduce-motion', !!v.reducedMotion);
    SH.Soundtrack && SH.Soundtrack.sync();
  };
  S.delay = n => S.values.textSpeed === 'instant' ? 0 : S.values.textSpeed === 'slow' ? n * 1.8 : n;
  const A = SH.Audio;
  Object.defineProperty(A, 'muted', { configurable: true, get: () => S.values.muted, set: v => S.set('muted', !!v) });
  const tone = A.tone;
  A.tone = function (f, d, type, volume = 0.05, delay) {
    if (!S.values.sfx || document.hidden || (SH.Presentation && SH.Presentation.paused)) return;
    return tone.call(A, f, d, type, volume * S.values.sfxVolume, delay);
  };
  const init = A.init;
  A.init = function () { init(); if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume().catch(() => {}); SH.Soundtrack && SH.Soundtrack.unlock(); };
  S.apply();
})(window.SH);
