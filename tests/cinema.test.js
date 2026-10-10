const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const b=await chromium.launch({executablePath:'/tmp/chromium',args:['--no-sandbox']});
 try {
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(process.argv[2] || 'src/index.html'));await p.waitForTimeout(200);
 await p.click('#newGameBtn');await p.click('#startBtn');await p.waitForTimeout(200);await p.click('#modal .act');
 const live=await p.evaluate(()=>{SH.Settings.set('music',false);['sam','jordan','nia'].forEach(id=>SH.Visuals.look(id));return JSON.stringify(SH.G)});
 // Isolated visual fixtures: not inserted into the player's earned history.
 await p.evaluate(()=>{const looks=['sam','jordan','nia'].map(id=>({id,name:id==='sam'?'Sam':SH.NPCS_META[id].n,look:JSON.parse(JSON.stringify(SH.Visuals.look(id)))}));window.fixture=(kind,beat,weather)=>({title:kind==='stop'?'A town neither of you knows':'The hours nobody sees',kind:beat,text:'A renderer test fixture. Not an earned gameplay memory.',scene:{loc:'fixture',place:kind==='stop'?'The roadside bus shelter':kind,town:'Birchbrook',date:'Mon, Oct 5',time:'7:20 PM',night:true,weather,set:{kind,indoor:['bedroom','library','school','diner','motel','barn','building'].includes(kind)},beat,people:looks}});SH.Presentation.open([fixture('stop','arrival','rain')],()=>{},true)});
 await p.waitForTimeout(700);await p.screenshot({path:'tests/shots/cinema-rain.png'});
 const animations=await p.evaluate(()=>document.querySelector('.cinema').getAnimations({subtree:true}).length);assert(animations>10);
 const svg=await p.locator('.cinema svg').innerHTML();assert(svg.includes('data-pose'));assert(svg.includes('TIMES'));assert(svg.includes('cin-ripple'));
 await p.click('#scenePause');const paused=await p.evaluate(()=>document.querySelector('.cinema').getAnimations({subtree:true}).map(a=>a.currentTime));await p.waitForTimeout(250);const after=await p.evaluate(()=>document.querySelector('.cinema').getAnimations({subtree:true}).map(a=>a.currentTime));assert.deepEqual(after,paused);
 const sameSVG=await p.locator('.cinema svg').innerHTML();assert.equal(svg,sameSVG,'pause does not regenerate SVG / IDs');
 await p.click('#scenePause');await p.click('#sceneMotion');assert(await p.evaluate(()=>document.querySelector('.cinema').getAnimations({subtree:true}).length===0));
 await p.click('#sceneMotion');await p.click('#sceneSkip');
 const liveAfter=await p.evaluate(()=>JSON.stringify(SH.G));assert.equal(live,liveAfter,'rendering fixture never mutates live story');
 for(const kind of ['bedroom','library','school','diner','motel','camp','barn','building','underpass','street']){await p.evaluate(k=>SH.Presentation.open([fixture(k,'still','clear')],()=>{},true),kind);await p.waitForTimeout(100);assert.equal(await p.locator('.cinema').getAttribute('data-scene-kind'),kind);if(['bedroom','diner','motel','camp','barn'].includes(kind))await p.screenshot({path:'tests/shots/cinema-'+kind+'.png'});await p.click('#sceneSkip')}
 await p.evaluate(()=>{const f=fixture('camp','construction','clear');f.scene.set.shack=true;f.scene.set.camp=true;f.scene.set.upgrades=['sh_frame','sh_walls','sh_roof','sh_bed','sh_fire'];SH.Presentation.open([f],()=>{},true)});await p.waitForTimeout(800);await p.screenshot({path:'tests/shots/cinema-shack.png'});await p.click('#sceneSkip');
 await p.evaluate(()=>SH.Presentation.open([fixture('bedroom','sleep','clear')],()=>{},true));await p.waitForTimeout(100);await p.screenshot({path:'tests/shots/cinema-sleep.png'});assert.equal(await p.locator('[data-actor="sam"]').getAttribute('data-pose'),'lie');await p.click('#sceneSkip');
 // A walk moves across the set, ends once, and does not become a treadmill.
 await p.evaluate(()=>SH.Presentation.open([fixture('street','arrival','clear')],()=>{},true));const at=await p.locator('[data-actor="sam"] .cin-crossing').evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(3500);const arrived=await p.locator('[data-actor="sam"] .cin-crossing').evaluate(e=>getComputedStyle(e).transform);assert.notEqual(at,arrived);assert.equal(await p.locator('[data-actor="sam"] .cin-crossing').evaluate(e=>getComputedStyle(e).animationIterationCount),'1');await p.click('#sceneSkip');
 // Several co-present friends: every face remains inside the scene and controls stay reachable.
 await p.evaluate(()=>{const f=fixture('camp','shared','clear');f.scene.people=f.scene.people.concat(['marco','dolores','wren','maya','lily'].map(id=>({id,name:id,look:SH.Visuals.look(id)})));SH.Presentation.open([f],()=>{},true)});await p.waitForTimeout(100);await p.screenshot({path:'tests/shots/cinema-crowded.png'});assert.equal(await p.locator('.cin-actor-placement').count(),8);assert(await p.locator('.cin-actor-placement').evaluateAll(es=>{const r=es[0].closest('svg').getBoundingClientRect();return es.every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom})}));await p.click('#sceneSkip');
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>SH.Presentation.open([fixture('library','conversation','rain')],()=>{},true));await p.screenshot({path:'tests/shots/cinema-mobile.png'});assert(await p.evaluate(()=>document.body.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('PASS: distinct scene sets, animated actor/environment layers, true pause/resume, reduced motion, read-only render, mobile bounds; no page errors.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
