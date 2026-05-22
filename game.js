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


// 📱 MOBILE SUPPORT
document.addEventListener("touchstart", handleAction);
document.addEventListener("click", handleAction);

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

// ☁️ CLOUDS
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

// 🐤 UPGRADED BIRD (REALISTIC + ROTATION)
function drawBird() {

    let angle = Math.max(-0.5, Math.min(0.8, bird.v * 0.1));

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(angle);

    let body = ctx.createRadialGradient(-5, -5, 5, 0, 0, 20);
    body.addColorStop(0, "#fff59d");
    body.addColorStop(1, "#f9a825");

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f57f17";
    ctx.beginPath();
    ctx.ellipse(-5, 3, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(5, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(6, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff6f00";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(22, -3);
    ctx.lineTo(22, 3);
    ctx.fill();

    ctx.restore();
}

// 🚧 UPGRADED PIPE (3D REALISTIC)
function drawPipe(x, y, h) {

    let grad = ctx.createLinearGradient(x, 0, x + pipeW, 0);
    grad.addColorStop(0, "#7bdc7b");
    grad.addColorStop(0.5, "#43a047");
    grad.addColorStop(1, "#1b5e20");

    ctx.fillStyle = grad;

    ctx.fillRect(x, 0, pipeW, h);
    ctx.fillRect(x, h + gap, pipeW, H);

    ctx.fillStyle = "#a5f6a5";
    ctx.fillRect(x - 5, h - 12, pipeW + 10, 12);
    ctx.fillRect(x - 5, h + gap, pipeW + 10, 12);

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(x + pipeW - 6, 0, 6, h);
    ctx.fillRect(x + pipeW - 6, h + gap, 6, H);
}

// 💥 DIE
function die() {
    gameOver = true;
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
}

// 🎮 LOOP
function update() {

    drawSky();

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
