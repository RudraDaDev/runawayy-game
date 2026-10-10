/* Small Hours v1.5: local run archive, read-only replay and proper main menu. */
(function (SH) {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'smallhours_runs_v15', copy = x => JSON.parse(JSON.stringify(x));
  const AR = SH.Archive = {}, MN = SH.Menu = {};
  AR.read = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (_) { return []; } };
  AR.write = function (runs) { try { localStorage.setItem(KEY, JSON.stringify(runs)); return true; } catch (_) { return false; } };
  function safeHTML(html) {
    const t = document.createElement('template'); t.innerHTML = html;
    t.content.querySelectorAll('script,iframe,object,embed,form,button,input,textarea,link,style').forEach(e => e.remove());
    t.content.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => { if (/^on/i.test(a.name) || ['src','srcdoc','href','style','id'].includes(a.name)) e.removeAttribute(a.name); }));
    return t.innerHTML;
  }
  AR.capture = function (ending) {
    const node = $('#modal .mtext'); if (!node) return;
    const rec = copy(ending); rec.html = safeHTML(node.innerHTML); rec.savedAt = Date.now(); rec.id = (rec.gid || rec.seed) + ':' + rec.key + ':' + rec.t;
    const runs = AR.read(); if (runs.some(r => r.id === rec.id)) return;
    runs.unshift(rec);
    // Never evict a previous run (or a playable save) silently to make room.
    if (!AR.write(runs)) {
      AR.pending = rec;
      SH.UI.toast('History storage is full or blocked. Export this ending from Previous Runs before leaving. Your saves were not deleted.');
    }
  };
  AR.export = function () {
    const a = document.createElement('a'), blob = new Blob([JSON.stringify({ format: 'smallhours-history', version: 1, runs: AR.read().concat(AR.pending ? [AR.pending] : []) })], { type: 'application/json' });
    const url = URL.createObjectURL(blob); a.href = url; a.download = 'SmallHours-history.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  AR.validate = function (d) {
    if (!d || d.format !== 'smallhours-history' || d.version !== 1 || !Array.isArray(d.runs) || d.runs.length > 200) throw Error('Not a supported history backup.');
    return d.runs.map(r => {
      if (!r || typeof r.id !== 'string' || typeof r.title !== 'string' || !Array.isArray(r.memories) || r.memories.length > 160 || typeof r.html !== 'string' || r.html.length > 500000) throw Error('A run in this backup is incomplete or invalid.');
      const clean = copy(r); clean.html = safeHTML(clean.html); return clean;
    });
  };
  AR.merge = function (d) {
    const add = AR.validate(d), existing = AR.read(), ids = new Set(existing.map(r => r.id));
    add.forEach(r => { if (!ids.has(r.id)) { existing.push(r); ids.add(r.id); } });
    if (!AR.write(existing)) throw Error('History storage is full or blocked. Export your current history first.');
    return add.length;
  };
  AR.import = function () {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = async () => { const f = i.files[0]; if (!f) return; try { if (f.size > 12000000) throw Error('That backup is too large.'); const d = JSON.parse(await f.text()); AR.validate(d); if (!confirm('Merge this history backup? Existing runs and playable saves will be kept.')) return; AR.merge(d); MN.runs(); } catch (e) { alert(e.message || 'Could not read that backup.'); } }; i.click();
  };
  function overlay(title, html, wire) {
    let e = $('#menuOverlay'); if (!e) { e = document.createElement('div'); e.id = 'menuOverlay'; e.setAttribute('role', 'dialog'); e.setAttribute('aria-modal', 'true'); document.body.appendChild(e); }
    e.innerHTML = `<section class="menu-panel"><header><div><small class="studio">BROKENHOURS STUDIO · v1.5 preview</small><h2>${esc(title)}</h2></div><button class="btn" id="menuClose" aria-label="Close ${esc(title)}">Close</button></header><div class="menu-content">${html}</div></section>`;
    $('#menuClose').onclick = () => { e.remove(); $('#menuBtn') && $('#menuBtn').focus(); };
    wire && wire(e); $('#menuClose').focus();
  }
  MN.overlay = overlay;
  MN.settings = function () {
    const v = SH.Settings.values;
    const toggle = (id, title) => `<label class="pref-row"><span>${title}</span><input type="checkbox" data-pref="${id}" ${v[id] ? 'checked' : ''}></label>`;
    const volume = (id, title) => `<label class="pref-row"><span>${title}</span><input type="range" min="0" max="1" step="0.01" data-pref="${id}" value="${v[id]}"></label>`;
    overlay('Settings', `<p class="muted">Saved in this browser, separately from your story. You can always play silently.</p>${toggle('muted', 'Mute all audio')}${toggle('music', 'Music')}${volume('musicVolume', 'Music volume')}${toggle('sfx', 'Small sound effects')}${volume('sfxVolume', 'Effects volume')}<hr><label class="pref-row"><span>Reading size</span><select data-pref="fontSize">${[14,16,18,20,22].map(n => `<option value="${n}" ${n === v.fontSize ? 'selected' : ''}>${n}px</option>`).join('')}</select></label><label class="pref-row"><span>Conversation reply speed</span><select data-pref="textSpeed">${['instant','normal','slow'].map(n => `<option ${n === v.textSpeed ? 'selected' : ''}>${n}</option>`).join('')}</select></label>${toggle('reducedMotion', 'Reduced motion')}<div id="audioStatus" class="muted"></div><button class="btn" id="audioRetry">Retry music</button><p class="muted">Scenes have no reading timer. Continue when you are ready. Backgrounding this page pauses audio.</p>`, e => {
      e.querySelectorAll('[data-pref]').forEach(i => i.oninput = () => { const val = i.type === 'checkbox' ? i.checked : /Volume|fontSize/.test(i.dataset.pref) ? +i.value : i.value; SH.Settings.set(i.dataset.pref, val); });
      $('#audioStatus').textContent = SH.Soundtrack ? SH.Soundtrack.status() : 'Selected music assets are not installed yet. Effects and silent play work.';
      $('#audioRetry').onclick = () => { SH.Audio.init(); SH.Soundtrack && SH.Soundtrack.retry(); $('#audioStatus').textContent = SH.Soundtrack ? SH.Soundtrack.status() : 'Music assets are still pending.'; };
    });
  };
  MN.credits = function () {
    overlay('Credits', `<div class="credits-title">SMALL HOURS</div><p>Created by <b>BrokenHours Studio</b>.</p><p>Vanilla JavaScript, canvas figures and scenes. Small sound effects synthesized in-game; no external SFX samples.</p><h3>Selected soundtrack</h3>${[['The Long Dark','the-long-dark'],['There is a Place','there-is-a-place'],['Intervention (No Piano Melody mix)','intervention']].map(([n, slug]) => `<p>‘${n}’ by Scott Buckley, released under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. <a href="https://www.scottbuckley.com.au/library/${slug}/" target="_blank" rel="noopener">www.scottbuckley.com.au</a>.</p>`).join('')}<p class="muted">Music integration is in progress. A track is never replaced with a different composition if its local file is missing. See AUDIO_CREDITS.md for asset provenance and packaging status.</p><h3>Content note · 16+</h3><p>This is fiction about a twelve-year-old, not instructions for running away. It includes family conflict, non-graphic abuse, bullying, homelessness and grooming risk.</p><p>If this is close to home: India <b>1098 / 112</b>; US National Runaway Safeline <b>1-800-786-2929</b> and crisis <b>988</b>; UK Childline <b>0800 1111</b>.</p><p class="muted">v1.5 preview. Your saves, previous runs and memories are stored locally in this browser. Export backups before clearing browser data or changing devices.</p>`);
  };
  MN.runs = function () {
    const runs = AR.read().concat(AR.pending ? [AR.pending] : []);
    overlay('Previous Runs', `<p class="muted">Completed chapters only. Viewing one never loads it as a playable save.</p>${runs.length ? runs.map((r, i) => `<button class="history-row" data-run="${i}"><span><b>${esc(r.title)}</b><small>${esc(r.name)} · Story #${esc(r.seed)} · ${esc(r.scene && r.scene.town)} · ${esc(r.sub)}</small></span><span>View ›</span></button>`).join('') : '<div class="empty-state"><h3>No completed stories yet</h3><p>The endings you actually reach will be kept here. Nothing undiscovered is listed.</p></div>'}<div class="backup-buttons"><button class="btn" id="historyExport">Export history & memories</button><button class="btn" id="historyImport">Import history backup</button></div><p class="muted">History lives in this browser, not in your account. Clearing browser data removes it. Backups merge without replacing saves or older runs.</p>`, e => {
      e.querySelectorAll('[data-run]').forEach(b => b.onclick = () => MN.run(runs[+b.dataset.run]));
      $('#historyExport').onclick = AR.export; $('#historyImport').onclick = AR.import;
    });
  };
  MN.run = function (r) {
    overlay(r.title, `<p class="muted">Read-only · ${esc(r.name)} · Story #${esc(r.seed)}</p><div class="backup-buttons"><button class="btn primary" id="replayEnding">Replay scenes & memories</button><button class="btn" id="runMemories">Browse memories</button><button class="btn" id="backRuns">Back to runs</button></div><article class="archive-ending">${safeHTML(r.html || r.paras.map(p => `<p>${esc(p)}</p>`).join(''))}</article>`, () => {
      $('#replayEnding').onclick = () => SH.Presentation.open(SH.Presentation.cardsFor(r), () => MN.run(r), true);
      $('#runMemories').onclick = () => MN.memories(r); $('#backRuns').onclick = MN.runs;
    });
  };
  MN.memories = function (run) {
    const g = SH.G, current = g && g.v15, list = run ? run.memories : current ? current.memories : [], title = run ? `${run.name}'s story #${run.seed}` : g ? `${g.name}'s current story` : 'Earned memories';
    const runs = AR.read();
    overlay('Memories', `<h3>${esc(title)}</h3><p class="muted">These records belong to this story alone.${(run ? run.incomplete : current && current.incomplete) ? ' This older save has incomplete visual history; missing scenes are not invented.' : ''}</p>${list && list.length ? list.map((m, i) => `<button class="history-row" data-memory="${i}"><span><b>${esc(m.title)}</b><small>${esc(m.scene && m.scene.place)} · ${esc(m.scene && m.scene.date)}</small></span><span>View ›</span></button>`).join('') : '<div class="empty-state"><p>No visual memories recorded in this story yet.</p></div>'}${!run && runs.length ? `<h3>Archived stories</h3>${runs.map((r, i) => `<button class="history-row" data-archived="${i}">${esc(r.name)} · #${esc(r.seed)} · ${esc(r.title)}</button>`).join('')}` : ''}`, e => {
      e.querySelectorAll('[data-memory]').forEach(b => b.onclick = () => { const m = list[+b.dataset.memory]; SH.Presentation.open([{ title: m.title, text: m.text, scene: m.scene }], () => {}, true); });
      e.querySelectorAll('[data-archived]').forEach(b => b.onclick = () => MN.memories(runs[+b.dataset.archived]));
    });
  };
  MN.open = function () {
    overlay('Small Hours', '<div class="in-game-menu"><button class="btn primary" id="resumeStory">Back to your story</button><button class="btn" id="gameSaves">Saves</button><button class="btn" id="gameMemories">Memories</button><button class="btn" id="gameRuns">Previous Runs</button><button class="btn" id="gameSettings">Settings</button><button class="btn" id="gameCredits">Credits</button><button class="btn" id="gameTitle">Return to main menu</button></div>', () => {
      $('#resumeStory').onclick = () => $('#menuOverlay').remove();
      $('#gameSaves').onclick = () => { $('#menuOverlay').remove(); SH.Saves.open(true); };
      $('#gameMemories').onclick = () => MN.memories(); $('#gameRuns').onclick = MN.runs; $('#gameSettings').onclick = MN.settings; $('#gameCredits').onclick = MN.credits;
      $('#gameTitle').onclick = () => { if (SH.G && !SH.G.ended && !SH.save()) { if (!confirm('Saving is blocked. Export a playable save before leaving. Return anyway?')) return; } location.reload(); };
    });
  };
  const top = SH.UI.renderTop;
  SH.UI.renderTop = function () {
    const r = top.apply(this, arguments); if (!$('#menuBtn') && $('#top')) { const b = document.createElement('button'); b.id = 'menuBtn'; b.className = 'ibtn'; b.textContent = '☰'; b.title = 'Menu, memories and settings'; b.setAttribute('aria-label', b.title); b.onclick = MN.open; $('#top').appendChild(b); }
    const snd = $('#sndBtn'); if (snd) { snd.onclick = MN.settings; snd.title = 'Music and sound settings'; }
    return r;
  };
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('v15');
    const box = $('.tbox'), logo = $('.logo'), rows = [...box.children].filter(e => e.classList.contains('row'));
    const setup = document.createElement('section'); setup.id = 'newGameSetup'; setup.className = 'hidden';
    rows.forEach(r => setup.appendChild(r));
    const continueBtn = $('#contBtn'), slotsBtn = $('#slotsBtn'); if (continueBtn) continueBtn.remove(); if (slotsBtn) slotsBtn.remove();
    const studio = document.createElement('div'); studio.className = 'studio'; studio.textContent = 'BROKENHOURS STUDIO'; logo.before(studio);
    const nav = document.createElement('nav'); nav.className = 'main-menu'; nav.setAttribute('aria-label', 'Main menu');
    nav.innerHTML = `<button class="btn primary" id="newGameBtn">New Game <span>Start another story</span></button><button class="btn" id="menuContinue">Continue <span>${SH.hasSave() ? 'Return to your last save' : 'No autosave yet'}</span></button><button class="btn" id="menuSaves">Saves</button><button class="btn" id="menuRuns">Previous Runs</button><button class="btn" id="menuMemories">Memories</button><button class="btn" id="menuSettings">Settings</button><button class="btn" id="menuCredits">Credits</button>`;
    box.append(nav, setup); if (continueBtn) { continueBtn.classList.add('hidden'); box.appendChild(continueBtn); }
    const begin = $('#startBtn'); begin.textContent = 'Begin this story'; const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = 'Back to menu'; begin.after(cancel);
    cancel.onclick = () => { setup.classList.add('hidden'); nav.classList.remove('hidden'); };
    $('#newGameBtn').onclick = () => { nav.classList.add('hidden'); setup.classList.remove('hidden'); $('#nameIn').focus(); };
    const start = begin.onclick;
    begin.onclick = () => { if (SH.hasSave() && !confirm('Start a new story? The autosave will be replaced. Save it to a slot or export it first if you want to keep playing it. Previous Runs will be kept.')) return; start(); };
    $('#menuContinue').disabled = !SH.hasSave(); $('#menuContinue').onclick = () => continueBtn && continueBtn.click();
    $('#menuSaves').onclick = () => SH.Saves.open(false); $('#menuRuns').onclick = MN.runs; $('#menuMemories').onclick = () => MN.memories(); $('#menuSettings').onclick = MN.settings; $('#menuCredits').onclick = MN.credits;
    const foot = document.createElement('div'); foot.className = 'menu-version'; foot.textContent = 'v1.5 preview · 16+ · Your stories stay on this device'; box.appendChild(foot);
    [...box.children].filter(e => e !== foot && e.style.fontSize && /endings/.test(e.textContent)).forEach(e => e.remove());
    SH.Settings.apply();
  });
})(window.SH);
