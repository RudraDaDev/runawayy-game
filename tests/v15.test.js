/* Run: LD_LIBRARY_PATH=/tmp/lib:/tmp node tests/v15.test.js [URL]
   Source and built/offline tests exercise real browser code, not replacement mechanics. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/tmp/chromium', args: ['--no-sandbox'] });
  let count = 0;
  async function test(url, mobile = false) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url); await page.waitForTimeout(300);
    const ok = (value, message) => { assert.ok(value, message); console.log('PASS', ++count, message); };
    ok(await page.locator('#newGameBtn').count(), 'proper main menu');
    ok(await page.locator('#menuContinue').isDisabled(), 'empty Continue honest');
    await page.click('#menuRuns'); ok((await page.locator('#menuOverlay').innerText()).includes('No completed stories'), 'no fabricated run history'); await page.click('#menuClose');
    await page.click('#menuSettings'); await page.locator('[data-pref=fontSize]').selectOption('20'); await page.locator('[data-pref=textSpeed]').selectOption('instant'); await page.click('#menuClose');
    await page.reload(); await page.waitForTimeout(300);
    ok(await page.evaluate(() => SH.Settings.values.fontSize === 20 && SH.Settings.values.textSpeed === 'instant'), 'preferences persist independently');
    await page.click('#newGameBtn'); await page.fill('#nameIn', 'LongNamePlayer'); await page.fill('#seedIn', '148318'); await page.click('#startBtn'); await page.waitForTimeout(200); await page.click('#modal .act');
    ok(await page.evaluate(() => SH.G.name === 'LongNamePlayer' && !SH.G.v15.incomplete), 'new game, complete new history');
    const sam = await page.evaluate(() => JSON.stringify(SH.Visuals.look('sam')));
    await page.evaluate(() => { SH.G.bag.push('x_hoodie2','x_sweats','x_boots','x_cap'); SH.Visuals.equip('x_hoodie2'); SH.Memories.record('before-boot', 'Before the boots', 'An outfit record'); SH.Visuals.equip('x_boots'); SH.save(); });
    ok(await page.evaluate(() => SH.G.v15.memories.find(m => m.key === 'before-boot').scene.people[0].look.shoe !== SH.Visuals.look('sam').shoe), 'historical outfit is not current outfit');
    await page.reload(); await page.waitForTimeout(300); await page.click('#menuContinue'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => SH.G && document.querySelector('#title').classList.contains('hidden') && SH.G.v15.outfit.top === 'x_hoodie2'), 'Continue loads full story and outfit');
    ok(JSON.parse(sam).skin === await page.evaluate(() => SH.Visuals.look('sam').skin), 'face stable across load');
    ok(await page.evaluate(() => SH.Visuals.body('sam').top === SH.Visuals.look('sam').shirt), 'portrait and scene shirt match');
    const migration = await page.evaluate(() => { const g = JSON.parse(JSON.stringify(SH.G)); delete g.v15; SH.migrate(g); return { incomplete: g.v15.incomplete, memories: g.v15.memories.length, skin: g.v15.people.sam.skin }; });
    ok(migration.incomplete && migration.memories === 0, 'old saves migrate honestly without invented visual history');
    await page.evaluate(() => { SH.Run.start('test', false); SH.G.party = ['nia','marco']; SH.G.rkids = ['jordan']; SH.G.phone.share = false; SH.Friends.st('nia').met = true; SH.Friends.st('marco').met = true; SH.UI.afterAction(); SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; });
    await page.evaluate(() => { const place = SH.Atlas.data().places.find(p => p.tier === 'village'); SH.Atlas.arrive(place, { k:'bus', mins:10, e:1, cost:0 }); SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; document.querySelector('#modal').classList.add('hidden'); SH.UI.renderAll(); });
    await page.waitForTimeout(250); await page.evaluate(() => { SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; });
    ok(await page.evaluate(() => SH.Companions.ids().every(id => SH.World.where(id).loc === SH.G.loc && SH.Actions.list().acts.some(a => a.label === 'Talk to ' + SH.NPCS_META[id].n))), 'all companions present and interactive in village');
    ok(await page.evaluate(() => SH.Stage.npcs.some(n => n.id === 'nia') && SH.Stage.npcs.some(n => n.id === 'jordan')), 'away companions actually drawn');
    ok(await page.evaluate(() => { const n = (SH.G.threads.nia || []).length; SH.Phone.push('nia','nia','Test nearby text'); return (SH.G.threads.nia || []).length === n; }), 'present companions do not text Sam');
    await page.evaluate(() => SH.Phone.send('jordan','are you there?')); ok(await page.locator('#tin').count(), 'sending to companion opens in-person conversation');
    await page.fill('#tin', 'how are you?'); await page.click('#tsend'); await page.waitForTimeout(120);
    ok((await page.locator('#tlog').innerText()).includes("I'm glad you're here"), 'companion reply uses current context');
    await page.evaluate(() => SH.Talk.close());
    await page.evaluate(() => { SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; SH.Companions.quiet(); });
    await page.evaluate(() => document.querySelector('#modal .act').click());
    ok(await page.evaluate(() => SH.G.v15.memories.some(m => m.kind === 'shared')), 'quiet shared moment earned');
    await page.evaluate(() => { SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; document.querySelector('#modal').classList.add('hidden'); SH.G._exCollapse = 0; SH.Exhaust.hit(); SH.Endings.found('sheriff'); SH.Phone.dial('100'); });
    ok(await page.evaluate(() => !SH.G.ended && !SH.G._exCollapse && !SH.Presentation.active), 'village police and exhaustion exemption preserved');
    await page.evaluate(() => { document.querySelector('#modal').classList.add('hidden'); const town = SH.Atlas.data().places.find(p => p.tier === 'town' && !p.home); SH.Atlas.arrive(town, { k:'bus', mins:10, e:1, cost:0 }); SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; document.querySelector('#modal').classList.add('hidden'); SH.G.party = []; SH.G.rkids = []; SH.G.money=200; SH.GasPhone.burner(); });
    ok(await page.evaluate(() => SH.G.bag.includes('oldphone') && SH.ITEMS.oldphone.w === 0), 'burner keeps space-free shut-down old phone');
    ok(await page.evaluate(() => { const n=(SH.G.threads.mom||[]).length; SH.Phone.push('mom','mom','Test old number'); return (SH.G.threads.mom||[]).length===n && SH.Net.x().oldInbox.some(m=>m.text==='Test old number'); }), 'unknown burner number cannot receive incoming texts');
    await page.evaluate(() => { document.querySelector('#modal').classList.add('hidden'); SH.G.bag.push('charger','powerbank'); SH.G.phone.bat=20; SH.Power.st('powerbank').left=300; SH.Actions.useItem('powerbank'); });
    ok(await page.evaluate(() => SH.G.bag.includes('powerbank') && SH.Power.st('powerbank').left >= 219 && SH.Power.st('powerbank').left <= 221), 'power bank retains unused portion of three charges');
    await page.evaluate(() => { SH.Presentation.dismiss(); SH.Presentation.queue=[]; SH.Presentation.pending=null; SH.Power.st('powerbank').used=2000; SH.G.phone.bat=20; document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('powerbank'); });
    ok(await page.evaluate(() => !SH.G.bag.includes('powerbank') && SH.G.bag.includes('charger')), 'bank wears out after twenty charges; charger reusable');
    await page.evaluate(() => { document.querySelector('#modal').classList.add('hidden'); SH.Presentation.dismiss(); SH.Presentation.queue=[]; SH.Presentation.pending=null; SH.Events.Q=[]; SH.G._exCollapse=0; SH.G.ended=false; SH.G.phase='run'; SH.Exhaust.hit(); });
    ok(await page.evaluate(() => !SH.G.ended && !SH.Presentation.active && document.querySelector('#modal').innerText.includes('Your body decides')), 'first exhaustion collapse not a premature ending');
    await page.locator('#modal .act').first().click();
    ok(await page.evaluate(() => !SH.G.ended && SH.G._exGrace > SH.G.t), 'collapse grants established grace period');
    await page.evaluate(() => { SH.Events.Q=[]; SH.Presentation.queue=[]; SH.Presentation.pending=null; SH.G.party=['nia','marco']; SH.G.rkids=['jordan']; });
    const policeBefore = await page.evaluate(() => { const town = SH.Atlas.data().places.find(p => p.tier === 'town' && !p.home); SH.Atlas.arrive(town, { k:'bus', mins:10, e:1, cost:0 }); SH.Presentation.dismiss(); SH.Presentation.queue = []; SH.Presentation.pending = null; document.querySelector('#modal').classList.add('hidden'); SH.Endings.found('tracked'); return {ended:SH.G.ended,scene:SH.Presentation.active,talk:document.querySelector('#modal').innerText}; });
    ok(!policeBefore.ended && !policeBefore.scene, 'no premature outcome card while found conversation remains');
    await page.evaluate(() => { document.querySelector('#modal').classList.add('hidden'); SH.EndX.trigger('gone'); });
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => SH.G.ended && SH.Presentation.active && document.querySelector('#presentation h1').textContent === 'You were never found.'), 'settled ending starts with appropriate title card');
    ok(await page.evaluate(() => !!document.querySelector('#keepLiving')), 'Keep living it retained behind presentation');
    ok(await page.evaluate(() => SH.Archive.read().length === 1), 'completed chapter archived before leaving sequence');
    await page.click('#scenePause'); ok(await page.locator('#sceneNext').isDisabled(), 'pause disables progression'); await page.click('#scenePause'); await page.click('#sceneNext');
    ok(await page.locator('#presentation .recorded-scene svg').count(), 'visual outcome scene after title'); await page.click('#sceneNext'); ok(await page.locator('#presentation .sequence-text').count(), 'memory has text and visual scene'); await page.click('#sceneSkip'); await page.waitForTimeout(150);
    const before = await page.evaluate(() => JSON.stringify(SH.G));
    await page.evaluate(() => SH.Menu.run(SH.Archive.read()[0])); await page.click('#replayEnding'); await page.click('#sceneNext'); await page.click('#sceneSkip');
    const afterReplay = await page.evaluate(() => JSON.stringify(SH.G));
    ok(before === afterReplay, 'archived replay read-only, zero live state changes');
    ok(await page.evaluate(() => { const runs=SH.Archive.read(); SH.Archive.merge({ format:'smallhours-history', version:1, runs }); return SH.Archive.read().length === 1; }), 'history import merges without duplicates');
    await page.click('#menuClose'); await page.click('#keepLiving');
    ok(await page.evaluate(() => !SH.G.ended && SH.G.phase === 'run' && SH.G.later.first), 'keep living resumes same story');
    await page.evaluate(() => SH.Later.finish(false)); await page.waitForTimeout(300);
    ok(await page.evaluate(() => SH.G.ended && SH.Archive.read().length === 2 && SH.G.later.done), 'second ending archived separately');
    await page.click('#sceneSkip'); await page.evaluate(() => { SH.Menu.settings(); });
    await page.waitForTimeout(2200);
    ok(await page.evaluate(() => SH.Soundtrack.active && !SH.Soundtrack.error && SH.Soundtrack.active.el.readyState >= 2), 'local audio decodes and plays');
    await page.locator('[data-pref=music]').uncheck();
    ok(await page.evaluate(() => SH.Soundtrack.players.every(p => p.el.paused)), 'music off pauses all players'); await page.locator('[data-pref=music]').check(); await page.click('#menuClose');
    await page.evaluate(() => { SH.Soundtrack.context(); SH.Soundtrack.context('reflection'); SH.Soundtrack.context(); });
    ok(await page.evaluate(() => SH.Soundtrack.players.length <= 2), 'rapid changes bound audio players');
    await page.waitForTimeout(2000); ok(await page.evaluate(() => SH.Soundtrack.players.length === 1), 'fade disposes old players');
    if (mobile) {
      ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth), 'mobile has no horizontal overflow');
      await page.setViewportSize({width:844,height:390}); await page.evaluate(() => SH.Menu.settings());
      ok(await page.evaluate(() => document.querySelector('.menu-panel').getBoundingClientRect().bottom <= innerHeight), 'landscape settings fit screen');
    }
    await page.evaluate(() => { SH.Menu.settings(); SH.Settings.set('music',true); SH.Settings.set('muted',false); SH.Soundtrack.retry(); });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const e=SH.Soundtrack.active.el; e.currentTime=e.duration-0.25; }); await page.waitForTimeout(1700);
    ok(await page.evaluate(() => SH.Soundtrack.active.el.currentTime < 4 && !SH.Soundtrack.error), 'full-track repeat boundary resumes without error');
    await page.evaluate(() => { SH.Settings.set('muted',true); });
    ok(await page.evaluate(() => SH.Soundtrack.players.every(p=>p.el.paused)), 'global mute includes music');
    await page.evaluate(() => { SH.Settings.set('muted',false); SH.Settings.set('musicVolume',0); }); await page.waitForTimeout(2000);
    ok(await page.evaluate(() => SH.Soundtrack.players.every(p=>p.el.volume===0)), 'zero-volume setting honored');
    ok(await page.evaluate(() => { try { SH.Archive.validate({ format:'smallhours-history', version:1, runs:[{}] }); return false; } catch(e) { return true; } }), 'invalid history backup rejected');
    ok(await page.evaluate(() => { const g=JSON.parse(JSON.stringify(SH.G)); g.ended=true; return !SH.Saves.restore(g); }), 'completed-save continuation rejected');
    assert.deepEqual(errors, [], 'uncaught browser errors'); console.log('PASS', ++count, 'no uncaught browser errors', url);
    await context.close();
  }
  try {
    const base = path.resolve(__dirname, '..');
    if (process.argv[2]) await test(process.argv[2]);
    else { await test('file://' + base + '/src/index.html'); await test('file://' + base + '/SmallHours.html', true); }
    console.log('ALL', count, 'CHECKS PASSED');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
