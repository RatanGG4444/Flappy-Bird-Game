const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// 🔊 SOUNDS (fixed reset issue)
const jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

// 🐤 BIRD (slightly more realistic)
let bird = {
    x: 90,
    y: 300,
    v: 0
};

let gravity = 0.25;
let jump = -5;

// 🚧 PIPES
let pipeX = W;
let pipeW = 70;
let pipeGap = 160;
let pipeH = randPipe();
let pipeSpeed = 3.5;

// ☁️ CLOUDS (smoother, not circles only look)
let clouds = [
    { x: 60, y: 90 },
    { x: 200, y: 140 },
    { x: 330, y: 70 }
];

// 🎮 GAME STATE
let started = false;
let gameOver = false;

// 🏆 SCORE
let score = 0;
let high = localStorage.getItem("high") || 0;
let lastScore = Date.now();

function randPipe() {
    return Math.floor(Math.random() * 220) + 80;
}

// 🔁 RESET
function reset() {
    bird.y = 300;
    bird.v = 0;
    pipeX = W;
    pipeH = randPipe();
    score = 0;
    gameOver = false;
    started = false;
}

// 🎮 ACTION (FIXED SOUND RESET)
function action() {
    if (!started) {
        started = true;
        return;
    }

    if (!gameOver) {
        bird.v = jump;
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
        return;
    }

    reset();
}

// CONTROLS
document.addEventListener("keydown", e => {
    if (e.code === "Space") action();
});
document.addEventListener("touchstart", action);
document.addEventListener("click", action);

// 🧠 GAME LOOP
function loop() {

    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, W, H);

    // ☁️ CLOUDS (better look)
    ctx.fillStyle = "white";
    clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
        ctx.arc(c.x + 18, c.y + 5, 18, 0, Math.PI * 2);
        ctx.arc(c.x - 18, c.y + 5, 18, 0, Math.PI * 2);
        ctx.fill();

        c.x -= 0.3;
        if (c.x < -60) c.x = W + 60;
    });

    // 🐤 BIRD (NOT JUST A BALL NOW)
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.ellipse(bird.x, bird.y, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    if (started && !gameOver) {

        bird.v += gravity;
        bird.y += bird.v;

        pipeX -= pipeSpeed;

        if (pipeX < -pipeW) {
            pipeX = W;
            pipeH = randPipe();
        }

        // score
        if (Date.now() - lastScore > 2000) {
            score++;
            lastScore = Date.now();
        }

        if (score > high) {
            high = score;
            localStorage.setItem("high", high);
        }

        // 🚨 COLLISION (FIXED STRONG DETECTION)
        if (
            bird.x + 14 > pipeX &&
            bird.x - 14 < pipeX + pipeW &&
            (bird.y - 12 < pipeH || bird.y + 12 > pipeH + pipeGap)
        ) {
            gameOver = true;
            hitSound.currentTime = 0;
            hitSound.play().catch(() => {});
        }

        if (bird.y < 0 || bird.y > H) {
            gameOver = true;
            hitSound.currentTime = 0;
            hitSound.play().catch(() => {});
        }
    }

    // 🚧 PIPES (lighter green, more realistic)
    ctx.fillStyle = "#4CAF50";
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
