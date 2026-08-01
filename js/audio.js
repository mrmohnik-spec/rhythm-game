/* ==========================================
   1. TELEGRAM SDK & AUDIO ENGINE
   ========================================== */
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#121212');
    tg.setBackgroundColor('#121212');
}

function buzz(type = 'light') {
    if (tg && tg.HapticFeedback) {
        if (type === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
        else tg.HapticFeedback.impactOccurred('light');
    } else if (navigator.vibrate) {
        try { navigator.vibrate(10); } catch (_) {}
    }
}

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;

function initAudio() {
    if (!actx) {
        actx = new AudioCtx();
    }
    if (actx.state === 'suspended') {
        actx.resume();
    }
}

const NOTE_FREQS = {
    'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
    'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25,
    'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50
};

function playPluck(freq, duration = 0.4) {
    if (!actx) return;
    const now = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + duration);
}
