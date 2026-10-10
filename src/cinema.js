/* Recorded-scene renderer. Pure snapshot -> SVG: never reads or changes live simulation. */
(function (SH) {
  const C = SH.Cinema = {}, esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let serial = 0;
  const rect = (x,y,w,h,c,r=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
  const path = (d,c,stroke='',width=1) => `<path d="${d}" fill="${c}" ${stroke ? `stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`;
  const line = (d,c,w=1) => path(d,'none',c,w);
  const text = (x,y,s,size=12,c='#d8c8a6') => `<text x="${x}" y="${y}" font-family="Georgia,serif" font-size="${size}" fill="${c}">${esc(s)}</text>`;
  const circle = (x,y,r,c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  function hash(s) { let n=2166136261; for (const ch of String(s)) n=Math.imul(n^ch.charCodeAt(0),16777619); return n>>>0; }
  const kinds=new Set(['bedroom','kitchen','home','library','school','diner','shelter','motel','interior','camp','stop','underpass','street','barn','building']);
  C.kind = s => {
    if (s.set && s.set.baseType==='barn') return 'barn';
    if (s.set && s.set.baseType==='building') return 'building';
    if (s.set && kinds.has(s.set.kind)) return s.set.kind;
    const l = (s.loc || '').toLowerCase();
    if (/^home$/.test(l)) return s.room === 'bedroom' ? 'bedroom' : s.room === 'kitchen' ? 'kitchen' : 'home';
    if (/shack|camp|woods|forest/.test(l)) return 'camp';
    if (/underpass/.test(l)) return 'underpass';
    if (/bus|stop|station|depot/.test(l)) return 'stop';
    if (/library/.test(l)) return 'library';
    if (/school/.test(l)) return 'school';
    if (/diner|cafe/.test(l)) return 'diner';
    if (/motel|shelter|harbor|grandma/.test(l)) return 'shelter';
    return s.set && s.set.indoor ? 'interior' : 'street';
  };
  function tree(x,y,scale,colour,i) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">${path('M-5 0L-3 -118H4L8 0Z','#352f27')}<g class="cin-sway" style="--origin:0px -90px;--delay:${-i}s">${path('M0 -215L-52 -110H-34L-68 -55H60L35 -110H48Z',colour)}${line('M0 -178L-22 -127M0 -134L24 -95','#8c9875',1)}</g></g>`;
  }
  function windowPane(x,y,w,h,id,night,rain) {
    return `<g>${rect(x-7,y-7,w+14,h+14,'#302f28',2)}${rect(x,y,w,h,`url(#${id}-sky)`)}${night ? circle(x+w*.72,y+24,10,'#d8d4b0') : ''}${path(`M${x} ${y+h}V${y+h-27}l${w/4} -21 ${w/3} 22 ${w*.42} -19V${y+h}Z`,'#303e39')}${rain ? `<g clip-path="url(#${id}-window)">${Array.from({length:13},(_,i)=>line(`M${x+8+i*14} ${y+9}l-6 28`,'#a7b3ad',1)).join('')}</g>`:''}${line(`M${x+w/2} ${y}V${y+h}M${x} ${y+h/2}H${x+w}`,'#79664d',5)}${line(`M${x+9} ${y+8}v${h-16}`,'#d5bd85',2)}${rect(x-12,y+h,w+24,9,'#9c815c',2)}</g>`;
  }
  function shelf(x,y,w,h,seed) {
    let books=''; const cols=['#657c73','#9e6952','#b99e63','#786d7d','#a5a78d','#486270'];
    for(let row=0;row<3;row++) { for(let j=0;j<12;j++) { const bh=25+(seed+j*7+row*11)%26, bx=x+12+j*(w-24)/12; books+=rect(bx,y+15+row*(h/3)+50-bh,9,bh,cols[(j+row)%6],1)+line(`M${bx+2} ${y+61+row*(h/3)}h5`,'#dcc8a0',1); } books+=rect(x,y+65+row*(h/3),w,6,'#9a7b53'); }
    return rect(x-6,y-6,w+12,h+16,'#302d24',2)+rect(x,y,w,h,'#49412d')+books;
  }
  function lamp(x,y,id) { return `<g>${path(`M${x} ${y}v-74`,'none','#9a8464',4)}${path(`M${x-24} ${y-72}l10 -33h28l10 33Z`,'#d4b982')}${circle(x,y-69,5,'#ffde9e')}<ellipse class="cin-lamp" cx="${x}" cy="${y-52}" rx="95" ry="82" fill="url(#${id}-light)"/></g>`; }
  function interior(s,id,kind,seed) {
    const rain=/rain|storm|drizzle/.test(s.weather), night=s.night;
    if(kind==='barn'||kind==='building') return baseInterior(s,id,kind);
    let a=rect(0,0,960,430,'#343b36')+rect(0,282,960,148,'#473a2d');
    a+=Array.from({length:14},(_,i)=>line(`M${i*87-130} 430L${i*61+30} 282`,'#292b24',1)).join('');
    a+=line('M0 320H960M0 364H960M0 416H960','#6b5941',1)+rect(0,272,960,10,'#918267');
    a+=windowPane(62,55,183,160,id,night,rain);
    a+=`<g class="cin-curtain" style="--origin:50px 40px">${path('M43 39H80L91 224 51 238Z','#777b62')}${line('M60 51L70 211M72 53L79 216','#abb196',2)}</g>`;
    a+=path('M225 40H265L265 232 232 221Z','#777b62');
    a+=rect(725,30,144,245,'#222b27')+rect(734,40,126,231,'#5c5342')+rect(748,54,96,99,'#68614d')+rect(748,171,96,78,'#4b473a')+circle(836,163,4,'#ccae73');
    if(kind==='stop') {
      a+=rect(303,42,390,177,'#272e28')+text(325,72,'DEPARTURES',19)+[0,1,2,3].map(i=>text(325,103+i*26,'BAY '+(i+1)+'       SEE POSTED TIMETABLE',12,'#a9bba0')).join('');
      a+=rect(266,274,247,15,'#8b8060',3)+rect(278,289,8,61,'#464c3b')+rect(493,289,8,61,'#464c3b')+rect(561,275,134,15,'#8b8060',3);
    } else if(kind==='school') {
      a+=rect(298,46,392,178,'#213e33')+line('M320 80h90m-90 28h167m-167 28h112','#c4c5a5',2)+text(323,195,'MONDAY',20)+rect(289,224,411,8,'#967e56');
      a+=rect(138,280,184,15,'#a7895e',3)+rect(152,294,10,94,'#4b4a36')+rect(302,294,10,94,'#4b4a36')+rect(399,280,184,15,'#a7895e',3);
    } else if(kind==='library') {
      a+=shelf(310,35,183,221,seed)+shelf(510,35,181,221,seed+9);
      a+=text(330,21,'PLEASE KEEP IT QUIET',13);
      a+=rect(51,282,236,15,'#ae8a5a',3)+rect(65,295,10,93,'#4d4031')+rect(264,295,10,93,'#4d4031');
      a+=lamp(180,278,id)+rect(94,269,44,9,'#727d66')+rect(96,261,40,8,'#ac7956');
    } else if(kind==='diner'||kind==='kitchen') {
      a+=rect(301,88,391,81,'#c0b89b')+Array.from({length:12},(_,i)=>line(`M${302+i*35} 88v81`,'#848774')).join('');
      a+=rect(298,173,400,15,'#b6b9a1',3)+rect(306,188,384,79,'#696753')+line('M430 190v72M560 190v72','#313c33',3);
      a+=rect(353,118,68,56,'#353f38',5)+rect(362,123,49,31,'#9b9580',2)+circle(401,160,4,'#d9ba7d');
      a+=rect(561,136,17,37,'#d3c6a5',3)+rect(583,141,18,32,'#aa8068',3);
      a+=text(477,53,kind==='diner'?'BREAKFAST ALL DAY':'HOME',18);
      a+=rect(40,283,224,63,'#8a5144',12)+rect(39,345,227,16,'#563f33',3)+rect(55,365,9,27,'#2c3027');
      a+=path('M267 303H437L459 328H253Z','#b1a78a')+rect(340,328,9,63,'#5b6457');
      a+=circle(330,309,13,'#dad3b9')+rect(326,293,13,18,'#eee1c1',3)+`<path class="cin-steam" d="M333 288q-7 -9 0 -18t0 -17" fill="none" stroke="#e5dabd" opacity=".5" stroke-width="2"/>`;
    } else if(kind==='motel') {
      a+=rect(40,302,269,65,'#615b49',5)+path('M40 282H284L309 310H40Z','#b7af98')+path('M115 282H284L309 310V348H116Z','#7d7754')+rect(48,285,65,19,'#d5cdb0',8);
      a+=rect(503,303,209,61,'#615b49',5)+path('M503 281H688L712 311H503Z','#b7af98')+path('M550 281H688L712 311V351H550Z','#7d7754')+rect(509,286,41,18,'#d5cdb0',8);
      a+=rect(329,233,125,61,'#6f5c43')+rect(322,224,139,10,'#aa8e5d')+rect(347,128,90,81,'#262f28',5)+rect(355,137,73,54,'#52645b',3)+rect(376,209,29,15,'#2c372c');
      a+=rect(552,41,117,89,'#b9a17c')+rect(559,48,103,75,'#6a8274')+path('M580 97q-12 -18 16 -21q2 -18 14 -12l4 9 15 2 -13 6q-3 22 -36 16Z','#d6c397')+lamp(474,253,id);
    } else if(kind==='bedroom'||kind==='shelter') {
      a+=rect(45,306,271,57,'#6b6850',5)+path('M40 286H287L319 313H41Z','#b0b1a1')+path('M116 286H287L319 313V351H121Z','#687e7a')+line('M138 290l5 49M163 290l6 51M190 290l9 53','#879a8f',2)+rect(56,289,64,18,'#d4ccaf',8);
      a+=rect(37,270,12,118,'#a18a62',3)+rect(303,322,11,66,'#786343',3)+shelf(519,106,156,151,seed);
      a+=rect(324,254,120,12,'#96764d')+rect(331,266,8,93,'#5b4e36')+rect(421,266,8,93,'#5b4e36')+lamp(393,251,id);
      a+=rect(330,218,33,31,'#a88b61',2)+text(337,240,'7:00',9,'#302c24');
      a+=rect(330,41,123,115,'#c2ad80',2)+rect(337,48,109,101,'#283b43')+circle(390,90,22,'#c5b57d')+path('M341 140l31 -46 32 35 18 -17 19 28Z','#68887b');
    } else {
      a+=rect(300,224,289,110,'#737b60',16)+rect(319,278,250,28,'#929675',8)+line('M437 235v40','#4c5844',2)+rect(302,274,30,64,'#58694f',9)+rect(559,274,30,64,'#58694f',9)+lamp(650,280,id);
      a+=rect(319,349,221,12,'#8d754f',4)+rect(333,360,8,37,'#453d2c')+rect(519,360,8,37,'#453d2c')+rect(361,340,52,8,'#a78e6a');
    }
    // Dust in lamplight is environmental, not a fabricated gameplay event.
    a+=`<g class="cin-dust">${Array.from({length:18},(_,i)=>circle(60+(seed+i*97)%820,45+(i*53)%230,1,'#d9c49a')).join('')}</g>`;
    return a;
  }
  function baseInterior(s,id,kind) {
    const up=s.set.upgrades||[], barn=kind==='barn';
    let a=rect(0,0,960,430,barn?'#3c3528':'#39403a')+rect(0,297,960,133,barn?'#67543b':'#5b5b4e');
    if(barn) {
      a+=Array.from({length:22},(_,i)=>rect(i*45,0,43,297,i%2?'#655138':'#594a34')).join('');
      a+=line('M0 90H960M0 287H960M62 0v297M687 0v297','#382d22',13)+line('M67 96L283 282M687 96L897 282','#8e7550',8);
      a+=rect(314,44,290,251,'#292d24')+rect(320,51,278,242,'#3e4231')+line('M459 51v242','#777054',5)+rect(122,229,115,62,'#938357',8)+line('M137 239l73 41M217 240l-65 39','#c1ae73',2);
    } else {
      a+=rect(40,44,229,172,'#222f2b')+rect(49,54,211,150,'#6b786b');
      a+=line('M42 63L262 151M42 108L262 196M46 157l169 -111','#736344',14)+rect(348,212,295,70,'#6b7469',8);
      a+=Array.from({length:5},(_,i)=>circle(384+i*54,242,21,'#303d36')+circle(384+i*54,242,14,'#526058')).join('');
      a+=rect(751,28,142,269,'#29352e')+rect(760,39,126,254,'#625d4a')+circle(867,173,4,'#aaa071');
      a+=line('M318 37l-19 53 9 55M670 155l-24 48 10 66','#79816d',2);
    }
    if(up.includes('bed')||up.includes('sh_bed')) a+=`<g data-prop="bed">${path('M171 333L367 329 398 359H166Z','#96977a')}${rect(169,358,227,17,'#5c776a',7)}</g>`;
    if(up.includes('light')) a+=`<g data-prop="light">${lamp(658,278,id)}</g>`;
    if(up.includes('cover')) a+=rect(45,51,214,153,'#746a4e');
    if(up.includes('power')) a+=`<g data-prop="power">${rect(606,307,68,17,'#405c64')}${line('M617 307v17M632 307v17M647 307v17','#9cab95',1)}</g>`;
    return a;
  }
  function exterior(s,id,kind,seed) {
    const night=s.night;
    let a=rect(0,0,960,430,`url(#${id}-sky)`);
    if(night) a+=Array.from({length:35},(_,i)=>circle((seed+i*83)%960,18+(i*17)%150,.6+(i%3)*.35,'#d0d4bd')).join('')+circle(734,64,23,'#d5d0ae')+circle(744,57,21,'#263b3c');
    a+=`<g class="cin-cloud">${path('M-140 95q32 -38 75 -15q25 -40 78 -5q60 -24 114 26Z',night?'#354744':'#a9b7a0')}${path('M440 56q29 -36 66 -14q55 -37 97 10Z',night?'#354744':'#a9b7a0')}</g>`;
    a+=path('M0 208L100 143 231 202 322 148 431 196 599 125 760 186 863 134 960 197V430H0Z','#344b40');
    a+=path('M0 252Q219 208 382 252T960 238V430H0Z','#475a43');
    const biome=s.set && s.set.biome || '';
    if(!/farmland|prairie/.test(biome) || kind==='camp') a+=Array.from({length:9},(_,i)=>tree(i*139-60,285,.6+(i%3)*.12,'#263e32',i)).join('');
    else a+=path('M0 243Q400 205 960 248V316H0Z','#7b7950')+Array.from({length:9},(_,i)=>line(`M${i*110} 300l150 -57`,'#aaa16a',2)).join('')+line('M0 280H960','#b2a079',3)+Array.from({length:13},(_,i)=>line(`M${i*81} 265v34`,'#817052',4)).join('');
    a+=path('M0 338Q244 285 960 312V430H0Z','#534c39')+path('M0 393Q369 332 960 355V430H0Z','#69624a');
    if(kind==='camp') {
      if(s.set && s.set.shack) {
        const up=s.set.upgrades||[], roof=up.some(x=>/roof|tin/.test(x)), walls=up.some(x=>/wall/.test(x));
        if(up.includes('sh_frame')) a+=`<g data-prop="sh_frame">${line('M220 309L349 94 491 309M253 254H457M271 219H432','#9c7f51',10)}</g>`;
        if(walls) a+=rect(225,149,265,162,'#736044')+Array.from({length:9},(_,i)=>line(`M227 ${155+i*17}h261`,'#423f2e',2)).join('');
        if(roof) a+=`<g data-prop="sh_roof">${path('M184 155L349 72 526 155Z','#797c67')}${line('M190 155L349 77 520 155','#adb098',2)}</g>`;
        if(walls) a+=rect(330,200,66,111,'#252f25');
        if(up.includes('sh_door')) a+=rect(330,200,66,111,'#746040')+line('M347 206v97M365 206v97M383 206v97','#443c2b',2)+circle(384,258,3,'#b7a877');
        if(up.includes('sh_bed')) a+=path('M238 310l61 -8 45 11 -87 9Z','#a49665');
        if(up.includes('sh_footing')) a+=Array.from({length:12},(_,i)=>rect(222+i*23,310,22,12,'#898a72',5)).join('');
        if(up.includes('sh_fire')) a+=Array.from({length:9},(_,i)=>circle(545+Math.cos(i*.7)*34,338+Math.sin(i*.7)*9,8,'#999884')).join('');
      } else if(s.set && s.set.camp && (s.set.upgrades||[]).includes('tent')) a+=path('M175 316L306 147 445 316Z','#897a4e')+path('M306 147L445 316H583L437 165Z','#61694b')+path('M226 316L305 208 371 316Z','#293629')+line('M303 155L110 339M438 167L617 336','#b5ae88',2);
      if(s.set && (s.set.upgrades||[]).includes('tarp')) a+=`<g data-prop="tarp">${path('M120 223L295 196 391 242 221 268Z','#818866')}${line('M121 223L98 324M391 242L405 324','#b6ad83',2)}</g>`;
      a+=rect(84,340,140,21,'#55432d',10)+line('M96 344h115M110 351h87','#977348',2)+tree(835,394,1.45,'#24382c',3);
      a+=Array.from({length:15},(_,i)=>path(`M${i*66} 417l-4 -15 9 8 4 -13 5 20Z`,'#34412b')).join('');
    } else if(kind==='stop') {
      a+=rect(227,118,305,194,'#313f38')+rect(237,128,282,165,'#697d6d')+path('M240 130L520 194V243L240 178Z','#829182')+line('M327 130v163M421 130v163','#30473d',6);
      a+=path('M204 116L234 94H544V120Z','#a59b7b')+rect(226,116,9,207,'#c5b997')+rect(524,116,9,207,'#c5b997');
      a+=rect(260,268,228,9,'#9e8254',2)+rect(268,280,8,39,'#403f30')+rect(472,280,8,39,'#403f30')+rect(561,89,5,243,'#5d6553');
      a+=rect(543,87,43,46,'#ceba83',5)+rect(551,99,27,17,'#43564a',3)+circle(556,121,3,'#43564a')+circle(577,121,3,'#43564a');
      a+=rect(449,149,53,75,'#d0c7a9')+text(455,166,'TIMES',9,'#3b493a')+Array.from({length:6},(_,i)=>line(`M455 ${176+i*6}h37`,'#767760')).join('');
    } else if(kind==='underpass') {
      a+=path('M0 45H960V113H0Z','#535f56')+rect(60,111,112,222,'#6a7161')+rect(760,111,114,222,'#626e5f')+line('M0 78H960M97 127v182M795 127v182','#333e34',3)+path('M182 335Q427 259 753 333V362H182Z','#263b32');
      a+=text(90,240,'STAY',19,'#a69d75')+text(89,263,'GOLD',19,'#a69d75');
    } else if(s.set && s.set.locationKind==='edge') {
      a+=path('M0 364Q317 295 960 337V392Q378 344 0 411Z','#888276')+line('M45 381Q365 320 898 355','#b9af85',2);
      a+=rect(793,213,5,132,'#615a42')+rect(748,208,100,44,'#78876a',3)+text(761,236,'TOWN LIMIT',12);
    } else {
      const cols=['#736d54','#7e725a','#566e63'];
      for(let i=0;i<3;i++) { const x=95+i*240; a+=rect(x,110+i*15,208,203-i*15,cols[i])+path(`M${x-12} ${110+i*15}l116 -64 116 64Z`,'#37483b');
        for(let j=0;j<3;j++) a+=rect(x+20+j*60,143+i*15,32,51,night?'#cfb77c':'#9aa996')+line(`M${x+36+j*60} ${143+i*15}v51`,'#4e5d49',3);
        a+=rect(x+83,228,46,85,'#354539')+circle(x+121,270,3,'#c5ad78'); }
      a+=rect(0,316,960,8,'#96917a')+rect(0,325,960,90,'#3e4540')+line('M0 378h125m68 0h125m68 0h125m68 0h125m68 0h125','#b4b096',3);
      a+=lamp(827,303,id);
    }
    if(/rain|storm|drizzle/.test(s.weather)) a+=`<g opacity=".38">${[125,457,749].map((x,i)=>`<ellipse cx="${x}" cy="${367+i*14}" rx="${55+i*9}" ry="5" fill="#9dab99"/><ellipse class="cin-ripple" style="--delay:${-i}s;transform-origin:${x}px ${367+i*14}px" cx="${x}" cy="${367+i*14}" rx="30" ry="3" fill="none" stroke="#cad0b5"/>`).join('')}</g>`;
    return a;
  }
  // Blocking is set-specific, not a centred cast lineup. Coordinates are feet/seat anchors.
  function blocking(kind,beat,i,n) {
    const slots = {
      stop: [[305,319,'sit',1],[458,319,'stand',-1],[383,319,'sit',-1],[650,371,'stand',-1]],
      bedroom: [[182,365,'sit',1],[406,361,'stand',-1],[568,362,'stand',-1]],
      motel: [[174,365,'sit',1],[605,365,'sit',-1],[402,369,'stand',-1]],
      shelter: [[174,365,'sit',1],[400,363,'sit',-1],[625,370,'stand',-1]],
      diner: [[185,386,'sit',1],[478,386,'sit',-1],[654,302,'stand',-1]],
      kitchen: [[191,386,'sit',1],[479,386,'sit',-1],[600,310,'stand',-1]],
      library: [[170,378,'sit',1],[350,378,'sit',-1],[628,354,'stand',-1]],
      school: [[230,375,'sit',1],[461,375,'sit',-1],[679,334,'stand',-1]],
      home: [[365,363,'sit',1],[523,363,'sit',-1],[676,372,'stand',-1]],
      camp: [[170,370,'sit',1],[626,367,'crouch',-1],[735,379,'sit',-1]],
      underpass: [[290,365,'sit',1],[547,372,'crouch',-1],[687,358,'stand',-1]],
      street: [[350,387,'stand',1],[587,379,'stand',-1],[734,390,'stand',-1]],
      interior: [[365,363,'sit',1],[523,363,'sit',-1],[676,372,'stand',-1]]
    };
    if(n>4) {
      const crowd=[[135,376],[266,387],[402,374],[540,393],[685,382],[813,397],[335,338],[624,337],[749,343],[186,338],[478,342],[865,343],[104,341],[564,344],[696,340],[295,347]];
      const slot=crowd[i%crowd.length];return {x:slot[0],y:slot[1],pose:kind==='camp' && beat==='shared' ? (i%3===1?'crouch':i%3===0?'sit':'stand') : 'stand',face:slot[0]<480?1:-1,travel:beat==='arrival'||beat==='departure',extra:i>=6?1:0};
    }
    const list=slots[kind]||slots.street, slot=list[i%list.length];
    const extra=Math.floor(i/list.length), x=slot[0]+extra*45, y=slot[1]-extra*47;
    const travel=(beat==='arrival'||beat==='departure');
    return {x,y,pose:travel?'stand':slot[2],face:slot[3],travel:travel && !['stop','bedroom','shelter','motel'].includes(kind),extra};
  }
  function person(a,i,n,kind,beat,action) {
    const l=a.look||{}, skin=l.skin||'#bf9270', shirt=l.shirt||'#787b61', hair=l.hair||'#423328';
    const b=blocking(['barn','building'].includes(kind)?'camp':kind,beat,i,n), moving=b.travel && beat!=='sleep' && beat!=='construction', sitting=(b.pose==='sit'||b.pose==='crouch') && beat!=='sleep' && beat!=='construction', {x,y}=b, talking=beat==='conversation'||beat==='joined', cold=beat==='shelter', crouch=b.pose==='crouch', sleeping=beat==='sleep', inspecting=beat==='construction';
    const villageKid=String(a.id).startsWith('village-kid:');
    if(villageKid && action==='bike-kid') { b.x=675;b.y=369;b.pose='sit'; }
    if(villageKid && action==='grass-talk') { b.x=661;b.y=379;b.pose='lie'; }
    if(sleeping) {b.pose='lie';b.travel=false;}
    if(inspecting) {b.pose='stand';b.travel=false;}
    const scale=(l.young===2?.76:l.young?.94:1.05)*(b.extra?.83:1), shoe=l.shoe||'#a5a28a';
    const legs=villageKid && action==='bike-kid'?'M-10 -55L-24 -23 0 -6M10 -55L30 -28 28 -2':crouch && !inspecting?'M-10 -55L-31 -40 -19 -4M10 -55L30 -32 23 -4':sitting?'M-10 -55L15 -53 23 -4M10 -55L34 -51 40 -4':'M-9 -54L-10 -27 -13 -3M9 -54L10 -27 14 -3';
    const armL=cold?'M-20 -105L-25 -78 12 -87':sitting?'M-20 -105L-27 -78 7 -66':'M-20 -105L-30 -75 -25 -55';
    const armR=talking?'M20 -105L32 -85 50 -98':sitting?'M20 -105L31 -82 24 -66':'M20 -105L29 -77 24 -59';
    const handL=cold?[12,-87]:sitting?[7,-66]:[-25,-53], handR=talking?[50,-98]:sitting?[24,-66]:[24,-57];
    const anchor=sleeping ? [190+i*215,(kind==='camp'||kind==='underpass'||kind==='street'?394:355)+i%2*34] : [b.x,b.y];
    const poseTransform=sleeping || (villageKid && action==='grass-talk')?'translate(0 10) rotate(-88 0 -75) scale(.88)': '';
    return `<g class="cin-actor-placement" data-pose="${b.pose}" data-actor="${esc(a.id)}" transform="translate(${anchor[0]} ${anchor[1]}) scale(${scale})"><g transform="${poseTransform}"><g class="${moving||beat==='arrival'||beat==='departure'?'cin-crossing':'cin-settle'}" style="--entry:${beat==='departure'?'-110px':'-65px'};--delay:${i*.15}s"><title>${esc(a.name)}</title><ellipse cx="0" cy="3" rx="33" ry="7" fill="#111b16" opacity=".45"/><g class="${moving?'cin-walk':'cin-breathe'}" style="--delay:${-i*.8}s">${moving ? `<g class="cin-leg-front" style="--origin:-9px -54px">${line('M-9 -54L-10 -27 -13 -3',l.legs||'#3d4745',13)+line('M-19 -2h15',shoe,6)}</g><g class="cin-leg-back" style="--origin:9px -54px">${line('M9 -54L10 -27 14 -3',l.legs||'#3d4745',13)+line('M9 -2h15',shoe,6)}</g>` : line(legs,l.legs||'#3d4745',13)}${moving?'':line(sitting?'M17 -2h15M34 -2h16':'M-19 -2h15M9 -2h15',shoe,6)}${moving?rect(-30,-110,24,48,'#625139',8)+line('M-23 -104v34','#b39b6a',2):''}${path('M-13 -117Q-26 -115 -25 -94L-22 -54Q0 -47 23 -54L24 -97Q23 -113 12 -117Z',shirt)}<g class="${moving?'cin-arm':''}" style="--origin:-20px -105px">${line(armL,shirt,11)}${circle(...handL,5,l.gloves||skin)}</g><g class="${talking?'cin-gesture':inspecting?'cin-inspect':''}" style="--origin:20px -105px;--delay:${-i*2}s">${line(armR,shirt,11)}${circle(...handR,5,l.gloves||skin)}</g>${l.top==='flannel'?line('M-19 -104h39M-20 -91h42M-20 -78h42M-20 -65h42M-11 -109v54M10 -109v54','#a79b7b',1):''}${l.top==='scrubs'?path('M-10 -116L0 -105 10 -116','none','#b9cdc0',2)+rect(8,-94,11,12,'#849d91'):''}${l.top==='shawl'?path('M-23 -112L2 -96 24 -112 -2 -65Z','#a69c89'):''}${l.top==='cardigan'?line('M0 -109v53','#e1c39a',2)+[-93,-80,-67].map(y=>circle(0,y,1.5,'#d6bc85')).join(''):''}${l.top==='uniform'?path('M-17 -111l10 9 7 -7 7 7 12 -9Z','#dad1b4')+rect(7,-94,9,9,'#b8a068',2):''}${l.lanyard?line('M-10 -115L0 -78 10 -115','#babc9c',2)+rect(-6,-80,12,15,'#d1bd88',1):''}${l.top==='hoodie'||l.top==='hoodup'?line('M-14 -114Q0 -98 14 -114M-6 -105v20M6 -105v20','#c1bca1',2)+path('M-12 -69H13L9 -59H-9Z','none','#c3c3a0',1):line('M0 -111v56','#b6b8a0',2)}${rect(-6,-125,12,14,skin,3)}<g class="cin-head" style="--delay:${-i*.8}s">${/pony|bob|curly|bun|pigtails/.test(l.style)?path('M-22 -138Q-28 -174 0 -172Q28 -173 23 -131L26 -111 -17 -115Z',hair):''}${circle(-21,-143,5,skin)+circle(21,-143,5,skin)}<ellipse cy="-145" rx="21" ry="26" fill="${skin}"/>${l.style==='none'?'':l.style==='buzz'?path('M-21 -155Q-18 -173 0 -173Q19 -173 21 -155L15 -164 -15 -164Z',hair):l.style==='tuft'?path('M-22 -151L-12 -165 -3 -164 4 -183 14 -167 23 -153Z',hair):path('M-22 -150Q-23 -177 0 -174Q24 -175 23 -151L15 -158 7 -159 2 -165 -7 -158 -15 -161Z',hair)}${l.style==='beehive'?`<ellipse cx="0" cy="-177" rx="20" ry="16" fill="${hair}"/>`:''}${/curly/.test(l.style)?[-17,-7,5,17].map((x,j)=>circle(x,-169+j%2*4,8,hair)).join(''):''}${/bun|pony/.test(l.style)?circle(-22,-162,9,hair):''}${/pigtails/.test(l.style)?circle(-26,-140,9,hair)+circle(26,-140,9,hair):''}${line(cold?'M-12 -152l7 -3M5 -155l7 3':'M-12 -152l7 -1M5 -153l7 1',hair,1.8)}<g class="cin-blink" style="--delay:${-i*.7}s;transform-origin:0px -146px">${sleeping?line('M-11 -146h6M5 -146h6','#252b23',1.5):circle(-8+b.face*1.2,-146,1.9,'#252b23')+circle(8+b.face*1.2,-146,1.9,'#252b23')}</g>${path('M0 -143l-2 6 4 1','none','#876a50',1)}${line(talking?'M-5 -129q5 5 10 -1':cold?'M-5 -128q5 -2 10 0':'M-5 -128q5 2 10 -1','#714e3e',1.5)}${l.bindi?circle(0,-156,1.7,'#9c4742'):''}${l.beard?path('M-20 -136Q0 -118 20 -136L15 -124 0 -118 -15 -124Z',hair):''}${l.wrinkles?line('M-16 -139l4 2M13 -137l4 -2M-7 -122h12','#997254',.8):''}${l.freckles?[-12,-8,8,12].map(x=>circle(x,-136,.7,'#835e42')).join(''):''}${l.glasses?`<g stroke="${esc(l.glasses)}" fill="none" stroke-width="1.7"><rect x="-17" y="-151" width="14" height="11" rx="4"/><rect x="3" y="-151" width="14" height="11" rx="4"/><path d="M-3 -147h6"/></g>`:''}${l.hat?path('M-23 -157Q-23 -183 0 -183Q23 -182 23 -157Z',l.hatc||shirt)+rect(-24,-162,l.hat==='cap'?57:48,8,l.hatc||shirt,3):''}</g></g></g></g></g>`;
  }
  C.render = function (s,card={}) {
    if(!s) return '<div class="memory-empty">This older record has no scene. Nothing has been invented to fill it.</div>';
    s=Object.assign({},s,{set:s.set&&typeof s.set==='object'?Object.assign({},s.set,{upgrades:Array.isArray(s.set.upgrades)?s.set.upgrades.filter(x=>typeof x==='string').slice(0,40):[]}):null, people:Array.isArray(s.people)?s.people.slice(0,16).filter(a=>a&&a.look).map(a=>{const l={skin:'#bf9270',hair:'#423328',shirt:'#787b61',style:'short',top:'tee'};Object.entries(a.look).forEach(([k,v])=>{if(['skin','hair','shirt','legs','shoe','hatc','glasses','gloves'].includes(k)){if(/^#[0-9a-f]{3,8}$/i.test(v))l[k]=v;}else if(['style','top','hat'].includes(k)){if(/^[a-z0-9_-]{1,24}$/i.test(v))l[k]=v;}else if(['young','freckles','bindi','beard','wrinkles','lanyard'].includes(k) && (typeof v==='boolean' || (typeof v==='number' && Number.isFinite(v) && Math.abs(v)<=10)))l[k]=v;});return Object.assign({},a,{look:l});}):[]});
    const id='cin'+(++serial), seed=hash(s.loc+':'+s.date), kind=C.kind(s), indoor=s.set && typeof s.set.indoor==='boolean'?s.set.indoor:['bedroom','kitchen','home','library','school','diner','shelter','motel','interior','barn','building'].includes(kind), weather=s.weather||'clear';
    const beat=s.beat||card.kind||(/leaving/i.test(card.title||'')?'departure':/quiet/i.test(card.title||'')?'shared':'still');
    const people=s.people||[], sky=s.night?['#142b33','#556958']:['#6e8e87','#b8bba0'];
    let content=indoor?interior(s,id,kind,seed):exterior(s,id,kind,seed);
    if(['shared','conversation','still','shelter'].includes(beat) && kind==='underpass') content+=path('M214 334H352L381 353H202Z','#7b7762')+rect(218,352,154,14,'#555b48',7);
    if(kind==='camp' && people.length>2) content+=rect(677,346,140,21,'#55432d',10);
    if(['library','school'].includes(kind)) content+=[140,321].map(x=>rect(x,318,55,12,'#756b4c',3)+rect(x+5,330,6,48,'#4b4935')+rect(x+42,330,6,48,'#4b4935')).join('');
    const cast=people.slice().sort((a,b)=>(a.id==='sam'?-2:a.companion?1:0)-(b.id==='sam'?-2:b.companion?1:0));
    if(s.action==='bike-kid') content+=`<g data-prop="bicycle">${[634,723].map(x=>`<circle cx="${x}" cy="369" r="27" fill="none" stroke="#292e27" stroke-width="5"/><circle cx="${x}" cy="369" r="23" fill="none" stroke="#b0ae8a" stroke-width="1"/>`).join('')}${line('M634 369L659 327 688 369H634L698 326 723 369M650 327h20M695 326l-5 -18h16','#a29357',4)}</g>`;
    content+=cast.map((a,i)=>({a,i,y:blocking(kind,beat,i,cast.length).y})).sort((a,b)=>a.y-b.y).map(({a,i})=>person(a,i,people.length,kind,beat==='sleep' && a.id!=='sam'?'shelter':beat,s.action)).join('');
    if(beat==='sleep') {
      const up=s.set && s.set.upgrades || [];
      if(['bedroom','shelter','motel'].includes(kind) || up.includes('bed') || up.includes('sh_bed')) content+=`<g data-prop="bedding">${path('M139 280Q186 278 260 287L270 314H142Z','#697e72')}${line('M151 285l4 23M176 285l4 24M204 289l5 21','#9ea98a',2)}</g>`;
    }
    if(s.action==='dog-returned') content+=`<g data-prop="returned-dog" transform="translate(510 367)">${path('M-49 -16Q-57 -42 -32 -45L25 -40 46 -24 39 -8H-36Z','#b19d68')}${line('M-31 -14l-5 20M22 -12l7 17','#ae9962',10)}${circle(42,-36,18,'#c3ae77')}${path('M34 -51q-18 -5 -13 23l14 2Z','#867449')}${circle(49,-39,2,'#292e27')}${circle(59,-31,4,'#3c3627')}${line('M-45 -30q-19 -4 -20 -24','#b19d68',7)}</g>`;
    // Foreground furniture occludes knees naturally, rather than placing figures on top of it.
    if(kind==='diner'||kind==='kitchen') content+=path('M259 304H447L464 330H250Z','#b1a78a')+rect(340,330,9,63,'#5b6457')+circle(330,310,13,'#dad3b9')+rect(326,291,13,19,'#eee1c1',3)+`<path class="cin-steam" d="M333 286q-7 -9 0 -18t0 -17" fill="none" stroke="#e5dabd" opacity=".5" stroke-width="2"/>`;
    if(kind==='library') content+=rect(52,282,234,14,'#ae8a5a',3)+rect(65,296,10,92,'#4d4031')+rect(264,296,10,92,'#4d4031')+path('M96 280l38 -8 37 8v5l-38 -6 -37 6Z','#cfc4a1');
    if(!indoor && /rain|storm|drizzle|snow/.test(weather)) {
      const snow=weather==='snow'; content+=`<g class="cin-weather ${snow?'snow':'rain'}">${Array.from({length:snow?50:95},(_,i)=>snow?circle((seed+i*97)%1060-50,(i*83)%550-100,1.2+i%3*.5,'#d6dfcf'):line(`M${(seed+i*67)%1060-50} ${(i*53)%530-90}l-9 27`,'#bbd0bc',1)).join('')}</g>`;
    }
    content+=rect(0,0,960,430,`url(#${id}-vignette)`)+rect(0,0,960,430,`url(#${id}-grain)`);
    return `<div class="recorded-scene cinema" data-scene-kind="${esc(kind)}" data-scene-beat="${esc(beat)}"><svg viewBox="0 0 960 430" role="img" aria-label="${esc(s.place)}. ${esc(weather)}. ${esc(people.map(a=>a.name).join(', '))}."><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><radialGradient id="${id}-light"><stop stop-color="#ffdb88" stop-opacity=".38"/><stop offset="1" stop-color="#ffdb88" stop-opacity="0"/></radialGradient><radialGradient id="${id}-vignette"><stop offset=".4" stop-color="#081510" stop-opacity="0"/><stop offset="1" stop-color="#081510" stop-opacity=".6"/></radialGradient><pattern id="${id}-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="3" r=".6" fill="#d6c29a" opacity=".06"/></pattern><clipPath id="${id}-window"><rect x="62" y="55" width="183" height="160"/></clipPath></defs>${content}</svg><div class="scene-caption"><span>${esc(s.place)}${s.town && s.town!==s.place?' · '+esc(s.town):''}</span><span>${esc(s.date)} · ${esc(s.time)} · ${esc(weather)}</span></div></div><div class="memory-cast">${people.map(a=>`<span>${SH.Portrait.svg(a.id,{look:a.look,mood:'neutral'})}<b>${esc(a.name)}</b></span>`).join('')}</div>`;
  };
  C.sync = function () {
    const e=document.querySelector('#presentation'); if(!e)return;
    const paused=SH.Presentation.paused||document.hidden;
    const animations=e.querySelector('.cinema')?.getAnimations({subtree:true})||[];
    if(SH.Settings.values.reducedMotion) { animations.forEach(a=>a.cancel()); if(C.held) C.held.clear(); }
    else if(paused) {
      C.held=C.held||new Set();
      animations.forEach(a=>{ const t=a.currentTime; a.pause(); a.currentTime=t; C.held.add(a); });
    }
    e.classList.toggle('cin-paused',!!paused);
    if(!paused && C.held) { C.held.forEach(a=>{if(SH.Settings.values.reducedMotion) a.cancel(); else if(a.playState==='paused')a.play();}); C.held.clear(); }
    e.querySelectorAll('svg').forEach(svg=> { if(paused) svg.pauseAnimations && svg.pauseAnimations(); else svg.unpauseAnimations && svg.unpauseAnimations(); });
  };
  document.addEventListener('visibilitychange',C.sync);
})(window.SH);
