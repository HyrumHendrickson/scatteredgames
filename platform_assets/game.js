// platformer.js

(function() {
    // Get the div where we want to insert the canvas
    const gameContainer = document.getElementById('GAMEHERE');
    if (!gameContainer) {
        console.error('No div with id "GAMEHERE" found.');
        return;
    }

    // Create the canvas element
    const canvas = document.createElement('canvas');
    gameContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let player = {
        x: 50,
        y: 400,
        width: 50,
        height: 50,
        speed: 5,
        dx: 0,
        dy: 0,
        gravity: 0.5,
        jumpPower: -12,
        isJumping: false,
    };

    let platforms = [
        { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 }, // Ground
        { x: 200, y: 400, width: 200, height: 20 },
        { x: 500, y: 300, width: 200, height: 20 },
        { x: 300, y: 150, width: 150, height: 20 },
    ];

    let level = 1;
    let maxLevel = 3;
    let score = 0;

    function drawPlayer() {
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawPlatforms() {
        ctx.fillStyle = 'green';
        platforms.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    }

    function handleKeyPress(event) {
        if (event.key === 'ArrowRight' || event.key === 'd') {
            player.dx = player.speed;
        } else if (event.key === 'ArrowLeft' || event.key === 'a') {
            player.dx = -player.speed;
        } else if ((event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') && !player.isJumping) {
            player.dy = player.jumpPower;
            player.isJumping = true;
        }
    }

    function handleKeyRelease(event) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'd' || event.key === 'a') {
            player.dx = 0;
        }
    }

    function update() {
        // Move the player
        player.x += player.dx;
        player.y += player.dy;

        // Apply gravity
        if (player.y + player.height < canvas.height) {
            player.dy += player.gravity;
        } else {
            player.dy = 0;
            player.isJumping = false;
            player.y = canvas.height - player.height;
        }

        // Check for collision with platforms
        platforms.forEach(platform => {
            if (player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height <= platform.y &&
                player.y + player.height + player.dy >= platform.y) {
                player.dy = 0;
                player.y = platform.y - player.height;
                player.isJumping = false;
            }
        });

        // Check if player reaches the next level
        if (player.x > canvas.width - 50) {
            level++;
            if (level > maxLevel) {
                alert('You won the game!');
                level = 1;
                score = 0;
            }
            resetLevel();
        }

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlatforms();
        drawPlayer();
    }

    function resetLevel() {
        player.x = 50;
        player.y = canvas.height - player.height;
        platforms = generateLevel(level);
    }

    function generateLevel(level) {
        if (level === 1) {
            return [
                { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
                { x: 200, y: 400, width: 200, height: 20 },
            ];
        } else if (level === 2) {
            return [
                { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
                { x: 100, y: 350, width: 300, height: 20 },
                { x: 500, y: 250, width: 200, height: 20 },
            ];
        } else if (level === 3) {
            return [
                { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
                { x: 150, y: 400, width: 200, height: 20 },
                { x: 400, y: 300, width: 200, height: 20 },
                { x: 250, y: 150, width: 200, height: 20 },
            ];
        }
    }

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);

    function gameLoop() {
        update();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
})();
