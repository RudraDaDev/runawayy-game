/* Small Hours v1.5: settled endings and recorded scenes. The game modal stays intact. */
(function (SH) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const P = SH.Presentation = { active: false, paused: false, readOnly: false, gen: 0 };
  P.scene = function (s) {
    if (!s) return '<div class="memory-empty">No visual record was stored.</div>';
    const night = s.night, indoors = /home|room|library|motel|shelter|shack|diner|grandma|patel/.test(s.loc || '');
    const sky = night ? '#181a15' : '#3d4337', land = night ? '#24261d' : '#4a4d38';
    const place = esc(s.place || s.town || 'A place you were');
    let scenery = indoors ? '<rect x="0" y="0" width="800" height="300" fill="#342f26"/><path d="M0 252H800" stroke="#6b5b42" stroke-width="4"/><rect x="65" y="52" width="132" height="133" fill="' + sky + '" stroke="#7c694e" stroke-width="8"/><path d="M131 52V185 M65 118H197" stroke="#7c694e" stroke-width="5"/><path d="M585 254V125H725V254" fill="#574737"/><rect x="470" y="207" width="240" height="42" rx="7" fill="#625841"/>' : '<path d="M0 170L80 134L170 164L235 120L390 167L520 133L650 164L800 112V300H0Z" fill="' + land + '"/><path d="M0 245H800V300H0Z" fill="#413c30"/><path d="M530 240V85H680V240" fill="#564b38"/><rect x="555" y="112" width="42" height="56" fill="' + (night ? '#b39458' : '#929780') + '"/><path d="M70 242V135M58 140H126M117 140V155" stroke="#908369" stroke-width="5"/>';
    if (/village|camp|forest|park|woods/.test(s.loc || '') || s.tier === 'village') scenery += '<path d="M20 242V167M150 242V125M755 242V145" stroke="#5d563e" stroke-width="10"/><path d="M20 82L-24 189H64ZM150 40L100 164H200ZM755 65L706 186H804Z" fill="#394630"/>';
    if (/rain|storm|drizzle|snow/.test(s.weather || '')) scenery += '<path d="M25 20L10 50M230 15L215 45M395 39L380 69M605 14L590 44M740 65L725 95M90 145L75 175M310 178L295 208M470 100L455 130M685 150L670 180" stroke="#c8c5af" opacity=".35" stroke-width="2"/>';
    const people = (s.people || []).slice(0, 7).map((a, i, all) => {
      const l = a.look, x = 300 + (i - (all.length - 1) / 2) * 70, y = 245;
      return `<g transform="translate(${x},${y})"><ellipse cy="2" rx="20" ry="5" fill="#111" opacity=".3"/><path d="M-5 -40L-7 0M5 -40L9 0" stroke="#39372f" stroke-width="8"/><rect x="-14" y="-80" width="28" height="44" rx="8" fill="${esc(l.shirt)}"/><path d="M-12 -72L-19 -44M12 -72L20 -44" stroke="${esc(l.shirt)}" stroke-width="8"/><circle cy="-95" r="14" fill="${esc(l.skin)}"/><path d="M-14 -96Q-17 -115 0 -111Q17 -111 14 -96L7 -102L-8 -102Z" fill="${esc(l.hair)}"/>${/pony|bob|curly/.test(l.style) ? `<path d="M-14 -100V-79" stroke="${esc(l.hair)}" stroke-width="7"/>` : ''}${l.hat ? `<path d="M-15 -103Q0 -124 15 -103Z" fill="${esc(l.hatc || l.shirt)}"/>` : ''}<path d="M-5 -95h2m6 0h2" stroke="#29211b" stroke-width="2"/>${l.glasses ? `<path d="M-10 -99h8v7h-8Zm12 0h8v7H2ZM-2 -96H2" fill="none" stroke="${esc(l.glasses)}"/>` : ''}</g>`;
    }).join('');
    return `<div class="recorded-scene"><svg viewBox="0 0 800 300" role="img" aria-label="Recorded scene at ${place}"><rect width="800" height="300" fill="${sky}"/>${scenery}${people}<path d="M0 294H800" stroke="#bb9960" opacity=".6" stroke-width="2"/></svg><div class="scene-caption">${place} · ${esc(s.date)} · ${esc(s.time)} · ${esc(s.weather)}</div></div><div class="memory-cast">${(s.people || []).map(a => `<span>${SH.Portrait.svg(a.id, { look: a.look, mood: 'neutral' })}<b>${esc(a.name)}</b></span>`).join('')}</div>`;
  };
  function root() {
    let e = document.querySelector('#presentation');
    if (!e) { e = document.createElement('div'); e.id = 'presentation'; e.setAttribute('role', 'dialog'); e.setAttribute('aria-modal', 'true'); document.body.appendChild(e); }
    return e;
  }
  P.open = function (cards, onDone, readOnly = false) {
    if (!cards.length) { onDone && onDone(); return; }
    P.dismiss(); const gen = ++P.gen;
    P.active = true; P.readOnly = readOnly; P.paused = false; P.index = 0; P.cards = clone(cards); P.onDone = onDone;
    const md = document.querySelector('#modal'); md.inert = true; md.setAttribute('aria-hidden', 'true');
    document.body.classList.add('sh-presenting');
    SH.Soundtrack && SH.Soundtrack.context('reflection');
    const e = root();
    function draw() {
      if (gen !== P.gen) return;
      const c = P.cards[P.index];
      e.innerHTML = `<section class="sequence-panel"><header><span class="studio">BROKENHOURS STUDIO</span><span>${P.index + 1} / ${P.cards.length}</span></header><div class="sequence-content ${c.titleOnly ? 'outcome-card' : ''}"><small class="eyebrow">${esc(c.label || 'A memory from this story')}</small><h1>${esc(c.title)}</h1>${c.titleOnly ? '' : P.scene(c.scene)}<div class="sequence-text">${esc(c.text || '').split('\n').map(l => `<p>${l}</p>`).join('')}</div></div><footer><button class="btn" id="scenePause">${P.paused ? 'Resume' : 'Pause'}</button><button class="btn" id="sceneMotion">${SH.Settings.values.reducedMotion ? 'Reduced motion on' : 'Reduce motion'}</button><button class="btn" id="sceneSkip">${readOnly ? 'Close' : 'Skip to ending'}</button><button class="btn primary" id="sceneNext" ${P.paused ? 'disabled' : ''}>${P.index + 1 === P.cards.length ? readOnly ? 'Done' : 'Read the ending' : 'Continue'}</button></footer><small class="sequence-hint">Read at your own pace. ${P.paused ? 'Paused, including music.' : 'Nothing advances until you continue.'}</small></section>`;
      e.querySelector('#scenePause').onclick = () => { P.paused = !P.paused; SH.Soundtrack && SH.Soundtrack.sync(); draw(); };
      e.querySelector('#sceneMotion').onclick = () => { SH.Settings.set('reducedMotion', !SH.Settings.values.reducedMotion); draw(); };
      e.querySelector('#sceneSkip').onclick = finish;
      e.querySelector('#sceneNext').onclick = () => { if (P.paused) return; if (++P.index >= P.cards.length) finish(); else draw(); };
      e.querySelector('#sceneNext').focus();
    }
    function finish() { if (gen !== P.gen) return; const fn = P.onDone; P.dismiss(); fn && fn(); }
    P.finish = finish; draw();
  };
  P.dismiss = function () {
    ++P.gen; P.active = false; P.paused = false; P.readOnly = false;
    const e = document.querySelector('#presentation'); if (e) e.remove();
    document.body.classList.remove('sh-presenting');
    const md = document.querySelector('#modal'); if (md) { md.inert = false; md.removeAttribute('aria-hidden'); }
    SH.Soundtrack && SH.Soundtrack.context();
  };
  P.offer = function (rec) {
    if (!rec) return;
    const g = SH.G, epoch = SH.epoch;
    setTimeout(() => {
      if (SH.G !== g || SH.epoch !== epoch || g.ended || P.active || SH.UI.modalOpen()) return;
      P.open([{ title: rec.title, text: rec.text, scene: rec.scene, label: 'A turning point' }], () => {});
    }, 120);
  };
  P.cardsFor = function (ending) {
    const list = [{ title: ending.outcome, text: '', titleOnly: true, label: 'This chapter has settled' }, { title: ending.title, text: ending.sub, scene: ending.scene, label: 'Where this chapter leaves you' }];
    (ending.memories || []).forEach(m => list.push({ title: m.title, text: m.text, scene: m.scene, label: 'What actually happened' }));
    if (ending.incomplete) list.push({ title: 'Some hours were not recorded', text: 'This story began in an older version. Missing scenes have not been invented. The saved conversations and ending still belong to this story.', label: 'An incomplete visual history' });
    return list;
  };
  P.settle = function (key, title, sub, paras) {
    const g = SH.G; if (!g || !g.ended || g.endKey !== key) return;
    const h = SH.Visuals.ensure(g), never = /never found/i.test(sub) || SH.EndX.defs.some(d => d.k === key && d.on.includes('gone'));
    const found = /found|returned|caught/i.test(sub + ' ' + key) && !never;
    const end = clone({ key, title, sub, paras, name: g.name, seed: (g.story || {}).seed, gid: g.gid, t: g.t, scene: SH.Memories.snapshot(), memories: h.memories, incomplete: h.incomplete, outcome: never ? 'You were never found.' : found ? 'You were found.' : 'This chapter has ended.' });
    // This hook is called only by the final renderer, never by Found/patrol conversations.
    P.open(P.cardsFor(end), () => {
      if (SH.G !== g || !g.ended || g.endKey !== key) return;
      // Allow existing delayed ending decoration and Keep living it hooks to finish before archiving.
      setTimeout(() => { if (SH.G === g && g.ended && g.endKey === key) SH.Archive.capture(end); }, 100);
      const next = document.querySelector('#modal .mchoices button'); next && next.focus();
    });
  };
  // A paused/hidden ending modal must not respond to the game's numeric shortcuts.
  document.addEventListener('keydown', e => {
    if (!P.active) return;
    const root = document.querySelector('#presentation');
    if (e.key === 'Tab') {
      const bs = [...root.querySelectorAll('button:not(:disabled)')];
      if (e.shiftKey && document.activeElement === bs[0]) { e.preventDefault(); bs.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === bs.at(-1)) { e.preventDefault(); bs[0].focus(); }
    }
    if (e.key === 'Escape') { e.preventDefault(); P.finish && P.finish(); }
    if (['1','2','3','4','5','6','7','8','9','m','M','p','P','?'].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  const reset = SH.resetRuntime;
  SH.resetRuntime = function () { P.dismiss(); return reset.apply(this, arguments); };
})(window.SH);
