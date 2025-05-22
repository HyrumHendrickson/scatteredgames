import config from './config.js';
import { player, handleKeyDown, handleKeyUp, updatePlayer, resetPlayerPosition } from './player.js';
import { createMap, createGameObjects, updateEnemies, checkCollisions } from './objects.js';
import { createAllPowerups, updatePowerups, showNotification } from './powerups.js';

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

// Make game state and functions accessible globally
window.game = game;
window.loseLife = loseLife;
window.resetPlayerPosition = resetPlayerPosition;

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
    
    // Initialize game elements
    createMap();
    createGameObjects();
    createAllPowerups();
    
    // Create abilities HUD
    createAbilitiesHUD();
    
    // Set player initial position
    player.x = 150;
    player.y = 1500;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Event listeners for player controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Reset game state
    game.score = 0;
    game.lives = 3;
    game.isGameOver = false;
    
    // Reset player abilities at game start
    player.canDoubleJump = false;
    player.hasDoubleJumped = false;
    player.canDash = false;
    player.isDashing = false;
    player.hasSword = false;
    player.isAttacking = false;
    player.lastJumpKeyState = false;
    
    // Update score and lives display
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    
    // Start game loop
    gameLoop();
}

// Create abilities HUD
function createAbilitiesHUD() {
    const abilitiesHUD = document.createElement('div');
    abilitiesHUD.className = 'abilities-hud';
    
    // Double jump icon
    const doubleJumpIcon = document.createElement('div');
    doubleJumpIcon.id = 'double-jump-icon';
    doubleJumpIcon.className = 'ability-icon double-jump-icon';
    doubleJumpIcon.textContent = '↑↑';
    abilitiesHUD.appendChild(doubleJumpIcon);
    
    // Dash icon
    const dashIcon = document.createElement('div');
    dashIcon.id = 'dash-icon';
    dashIcon.className = 'ability-icon dash-icon';
    dashIcon.textContent = '→';
    
    // Cooldown overlay for dash
    const dashCooldown = document.createElement('div');
    dashCooldown.id = 'dash-cooldown';
    dashCooldown.className = 'cooldown-overlay';
    dashCooldown.style.height = '0%';
    dashIcon.appendChild(dashCooldown);
    
    abilitiesHUD.appendChild(dashIcon);
    
    // Sword icon
    const swordIcon = document.createElement('div');
    swordIcon.id = 'sword-icon';
    swordIcon.className = 'ability-icon sword-icon';
    swordIcon.textContent = '⚔️';
    
    // Cooldown overlay for sword
    const swordCooldown = document.createElement('div');
    swordCooldown.id = 'sword-cooldown';
    swordCooldown.className = 'cooldown-overlay';
    swordCooldown.style.height = '0%';
    swordIcon.appendChild(swordCooldown);
    
    abilitiesHUD.appendChild(swordIcon);
    
    document.getElementById('game').appendChild(abilitiesHUD);
}

// Update abilities HUD
function updateAbilitiesHUD() {
    // Make sure DOM elements exist
    const doubleJumpIcon = document.getElementById('double-jump-icon');
    const dashIcon = document.getElementById('dash-icon');
    const dashCooldown = document.getElementById('dash-cooldown');
    const swordIcon = document.getElementById('sword-icon');
    const swordCooldown = document.getElementById('sword-cooldown');
    
    if (!doubleJumpIcon || !dashIcon || !dashCooldown || !swordIcon || !swordCooldown) {
        console.error("HUD elements not found!");
        return;
    }
    
    // Update double jump icon - use window.player
    if (window.player.canDoubleJump) {
        doubleJumpIcon.classList.add('active');
        
        // Show if double jump is available while in air
        if (window.player.isJumping && !window.player.hasDoubleJumped) {
            doubleJumpIcon.style.animation = 'pulse 1s infinite';
        } else {
            doubleJumpIcon.style.animation = 'none';
        }
    } else {
        doubleJumpIcon.classList.remove('active');
    }
    
    // Update dash icon - use window.player
    if (window.player.canDash) {
        dashIcon.classList.add('active');
        
        // Show cooldown
        if (window.player.dashCooldown > Date.now()) {
            const cooldownPercentage = (window.player.dashCooldown - Date.now()) / 1000; // 1 second cooldown
            dashCooldown.style.height = `${Math.min(100, cooldownPercentage * 100)}%`;
        } else {
            dashCooldown.style.height = '0%';
        }
    } else {
        dashIcon.classList.remove('active');
    }
    
    // Update sword icon - use window.player
    if (window.player.hasSword) {
        swordIcon.classList.add('active');
        
        // Show cooldown
        if (window.player.attackCooldown > Date.now()) {
            const cooldownPercentage = (window.player.attackCooldown - Date.now()) / 500; // 0.5 second cooldown
            swordCooldown.style.height = `${Math.min(100, cooldownPercentage * 100)}%`;
        } else {
            swordCooldown.style.height = '0%';
        }
        
        // Highlight when attacking
        if (window.player.isAttacking) {
            swordIcon.style.boxShadow = '0 0 10px 5px rgba(255, 215, 0, 0.8)';
        } else {
            swordIcon.style.boxShadow = 'none';
        }
    } else {
        swordIcon.classList.remove('active');
    }
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

// Game update function - calls all other update functions
function update() {
    if (game.isGameOver) return;
    
    updatePlayer();
    updateEnemies();
    updatePowerups();
    updateAbilitiesHUD();
    checkCollisions();
}

// Game loop
function gameLoop() {
    update();
    updateCamera();
    requestAnimationFrame(gameLoop);
}

// Export functions for use in other modules
export {
    game,
    init,
    updateCamera,
    loseLife,
    gameOver,
    update,
    gameLoop,
    createAbilitiesHUD,
    updateAbilitiesHUD
};

// Start the game when page loads
window.addEventListener('load', init);