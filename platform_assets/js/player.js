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
    dashDirection: 1,          // Direction of dash
    
    // Sword ability
    hasSword: false,           // Whether player has collected the sword power-up
    isAttacking: false,        // Whether player is currently attacking
    attackDuration: 0,         // Duration timer for current attack
    attackCooldown: 0,         // Cooldown timer for attack
    attackFrame: 0,            // Current frame of attack animation
    swordElement: null         // Reference to the sword element
};

// Handle keydown events
function handleKeyDown(e) {
    if (window.game.isGameOver) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.isMovingLeft = true;
        player.facingDirection = -1;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.isMovingRight = true;
        player.facingDirection = 1;
    }
    
    // Jump key pressed
    const jumpKeyPressed = (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ');
    
    if (jumpKeyPressed) {
        const currentKeyState = true;
        
        // Regular jump - we're on the ground or in coyote time
        if (!player.isJumping && (Date.now() - player.lastOnGround < config.coyoteTime)) {
            jump();
        }
        // Double jump - only if key was just pressed (not held), player is already jumping,
        // has the ability, and hasn't used the double jump yet
        else if (player.canDoubleJump && 
                 player.isJumping && 
                 !player.hasDoubleJumped && 
                 !player.isDashing && 
                 !player.lastJumpKeyState) {
            doubleJump();
            console.log("Double jump executed");
        }
        // Otherwise, buffer the jump
        else if (!player.lastJumpKeyState) {
            player.jumpBuffered = true;
            player.jumpBufferTimestamp = Date.now();
        }
        
        // Update last key state
        player.lastJumpKeyState = currentKeyState;
    }
    
    // Dash with Shift key
    if ((e.key === 'Shift' || e.key === 's') && 
        player.canDash && 
        !player.isDashing && 
        Date.now() > player.dashCooldown) {
        dash();
        console.log("Dash executed");
    }
    
    // Attack with Z or F key
    if ((e.key === 'z' || e.key === 'f') && 
        player.hasSword && 
        !player.isAttacking && 
        Date.now() > player.attackCooldown) {
        attack();
        console.log("Attack executed");
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

// Player double jump function
function doubleJump() {
    player.velocityY = -config.jumpForce * 0.8; // Slightly weaker than normal jump
    player.hasDoubleJumped = true;
    
    // Create visual effect for double jump
    createDoubleJumpEffect();
    
    // Add a small speed boost in the direction of movement
    if (player.isMovingRight) {
        player.velocityX += 1.5;
    } else if (player.isMovingLeft) {
        player.velocityX -= 1.5;
    }
}

// Player dash function
function dash() {
    player.isDashing = true;
    player.dashDuration = Date.now() + 200; // Dash lasts 200ms
    player.dashDirection = player.facingDirection;
    
    // Set cooldown for next dash
    player.dashCooldown = Date.now() + 1000; // 1 second cooldown
    
    // Create visual effect for dash
    createDashEffect();
}

// Player sword attack function
function attack() {
    player.isAttacking = true;
    player.attackDuration = Date.now() + 300; // Attack lasts 300ms
    player.attackFrame = 0;
    
    // Set cooldown for next attack
    player.attackCooldown = Date.now() + 500; // 0.5 second cooldown
    
    // Create visual effect for attack
    window.createSwordAttackEffect();
    
    // Check for enemy hits
    checkSwordHits();
}

// Check if sword hits any enemies
function checkSwordHits() {
    // Attack range
    const attackRange = 50;
    
    // Calculate attack area based on player position and facing direction
    const attackX = player.facingDirection === 1 ? player.x + player.width : player.x - attackRange;
    const attackWidth = attackRange;
    
    // Check each enemy for collision with attack area
    window.enemies.forEach(enemy => {
        // Only check non-defeated enemies
        if (!enemy.defeated && 
            attackX < enemy.x + enemy.width &&
            attackX + attackWidth > enemy.x &&
            player.y - 10 < enemy.y + enemy.height &&
            player.y + player.height + 10 > enemy.y) {
            
            // Enemy is hit
            defeatEnemy(enemy);
        }
    });
}

// Defeat an enemy
function defeatEnemy(enemy) {
    enemy.defeated = true;
    
    // Add animation class
    enemy.element.style.animation = 'enemyDeath 0.5s forwards';
    
    // Add score
    window.game.score += 25;
    document.getElementById('score').textContent = window.game.score;
    
    // Show notification
    window.showNotification("+25 Points!");
    
    // Remove enemy after animation
    setTimeout(() => {
        if (enemy.element.parentNode) {
            enemy.element.parentNode.removeChild(enemy.element);
        }
    }, 500);
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
        
        // Change color if attacking
        if (player.isAttacking) {
            player.element.style.backgroundColor = '#FFA500'; // Orange during attack
        } else {
            player.element.style.backgroundColor = '#FF5252'; // Normal red color
        }
    }
    
    // Visual indicator for double jump availability
    if (player.canDoubleJump && !player.hasDoubleJumped && player.isJumping) {
        player.element.style.border = '2px solid rgba(255, 255, 255, 0.7)';
    } else {
        player.element.style.border = 'none';
    }
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

// Reset player position
function resetPlayerPosition() {
    // Save the ability states before resetting
    const hadDoubleJump = player.canDoubleJump;
    const hadDash = player.canDash;
    const hadSword = player.hasSword;
    
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
    
    // End attacking state but preserve the ability
    player.isAttacking = false;
    player.attackCooldown = 0; // Reset cooldown on death
    
    // Restore abilities
    player.canDoubleJump = hadDoubleJump;
    player.canDash = hadDash;
    player.hasSword = hadSword;
    
    console.log("Player reset - Abilities preserved: Double Jump:", player.canDoubleJump, "Dash:", player.canDash, "Sword:", player.hasSword);
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
    
    // Update attack state
    if (player.isAttacking) {
        if (Date.now() < player.attackDuration) {
            // Update attack animation frame
            player.attackFrame = Math.min(6, Math.floor((Date.now() - (player.attackDuration - 300)) / 50));
        } else {
            // End attack state
            player.isAttacking = false;
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

// Make functions globally available
window.player = player;
window.hitEnemy = hitEnemy;
window.doubleJump = doubleJump;
window.dash = dash;
window.attack = attack;
window.defeatEnemy = defeatEnemy;
window.checkSwordHits = checkSwordHits;
window.resetPlayerPosition = resetPlayerPosition;

export { 
    player,
    handleKeyDown,
    handleKeyUp,
    jump,
    doubleJump,
    dash,
    attack,
    updatePlayerPosition,
    resetPlayerPosition,
    hitEnemy,
    defeatEnemy,
    checkSwordHits,
    updatePlayer,
    createDoubleJumpEffect,
    createDashEffect
};