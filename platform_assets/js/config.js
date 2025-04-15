// Game configuration
const config = {
    // Physics settings
    gravity: 0.6,
    playerSpeed: 0.8,
    maxSpeed: 8,
    jumpForce: 15,
    friction: 0.92,
    airControl: 0.5,
    
    // Game object counts
    coinCount: 20,
    enemyCount: 10,
    heartCount: 5,        // Number of hearts to place in the world
    maxLives: 5,          // Maximum number of lives player can have
    
    // Jump mechanics
    coyoteTime: 100,      // Time in ms player can jump after leaving platform
    jumpBufferTime: 150,  // Time in ms to buffer jump input
    
    // World and viewport dimensions
    worldWidth: 3000,
    worldHeight: 2000,
    viewportWidth: 800,
    viewportHeight: 500
};

export default config;