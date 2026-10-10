/* Small Hours: local stroke icons. Do not depend on colour-emoji fonts. */
(function (SH) {
  const paths = {
    bag: 'M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2', bed: 'M3 20V9m18 11V9M3 15h18M5 9h5v5H5Zm7-2h7v7h-7Z', box: 'M3 7l9-4 9 4v13H3ZM3 7l9 4 9-4M12 11v9',
    pen: 'M5 19l1-5L17 3l4 4L10 18ZM14 6l4 4M4 21h16', book: 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4ZM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6Z', door: 'M6 21V3h12v18M14 12h1',
    phone: 'M7 2h10v20H7ZM10 18h4', chat: 'M3 4h18v13H9l-6 4ZM7 8h10M7 12h7', people: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a6 6 0 0 1 12 0M17 3a4 4 0 0 1 0 8M22 21a6 6 0 0 0-5-6',
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14m6-12v14', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2', food: 'M5 3v8a3 3 0 0 0 6 0V3M8 3v18M18 3v18M18 3c-4 2-4 8 0 8',
    heart: 'M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13Z', bolt: 'M13 2 5 13h6l-1 9 9-13h-6Z', clothes: 'M8 3 3 6l2 6 3-1v10h8V11l3 1 2-6-5-3c0 4-8 4-8 0Z',
    weather: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', picture: 'M3 3h18v18H3ZM3 17l6-7 6 6 3-3 3 4M15 7h1', play: 'M6 3l15 9-15 9Z', cash: 'M3 6h18v12H3ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', headphones: 'M3 14V9a9 9 0 0 1 18 0v5M3 10h4v9H3Zm14 0h4v9h-4Z',
    sink: 'M3 13h18l-3 6H6ZM12 13V5h5v4M8 19v3m8-3v3', arrow: 'M3 12h18m-6-6 6 6-6 6', star: 'M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z', battery: 'M3 8h15v8H3Zm18 3v2', list: 'M7 5h14M7 12h14M7 19h14M3 5h1M3 12h1M3 19h1'
  };
  const I = SH.V15Icons = {};
  I.svg = key => `<svg class="sh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key] || paths.star}"/></svg>`;
  I.key = text => {
    if (/bed|sleep|nap|rest|🛏|🛌/i.test(text)) return 'bed';
    if (/door|leave|🚪/.test(text)) return 'door';
    if (/clothes|hoodie|👕|🧥/.test(text)) return 'clothes';
    if (/fridge|stove|eat|food|🍴|meal/.test(text)) return 'food';
    if (/sink|shower|wash|🚰|🛁/.test(text)) return 'sink';
    if (/money|cash|savings|💵|💳/.test(text)) return 'cash';
    if (/pack|bag|🎒/.test(text)) return 'bag';
    if (/shoebox|stash|📦/.test(text)) return 'box';
    if (/map|atlas|🗺/.test(text)) return 'map';
    if (/talk|people|friend|🧍/.test(text)) return 'people';
    if (/draw|desk|write|✏|journal/.test(text)) return 'pen';
    if (/book|shelf|📚|📖/.test(text)) return 'book';
    if (/window|look|👀/.test(text)) return 'eye';
    if (/game|console|skyforge|play|🎮/.test(text)) return 'play';
    if (/phone|call|📱/.test(text)) return 'phone';
    if (/wait|⏰|clock/.test(text)) return 'clock';
    return 'star';
  };
  const phoneKeys = { messages: 'chat', calls: 'phone', chirp: 'chat', pip: 'star', people: 'people', browser: 'book', hustle: 'pen', bank: 'cash', wallet: 'cash', camera: 'picture', photos: 'picture', calendar: 'clock', clock: 'clock', notes: 'pen', atlas: 'map', maps: 'map', network: 'settings', finder: 'eye', weather: 'weather', music: 'headphones', skyforge: 'play', settings: 'settings', tubeyou: 'play' };
  I.phone = function () {
    document.querySelectorAll('.homegrid .app').forEach(b => {
      const match = (b.getAttribute('onclick') || '').match(/open\('([^']+)'/), e = b.querySelector('.ic');
      if (e) { e.innerHTML = I.svg(phoneKeys[match && match[1]] || 'star'); e.style.background = '#353e29'; }
    });
  };
  const render = SH.Phone.render;
  SH.Phone.render = function () { const r = render.apply(this, arguments); I.phone(); return r; };
  const build = SH.Stage.build;
  SH.Stage.build = function () {
    const r = build.apply(this, arguments);
    document.querySelectorAll('#hot .hd').forEach(e => { const b = e.closest('button'); e.innerHTML = I.svg(I.key(b && b.getAttribute('aria-label') || e.textContent)); });
    document.querySelectorAll('#dock .di').forEach(e => { e.innerHTML = I.svg(I.key(e.closest('button').getAttribute('title') || e.textContent)); });
    return r;
  };
  window.addEventListener('DOMContentLoaded', () => document.querySelectorAll('#tabbar .ti').forEach(e => e.innerHTML = I.svg({ story: 'book', you: 'people', phone: 'phone', map: 'map' }[e.closest('button').dataset.t])));
})(window.SH);
