import config from './config.js';
import { player } from './player.js';

// Arrays to store power-ups
const hearts = [];
const doubleJumps = []; // Array for double jump power-ups
const dashes = [];      // Array for dash power-ups

// Make them accessible globally
window.hearts = hearts;
window.doubleJumps = doubleJumps;
window.dashes = dashes;

// Create a heart pickup
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
    
    // Give double jump ability - ensure we're modifying the global player object
    window.player.canDoubleJump = true;
    
    // Show notification
    showNotification("Double Jump Activated!");
    console.log("Double Jump collected - player.canDoubleJump =", window.player.canDoubleJump);
    
    // Add score bonus
    window.game.score += 30;
    document.getElementById('score').textContent = window.game.score;
    
    // FIX: Don't call updateAbilitiesHUD directly from here
    // It will be updated in the game loop
}

// Collect dash
function collectDash(dash) {
    dash.collected = true;
    dash.element.style.display = 'none';
    
    // Create a pickup effect
    createPickupEffect(dash.x, dash.y, 'dash');
    
    // Give dash ability - ensure we're modifying the global player object
    window.player.canDash = true;
    window.player.dashCooldown = 0;
    
    // Show notification
    showNotification("Dash Activated!");
    console.log("Dash collected - player.canDash =", window.player.canDash);
    
    // Add score bonus
    window.game.score += 30;
    document.getElementById('score').textContent = window.game.score;
    
    // FIX: Don't call updateAbilitiesHUD directly from here
    // It will be updated in the game loop
}

// Make all necessary functions globally available
window.collectDoubleJump = collectDoubleJump;
window.collectDash = collectDash;


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

// Make functions available globally to avoid circular dependencies
window.collectCoin = collectCoin;
window.collectHeart = collectHeart;
window.collectDoubleJump = collectDoubleJump;
window.collectDash = collectDash;
window.showNotification = showNotification;
window.createPickupEffect = createPickupEffect;

export {
    hearts,
    doubleJumps,
    dashes,
    createHeart,
    createDoubleJump,
    createDash,
    createAllPowerups,
    updatePowerups,
    collectCoin,
    collectHeart,
    collectDoubleJump,
    collectDash,
    createPickupEffect,
    showNotification
};