/* ==========================================
   2. SONGS REGISTRY & LEVEL SYSTEM
   Every melody lives in its own file under
   /songs (e.g. songs/mountain_king.js). Each
   file adds itself to window.SONG_DEFS.
   Song files must be loaded BEFORE this
   script (see index.html).
   ========================================== */
const SONGS = window.SONG_DEFS || {};

const LEVELS = [
    { id: 1, songKey: 'mountain_king', targetScore: 1000 },
    { id: 2, songKey: 'turkish_march', targetScore: 2000 },
    { id: 3, songKey: 'fur_elise',     targetScore: 3000 },
    { id: 4, songKey: 'symphony_5',    targetScore: 4000 },
    { id: 5, songKey: 'lalaland',      targetScore: 5000 },
    { id: 6, songKey: 'leon',          targetScore: 6000 },
    { id: 7, songKey: 'river_flows',   targetScore: 7000 }
];
