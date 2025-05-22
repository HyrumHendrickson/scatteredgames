import config from './config.js';
import { player } from './player.js';

// Arrays to store game objects
const platforms = [];
const coins = [];
const enemies = [];

// Make enemies accessible globally
window.enemies = enemies;

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
        initialX: x, // Store initial position for patrol behavior
        defeated: false // Track if enemy has been defeated by the sword
    });
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
}

// Update enemy positions
function updateEnemies() {
    enemies.forEach(enemy => {
        // Skip defeated enemies
        if (enemy.defeated) return;
        
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
            // Use window functions to avoid circular dependencies
            window.collectCoin(coin);
        }
    });
    
    // Player with hearts
    window.hearts.forEach(heart => {
        if (
            !heart.collected &&
            player.x < heart.x + heart.width &&
            player.x + player.width > heart.x &&
            player.y < heart.y + heart.height &&
            player.y + player.height > heart.y
        ) {
            // Use window functions to avoid circular dependencies
            window.collectHeart(heart);
        }
    });
    
    // Player with double jump power-ups
    window.doubleJumps.forEach(doubleJump => {
        if (
            !doubleJump.collected &&
            player.x < doubleJump.x + doubleJump.width &&
            player.x + player.width > doubleJump.x &&
            player.y < doubleJump.y + doubleJump.height &&
            player.y + player.height > doubleJump.y
        ) {
            // Use window functions to avoid circular dependencies
            window.collectDoubleJump(doubleJump);
        }
    });
    
    // Player with dash power-ups
    window.dashes.forEach(dash => {
        if (
            !dash.collected &&
            player.x < dash.x + dash.width &&
            player.x + player.width > dash.x &&
            player.y < dash.y + dash.height &&
            player.y + player.height > dash.y
        ) {
            // Use window functions to avoid circular dependencies
            window.collectDash(dash);
        }
    });
    
    // Player with sword power-ups
    window.swords.forEach(sword => {
        if (
            !sword.collected &&
            player.x < sword.x + sword.width &&
            player.x + player.width > sword.x &&
            player.y < sword.y + sword.height &&
            player.y + player.height > sword.y
        ) {
            // Use window functions to avoid circular dependencies
            window.collectSword(sword);
        }
    });
    
    // Player with enemies (only if not invulnerable)
    if (!player.isInvulnerable) {
        enemies.forEach(enemy => {
            // Skip defeated enemies
            if (enemy.defeated) return;
            
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // Using imported function from player.js
                window.hitEnemy();
            }
        });
    }
    
    // Check if player fell off the bottom
    checkWorldBoundaries();
}

// Check if player fell off the bottom of the world
function checkWorldBoundaries() {
    if (player.y > config.worldHeight) {
        window.loseLife();
        window.resetPlayerPosition();
    }
}

export {
    platforms,
    coins,
    enemies,
    createPlatform,
    createCoin,
    createSpecialCoin,
    createEnemy,
    createMap,
    createGameObjects,
    updateEnemies,
    checkCollisions,
    checkWorldBoundaries
};