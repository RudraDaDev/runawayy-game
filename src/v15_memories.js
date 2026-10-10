/* Small Hours v1.5: earned, per-story memories. No simulated effects on replay. */
(function (SH) {
  const copy = x => JSON.parse(JSON.stringify(x));
  const M = SH.Memories = {};
  const v = () => SH.Visuals.ensure(SH.G);
  M.snapshot = function (ids = [], context = {}) {
    const g = SH.G, L = context.location || SH.LOC[g.loc] || {}, p = g.away && SH.Atlas.here(), base = g.base;
    const atBase = !!(base && p && base.pid === p.id && context.base);
    const rawKind = L.kind || L.type || g.loc;
    let kind = g.loc === 'home' ? (g.room === 'bedroom' ? 'bedroom' : g.room === 'kitchen' ? 'kitchen' : 'home') : /diner|cafe/.test(rawKind) ? 'diner' : /library/.test(rawKind) ? 'library' : /school/.test(rawKind) ? 'school' : /motel|shelter|grandma|harbor/.test(rawKind) ? 'shelter' : /stop|bus|station/.test(rawKind) ? 'stop' : /underpass/.test(rawKind) ? 'underpass' : /camp|forest|woods/.test(rawKind) ? 'camp' : L.indoor ? 'interior' : 'street';
    if(atBase) kind=base.type==='camp'?'camp':'interior';
    if(context.room) kind='motel';
    if(context.kind) kind=context.kind;
    const set = { kind, indoor: !!context.room || (atBase ? base.type !== 'camp' : !!L.indoor), camp: atBase && base.type === 'camp', shack: atBase && !!base.shack, baseType: atBase ? base.type : '', upgrades: atBase && Array.isArray(base.up) ? base.up.slice() : [], biome: p ? p.biome : '', locationKind: rawKind };
    const local = p && SH.Town.present ? SH.Town.present(L).map(q=>q.id) : [];
    const presentIds = ids.filter(id => SH.Companions.has(id) || local.includes(id) || (!p && (SH.World.where(id) || {}).loc === g.loc) || (SH.Talk.cur && SH.Talk.cur.npc === id && !SH.Talk.cur.opts.phone));
    const actors = ['sam'].concat(SH.Companions.ids(), presentIds).filter((id, i, a) => a.indexOf(id) === i && SH.Visuals.look(id));
    const explicit=(context.actors||[]).filter(a=>a && a.id && a.name && a.look);
    const place = context.place || (context.room ? g.room.n + ', your room' : atBase ? (base.shack ? 'Your shack' : (SH.Bases.TYPES[base.type] || {}).n) : L.name || (p && p.name) || 'Harlow');
    return { set, loc: g.loc, place, town: p ? p.name : 'Harlow', tier: p ? p.tier : 'town', action: context.action || '', room: typeof g.room === 'string' ? g.room : 'motel', time: SH.fmt12(), date: SH.dateStr(), night: SH.isDark(), weather: SH.cond(), outfit: copy(v().outfit), people: actors.map(id => ({ id, name: id === 'sam' ? g.name : (SH.NPCS_META[id] || {}).n || id, look: copy(SH.Visuals.look(id)), companion: SH.Companions.has(id) })).concat(explicit.filter(a=>!actors.includes(a.id)).map(copy)) };
  };
  // Called at the actual completed action, not inferred from words in the log.
  M.event = function (key,title,text,kind,context={}) {
    const rec=M.record(key,title,text,kind,context.ids||[],M.snapshot(context.ids||[],context));
    if(rec) SH.Presentation && SH.Presentation.offer(rec);
    return rec;
  };
  M.record = function (key, title, text, kind = 'moment', ids = [], snapshot) {
    const g = SH.G; if (!g || (SH.Presentation && SH.Presentation.readOnly) || g.ended) return;
    const h = v(); if (h.seen[key]) return;
    h.seen[key] = true;
    const rec = { key: String(key).slice(0, 120), title: SH.nm(title), text: String(SH.nm(text)).replace(/<[^>]*>/g, '').slice(0, 2500), kind, t: g.t, scene: snapshot || M.snapshot(ids) };
    rec.scene.beat = kind === 'arrival' ? 'arrival' : key.startsWith('tag:ranAway') ? 'departure' : kind === 'shared' ? 'shared' : kind === 'conversation' || kind === 'joined' ? 'conversation' : kind === 'construction' ? 'construction' : kind === 'sleep' ? 'sleep' : kind === 'shelter' ? 'shelter' : 'still';
    h.memories.push(copy(rec));
    // Bound history, while keeping the first departure. Nothing is reconstructed as a pictured event.
    if (h.memories.length > 160) h.memories.splice(1, 1);
    return rec;
  };
  const tags = {
    phoneTaken: ['The empty pocket', 'Your phone was taken.'], burnedTyler: ['Finding your voice', 'You answered Tyler back.'],
    okaforTalk: ['Someone noticed', 'You talked with Ms. Okafor.'], bikeSold: ['The missing bicycle', 'The bicycle Grandma gave you was sold.'],
    protectedLily: ['A small fort', 'You stayed close to your sister when home was difficult.'], cps: ['Outside the house', 'Children’s Services became part of your story.'],
    dexReported: ['A report', 'You reported dex.'], bigNight: ['A breaking point', 'That night was a breaking point at home.'], lockedIn: ['Behind the door', 'You spent that night with the door closed.'],
    ranAway: ['Leaving', 'You left home.'], phoneDied: ['The screen went dark', 'Your phone battery ran out.']
  };
  const flag = SH.flag;
  SH.flag = function (key) {
    const first = SH.G && !SH.G.flags[key], r = flag.apply(this, arguments);
    const facts = { toldCounselor: ['Someone listened', 'You told Ms. Okafor what was happening.', 'okafor'], toldPolice: ['On the record', 'You told an officer about home.', 'officer'], toldMarcus: ['The words at Harbor', 'You told Marcus about home.', 'marcus'], momKnows: ['Telling Mom', 'Mom learned what was happening at home.', 'mom'], grandmaKnows: ['Any hour', 'Grandma learned what was happening at home.', 'grandma'], dexReported: ['A report', 'You reported dex.', null], leftNote: ['Words on the pillow', 'You left a note before going.', null], patelSafe: ['The next door', 'You told Mrs. Patel about home.', 'patel'] };
    if (first && SH.G.flags[key] && facts[key]) { const [title, text, who] = facts[key]; M.record('fact:' + key, title, text, 'turning', who ? [who] : []); }
    return r;
  };
  const tag = SH.tag;
  SH.tag = function (key) { const r = tag.apply(this, arguments); if (tags[key]) M.record('tag:' + key + ':' + SH.day(), tags[key][0], tags[key][1], 'turning', [], key==='ranAway' && SH.G.loc==='home' ? M.snapshot([], {kind:'street',location:{name:'Outside home',kind:'street',indoor:false}}) : undefined); return r; };
  // Only explicit events earn visual records. Prose mentioning a roof or a gift is not proof of receiving one.
  // Capture only milestone dialogs that were actually rendered. Choices still apply exactly once.
  const milestoneTitles = /^(Two backpacks|Harbor House|Storm|First snow|Thanksgiving|Christmas|Birthday|The diner, after the lunch rush|The Parking Lot|Second Place|Slow and Steady|His Hand|Locked|The Bulletin Board|The Librarian|The Tooth|Burning Up|Pancakes|Spilled Juice|A Knock at the Door|Newton Is Missing)$/;
  const dialog = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    const before = SH.G;
    const r = dialog.apply(this, arguments);
    if (o && before && SH.G === before && !before.ended && (o.memory || milestoneTitles.test(String(o.title || ''))) && SH.UI.modalOpen() && (document.querySelector('#modal h3') || {}).textContent === SH.nm(o.title)) {
      const text = [].concat(o.text || []).map(x => String(x).replace(/<[^>]*>/g, '')).join('\n');
      const meta=o.memory || {};
      const rec = M.record(meta.key || 'scene:' + o.title + ':' + before.t, o.title, text, meta.beat || 'scene', o.who ? [o.who] : [], M.snapshot(o.who ? [o.who] : [],meta));
      if (rec) SH.Presentation && SH.Presentation.offer(rec);
    }
    return r;
  };
  const sleep = SH.Run.sleep;
  SH.Run.sleep = function () {
    const g = SH.G, scene = M.snapshot(), t = g.t;
    const r = sleep.apply(this, arguments);
    if (SH.G === g && !g.ended && g.t > t) {
      const rec = M.record('night:' + scene.loc + ':' + scene.date, 'A place to close your eyes', 'You rested at ' + scene.place + ' for about ' + Math.max(1, Math.round((g.t-t)/60)) + ' hours. This records the rest you actually got, not a promise of an undisturbed night.', 'sleep', [], scene);
      SH.Presentation && SH.Presentation.offer(rec);
    }
    return r;
  };
  const close = SH.Talk.close;
  SH.Talk.close = function () {
    const c = SH.Talk.cur, lines = [...document.querySelectorAll('#tlog .tl')].map(e => (e.classList.contains('me') ? (SH.G.name || 'You') : e.classList.contains('narr') ? '' : (SH.NPCS_META[c && c.npc] || {}).n || '') + (e.classList.contains('narr') ? '' : ': ') + e.textContent);
    if (c && c.turn >= 1 && !c.opts.phone && lines.length) M.record('conversation:' + c.npc + ':' + SH.G.t, 'Talking with ' + (SH.NPCS_META[c.npc] || {}).n, lines.join('\n'), 'conversation', [c.npc]);
    return close.apply(this, arguments);
  };
  M.sync = function () {
    const g = SH.G; if (!g || g.ended || (SH.Presentation && SH.Presentation.readOnly)) return;
    const h = v(), current = SH.Companions.ids();
    if (!h.partyBaseline) { h.partyBaseline = current.slice(); return; }
    current.filter(id => !h.partyBaseline.includes(id)).forEach(id => {
      const n = SH.NPCS_META[id].n;
      const rec = M.record('joined:' + id, 'Not alone', n + ' joined you. From here, the road has another set of footsteps.', 'joined', [id]); SH.Presentation && SH.Presentation.offer(rec);
    });
    h.partyBaseline = current.slice();
  };
  const after = SH.UI.afterAction;
  SH.UI.afterAction = function () { M.sync(); const r = after.apply(this, arguments); SH.Soundtrack && SH.Soundtrack.context(); return r; };
  const start = SH.Run.start;
  SH.Run.start = function () { const before = SH.G && SH.G.phase, r = start.apply(this, arguments); if (SH.G && before !== SH.G.phase && SH.G.phase === 'run') { M.sync(); SH.Presentation && SH.Presentation.offer(v().memories.find(m => m.kind === 'turning' && m.key.startsWith('tag:ranAway'))); } return r; };
  const arrive = SH.Atlas.arrive;
  SH.Atlas.arrive = function (to) {
    const before = SH.G.away, r = arrive.apply(this, arguments), g = SH.G;
    if (!g.ended && g.away !== before) {
      const rec = M.record('arrival:' + to.id, to.home ? 'Harlow again' : 'Beyond Harlow', `You arrived in ${to.name}${SH.Companions.ids().length ? ' together' : ''}. The journey is part of your story now.`, 'arrival');
      SH.Presentation && SH.Presentation.offer(rec);
    }
    return r;
  };
  const newGame = SH.newGame;
  SH.newGame = function () { const r = newGame.apply(this, arguments); v().partyBaseline = []; return r; };
  SH.K.me((p, ch) => ch.push({ t: 'Memories from this story', sub: 'Only things you experienced', fn: () => SH.Menu.memories() }));
})(window.SH);
