/* Shape of My Heart (Léon) - Detailed Acoustic Guitar Riff */
window.SONG_DEFS = window.SONG_DEFS || {};
window.SONG_DEFS.leon = {
    title: "Shape of My Heart",
    icon: "images/leon.jpg",
    stepDur: 0.22, // نت‌های سریع‌تر برای ریتم اصلی
    chart: [
        // Intro Main Guitar Riff (Arpeggiated Chords)
        // F#m Pattern
        [0, 0, 'F#4', 0], [1, 1, 'C#5', 0], [2, 2, 'F#5', 0], [3, 3, 'A5', 0],
        [4, 2, 'G#5', 2],
        
        // E Pattern
        [8, 0, 'E4', 0],  [9, 1, 'B4', 0],  [10, 2, 'E5', 0],  [11, 3, 'G#5', 0],
        [12, 2, 'F#5', 2],

        // D Pattern
        [16, 0, 'D4', 0], [17, 1, 'A4', 0], [18, 2, 'D5', 0],  [19, 3, 'F#5', 0],
        [20, 2, 'E5', 0], [21, 1, 'D5', 1],

        // C#7 Pattern (Classic Cadence)
        [24, 0, 'C#4', 0],[25, 1, 'G#4', 0],[26, 2, 'C#5', 0], [27, 3, 'E5', 0],
        [28, 2, 'D#5', 3],

        // --- Verse / Chorus Theme ---
        // F#m -> E
        [34, 0, 'F#4', 0], [35, 1, 'C#5', 0], [36, 2, 'A5', 0], [37, 3, 'G#5', 0],
        [38, 2, 'F#5', 2],
        [42, 0, 'E4', 0],  [43, 1, 'B4', 0],  [44, 2, 'G#5', 0], [45, 3, 'F#5', 0],
        [46, 2, 'E5', 2],

        // Melodic Run (He deals the cards...)
        [50, 1, 'C#5', 0], [51, 2, 'D5', 0],  [52, 3, 'E5', 0],  [53, 3, 'F#5', 2],
        [56, 2, 'E5', 0],  [57, 1, 'D5', 0],  [58, 0, 'C#5', 0], [59, 1, 'B4', 3]
    ]
};