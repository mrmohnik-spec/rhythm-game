/* ==========================================
   3. GAME ENGINE, MENU, INPUT & RENDER LOOP
   Depends on: js/audio.js, js/songs.js and
   the song files in /songs (loaded first).
   ========================================== */
let currentLevelIndex = 0;
let unlockedLevel = parseInt(localStorage.getItem('unlocked_level') || '1');
let levelScores = JSON.parse(localStorage.getItem('level_scores') || '{}');

function renderMenu() {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
        const song = SONGS[lvl.songKey];
        const isUnlocked = lvl.id <= unlockedLevel;
        const highScore = levelScores[lvl.id] || 0;

        let starsCount = 0;
        if (highScore >= lvl.targetScore) starsCount = 1;
        if (highScore >= lvl.targetScore * 1.5) starsCount = 2;
        if (highScore >= lvl.targetScore * 2) starsCount = 3;

        const card = document.createElement('div');
        card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        if (isUnlocked) {
            card.style.setProperty('--bg-image', `url("${song.icon}")`);
            card.classList.add('has-bg');
            card.innerHTML = `
                <div class="level-number">STAGE ${lvl.id}</div>
                <div class="song-title-wrap">
                    <span class="song-name">${song.title}</span>
                </div>
                <div class="target-score">GOAL: ${lvl.targetScore}</div>
                <div class="stars-row">
                    <span class="star ${starsCount >= 1 ? 'active' : ''}">★</span>
                    <span class="star ${starsCount >= 2 ? 'active' : ''}">★</span>
                    <span class="star ${starsCount >= 3 ? 'active' : ''}">★</span>
                </div>
            `;
            card.onclick = () => selectLevel(idx);
        } else {
            card.style.setProperty('--bg-image', `url("${song.icon}")`);
            card.classList.add('has-bg');
            card.innerHTML = `
                <div class="level-number">STAGE ${lvl.id}</div>
                <div class="lock-icon">🔒</div>
                <div class="target-score">LOCKED</div>
            `;
        }

        grid.appendChild(card);
    });
}

function unlockNextLevel() {
    const nextLevelId = LEVELS[currentLevelIndex].id + 1;
    if (nextLevelId > unlockedLevel && nextLevelId <= LEVELS.length) {
        unlockedLevel = nextLevelId;
        localStorage.setItem('unlocked_level', unlockedLevel);

        const notice = document.getElementById('levelCompleteNotice');
        notice.style.display = 'block';
        setTimeout(() => { notice.style.display = 'none'; }, 3000);
        buzz('heavy');
    }
}

function saveScore(lvlId, currentScore) {
    if (!levelScores[lvlId] || currentScore > levelScores[lvlId]) {
        levelScores[lvlId] = currentScore;
        localStorage.setItem('level_scores', JSON.stringify(levelScores));
    }
}

/* ==========================================
   4. GAME ENGINE & CANVAS UTILS
   ========================================== */
const LANES = 4;
const INITIAL_DELAY = 1.8;

const cv = document.getElementById('gameCanvas');
const ctx = cv.getContext('2d', { alpha: false });

let W = 0, H = 0, LANE_W = 0, HIT_Y = 0, NOTE_W = 0;
let isTouch = 'ontouchstart' in window;

let gameRunning = false;
let currentSongKey = 'mountain_king';
let loopDuration = 0;
let startTime = 0;
let score = 0;
let combo = 0;

let currentLoop = 0;
let targetSpeedFactor = 1.0;
let currentSpeedFactor = 1.0;

let notesState = [];
let held = [false, false, false, false];

const LANE_HUES = [160, 200, 280, 340];
function hsl(h, s, l, a = 1) { return `hsla(${h}, ${s}%, ${l}%, ${a})`; }

function drawRoundRect(context, x, y, width, height, radius) {
    if (context.roundRect) {
        context.beginPath();
        context.roundRect(x, y, width, height, radius);
    } else {
        context.beginPath();
        if (typeof radius === 'number') radius = {tl: radius, tr: radius, br: radius, bl: radius};
        context.moveTo(x + radius.tl, y);
        context.lineTo(x + width - radius.tr, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        context.lineTo(x + width, y + height - radius.br);
        context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        context.lineTo(x + radius.bl, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        context.lineTo(x, y + radius.tl);
        context.quadraticCurveTo(x, y, x + radius.tl, y);
        context.closePath();
    }
}

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = isTouch ? Math.min(window.devicePixelRatio || 1, 2) : Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    LANE_W = W / LANES;
    HIT_Y = H - 110;
    NOTE_W = LANE_W * 0.72;
}
window.addEventListener('resize', resize);
resize();

function selectLevel(index) {
    currentLevelIndex = index;
    currentSongKey = LEVELS[index].songKey;
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
    initAudio();
    startGame();
}

function showMenu() {
    gameRunning = false;
    renderMenu();
    document.getElementById('menuOverlay').style.display = 'flex';
    document.getElementById('backBtn').style.display = 'none';
}

function startGame() {
    gameRunning = true;
    startTime = performance.now() / 1000;
    score = 0;
    combo = 0;
    currentLoop = 0;
    targetSpeedFactor = 1.0;
    currentSpeedFactor = 1.0;

    const song = SONGS[currentSongKey];

    let maxStepWithDur = 0;
    song.chart.forEach(item => {
        const endStep = item[0] + item[3] + 4;
        if (endStep > maxStepWithDur) maxStepWithDur = endStep;
    });

    loopDuration = maxStepWithDur * song.stepDur;

    notesState = song.chart.map((item, id) => {
        const [step, lane, noteName, durSteps] = item;
        const time = step * song.stepDur;
        const dur = durSteps * song.stepDur;
        return {
            id, lane, noteName, baseTime: time, dur,
            lastLoop: -1, hit: false, holding: false, completed: false, missed: false
        };
    });
}

/* ==========================================
   5. INPUT MECHANICS & SCORE CHECK
   ========================================== */
function processInput(lane) {
    if (!gameRunning) return;
    initAudio();
    const songTime = (performance.now() / 1000) - startTime;
    let target = null;
    let minDiff = Infinity;

    for (let n of notesState) {
        if (n.lane === lane && !n.hit && !n.missed) {
            let diff = Math.abs(songTime - n.currentTime);
            if (diff < minDiff) {
                minDiff = diff;
                target = n;
            }
        }
    }

    if (target && minDiff <= 0.35) {
        target.hit = true;
        score += 200;
        combo++;

        if (target.dur === 0) {
            target.completed = true;
            playPluck(NOTE_FREQS[target.noteName] || 440, 0.4);
        } else {
            target.holding = true;
            playPluck(NOTE_FREQS[target.noteName] || 440, target.dur + 0.3);
        }

        checkScoreForUnlock();
        buzz('light');
    }
}

function checkScoreForUnlock() {
    const currentLvl = LEVELS[currentLevelIndex];
    saveScore(currentLvl.id, score);
    if (score >= currentLvl.targetScore) {
        unlockNextLevel();
    }
}

cv.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const rect = cv.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const lane = Math.floor((e.changedTouches[i].clientX - rect.left) / LANE_W);
        if (lane >= 0 && lane < LANES) { held[lane] = true; processInput(lane); }
    }
}, { passive: false });

cv.addEventListener('touchend', (e) => {
    e.preventDefault();
    held.fill(false);
}, { passive: false });

cv.addEventListener('mousedown', (e) => {
    initAudio();
    const lane = Math.floor(e.clientX / LANE_W);
    if (lane >= 0 && lane < LANES) { held[lane] = true; processInput(lane); }
});
cv.addEventListener('mouseup', () => { held.fill(false); });

/* ==========================================
   6. RENDER LOOP
   ========================================== */
function updateAndDraw() {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, W, H);

    const currentTime = performance.now() / 1000;
    const songTime = gameRunning ? (currentTime - startTime) : 0;

    if (gameRunning) {
        const gameTime = Math.max(0, songTime - INITIAL_DELAY);
        const activeLoop = Math.floor(gameTime / loopDuration);

        if (activeLoop > currentLoop) {
            currentLoop = activeLoop;
            targetSpeedFactor += 0.08;
        }

        currentSpeedFactor += (targetSpeedFactor - currentSpeedFactor) * 0.05;

        notesState.forEach(n => {
            let noteLoop = Math.floor((gameTime - n.baseTime + (loopDuration * 0.5)) / loopDuration);
            if (noteLoop < 0) noteLoop = 0;

            if (n.lastLoop !== noteLoop) {
                n.lastLoop = noteLoop;
                n.hit = false;
                n.holding = false;
                n.completed = false;
                n.missed = false;
            }

            n.currentTime = INITIAL_DELAY + n.baseTime + (noteLoop * loopDuration);

            if (n.hit && n.holding && !n.completed) {
                if (!held[n.lane]) {
                    n.holding = false;
                    n.completed = true;
                } else {
                    score += 2;
                    checkScoreForUnlock();
                    if (songTime >= n.currentTime + n.dur) {
                        n.holding = false;
                        n.completed = true;
                        score += 100;
                        checkScoreForUnlock();
                    }
                }
            }
        });
    }

    // Line & Target Pads
    for (let i = 0; i < LANES; i++) {
        const cx = i * LANE_W + LANE_W / 2;
        ctx.strokeStyle = hsl(LANE_HUES[i], 80, 50, 0.12);
        ctx.beginPath(); ctx.moveTo(i * LANE_W, 0); ctx.lineTo(i * LANE_W, H); ctx.stroke();

        ctx.fillStyle = held[i] ? hsl(LANE_HUES[i], 100, 50, 0.3) : hsl(LANE_HUES[i], 100, 50, 0.08);
        drawRoundRect(ctx, cx - NOTE_W/2, HIT_Y - 25, NOTE_W, 50, 10);
        ctx.fill();
        ctx.strokeStyle = hsl(LANE_HUES[i], 100, 60, 0.6);
        ctx.stroke();
    }

    // Notes
    if (gameRunning) {
        notesState.forEach(n => {
            const timeDiffHead = n.currentTime - songTime;
            const timeDiffTail = (n.currentTime + n.dur) - songTime;

            const yHead = HIT_Y - ((timeDiffHead * currentSpeedFactor) / 1.8) * HIT_Y;
            const yTail = HIT_Y - ((timeDiffTail * currentSpeedFactor) / 1.8) * HIT_Y;

            if (songTime - n.currentTime > 0.35 && !n.hit) {
                n.missed = true;
                combo = 0;
            }

            if (yHead > -150 && yTail < H + 100 && !n.completed) {
                const cx = n.lane * LANE_W + LANE_W / 2;
                const hue = LANE_HUES[n.lane];

                let topY = (n.dur > 0) ? yTail : yHead - 16;
                let bottomY = (n.dur > 0) ? (n.holding ? HIT_Y : yHead) : yHead + 16;
                let h = Math.max(32, bottomY - topY);

                ctx.fillStyle = n.missed ? '#2A2A2A' : hsl(hue, 100, 55);
                drawRoundRect(ctx, cx - NOTE_W / 2, topY, NOTE_W, h, Math.min(10, h / 2));
                ctx.fill();

                ctx.strokeStyle = n.missed ? '#3A3A3A' : '#ffffff';
                ctx.lineWidth = n.holding ? 3 : 1.5;
                ctx.stroke();
            }
        });
    }

    // In-game HUD
    if (gameRunning) {
        const currentTarget = LEVELS[currentLevelIndex].targetScore;
        const isCompleted = score >= currentTarget;

        ctx.fillStyle = '#F5F5F5';
        ctx.font = '700 15px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${score} / ${currentTarget}`, W - 20, 36);
        ctx.fillText(`COMBO: ${combo}`, W - 20, 58);
        ctx.fillText(`SPEED: ${Math.round(currentSpeedFactor * 100)}%`, W - 20, 80);

        if (isCompleted) {
            ctx.fillStyle = '#22c55e';
            ctx.fillText(`STAGE CLEAR! 🔓`, W - 20, 102);
        }
    }

    requestAnimationFrame(updateAndDraw);
}

renderMenu();
requestAnimationFrame(updateAndDraw);
