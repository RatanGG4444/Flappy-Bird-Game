const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// 🔊 Sounds
const jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

// 🐤 Bird
let bird = { x: 80, y: 300, v: 0 };

const gravity = 0.45;
const jump = -7;

// 🚧 Pipes
let pipeX = W;
let pipeH = randomPipe();
const pipeW = 70;
const gap = 150;
const speed = 3.2;

// ☁️ Clouds
let clouds = [
    {x: 80, y: 100, r: 20},
    {x: 200, y: 150, r: 30},
    {x: 320, y: 80, r: 25}
];

// 🎮 State
let started = false;
let gameOver = false;
let paused = false;

// 🏆 Score
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

function randomPipe() {
    return Math.floor(Math.random() * 200) + 120;
}

// 💀 reset
function resetGame() {
    bird = { x: 80, y: 300, v: 0 };
    pipeX = W;
    pipeH = randomPipe();
    score = 0;
    gameOver = false;
    started = false;
}

// ⌨️ controls (PC)
document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {
        if (!started) started = true;

        else if (!gameOver && !paused) {
            bird.v = jump;
            jumpSound.currentTime = 0;
            jumpSound.play().catch(() => {});
        }

        else if (gameOver) resetGame();
    }

    if (e.code === "Escape") paused = !paused;
});


// ===============================
// 📱 MOBILE TOUCH FIX (ADDED)
// ===============================

// Tap anywhere
document.addEventListener("touchstart", handleAction);

// Click support (mobile + desktop)
document.addEventListener("click", handleAction);

// prevent scrolling on mobile
document.addEventListener("touchmove", function(e){
    e.preventDefault();
}, { passive: false });

function handleAction() {

    if (!started) {
        started = true;
        return;
    }

    if (!gameOver && !paused) {
        bird.v = jump;
        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
        return;
    }

    if (gameOver) {
        resetGame();
        return;
    }
}

// 🌤️ SKY
function drawSky() {
    let grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#6ec6ff");
    grad.addColorStop(1, "#bfe9ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
}

// ☁️ clouds
function drawCloud(c) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(c.x + 20, c.y + 10, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(c.x - 20, c.y + 10, c.r, 0, Math.PI * 2);
    ctx.fill();
}

// 🐤 BIRD
function drawBird() {
    ctx.fillStyle = "#ffb300";
    ctx.beginPath();
    ctx.ellipse(bird.x, bird.y, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 🚧 PIPE
function drawPipe(x, y, h) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, 0, pipeW, h);
    ctx.fillRect(x, h + gap, pipeW, H);
}

// 💥 death
function die() {
    gameOver = true;
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
}

// 🎮 LOOP
function update() {

    drawSky();

    // clouds
    for (let c of clouds) {
        drawCloud(c);
        c.x -= 0.3;
        if (c.x < -50) c.x = W + 50;
    }

    if (started && !gameOver && !paused) {

        bird.v += gravity;
        bird.y += bird.v;

        pipeX -= speed;

        if (pipeX < -pipeW) {
            pipeX = W;
            pipeH = randomPipe();
            score++;
        }

        if (
            bird.x + 15 > pipeX &&
            bird.x - 15 < pipeX + pipeW &&
            (bird.y < pipeH || bird.y > pipeH + gap)
        ) die();

        if (bird.y < 0 || bird.y > H) die();

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
    }

    drawPipe(pipeX, 0, pipeH);
    drawBird();

    // score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High: " + highScore, 10, 60);

    if (!started) ctx.fillText("Tap / Space to Start", 80, 250);

    if (paused) ctx.fillText("PAUSED", 150, 250);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 110, 250);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Tap to Restart", 110, 290);
    }

    requestAnimationFrame(update);
}

update();
