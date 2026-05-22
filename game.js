const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// =====================
// 🔊 SOUNDS
// =====================
const jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg");

// =====================
// 🏆 HIGH SCORE
// =====================
let highScore = localStorage.getItem("highScore") || 0;

// =====================
// 🐤 BIRD
// =====================
let bird = {
    x: 80,
    y: 300,
    velocity: 0
};

let gravity = 0.25;
let jump = -5;

// =====================
// 🚧 PIPES
// =====================
let pipeWidth = 60;
let pipeGap = 150;
let pipeX = WIDTH;
let pipeHeight = randomPipe();
let pipeSpeed = 4;

// =====================
// ☁️ CLOUDS
// =====================
let clouds = [
    { x: 50, y: 80, r: 20 },
    { x: 180, y: 120, r: 30 },
    { x: 320, y: 70, r: 25 }
];

// =====================
// 🎮 GAME STATE
// =====================
let started = false;
let gameOver = false;
let score = 0;
let lastScoreTime = Date.now();

// =====================
// RANDOM PIPE HEIGHT
// =====================
function randomPipe() {
    return Math.floor(Math.random() * 250) + 100;
}

// =====================
// RESTART GAME
// =====================
function restartGame() {
    bird.y = 300;
    bird.velocity = 0;

    pipeX = WIDTH;
    pipeHeight = randomPipe();

    score = 0;
    gameOver = false;
    started = false;
}

// =====================
// INPUT HANDLER (ALL DEVICES)
// =====================
function handleAction() {

    // Start game
    if (!started) {
        started = true;
        jumpSound.play().catch(() => {});
        return;
    }

    // Jump
    if (!gameOver) {
        bird.velocity = jump;
        jumpSound.play().catch(() => {});
        return;
    }

    // Restart
    restartGame();
    jumpSound.play().catch(() => {});
}

// =====================
// KEYBOARD (PC)
// =====================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        handleAction();
    }
});

// =====================
// TOUCH (MOBILE)
// =====================
document.addEventListener("touchstart", () => {
    handleAction();
});

// =====================
// MOUSE CLICK
// =====================
document.addEventListener("click", () => {
    handleAction();
});

// =====================
// GAMEPAD (CONSOLE)
// =====================
let gamepadPressed = false;

function checkGamepad() {
    const pads = navigator.getGamepads();

    for (let p of pads) {
        if (!p) continue;

        if (p.buttons[0].pressed && !gamepadPressed) {
            gamepadPressed = true;
            handleAction();
        }

        if (!p.buttons[0].pressed) {
            gamepadPressed = false;
        }
    }

    requestAnimationFrame(checkGamepad);
}
checkGamepad();

// =====================
// DRAW BIRD
// =====================
function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, 15, 0, Math.PI * 2);
    ctx.fill();
}

// =====================
// DRAW CLOUD
// =====================
function drawCloud(c) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
}

// =====================
// GAME LOOP
// =====================
function update() {

    // SKY
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // CLOUDS
    clouds.forEach(c => {
        drawCloud(c);
        c.x -= 0.5;
        if (c.x < -50) c.x = WIDTH + 50;
    });

    drawBird();

    if (started && !gameOver) {

        bird.velocity += gravity;
        bird.y += bird.velocity;

        pipeX -= pipeSpeed;

        if (pipeX < -pipeWidth) {
            pipeX = WIDTH;
            pipeHeight = randomPipe();
        }

        // SCORE
        if (Date.now() - lastScoreTime > 2000) {
            score++;
            lastScoreTime = Date.now();
        }

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        // COLLISION
        if (
            bird.x + 15 > pipeX &&
            bird.x - 15 < pipeX + pipeWidth &&
            (
                bird.y < pipeHeight ||
                bird.y > pipeHeight + pipeGap
            )
        ) {
            hitSound.play().catch(() => {});
            gameOver = true;
        }

        // OUT OF SCREEN
        if (bird.y < 0 || bird.y > HEIGHT) {
            hitSound.play().catch(() => {});
            gameOver = true;
        }
    }

    // PIPES
    ctx.fillStyle = "green";
    ctx.fillRect(pipeX, 0, pipeWidth, pipeHeight);
    ctx.fillRect(pipeX, pipeHeight + pipeGap, pipeWidth, HEIGHT);

    // SCORE TEXT
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High: " + highScore, 10, 60);

    // START SCREEN
    if (!started) {
        ctx.fillText("Tap / Press Space to Start", 60, 300);
    }

    // GAME OVER
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 100, 300);

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Tap / Press to Restart", 70, 340);
    }

    requestAnimationFrame(update);
}

update();
