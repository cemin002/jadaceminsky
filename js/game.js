const dino = document.getElementById('dino');
const gameContainer = document.querySelector('.game-container');
const gameOver = document.querySelector('.game-over');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startMessage = document.querySelector('.start-message');
const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');
const pointSound = document.getElementById('pointSound');

let isJumping = false;
let isGameStarted = false;
let gameInterval;
let obstacleInterval;
let cloudInterval;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 3;
let frameCount = 0;

highScoreElement.textContent = `High Score: ${highScore}`;

function createCloud() {
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');
    gameContainer.appendChild(cloud);

    const randomHeight = Math.random() * 150 + 100;
    cloud.style.top = randomHeight + 'px';
    cloud.style.right = '-70px';

    let position = 800;
    let moveInterval = setInterval(() => {
        if (position > -70) {
            position -= gameSpeed * 0.5;
            cloud.style.right = -position + 'px';
        } else {
            clearInterval(moveInterval);
            gameContainer.removeChild(cloud);
        }
    }, 20);
}

function jump() {
    if (!isJumping && (isGameStarted || !isGameOver)) {
        isJumping = true;
        jumpSound.currentTime = 0;
        jumpSound.play();
        
        dino.classList.add('jumping');
        
        let position = 0;
        let jumpHeight = 150;
        let jumpSpeed = 5;
        let gravity = 0.5;
        let velocity = 15;

        let jumpInterval = setInterval(() => {
            // Apply physics-based jump
            position += velocity;
            velocity -= gravity;

            // Ground check
            if (position <= 0) {
                position = 0;
                velocity = 0;
                clearInterval(jumpInterval);
                isJumping = false;
                dino.classList.remove('jumping');
            }

            dino.style.bottom = position + 'px';
        }, 20);
    }
}

const obstacles = [
    { name: 'mushroom', width: 40, height: 40, hitboxAdjust: 0.8 },
    { name: 'bush', width: 50, height: 45, hitboxAdjust: 0.7 },
    { name: 'log', width: 60, height: 35, hitboxAdjust: 0.9 },
    { name: 'rock', width: 45, height: 40, hitboxAdjust: 0.85 },
    { name: 'fern', width: 40, height: 50, hitboxAdjust: 0.6 }
];

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Randomly select obstacle type
    const obstacleType = obstacles[Math.floor(Math.random() * obstacles.length)];
    obstacle.classList.add(obstacleType.name);
    obstacle.style.width = obstacleType.width + 'px';
    obstacle.style.height = obstacleType.height + 'px';
    
    gameContainer.appendChild(obstacle);

    let position = 800;
    let moveInterval = setInterval(() => {
        if (position > -obstacleType.width) {
            position -= gameSpeed;
            obstacle.style.right = -position + 'px';

            // Collision detection with more precise hitbox
            const dinoRect = dino.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            // Adjust hitbox size based on obstacle type
            const hitboxMargin = 10;
            const adjustedWidth = obstacleRect.width * obstacleType.hitboxAdjust;
            const adjustedHeight = obstacleRect.height * obstacleType.hitboxAdjust;
            const adjustedLeft = obstacleRect.left + (obstacleRect.width - adjustedWidth) / 2;
            const adjustedTop = obstacleRect.top + (obstacleRect.height - adjustedHeight) / 2;

            if (
                dinoRect.right - hitboxMargin > adjustedLeft &&
                dinoRect.left + hitboxMargin < adjustedLeft + adjustedWidth &&
                dinoRect.bottom - hitboxMargin > adjustedTop
            ) {
                endGame();
            }
        } else {
            clearInterval(moveInterval);
            gameContainer.removeChild(obstacle);
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
            pointSound.currentTime = 0;
            pointSound.play();
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
            
            // Increase game speed every 100 points
            if (score % 100 === 0) {
                gameSpeed += 0.5;
            }
        }
    }, 20);
}

function startGame() {
    if (!isGameStarted) {
        isGameStarted = true;
        score = 0;
        gameSpeed = 3;
        scoreElement.textContent = `Score: ${score}`;
        startMessage.style.display = 'none';
        gameOver.style.display = 'none';
        
        // Create clouds
        cloudInterval = setInterval(createCloud, 3000);
        
        // Create obstacles at random intervals
        obstacleInterval = setInterval(() => {
            const randomDelay = Math.floor(Math.random() * 1000) + 1000;
            setTimeout(createObstacle, randomDelay);
        }, 2000);

        // Create initial clouds
        for (let i = 0; i < 3; i++) {
            setTimeout(createCloud, i * 1000);
        }
    }
}

function endGame() {
    isGameStarted = false;
    clearInterval(obstacleInterval);
    clearInterval(cloudInterval);
    gameOver.style.display = 'block';
    startMessage.style.display = 'block';
    startMessage.textContent = 'Press Space to Restart';
    gameOverSound.play();
    
    // Remove all existing obstacles and clouds
    const obstacles = document.querySelectorAll('.obstacle');
    const clouds = document.querySelectorAll('.cloud');
    obstacles.forEach(obstacle => obstacle.remove());
    clouds.forEach(cloud => cloud.remove());
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling
        if (!isGameStarted) {
            startGame();
        }
        jump();
    }
});

// Mobile support
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (!isGameStarted) {
        startGame();
    }
    jump();
});
