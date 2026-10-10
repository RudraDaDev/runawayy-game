/* Small Hours v1.5: earned, per-story memories. No simulated effects on replay. */
(function (SH) {
  const copy = x => JSON.parse(JSON.stringify(x));
  const M = SH.Memories = {};
  const v = () => SH.Visuals.ensure(SH.G);
  M.snapshot = function (ids = []) {
    const g = SH.G, place = (SH.LOC[g.loc] || {}).name || (g.away && SH.Atlas.here().name) || 'Harlow';
    const presentIds = ids.filter(id => SH.Companions.has(id) || (SH.World.where(id) || {}).loc === g.loc || (SH.Talk.cur && SH.Talk.cur.npc === id && !SH.Talk.cur.opts.phone));
    const actors = ['sam'].concat(SH.Companions.ids(), presentIds).filter((id, i, a) => a.indexOf(id) === i && SH.Visuals.look(id));
    return { loc: g.loc, place, town: g.away ? SH.Atlas.here().name : 'Harlow', tier: g.away ? SH.Atlas.here().tier : 'town', room: g.room, time: SH.fmt12(), date: SH.dateStr(), night: SH.isDark(), weather: SH.cond(), outfit: copy(v().outfit), people: actors.map(id => ({ id, name: id === 'sam' ? g.name : (SH.NPCS_META[id] || {}).n || id, look: copy(SH.Visuals.look(id)), companion: SH.Companions.has(id) })) };
  };
  M.record = function (key, title, text, kind = 'moment', ids = [], snapshot) {
    const g = SH.G; if (!g || (SH.Presentation && SH.Presentation.readOnly) || g.ended) return;
    const h = v(); if (h.seen[key]) return;
    h.seen[key] = true;
    const rec = { key: String(key).slice(0, 120), title: SH.nm(title), text: String(SH.nm(text)).replace(/<[^>]*>/g, '').slice(0, 2500), kind, t: g.t, scene: snapshot || M.snapshot(ids) };
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
  SH.tag = function (key) { const r = tag.apply(this, arguments); if (tags[key]) M.record('tag:' + key + ':' + SH.day(), tags[key][0], tags[key][1], 'turning'); return r; };
  const log = SH.UI.log;
  SH.UI.log = function (text, cls) {
    const r = log.apply(this, arguments), plain = String(SH.nm(text)).replace(/<[^>]*>/g, '');
    const meaningful = /shelter|you sleep|sleep tonight|first night|warm meal|lets? you in|takes? you in|joins you|comes with you|tells? (him|her|them|you) the truth|tell .*truth|you build|you finish|your own (place|roof)|hands you|gives you|you hug|holds your hand/i.test(plain);
    if (SH.G && !SH.G.ended && meaningful && !/you (can|could)|if you|buy|costs?\b|bus lets you off|you arrive|a way to sleep|shelter and keeps going/i.test(plain)) M.record('log:' + SH.G.t + ':' + plain.slice(0, 50), /you sleep|sleep tonight|first night|lets you in|roof|warm meal/.test(plain) ? 'Somewhere for tonight' : /truth/.test(plain) ? 'Words outside your head' : 'Something that stayed', plain, 'moment');
    return r;
  };
  // Capture only milestone dialogs that were actually rendered. Choices still apply exactly once.
  const milestoneTitles = /^(Two backpacks|Harbor House|Storm|First snow|Thanksgiving|Christmas|Birthday|The diner, after the lunch rush|The Parking Lot|Second Place|Slow and Steady|His Hand|Locked|The Bulletin Board|The Librarian|The Tooth|Burning Up|Pancakes|Spilled Juice|A Knock at the Door|Newton Is Missing)$/;
  const dialog = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    const before = SH.G;
    const r = dialog.apply(this, arguments);
    if (o && before && SH.G === before && !before.ended && milestoneTitles.test(String(o.title || '')) && SH.UI.modalOpen() && (document.querySelector('#modal h3') || {}).textContent === SH.nm(o.title)) {
      const text = [].concat(o.text || []).map(x => String(x).replace(/<[^>]*>/g, '')).join('\n');
      const rec = M.record('scene:' + o.title + ':' + before.t, o.title, text, 'scene', o.who ? [o.who] : []);
      if (rec) SH.Presentation && SH.Presentation.offer(rec);
    }
    return r;
  };
  const sleep = SH.Run.sleep;
  SH.Run.sleep = function () {
    const g = SH.G, scene = M.snapshot(), meals = g.stats.nightsOut || 0;
    const r = sleep.apply(this, arguments);
    if (SH.G === g && !g.ended && (g.stats.nightsOut || 0) > meals) {
      const rec = M.record('night:' + scene.loc + ':' + scene.date, 'A place to close your eyes', 'You spent a night at ' + scene.place + '. It is one of the places that held part of your story.', 'shelter', [], scene);
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
    const g = SH.G; if (!g || g.ended) return;
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
