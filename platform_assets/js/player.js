import config from './config.js';

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
    isInvulnerable: false,     // Invulnerability state after being hit
    invulnerableTimer: 0,      // Timer for invulnerability
    
    // Double jump ability
    canDoubleJump: false,      // Whether player has collected the double jump power-up
    hasDoubleJumped: false,    // Whether player has used their double jump
    lastJumpKeyState: false,   // Track if jump key was pressed last frame
    
    // Dash ability
    canDash: false,            // Whether player has collected the dash power-up
    isDashing: false,          // Whether player is currently dashing
    dashCooldown: 0,           // Cooldown timer for dash
    dashDuration: 0,           // Duration timer for current dash
    dashDirection: 1           // Direction of dash
};

// Handle keydown events
function handleKeyDown(e) {
    if (window.game.isGameOver) return;

    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        window.player.isMovingLeft = true;
        window.player.facingDirection = -1;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        window.player.isMovingRight = true;
        window.player.facingDirection = 1;
    }
    
    // Jump key pressed
    const jumpKeyPressed = (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ');
    
    if (jumpKeyPressed) {
        const currentKeyState = true;
        
        // Regular jump - we're on the ground or in coyote time
        if (!window.player.isJumping && (Date.now() - window.player.lastOnGround < config.coyoteTime)) {
            jump();
        }
        // CRITICAL FIX: Double jump - use window.player object directly
        else if (window.player.canDoubleJump && 
                 window.player.isJumping && 
                 !window.player.hasDoubleJumped && 
                 !window.player.isDashing && 
                 !window.player.lastJumpKeyState) {
            doubleJump();
        }
        // Otherwise, buffer the jump
        else if (!window.player.lastJumpKeyState) {
            window.player.jumpBuffered = true;
            window.player.jumpBufferTimestamp = Date.now();
        }
        
        // Update last key state
        window.player.lastJumpKeyState = currentKeyState;
    }
    
    // CRITICAL FIX: Dash - use window.player object directly and add support for more keys
    if ((e.key === 'Shift' || e.key === 's') && 
        window.player.canDash && 
        !window.player.isDashing && 
        Date.now() > window.player.dashCooldown) {
        dash();
    }
}

// Player double jump function
function doubleJump() {
    // CRITICAL FIX: Use window.player directly
    window.player.velocityY = -config.jumpForce * 0.8; // Slightly weaker than normal jump
    window.player.hasDoubleJumped = true;
    
    // Create visual effect for double jump
    createDoubleJumpEffect();
    
    // Add a small speed boost in the direction of movement
    if (window.player.isMovingRight) {
        window.player.velocityX += 1.5;
    } else if (window.player.isMovingLeft) {
        window.player.velocityX -= 1.5;
    }
}

// Player dash function
function dash() {
    // CRITICAL FIX: Use window.player directly
    window.player.isDashing = true;
    window.player.dashDuration = Date.now() + 200; // Dash lasts 200ms
    window.player.dashDirection = window.player.facingDirection;
    
    // Set cooldown for next dash
    window.player.dashCooldown = Date.now() + 1000; // 1 second cooldown
    
    // Create visual effect for dash
    createDashEffect();
}

// Make all necessary functions globally available
window.player = player;  // Ensure player object is globally available
window.doubleJump = doubleJump;
window.dash = dash;


// Handle keyup events
function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.isMovingLeft = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.isMovingRight = false;
    }
    
    // Track when jump key is released
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        player.lastJumpKeyState = false;
    }
}

// Player jump function
function jump() {
    // Add a small vertical impulse before the jump for better feel
    player.y -= 3;
    player.velocityY = -config.jumpForce;
    player.isJumping = true;
    player.jumpBuffered = false;
    player.hasDoubleJumped = false; // Reset double jump when regular jumping
    
    // Add a small speed boost in the direction of movement for better control
    if (player.isMovingRight) {
        player.velocityX += 2;
    } else if (player.isMovingLeft) {
        player.velocityX -= 2;
    }
}



// Create double jump visual effect
function createDoubleJumpEffect() {
    // Create a circular effect at player's position
    const effect = document.createElement('div');
    effect.className = 'effect double-jump-effect';
    effect.style.left = (player.x + player.width / 2 - 40) + 'px';
    effect.style.top = (player.y + player.height / 2 - 40) + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(effect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 400);
}

// Create dash visual effect
function createDashEffect() {
    // Create a trail effect behind the player
    const effect = document.createElement('div');
    effect.className = 'effect dash-effect';
    effect.style.left = (player.x - player.facingDirection * 20) + 'px';
    effect.style.top = player.y + 'px';
    effect.style.width = (player.width + 40) + 'px';
    effect.style.height = player.height + 'px';
    
    const gameElement = document.getElementById('game-world');
    gameElement.appendChild(effect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 300);
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
    
    // Visual feedback for dashing
    if (player.isDashing) {
        player.element.style.boxShadow = `0 0 10px 5px rgba(0, 255, 255, 0.8)`;
        player.element.style.backgroundColor = '#00FFFF';
    } else {
        player.element.style.boxShadow = '0 3px 5px rgba(0, 0, 0, 0.3)';
        player.element.style.backgroundColor = '#FF5252';
    }
    
    // Visual indicator for double jump availability
    if (player.canDoubleJump && !player.hasDoubleJumped && player.isJumping) {
        player.element.style.border = '2px solid rgba(255, 255, 255, 0.7)';
    } else {
        player.element.style.border = 'none';
    }
}

// Reset player position
function resetPlayerPosition() {
    // Save the ability states before resetting
    const hadDoubleJump = player.canDoubleJump;
    const hadDash = player.canDash;
    
    player.x = 150;
    player.y = 1500; // Reset to starting position
    player.velocityX = 0;
    player.velocityY = 0;
    
    // Reset jumping state variables
    player.isJumping = false;
    player.hasDoubleJumped = false;
    player.lastJumpKeyState = false;
    
    // End dashing state but preserve the ability
    player.isDashing = false;
    player.dashCooldown = 0; // Reset cooldown on death
    
    // Restore abilities
    player.canDoubleJump = hadDoubleJump;
    player.canDash = hadDash;

}

// Hit enemy
function hitEnemy() {
    // Using window.loseLife instead of directly importing to avoid circular dependencies
    window.loseLife();
    
    // Make player temporarily invulnerable
    player.isInvulnerable = true;
    player.invulnerableTimer = Date.now();
    
    // Knockback effect
    player.velocityY = -8;
    player.velocityX = player.facingDirection * -10;
    player.isJumping = true;
}

// Update player physics
function updatePlayer() {
    if (window.game.isGameOver) return;
    
    // Reset Double Jump when touching ground
    if (!player.isJumping) {
        player.hasDoubleJumped = false;
    }
    
    // Handle dash state
    if (player.isDashing) {
        if (Date.now() < player.dashDuration) {
            // While dashing, maintain high velocity and reduce gravity effect
            player.velocityX = player.dashDirection * 15;
            player.velocityY *= 0.8; // Reduce vertical momentum during dash
        } else {
            // End dash state
            player.isDashing = false;
        }
    } else {
        // Normal movement physics when not dashing
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
    }
    
    // Update position
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
    
    updatePlayerPosition();
}

// Make hitEnemy available globally to avoid circular dependencies
window.hitEnemy = hitEnemy;
window.doubleJump = doubleJump;
window.dash = dash;

export { 
    player,
    handleKeyDown,
    handleKeyUp,
    jump,
    doubleJump,
    dash,
    updatePlayerPosition,
    resetPlayerPosition,
    hitEnemy,
    updatePlayer,
    createDoubleJumpEffect,
    createDashEffect
};