// Game configuration
const config = {
    gravity: 0.6,
    playerSpeed: 0.8,
    maxSpeed: 8,
    jumpForce: 15,
    friction: 0.92,
    airControl: 0.5,
    coinCount: 20,
    enemyCount: 10,
    heartCount: 5,        // Number of hearts to place in the world
    maxLives: 5,          // Maximum number of lives player can have
    coyoteTime: 100,
    jumpBufferTime: 150,
    worldWidth: 3000,
    worldHeight: 2000,
    viewportWidth: 800,
    viewportHeight: 500
};

// Game state
const game = {
    score: 0,
    lives: 3,
    isGameOver: false,
    camera: {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    }
};

// Player object
const player = {
    element: null, // Will be set after DOM creation
    x: 150,
    y: 1500,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isMovingLeft: false,
    isMovingRight: false,
    lastOnGround: 0,
    jumpBuffered: false,
    jumpBufferTimestamp: 0,
    facingDirection: 1,
    isInvulnerable: false,  // Invulnerability state after being hit
    invulnerableTimer: 0    // Timer for invulnerability
};

// Arrays to store game objects
const platforms = [];
const coins = [];
const enemies = [];
const hearts = [];   // Array to store heart objects

// Initialize game
function init() {
    // Create game world
    const gameWorld = document.createElement('div');
    gameWorld.id = 'game-world';
    gameWorld.style.position = 'absolute';
    gameWorld.style.width = config.worldWidth + 'px';
    gameWorld.style.height = config.worldHeight + 'px';
    document.getElementById('game').appendChild(gameWorld);
    
    // Create player element
    const playerElement = document.createElement('div');
    playerElement.id = 'player';
    gameWorld.appendChild(playerElement);
    player.element = playerElement;
    
    // Set player initial position
    updatePlayerPosition();
    
    // Create the fixed map
    createMap();
    
    // Create game objects
    createGameObjects();
    
    // Start game loop
    gameLoop();
    
    // Event listeners for player controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Create a fixed map instead of random platforms
function createMap() {
    // Ground platforms
    createPlatform(-50, 1800, 3100, 200); // Main ground floor
    
    // Left area - starting zone
    createPlatform(100, 1600, 200, 20);
    createPlatform(400, 1500, 150, 20);
    createPlatform(200, 1350, 180, 20);
    createPlatform(500, 1250, 220, 20);
    createPlatform(300, 1100, 150, 20);
    
    // Middle area - central structures
    createPlatform(800, 1700, 400, 20);
    createPlatform(900, 1550, 200, 20);
    createPlatform(750, 1400, 300, 20);
    createPlatform(1000, 1250, 350, 20);
    createPlatform(850, 1100, 250, 20);
    createPlatform(950, 950, 200, 20);
    createPlatform(1100, 800, 400, 20);
    
    // Right area - advanced platforming challenges
    createPlatform(1600, 1700, 180, 20);
    createPlatform(1900, 1650, 150, 20);
    createPlatform(2200, 1700, 200, 20);
    createPlatform(1700, 1500, 120, 20);
    createPlatform(2000, 1450, 100, 20);
    createPlatform(2300, 1500, 150, 20);
    createPlatform(1800, 1300, 130, 20);
    createPlatform(2100, 1250, 110, 20);
    createPlatform(2400, 1300, 160, 20);
    
    // Upper area - harder to reach platforms
    createPlatform(700, 700, 200, 20);
    createPlatform(1000, 600, 150, 20);
    createPlatform(1300, 650, 180, 20);
    createPlatform(1600, 600, 200, 20);
    createPlatform(1900, 550, 150, 20);
    createPlatform(2200, 600, 180, 20);
    
    // Top area - highest platforms
    createPlatform(800, 400, 130, 20);
    createPlatform(1100, 350, 100, 20);
    createPlatform(1400, 300, 160, 20);
    createPlatform(1700, 250, 180, 20);
    createPlatform(2000, 300, 150, 20);
    
    // Secret area
    createPlatform(2400, 200, 300, 20);
    createPlatform(2600, 100, 200, 20);
}

// Create coins and enemies in fixed positions
function createGameObjects() {
    // Create coins in specific positions
    createCoin(150, 1550);
    createCoin(450, 1450);
    createCoin(250, 1300);
    createCoin(550, 1200);
    createCoin(350, 1050);
    
    createCoin(850, 1650);
    createCoin(950, 1500);
    createCoin(800, 1350);
    createCoin(1050, 1200);
    createCoin(900, 1050);
    createCoin(1000, 900);
    createCoin(1150, 750);
    
    createCoin(1650, 1650);
    createCoin(1950, 1600);
    createCoin(1750, 1450);
    createCoin(2050, 1400);
    createCoin(1850, 1250);
    createCoin(2150, 1200);
    
    createCoin(750, 650);
    createCoin(1050, 550);
    createCoin(1350, 600);
    createCoin(1650, 550);
    
    // Special high-value coins in hard-to-reach areas
    createSpecialCoin(1150, 300);
    createSpecialCoin(1750, 200);
    createSpecialCoin(2650, 50);
    
    // Create enemies in specific positions with specific behaviors
    createEnemy(600, 1750, 1, 1.5);  // Ground patrol
    createEnemy(1200, 1650, -1, 2);  // Platform patrol
    createEnemy(1400, 1200, 1, 2.5); // Platform patrol
    createEnemy(1850, 1600, -1, 1);  // Platform patrol
    createEnemy(2000, 1400, 1, 1.8); // Platform patrol
    createEnemy(1300, 600, -1, 1.5); // High platform patrol
    createEnemy(1850, 500, 1, 2);    // High platform patrol
    createEnemy(1000, 500, -1, 1);   // High platform patrol
    
    // Create hearts at strategic locations
    createHeart(300, 1550);   // Near start
    createHeart(980, 1200);   // In middle area
    createHeart(1850, 1550);  // In right area
    createHeart(2500, 150);   // In secret area
    createHeart(900, 350);    // In top area
}

// Create a single platform
function createPlatform(x, y, width, height) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = x + 'px';
    platform.style.top = y + 'px';
    platform.style.width = width + 'px';
    platform.style.height = height + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(platform);
    
    platforms.push({
        element: platform,
        x,
        y,
        width,
        height
    });
}

// Create a single coin
function createCoin(x, y) {
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = x + 'px';
    coin.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(coin);
    
    coins.push({
        element: coin,
        x,
        y,
        width: 20,
        height: 20,
        collected: false,
        special: false
    });
}

// Create a special high-value coin
function createSpecialCoin(x, y) {
    const coin = document.createElement('div');
    coin.className = 'coin special-coin';
    coin.style.left = x + 'px';
    coin.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(coin);
    
    coins.push({
        element: coin,
        x,
        y,
        width: 25,
        height: 25,
        collected: false,
        special: true
    });
}

// Create a heart pickup
function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(heart);
    
    hearts.push({
        element: heart,
        x,
        y,
        width: 25,  // Size of heart
        height: 25,
        collected: false
    });
}

// Create a single enemy
function createEnemy(x, y, direction, speed) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = x + 'px';
    enemy.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(enemy);
    
    enemies.push({
        element: enemy,
        x,
        y,
        width: 30,
        height: 30,
        direction,
        speed,
        initialX: x // Store initial position for patrol behavior
    });
}

// Handle keydown events
function handleKeyDown(e) {
    if (game.isGameOver) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.isMovingLeft = true;
        player.facingDirection = -1;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.isMovingRight = true;
        player.facingDirection = 1;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        // If we can jump immediately, do so
        if (!player.isJumping && (Date.now() - player.lastOnGround < config.coyoteTime)) {
            jump();
        } else {
            // Otherwise, buffer the jump
            player.jumpBuffered = true;
            player.jumpBufferTimestamp = Date.now();
        }
    }
}

// Handle keyup events
function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.isMovingLeft = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.isMovingRight = false;
    }
}

// Player jump function
function jump() {
    // Add a small vertical impulse before the jump for better feel
    player.y -= 3;
    player.velocityY = -config.jumpForce;
    player.isJumping = true;
    player.jumpBuffered = false;
    
    // Add a small speed boost in the direction of movement for better control
    if (player.isMovingRight) {
        player.velocityX += 2;
    } else if (player.isMovingLeft) {
        player.velocityX -= 2;
    }
}

// Update player position and appearance
function updatePlayerPosition() {
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    
    // Visual feedback for movement direction
    if (player.facingDirection === -1) {
        player.element.style.borderRadius = '5px 15px 5px 5px';
    } else {
        player.element.style.borderRadius = '15px 5px 5px 5px';
    }
    
    // Visual feedback for jumping
    if (player.isJumping) {
        player.element.style.height = '35px';
        player.element.style.marginTop = '5px';
    } else {
        player.element.style.height = '40px';
        player.element.style.marginTop = '0px';
    }
    
    // Visual feedback for invulnerability
    if (player.isInvulnerable) {
        player.element.style.opacity = Math.sin(Date.now() / 50) * 0.5 + 0.5; // Flashing effect
    } else {
        player.element.style.opacity = 1;
    }
}

// Update enemy positions with better boundary checking for the larger world
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.direction * enemy.speed;
        
        // Better boundary checking for limited patrol areas
        // Each enemy patrols a specific area rather than the entire world
        const patrolDistance = 200;
        const initialX = enemy.initialX || enemy.x;
        
        if (!enemy.initialX) {
            enemy.initialX = enemy.x;
        }
        
        if (enemy.x <= initialX - patrolDistance || enemy.x >= initialX + patrolDistance) {
            enemy.direction *= -1;
        }
        
        enemy.element.style.left = enemy.x + 'px';
        enemy.element.style.top = enemy.y + 'px';
    });
}

// Update hearts animation
function updateHearts() {
    const currentTime = Date.now();
    hearts.forEach(heart => {
        if (!heart.collected) {
            // Simple floating animation
            heart.element.style.transform = `translateY(${Math.sin(currentTime / 500) * 5}px)`;
        }
    });
}

// Update camera position to follow player
function updateCamera() {
    // Target position is centered on the player
    game.camera.targetX = player.x - (config.viewportWidth / 2) + (player.width / 2);
    game.camera.targetY = player.y - (config.viewportHeight / 2) + (player.height / 2);
    
    // Camera boundaries
    if (game.camera.targetX < 0) game.camera.targetX = 0;
    if (game.camera.targetX > config.worldWidth - config.viewportWidth) {
        game.camera.targetX = config.worldWidth - config.viewportWidth;
    }
    if (game.camera.targetY < 0) game.camera.targetY = 0;
    if (game.camera.targetY > config.worldHeight - config.viewportHeight) {
        game.camera.targetY = config.worldHeight - config.viewportHeight;
    }
    
    // Smooth camera follow
    game.camera.x += (game.camera.targetX - game.camera.x) * 0.1;
    game.camera.y += (game.camera.targetY - game.camera.y) * 0.1;
    
    // Apply camera position to game area
    document.getElementById('game-world').style.transform = 
        `translate(${-game.camera.x}px, ${-game.camera.y}px)`;
}

// Check collisions
function checkCollisions() {
    // Player with platforms
    let onPlatform = false;
    platforms.forEach(platform => {
        // Improved collision detection
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height <= platform.y + 5 &&  // Added small threshold
            player.y + player.height + player.velocityY >= platform.y - 5 &&  // Added small threshold
            player.velocityY >= 0  // Only collide when falling down
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onPlatform = true;
            player.lastOnGround = Date.now(); // Update last time on ground
        }
    });
    
    if (!onPlatform && player.velocityY >= 0) {
        player.isJumping = true;
    }
    
    // Player with coins
    coins.forEach(coin => {
        if (
            !coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y
        ) {
            collectCoin(coin);
        }
    });
    
    // Player with hearts
    hearts.forEach(heart => {
        if (
            !heart.collected &&
            player.x < heart.x + heart.width &&
            player.x + player.width > heart.x &&
            player.y < heart.y + heart.height &&
            player.y + player.height > heart.y
        ) {
            collectHeart(heart);
        }
    });
    
    // Player with enemies (only if not invulnerable)
    if (!player.isInvulnerable) {
        enemies.forEach(enemy => {
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                hitEnemy();
            }
        });
    }
    
    // Check if player fell off the bottom
    checkWorldBoundaries();
}

// Check if player fell off the bottom of the world
function checkWorldBoundaries() {
    if (player.y > config.worldHeight) {
        loseLife();
        resetPlayerPosition();
    }
}

// Collect coin
function collectCoin(coin) {
    coin.collected = true;
    coin.element.style.display = 'none';
    
    // Special coins are worth more points
    if (coin.special) {
        game.score += 50;
    } else {
        game.score += 10;
    }
    
    document.getElementById('score').textContent = game.score;
}

// Collect heart
function collectHeart(heart) {
    heart.collected = true;
    heart.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(heart.x, heart.y, 'heart');
    
    // Gain life if below maximum
    if (game.lives < config.maxLives) {
        game.lives++;
        document.getElementById('lives').textContent = game.lives;
        
        // Show notification
        showNotification("+1 Life!");
    } else {
        // Bonus points if at max lives
        game.score += 100;
        document.getElementById('score').textContent = game.score;
        
        // Show notification
        showNotification("+100 Points!");
    }
}

// Create pickup effect
function createPickupEffect(x, y, type) {
    const effect = document.createElement('div');
    effect.className = `effect ${type}-pickup`;
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(effect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 500);
}

// Show notification
function showNotification(message) {
    // Check if notification element exists
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.getElementById('game').appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = 'show';
    
    // Hide notification after delay
    setTimeout(() => {
        notification.className = '';
    }, 2000);
}

// Hit enemy
function hitEnemy() {
    loseLife();
    
    // Make player temporarily invulnerable
    player.isInvulnerable = true;
    player.invulnerableTimer = Date.now();
    
    // Knockback effect
    player.velocityY = -8;
    player.velocityX = player.facingDirection * -10;
    player.isJumping = true;
}

// Lose a life
function loseLife() {
    game.lives--;
    document.getElementById('lives').textContent = game.lives;
    
    if (game.lives <= 0) {
        gameOver();
    } else {
        // Show notification
        showNotification("Ouch!");
    }
}

// Reset player position
function resetPlayerPosition() {
    player.x = 150;
    player.y = 1500; // Reset to starting position
    player.velocityX = 0;
    player.velocityY = 0;
}

// Game over
function gameOver() {
    game.isGameOver = true;
    
    // Create game over message
    const gameOverMsg = document.createElement('div');
    gameOverMsg.style.position = 'absolute';
    gameOverMsg.style.top = '50%';
    gameOverMsg.style.left = '50%';
    gameOverMsg.style.transform = 'translate(-50%, -50%)';
    gameOverMsg.style.fontSize = '48px';
    gameOverMsg.style.color = 'white';
    gameOverMsg.style.textShadow = '2px 2px 4px #000';
    gameOverMsg.style.zIndex = '100';
    gameOverMsg.textContent = 'GAME OVER';
    
    const restartMsg = document.createElement('div');
    restartMsg.style.fontSize = '24px';
    restartMsg.style.marginTop = '20px';
    restartMsg.style.textAlign = 'center';
    restartMsg.textContent = 'Refresh the page to play again';
    
    gameOverMsg.appendChild(restartMsg);
    document.getElementById('game').appendChild(gameOverMsg);
}

// Game update function
function update() {
    if (game.isGameOver) return;
    
    // Apply player movement with different air/ground control
    const controlFactor = player.isJumping ? config.airControl : 1;
    
    if (player.isMovingLeft) {
        player.velocityX -= config.playerSpeed * controlFactor;
    }
    if (player.isMovingRight) {
        player.velocityX += config.playerSpeed * controlFactor;
    }
    
    // Apply maximum speed limit
    if (player.velocityX > config.maxSpeed) {
        player.velocityX = config.maxSpeed;
    } else if (player.velocityX < -config.maxSpeed) {
        player.velocityX = -config.maxSpeed;
    }
    
    // Apply physics
    player.velocityX *= config.friction;
    player.velocityY += config.gravity;
    
    // Apply tiny minimum threshold to stop completely
    if (Math.abs(player.velocityX) < 0.1) {
        player.velocityX = 0;
    }
    
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Process jump buffer if player just landed
    if (!player.isJumping && player.jumpBuffered) {
        if (Date.now() - player.jumpBufferTimestamp < config.jumpBufferTime) {
            jump();
        }
        player.jumpBuffered = false;
    }
    
    // Check invulnerability timeout
    if (player.isInvulnerable && Date.now() - player.invulnerableTimer > 1500) {
        player.isInvulnerable = false;
    }
    
    // Boundary checking for the world edges
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x > config.worldWidth - player.width) {
        player.x = config.worldWidth - player.width;
        player.velocityX = 0;
    }
    
    // Update positions
    updatePlayerPosition();
    updateEnemies();
    updateHearts();
    
    // Check for collisions
    checkCollisions();
}

// Game loop
function gameLoop() {
    update();
    updateCamera();
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);