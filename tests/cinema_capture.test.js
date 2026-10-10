/* Deterministic browser integration fixtures exercise the real completed-action hooks. */
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/tmp/chromium',args:['--no-sandbox']});
 try{for(const file of ['src/index.html','SmallHours.html']){
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('file://'+path.resolve(file));await p.click('#newGameBtn');await p.fill('#seedIn','148318');await p.click('#startBtn');await p.waitForTimeout(200);await p.click('#modal .act');
 const result=await p.evaluate(()=>{
  SH.Settings.set('music',false); SH.Run.start('test',false);
  const clear=()=>{SH.Presentation.dismiss();SH.Presentation.queue=[];document.querySelector('#modal').classList.add('hidden');SH.Events.Q=[];};clear();
  const village=SH.Atlas.data().places.find(p=>p.tier==='village');SH.Atlas.arrive(village,{k:'bus',mins:10,e:1,cost:0});clear();
  const g=SH.G;g.party=[];g.rkids=[];g.loc=SH.Town.id(village.id,'edge');g.base={pid:village.id,type:'camp',shack:true,up:[],nights:0};
  const edge=SH.Memories.snapshot(), empty=SH.Cinema.render(SH.Memories.snapshot([],{base:true}));
  g.base.pid='other-town';const other=SH.Memories.snapshot([],{base:true});g.base.pid=village.id;
  g.t=Math.floor(g.t/1440)*1440+600;g.res=g.res||{};g.res[village.id]={log:20,branch:100,plank:100,rope:10,tin:10,straw:20,stone:100,nail:10};
  g.s.energy=100;g.s.health=100;g.s.full=100;g.s.warmth=100;g.heat=0;
  // Fix event randomness only; build/time/resource/effect/capture code all remain real.
  const chance=SH.K.chance;SH.K.chance=()=>false;
  SH.Shack.build(village,SH.Shack.PARTS[0]);const frame=g.v15.memories.find(m=>m.key==='shack:'+village.id+':sh_frame');clear();
  g.t=Math.floor(g.t/1440)*1440+21*60;SH.Bases.sleep(village);const baseNight=g.v15.memories.find(m=>m.key.startsWith('base-night:'));clear();
  g.room={pid:village.id,n:'Fixture Inn',rate:20,until:g.t+2880};g.roomEvt=null;
  g.t=Math.floor(g.t/1440)*1440+21*60;SH.Motels.roomMenu(village);document.querySelector('#modal .act').click();const motelNight=g.v15.memories.find(m=>m.key.startsWith('motel-night:'));clear();SH.K.chance=chance;
  const castBefore=g.v15.memories.length;
  SH.UI.dialog({title:'Explicit village scene',text:['A local person speaks in this scene.'],choices:[{t:'Okay'}],memory:{kind:'diner',location:{kind:'diner',name:'The diner',indoor:true},actors:[{id:'local:fixture',name:'Marcus',look:{skin:'#c88e65',hair:'#35271d',shirt:'#866053',style:'short',top:'flannel'}}]}});
  const explicit=g.v15.memories.at(-1);clear();
  // Import validation protects renderer props as well as archived fallback HTML.
  const bad={format:'smallhours-history',version:1,runs:[{id:'x',title:'x',html:'',scene:frame.scene,memories:[]}]};bad.runs[0].scene=JSON.parse(JSON.stringify(frame.scene));bad.runs[0].scene.set.upgrades={bad:true};let rejected=false;try{SH.Archive.validate(bad)}catch(e){rejected=true}
  const hostile=JSON.parse(JSON.stringify(frame.scene));hostile.people[0].look.shirt='red" onload="alert(1)';const safe=SH.Cinema.render(hostile);
  clear();const one=SH.Memories.record('queue-one','One','First'),two=SH.Memories.record('queue-two','Two','Second');SH.Presentation.offer(one);SH.Presentation.offer(two);const queued=SH.Presentation.queue.length;SH.epoch++;SH.Presentation.flush();const staleDropped=SH.Presentation.queue.length===0;
  return {queued,staleDropped,edge,other,emptyFrame:empty.includes('data-prop="sh_frame"'),frame,baseNight,motelNight,explicit,captured:explicit&&g.v15.memories.length>castBefore,rejected,safe:!safe.includes('onload=')};
 });
 assert.equal(result.edge.set.shack,false,'road edge is not automatically your base');assert.equal(result.other.set.shack,false,'base in a different town is not depicted');assert.equal(result.emptyFrame,false,'cleared spot has no completed frame');
 assert(result.frame && result.frame.scene.set.upgrades.includes('sh_frame'),'completed frame earns real construction scene');assert.equal(result.frame.scene.beat,'construction');assert.equal(result.frame.scene.set.upgrades.includes('sh_roof'),false);
 assert(result.baseNight,'actual Bases.sleep earns a night memory');assert.equal(result.baseNight.scene.beat,'sleep');assert.equal(result.baseNight.scene.place,'Your shack');
 assert(result.motelNight,'private motel sleep callback earns a night memory');assert.equal(result.motelNight.scene.set.indoor,true);assert.match(result.motelNight.scene.place,/Fixture Inn/);
 assert(result.captured);assert(result.explicit.scene.people.some(a=>a.id==='local:fixture'));assert(!result.explicit.scene.people.some(a=>a.id==='marcus'),'same name does not substitute canonical NPC');assert(result.rejected);assert(result.safe);
 assert.equal(result.queued,2,'multiple completed milestones keep their offers');assert(result.staleDropped,'restored worlds do not receive stale scenes');
 assert.deepEqual(errors,[]);console.log('PASS completed-action capture, partial/remote base fidelity, explicit local cast, safe props: '+file);await p.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
