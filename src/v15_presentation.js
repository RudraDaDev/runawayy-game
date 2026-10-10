/* Small Hours v1.5: settled endings and recorded scenes. The game modal stays intact. */
(function (SH) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const P = SH.Presentation = { active: false, paused: false, readOnly: false, gen: 0 };
  P.scene = (s, card) => SH.Cinema.render(s, card);
  function root() {
    let e = document.querySelector('#presentation');
    if (!e) { e = document.createElement('div'); e.id = 'presentation'; e.setAttribute('role', 'dialog'); e.setAttribute('aria-modal', 'true'); document.body.appendChild(e); }
    return e;
  }
  P.open = function (cards, onDone, readOnly = false) {
    if (!cards.length) { onDone && onDone(); return; }
    P.dismiss(); const gen = ++P.gen;
    const isEnding = cards.some(c => c.titleOnly);
    P.active = true; P.readOnly = readOnly;
    if (readOnly) { P.oldFocus = document.activeElement; } P.paused = false; P.index = 0; P.cards = clone(cards); P.onDone = onDone;
    const md = document.querySelector('#modal'); md.inert = true; md.setAttribute('aria-hidden', 'true');
    document.body.classList.add('sh-presenting');
    SH.Soundtrack && SH.Soundtrack.context('reflection');
    const e = root();
    function draw() {
      if (gen !== P.gen) return;
      const c = P.cards[P.index];
      e.innerHTML = `<section class="sequence-panel"><header><span class="studio">BROKENHOURS STUDIO</span><span>${P.index + 1} / ${P.cards.length}</span></header><div class="sequence-content ${c.titleOnly ? 'outcome-card' : ''}"><small class="eyebrow">${esc(c.label || 'A memory from this story')}</small><h1>${esc(c.title)}</h1>${c.titleOnly ? '' : P.scene(c.scene, c)}<div class="sequence-text">${esc(c.text || '').split('\n').map(l => `<p>${l}</p>`).join('')}</div></div><footer><button class="btn" id="scenePrev" ${P.index === 0 || P.paused ? 'disabled' : ''}>Previous</button><button class="btn" id="scenePause">${P.paused ? 'Resume' : 'Pause'}</button><button class="btn" id="sceneMotion">${SH.Settings.values.reducedMotion ? 'Reduced motion on' : 'Reduce motion'}</button><button class="btn" id="sceneSkip">${readOnly ? 'Close' : isEnding ? 'Skip to ending' : 'Skip scene'}</button><button class="btn primary" id="sceneNext" ${P.paused ? 'disabled' : ''}>${P.index + 1 === P.cards.length ? readOnly ? 'Done' : isEnding ? 'Read the ending' : 'Keep going' : 'Continue'}</button></footer><small class="sequence-hint">Read at your own pace. ${P.paused ? 'Paused, including music.' : 'Nothing advances until you continue.'}</small></section>`;
      e.querySelector('#scenePrev').onclick = () => { if (!P.paused && P.index > 0) { P.index--; draw(); } };
      e.querySelector('#scenePause').onclick = () => { P.paused = !P.paused; SH.Soundtrack && SH.Soundtrack.sync(); SH.Cinema.sync();
        e.querySelector('#scenePause').textContent = P.paused ? 'Resume' : 'Pause'; e.querySelector('#sceneNext').disabled = P.paused; e.querySelector('#scenePrev').disabled = P.paused || P.index === 0;
        e.querySelector('.sequence-hint').textContent = P.paused ? 'Paused, including animation and music.' : 'Read at your own pace. Nothing advances until you continue.'; };
      e.querySelector('#sceneMotion').onclick = () => { SH.Settings.set('reducedMotion', !SH.Settings.values.reducedMotion); e.querySelector('#sceneMotion').textContent = SH.Settings.values.reducedMotion ? 'Reduced motion on' : 'Reduce motion'; SH.Cinema.sync(); };
      e.querySelector('#sceneSkip').onclick = finish;
      e.querySelector('#sceneNext').onclick = () => { if (P.paused) return; if (++P.index >= P.cards.length) finish(); else draw(); };
      SH.Cinema.sync(); e.querySelector('#sceneNext').focus();
    }
    function finish() { if (gen !== P.gen) return; const fn = P.onDone; const focus = P.oldFocus; P.dismiss(); fn && fn(); if (readOnly && focus && focus.isConnected) focus.focus(); }
    P.finish = finish; draw();
  };
  P.dismiss = function () {
    ++P.gen; P.active = false; P.paused = false; P.readOnly = false;
    const e = document.querySelector('#presentation'); if (e) e.remove(); if(SH.Cinema.held) SH.Cinema.held.clear();
    document.body.classList.remove('sh-presenting');
    const md = document.querySelector('#modal'); if (md) { md.inert = false; md.removeAttribute('aria-hidden'); }
    SH.Soundtrack && SH.Soundtrack.context();
  };
  // A queue belongs to one live world/epoch; stale callbacks cannot erase newer offers.
  P.queue = [];
  P.flush = function () {
    P.queue=P.queue.filter(x=>x.g===SH.G && x.epoch===SH.epoch && !x.g.ended);
    if(P.active || P.readOnly || SH.UI.modalOpen() || !P.queue.length) return;
    const next=P.queue.shift(), rec=next.rec;
    P.open([{title:rec.title,text:rec.text,scene:rec.scene,kind:rec.kind,label:'A turning point'}],()=>setTimeout(P.flush,120));
  };
  P.offer = function (rec) {
    if (!rec || !SH.G || SH.G.ended || P.readOnly) return;
    if(!P.queue.some(x=>x.rec.key===rec.key && x.g===SH.G && x.epoch===SH.epoch)) P.queue.push({rec:clone(rec),g:SH.G,epoch:SH.epoch});
    setTimeout(P.flush,120);
  };
  const afterAction = SH.UI.afterAction;
  SH.UI.afterAction = function () { const r=afterAction.apply(this,arguments); setTimeout(P.flush,120); return r; };
  P.cardsFor = function (ending) {
    const list = [{ title: ending.outcome, text: '', titleOnly: true, label: 'This chapter has settled' }, { title: ending.title, text: ending.sub, scene: ending.scene, label: 'The last recorded scene' }];
    (ending.memories || []).forEach(m => list.push({ title: m.title, text: m.text, scene: m.scene, kind: m.kind, label: 'What actually happened' }));
    if (ending.incomplete) list.push({ title: 'Some hours were not recorded', text: 'This story began in an older version. Missing scenes have not been invented. The saved conversations and ending still belong to this story.', label: 'An incomplete visual history' });
    return list;
  };
  P.settle = function (key, title, sub, paras) {
    const g = SH.G; if (!g || !g.ended || g.endKey !== key) return;
    const h = SH.Visuals.ensure(g), never = /never found/i.test(sub) || SH.EndX.defs.some(d => d.k === key && d.on.includes('gone'));
    const found = /found|returned|caught/i.test(sub + ' ' + key) && !never;
    const end = clone({ key, title, sub, paras, name: g.name, seed: (g.story || {}).seed, gid: g.gid, t: g.t, scene: SH.Memories.snapshot(), memories: h.memories, incomplete: h.incomplete, outcome: never ? 'You were never found.' : found ? 'You were found.' : /harbor|grandma|patel|call911|listened|friendFamily|reachedOut/.test(key) ? 'You reached someone.' : /walkHome/.test(key) ? 'You chose to go home.' : /quiet/.test(key) ? 'You stayed.' : 'This chapter has ended.' });
    setTimeout(() => { if (SH.G === g && g.ended && g.endKey === key) SH.Archive.capture(end); }, 120);
    // This hook is called only by the final renderer, never by Found/patrol conversations.
    P.open(P.cardsFor(end), () => {
      if (SH.G !== g || !g.ended || g.endKey !== key) return;
      // Allow existing delayed ending decoration and Keep living it hooks to finish before archiving.
      setTimeout(() => { if (SH.G === g && g.ended && g.endKey === key) SH.Archive.capture(end); }, 100);
      const controls = document.querySelector('#modal .mchoices');
      if (controls && !document.querySelector('#endingMenu')) { const b = document.createElement('button'); b.id = 'endingMenu'; b.className = 'btn'; b.textContent = 'Menu / Previous Runs'; b.onclick = SH.Menu.open; controls.appendChild(b); }
      const next = document.querySelector('#modal .mchoices button'); next && next.focus();
    });
  };
  // Late messages scheduled by an earlier action must not mutate a settled run or a read-only viewer.
  const push = SH.Phone.push; P.heldMessages = [];
  SH.Phone.push = function () {
    const g = SH.G; if (!g || g.ended) return;
    if (P.readOnly) { P.heldMessages.push({ g, epoch: SH.epoch, args: [...arguments] }); return; }
    return push.apply(this, arguments);
  };
  const reply = SH.Phone.reply; P.heldReplies = [];
  SH.Phone.reply = function () {
    if (!SH.G || SH.G.ended || SH.Companions.has(arguments[0])) return;
    if (P.readOnly) { P.heldReplies.push({ g: SH.G, epoch: SH.epoch, args: [...arguments] }); return; }
    return reply.apply(this, arguments);
  };
  const afterMessages = SH.UI.afterAction;
  SH.UI.afterAction = function () {
    if (!P.readOnly && SH.G && !SH.G.ended) {
      const replies = P.heldReplies.splice(0);
      replies.filter(m => m.g === SH.G && m.epoch === SH.epoch && !SH.Companions.has(m.args[0])).forEach(m => reply.apply(SH.Phone, m.args));
      const messages = P.heldMessages.splice(0);
      messages.filter(m => m.g === SH.G && m.epoch === SH.epoch).forEach(m => push.apply(SH.Phone, m.args));
    }
    return afterMessages.apply(this, arguments);
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
  SH.resetRuntime = function () { P.queue = []; P.pending = null; P.heldMessages = []; P.heldReplies = []; P.dismiss(); return reset.apply(this, arguments); };
})(window.SH);
