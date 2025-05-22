import config from './config.js';
import { player } from './player.js';

// Arrays to store power-ups
const hearts = [];
const doubleJumps = []; // Array for double jump power-ups
const dashes = [];      // Array for dash power-ups
const swords = [];      // Array for sword power-ups

// Make them accessible globally
window.hearts = hearts;
window.doubleJumps = doubleJumps;
window.dashes = dashes;
window.swords = swords;

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
        width: 40,  // Increased from 25
        height: 40, // Increased from 25
        collected: false
    });
}

// Create a double jump power-up
function createDoubleJump(x, y) {
    const doubleJump = document.createElement('div');
    doubleJump.className = 'double-jump';
    doubleJump.style.left = x + 'px';
    doubleJump.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(doubleJump);
    
    doubleJumps.push({
        element: doubleJump,
        x,
        y,
        width: 30,
        height: 30,
        collected: false
    });
}

// Create a dash power-up
function createDash(x, y) {
    const dash = document.createElement('div');
    dash.className = 'dash';
    dash.style.left = x + 'px';
    dash.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(dash);
    
    dashes.push({
        element: dash,
        x,
        y,
        width: 30,
        height: 30,
        collected: false
    });
}

// Create a sword power-up
function createSword(x, y) {
    const sword = document.createElement('div');
    sword.className = 'sword-powerup';
    sword.style.left = x + 'px';
    sword.style.top = y + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(sword);
    
    swords.push({
        element: sword,
        x,
        y,
        width: 35,
        height: 35,
        collected: false
    });
}

// Create all special powerups
function createAllPowerups() {
    // Create hearts
    createHeart(300, 1550);   // Near start
    createHeart(980, 1200);   // In middle area
    createHeart(1850, 1550);  // In right area
    createHeart(2500, 150);   // In secret area
    createHeart(900, 350);    // In top area
    
    // Create just one double jump power-up (in challenging location)
    createDoubleJump(1200, 750);     // Middle area, higher platform
    
    // Create just one dash power-up (in challenging location)
    createDash(2050, 1200);          // Right area
    
    // Create just one sword power-up (in challenging location)
    createSword(1500, 600);          // Upper middle area
}

// Update all power-ups animation
function updatePowerups() {
    const currentTime = Date.now();
    
    // Update hearts
    hearts.forEach(heart => {
        if (!heart.collected) {
            // Simple floating animation
            heart.element.style.transform = `translateY(${Math.sin(currentTime / 500) * 5}px)`;
        }
    });
    
    // Update double jumps
    doubleJumps.forEach(doubleJump => {
        if (!doubleJump.collected) {
            // Rotate and float animation
            doubleJump.element.style.transform = `translateY(${Math.sin(currentTime / 400) * 5}px) rotate(${currentTime / 20}deg)`;
        }
    });
    
    // Update dashes
    dashes.forEach(dash => {
        if (!dash.collected) {
            // Pulse and float animation
            const scale = 0.9 + Math.sin(currentTime / 300) * 0.2;
            dash.element.style.transform = `translateY(${Math.sin(currentTime / 450) * 3}px) scale(${scale})`;
        }
    });
    
    // Update swords
    swords.forEach(sword => {
        if (!sword.collected) {
            // Rotate and float animation
            sword.element.style.transform = `translateY(${Math.sin(currentTime / 600) * 4}px) rotate(${currentTime / 25}deg)`;
        }
    });
    
    // Update player's sword position if it exists
    if (window.player.hasSword && window.player.swordElement) {
        updatePlayerSword();
    }
}

// Update player's sword position
function updatePlayerSword() {
    const sword = window.player.swordElement;
    
    // Only show sword when attacking
    if (window.player.isAttacking) {
        sword.style.display = 'block';
        
        // Position based on player position and facing direction
        if (window.player.facingDirection === 1) { // Facing right
            sword.style.left = (window.player.x + window.player.width - 5) + 'px';
            sword.style.top = (window.player.y + window.player.height/2 - 4) + 'px';
            sword.style.transform = `rotate(${window.player.attackFrame * 15}deg)`;
        } else { // Facing left
            sword.style.left = (window.player.x - sword.offsetWidth + 5) + 'px';
            sword.style.top = (window.player.y + window.player.height/2 - 4) + 'px';
            sword.style.transform = `rotate(${-window.player.attackFrame * 15}deg) scaleX(-1)`;
        }
    } else {
        sword.style.display = 'none';
    }
}

// Collect coin
function collectCoin(coin) {
    coin.collected = true;
    coin.element.style.display = 'none';
    
    // Special coins are worth more points
    if (coin.special) {
        window.game.score += 50;
        showNotification("+50 Points!");
    } else {
        window.game.score += 10;
    }
    
    document.getElementById('score').textContent = window.game.score;
}

// Collect heart
function collectHeart(heart) {
    heart.collected = true;
    heart.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(heart.x, heart.y, 'heart');
    
    // Gain life if below maximum
    if (window.game.lives < config.maxLives) {
        window.game.lives++;
        document.getElementById('lives').textContent = window.game.lives;
        
        // Show notification
        showNotification("+1 Life!");
    } else {
        // Bonus points if at max lives
        window.game.score += 100;
        document.getElementById('score').textContent = window.game.score;
        
        // Show notification
        showNotification("+100 Points!");
    }
}

// Collect double jump
function collectDoubleJump(doubleJump) {
    doubleJump.collected = true;
    doubleJump.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(doubleJump.x, doubleJump.y, 'double-jump');
    
    // Give double jump ability
    window.player.canDoubleJump = true;
    
    // Show notification
    showNotification("Double Jump Activated!");
    console.log("Double Jump collected - player.canDoubleJump =", window.player.canDoubleJump);
    
    // Add score bonus
    window.game.score += 30;
    document.getElementById('score').textContent = window.game.score;
}

// Collect dash
function collectDash(dash) {
    dash.collected = true;
    dash.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(dash.x, dash.y, 'dash');
    
    // Give dash ability
    window.player.canDash = true;
    window.player.dashCooldown = 0;
    
    // Show notification
    showNotification("Dash Activated!");
    console.log("Dash collected - player.canDash =", window.player.canDash);
    
    // Add score bonus
    window.game.score += 30;
    document.getElementById('score').textContent = window.game.score;
}

// Collect sword
function collectSword(sword) {
    sword.collected = true;
    sword.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(sword.x, sword.y, 'sword');
    
    // Give sword ability
    window.player.hasSword = true;
    
    // Create the player's sword element if it doesn't exist
    if (!document.getElementById('player-sword')) {
        const swordElement = document.createElement('div');
        swordElement.id = 'player-sword';
        swordElement.className = 'player-sword';
        document.getElementById('game-world').appendChild(swordElement);
        window.player.swordElement = swordElement;
    }
    
    // Show notification
    showNotification("Sword Acquired!");
    console.log("Sword collected - player.hasSword =", window.player.hasSword);
    
    // Add score bonus
    window.game.score += 30;
    document.getElementById('score').textContent = window.game.score;
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

// Create sword attack effect
function createSwordAttackEffect() {
    const effect = document.createElement('div');
    effect.className = 'effect sword-attack';
    
    const x = window.player.facingDirection === 1 ? 
        window.player.x + window.player.width : 
        window.player.x - 60;
        
    effect.style.left = x + 'px';
    effect.style.top = (window.player.y - 10) + 'px';
    
    // Flip the effect if facing left
    if (window.player.facingDirection === -1) {
        effect.style.transform = 'scaleX(-1)';
    }
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(effect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 300);
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

// Make functions available globally to avoid circular dependencies
window.collectCoin = collectCoin;
window.collectHeart = collectHeart;
window.collectDoubleJump = collectDoubleJump;
window.collectDash = collectDash;
window.collectSword = collectSword;
window.showNotification = showNotification;
window.createPickupEffect = createPickupEffect;
window.createSwordAttackEffect = createSwordAttackEffect;
window.updatePlayerSword = updatePlayerSword;

export {
    hearts,
    doubleJumps,
    dashes,
    swords,
    createHeart,
    createDoubleJump,
    createDash,
    createSword,
    createAllPowerups,
    updatePowerups,
    collectCoin,
    collectHeart,
    collectDoubleJump,
    collectDash,
    collectSword,
    createPickupEffect,
    showNotification,
    createSwordAttackEffect,
    updatePlayerSword
};