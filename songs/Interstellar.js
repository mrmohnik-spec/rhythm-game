/* Interstellar - First Step / Cornfield Chase (Hans Zimmer) */
window.SONG_DEFS = window.SONG_DEFS || {};
window.SONG_DEFS.interstellar = {
    title: "Interstellar",
    icon: "images/Interstellar.jpg",
    stepDur: 0.16, // ریتم سریع و اوج هیجان ارگ هانس زیمر
    chart: [
        // --- Main Building Arpeggio (Intro Motive) ---
        [0, 0, 'E4', 0], [1, 1, 'A4', 0], [2, 2, 'B4', 0], [3, 3, 'C5', 1],
        [5, 0, 'E4', 0], [6, 1, 'A4', 0], [7, 2, 'B4', 0], [8, 3, 'C5', 1],

        // --- Transition into Main Climax ---
        [10, 0, 'D4', 0], [11, 1, 'F4', 0], [12, 2, 'A4', 0], [13, 3, 'D5', 1],
        [15, 0, 'D4', 0], [16, 1, 'F4', 0], [17, 2, 'A4', 0], [18, 3, 'C5', 1],

        // --- THE CLIMAX (اوج هیجان‌آور ارگ و پیانو) ---
        // Block 1: Fast ascending arpeggios across all lanes
        [20, 0, 'E5', 0], [21, 1, 'A5', 0], [22, 2, 'B5', 0], [23, 3, 'C6', 2],
        [26, 3, 'B5', 0], [27, 2, 'A5', 0], [28, 1, 'E5', 0], [29, 0, 'C5', 1],

        [31, 0, 'F5', 0], [32, 1, 'A5', 0], [33, 2, 'C6', 0], [34, 3, 'E6', 2],
        [37, 3, 'D6', 0], [38, 2, 'C6', 0], [39, 1, 'A5', 0], [40, 0, 'F5', 1],

        // Block 2: Massive climax resolution chords
        [42, 0, 'E4', 0], [43, 1, 'E5', 0], [44, 2, 'G#5', 0], [45, 3, 'B5', 0],
        [46, 3, 'E6', 3], // نت کشیده قدرتمند اوج

        // Outro descent after the climax
        [50, 3, 'C6', 0], [51, 2, 'B5', 0], [52, 1, 'A5', 0], [53, 0, 'E5', 0],
        [54, 1, 'A4', 3]
    ]
};