const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// 🔊 FIXED SOUND (no delay issues)
const jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

// 🐤 BIRD (REAL HITBOX, NOT VISUAL ONLY)
let bird = {
    x: 90,
    y: 300,
    r: 14,
    v: 0
};

let gravity = 0.25;
let jump = -5.5;

// 🚧 PIPES
let pipeX = W;
let pipeW = 70;
let pipeGap = 160;
let pipeH = rand();

let speed = 3;

// 🎮 GAME STATE
let started = false;
let gameOver = false;

// 🏆 SCORE
let score = 0;
let high = localStorage.getItem("high") || 0;
let lastScore = Date.now();

// 🎲 RANDOM PIPE
function rand() {
    return Math.floor(Math.random() * 220) + 80;
}

// 🔁 RESET
function reset() {
    bird.y = 300;
    bird.v = 0;
    pipeX = W;
    pipeH = rand();
    score = 0;
    gameOver = false;
    started = false;
}

// 🎮 ACTION (FIXED)
function action() {

    if (!started) {
        started = true;
        return;
    }

    if (!gameOver) {
        bird.v = jump;
        jumpSound.currentTime = 0;
        jumpSound.play().catch(()=>{});
        return;
    }

    reset();
}

// 📱 CONTROLS
document.addEventListener("keydown", e => {
    if (e.code === "Space") action();
});

document.addEventListener("touchstart", action);
document.addEventListener("click", action);

// ================= GAME LOOP =================
function loop() {

    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, W, H);

    // ☁️ SIMPLE CLOUDS (STABLE)
    ctx.fillStyle = "white";
    for (let i = 0; i < 3; i++) {
        let cx = 80 + i * 120;
        let cy = 80 + i * 20;

        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy + 5, 18, 0, Math.PI * 2);
        ctx.arc(cx - 18, cy + 5, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // 🐤 BIRD (REAL SHAPE + HITBOX MATCHES)
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    if (started && !gameOver) {

        bird.v += gravity;
        bird.y += bird.v;

        pipeX -= speed;

        if (pipeX < -pipeW) {
            pipeX = W;
            pipeH = rand();
        }

        // SCORE
        if (Date.now() - lastScore > 2000) {
            score++;
            lastScore = Date.now();
        }

        if (score > high) {
            high = score;
            localStorage.setItem("high", high);
        }

        // 🚨 PERFECT COLLISION FIX
        if (
            bird.x + bird.r > pipeX &&
            bird.x - bird.r < pipeX + pipeW &&
            (
                bird.y - bird.r < pipeH ||
                bird.y + bird.r > pipeH + pipeGap
            )
        ) {
            gameOver = true;
            hitSound.currentTime = 0;
            hitSound.play().catch(()=>{});
        }

        // screen crash
        if (bird.y < 0 || bird.y > H) {
            gameOver = true;
            hitSound.currentTime = 0;
            hitSound.play().catch(()=>{});
        }
    }

    // 🚧 PIPES (FIXED VISUAL)
    ctx.fillStyle = "#3CB043";
    ctx.fillRect(pipeX, 0, pipeW, pipeH);
    ctx.fillRect(pipeX, pipeH + pipeGap, pipeW, H);

    // 📊 SCORE
    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    ctx.fillText("High: " + high, 10, 50);

    if (!started) {
        ctx.fillText("Tap / Space to Start", 80, 300);
    }

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER", 120, 300);
        ctx.fillStyle = "black";
        ctx.fillText("Tap to Restart", 120, 330);
    }

    requestAnimationFrame(loop);
}

loop();
