// Registro de estilos, dinastías y escenas del funk según Rickey Vincent. Cada fichero de capítulo (data/NN-*.js,
// escritos a mano leyendo el libro) llama a FUNK.chapter({...}) y FUNK.add([...], n).
// Los datos se fusionan por id: los arrays se unen y cada capítulo puede añadir
// discos, citas (refs) y una nota propia sobre una escena ya definida en otro.
window.FUNK = (function () {
  const genres = new Map();
  const chapters = [];

  const FAMILIES = {
    raices:     { name: 'Raíces: blues, jazz, gospel y R&B', color: '#d97706' },
    soul:       { name: 'Soul y proto-funk: Stax, Nueva Orleans, Motown', color: '#facc15' },
    jb:         { name: 'James Brown y los JB’s', color: '#ef4444' },
    rock:       { name: 'Funk psicodélico y black rock: Sly, Hendrix', color: '#c084fc' },
    fusion:     { name: 'Jazz-funk y fusión', color: '#38bdf8' },
    bandas:     { name: 'Bandas de funk de los setenta', color: '#22c55e' },
    pfunk:      { name: 'P-Funk: Parliament-Funkadelic', color: '#a3e635' },
    disco:      { name: 'Disco y dance funk', color: '#f472b6' },
    ochenta:    { name: 'Funk de los ochenta: Prince, Rick James, electro', color: '#22d3ee' },
    hiphop:     { name: 'Hip hop, go-go y funk de los noventa', color: '#94a3b8' },
    cultura:    { name: 'Política y cultura negra', color: '#e5e7eb' },
  };

  const key = (t) => (t.a + '|' + t.t).toLowerCase();

  function mergeArr(a = [], b = [], k = (x) => (typeof x === 'string' ? x.toLowerCase() : JSON.stringify(x))) {
    const seen = new Set(a.map(k));
    const out = a.slice();
    for (const x of b) if (!seen.has(k(x))) { seen.add(k(x)); out.push(x); }
    return out;
  }

  // Anota en cada disco los capítulos que lo citan.
  function cite(tracks, t, ch) {
    const m = tracks.find((x) => key(x) === key(t));
    if (m && ch != null) m.chs = mergeArr(m.chs, [ch]);
  }

  function add(list, chapter) {
    for (const g of list) {
      let cur = genres.get(g.id);
      if (!cur) {
        cur = { id: g.id, aka: [], influences: [], artists: [], tracks: [], labels: [], refs: [], notes: [], chapters: [] };
        genres.set(g.id, cur);
      }
      for (const f of ['aka', 'influences', 'artists', 'labels']) cur[f] = mergeArr(cur[f], g[f]);
      cur.tracks = mergeArr(cur.tracks, (g.tracks || []).map((t) => ({ ...t })), key);
      for (const t of g.tracks || []) {
        if (t.ess) { const m = cur.tracks.find((x) => key(x) === key(t)); if (m) m.ess = 1; }
        cite(cur.tracks, t, chapter);
      }
      cur.refs = mergeArr(cur.refs, (g.refs || []).map((r) => ({ ch: chapter, ...r })), (r) => r.q);
      for (const f of ['name', 'family', 'start', 'end', 'place', 'desc']) if (g[f] != null && cur[f] == null) cur[f] = g[f];
      if (g.desc != null) cur.descCh = cur.descCh ?? chapter;
      if (g.note) cur.notes.push({ ch: chapter, text: g.note });
      if (chapter != null && !cur.chapters.includes(chapter)) cur.chapters.push(chapter);
    }
  }

  return {
    FAMILIES,
    chapters,
    genres,
    chapter(meta) { chapters.push(meta); },
    add,
  };
})();
