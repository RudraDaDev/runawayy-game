/* Small Hours v1.5: one appearance source, and companions are actually here. */
(function (SH) {
  const clone = x => JSON.parse(JSON.stringify(x));
  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const V = SH.Visuals = {};
  V.ensure = function (g) {
    if (!g) return;
    g.v15 = g.v15 || { version: 1, memories: [], seen: {}, incomplete: true };
    const v = g.v15; v.memories = v.memories || []; v.seen = v.seen || {}; v.people = v.people || {}; v.outfit = v.outfit || {};
    if (!v.people.sam) {
      const n = hash('sam:' + ((g.story || {}).seed || 1));
      v.people.sam = { skin: ['#e1b48f', '#bc845c', '#8d5b3e', '#69432f', '#efc5a3'][n % 5], hair: ['#211812', '#463021', '#8b5734', '#b58c52'][(n >>> 4) % 4], style: (g.gender || (g.fam || {}).gender) === 'f' ? ['bob', 'pony', 'curly'][(n >>> 7) % 3] : ['messy', 'short', 'curly'][(n >>> 7) % 3], shirt: ['#746957', '#686d56', '#8a5650', '#69606c'][(n >>> 10) % 4], top: 'hoodie', young: 1, freckles: (n >>> 13) % 2 };
    }
    return v;
  };
  V.look = function (id, g = SH.G) {
    const v = V.ensure(g); if (!v) return SH.Portrait.LOOK[id];
    if (!v.people[id]) {
      const established = SH.Portrait.LOOK[id];
      if (established) v.people[id] = clone(established);
      else if (SH.NPCS_META[id] && id !== 'dex') {
        const n = hash(id + ':' + ((g.story || {}).seed || 1));
        v.people[id] = { skin: ['#c88e65', '#8d5b3e', '#69432f', '#efc5a3'][n % 4], hair: ['#211812', '#8b5734', '#a7a09a'][(n >>> 4) % 3], shirt: ['#746957', '#686d56', '#8a5650', '#69606c'][(n >>> 8) % 4], style: 'short', top: 'tee', young: (SH.NPCS_META[id].age || 30) <= 14 ? 1 : 0 };
      }
    }
    const l = v.people[id]; if (!l) return null;
    if (id !== 'sam') return l;
    const o = Object.assign({}, l), changes = g.look || {}, fit = v.outfit;
    if (changes.hair) o.style = 'buzz';
    if (changes.dye) o.hair = '#a47eb0';
    if (changes.glasses || fit.glasses) o.glasses = '#aaa08e';
    o.legs = fit.legs === 'x_sweats' ? '#65616b' : '#39372f'; o.shoe = fit.shoes === 'x_boots' ? '#786049' : '#aaa396';
    o.gloves = fit.hands === 'x_gloves' ? '#70664f' : null;
    const tops = { x_hoodie2: ['#74766d', 'hoodie'], x_rainjacket: ['#68765b', 'jacket'], x_sweats: ['#65616b', 'hoodie'] };
    if (tops[fit.top]) [o.shirt, o.top] = tops[fit.top];
    if (fit.hat) { o.hat = fit.hat === 'x_cap' ? 'cap' : 'beanie'; o.hatc = '#8b735b'; }
    return o;
  };
  V.body = function (id, fallback) {
    const p = V.look(id); if (!p) return fallback;
    const fit = id === 'sam' ? V.ensure(SH.G).outfit : {};
    return { skin: p.skin, hair: p.hair, top: p.shirt, legs: fit.legs === 'x_sweats' ? '#65616b' : '#39372f', shoe: p.shoe || (fit.shoes === 'x_boots' ? '#786049' : '#aaa396'), long: /pony|bob|curly|bun|pigtails/.test(p.style), cap: p.hat ? p.hatc || p.shirt : null, glasses: p.glasses, gloves: p.gloves, tall: p.young === 2 ? 0.7 : p.young ? 0.86 : 1 };
  };
  const categories = { x_hoodie2: 'top', x_rainjacket: 'top', x_sweats: 'legs', x_boots: 'shoes', x_cap: 'hat', x_beanie: 'hat', x_gloves: 'hands', x_socks: 'socks', x_glasses: 'glasses' };
  V.equip = function (id) {
    const g = SH.G, slot = categories[id];
    if (!g || !slot || !(g.bag || []).concat(g.owned || []).includes(id)) return false;
    const fit = V.ensure(g).outfit; if (fit[slot] === id) return true; fit[slot] = id;
    SH.Memories && SH.Memories.record('outfit:' + id + ':' + g.t, 'A different outline', 'You put on the ' + SH.ITEMS[id].n + '.', 'outfit');
    return true;
  };
  V.wardrobe = function () {
    const g = SH.G, ids = [...new Set((g.bag || []).concat(g.owned || []))].filter(id => categories[id]);
    SH.UI.dialog({ title: 'What you wear', text: ['Your face stays yours. Clothing changes only what you see here; existing carried-gear benefits stay unchanged.'], choices: ids.map(id => ({ t: SH.ITEMS[id].n, sub: V.ensure(g).outfit[categories[id]] === id ? 'Wearing this' : 'Put it on', fn: () => { V.equip(id); SH.UI.renderAll(); V.wardrobe(); } })).concat([{ t: 'Back', fn: () => {} }]) });
  };
  const PT = SH.Portrait, svg = PT.svg, has = PT.has;
  PT.has = id => has(id) || !!(SH.NPCS_META[id] && id !== 'dex');
  PT.svg = function (id, o = {}) { return svg.call(PT, id, Object.assign({}, o, { look: o.look || V.look(id) })); };
  const migrate = SH.migrate;
  SH.migrate = function (g) { const r = migrate.apply(this, arguments); V.ensure(g); return r; };
  const newGame = SH.newGame;
  SH.newGame = function () { const r = newGame.apply(this, arguments); const h = V.ensure(SH.G); delete h.people.sam; V.ensure(SH.G); h.incomplete = false; return r; };

  const C = SH.Companions = {};
  C.ids = function (g = SH.G) { return g && (g.phase === 'run' || g.phase === 'end') ? [...new Set((g.party || []).concat(g.rkids || []))].filter(id => SH.NPCS_META[id]) : []; };
  C.has = id => C.ids().includes(id);
  C.talk = function (id) {
    if (!C.has(id)) return;
    const g = SH.G, p = SH.Atlas.here(), n = SH.NPCS_META[id].n;
    const first = g.away ? `I'm here. ${p.name} still feels strange, doesn't it?` : 'Right here. You can just talk to me.';
    SH.Talk.open(id, { ctx: 'run', first, turnsMax: 12, intro: `${n} turns toward you. No screen between you this time.` });
  };
  C.quiet = function () {
    const ids = C.ids(); if (!ids.length) return;
    const g = SH.G, n = ids.map(id => SH.NPCS_META[id].n).join(' and '), p = SH.LOC[g.loc];
    SH.advance(10, { interrupt: false }); if (g.ended) return;
    const line = `${n} ${ids.length > 1 ? 'stay' : 'stays'} beside you. ${SH.raining() ? 'Rain ticks against the nearest roof. You listen together.' : SH.isDark() ? 'For a little while, neither of you needs to fill the dark with words.' : 'Someone shifts their bag to make a little more room. The quiet is shared, not empty.'}`;
    SH.UI.log(line, 'good');
    SH.Memories.record('quiet:' + SH.day() + ':' + g.loc, 'The quiet beside you', line, 'shared', ids);
    SH.UI.dialog({ title: p ? p.name : 'A little while', text: [line], choices: [{ t: 'Stay together. Keep going.', fn: () => {} }] });
  };
  // Co-present friends answer about the place they are in, not an old home routine.
  Object.keys(SH.Friends.KIDS).concat('jordan').forEach(id => {
    const brain = SH.Brain[id]; if (!brain) return;
    SH.Brain[id] = function (an, c) {
      if (C.has(id) && c.ctx !== 'homesick' && !an.has('selfharm') && !an.has('disclose') && !an.has('run') && !an.has('stay')) {
        const t = an.t || '';
        if (/\b(how are you|how r u|how you doing|how's it going|what are you doing|wyd)\b/.test(t)) {
          c.mem._v15Small = (c.mem._v15Small || 0) + 1;
          const place = SH.G.away ? SH.Atlas.here().name : 'here';
          return { say: c.mem._v15Small === 1 ? `Still getting used to ${place}. I'm glad you're here, though.` : "A little tired. Still here. We don't have to have a plan for every minute.", fx: {} };
        }
        if (/\b(where are you|where r u|are you there|u there)\b/.test(t)) return { say: "Right here. I'm not going anywhere on my own.", fx: {} };
        if (/\b(look at|this place|this town|the rain|it's raining|it is raining)\b/.test(t)) return { say: SH.raining() ? "Yeah. The rain sounds different here. Everything does." : "Yeah. I keep noticing small things. The signs. The way people say hello.", fx: {} };
      }
      return brain.apply(this, arguments);
    };
  });
  const where = SH.World.where, present = SH.World.present;
  SH.World.where = function (id, t) { if (C.has(id)) return { loc: SH.G.loc, act: 'with you', place: SH.G.away || 'p0' }; return where.apply(this, arguments); };
  SH.World.present = function (loc = SH.G.loc) { return [...new Set(present.apply(this, arguments).concat(loc === SH.G.loc ? C.ids() : []))]; };
  SH.K.party = () => C.ids();
  const list = SH.Actions.list;
  SH.Actions.list = function () {
    const out = list.apply(this, arguments); if (!out || !SH.G || SH.G.ended) return out;
    C.ids().forEach(id => {
      const n = SH.NPCS_META[id].n, label = 'Talk to ' + n;
      out.acts = out.acts.filter(a => a.label !== label);
      out.acts.push({ label, sub: 'With you, here. Talk in person.', fn: () => C.talk(id) });
    });
    if (!out.acts.some(a => a.label === 'What you wear')) out.acts.push({ label: 'What you wear', sub: 'Your clothes, your outline.', fn: V.wardrobe });
    if (C.ids().length) out.acts.push({ label: 'Share a quiet moment', sub: 'Ten minutes together. No need to say anything.', fn: C.quiet });
    return out;
  };
  const send = SH.Phone.send, call = SH.Phone.callOut;
  SH.Phone.send = function (id) { if (C.has(id)) { SH.UI.toast('They are beside you. Talk in person.'); return C.talk(id); } return send.apply(this, arguments); };
  SH.Phone.callOut = function (id) { if (C.has(id)) return C.talk(id); return call.apply(this, arguments); };
  const ctx = SH.EndX.ctx;
  SH.EndX.ctx = function () {
    const c = ctx.apply(this, arguments), ids = C.ids(c.g), nm = id => SH.NPCS_META[id].n;
    c.party = ids; c.pn = ids.map(nm); c.n = ids.length; c.pl = c.pn.length > 1 ? c.pn.slice(0, -1).join(', ') + ' and ' + c.pn.at(-1) : c.pn[0] || '';
    c.they = c.n === 1 ? c.pl : c.n ? 'your friends' : ''; c.withYou = c.n ? ' with ' + c.pl : ''; c.partnerWith = ids.includes(c.partner);
    return c;
  };
  SH.K.me((p, ch) => { ch.push({ t: 'What you wear', sub: 'Choose from clothes you own', fn: V.wardrobe }); C.ids().forEach(id => ch.push({ t: 'Talk to ' + SH.NPCS_META[id].n, sub: 'Right here', fn: () => C.talk(id) })); if (C.ids().length) ch.push({ t: 'Share a quiet moment', fn: C.quiet }); });
})(window.SH);
