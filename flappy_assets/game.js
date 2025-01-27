// flappybird.js

(function() {
    const gameContainer = document.getElementById('GAMEHERE');
    if (!gameContainer) {
        console.error('No div with id "GAMEHERE" found.');
        return;
    }

    const canvas = document.createElement('canvas');
    gameContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const canvasWidth = 400;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Bird object
    let bird = {
        x: 50,
        y: 150,
        width: 40,
        height: 40,
        velocity: 0,
        gravity: 0.2, // Slower gravity to reduce falling speed
        lift: -7, // Reduced flap strength to make it slower
        draw() {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y + this.height > canvasHeight) {
                this.y = canvasHeight - this.height;
                this.velocity = 0;
            }
        },
        flap() {
            this.velocity = this.lift;
        },
    };

    // Pipes
    let pipes = [];
    const pipeWidth = 50;
    const pipeGap = 350; // Increase gap for more space between pipes
    let pipeFrequency = 180; // Slow down pipe frequency (higher means slower)
    let pipeSpeed = 1.5; // Slower pipe movement speed

    function generatePipe() {
        const topPipeHeight = Math.floor(Math.random() * (canvasHeight - pipeGap));
        const bottomPipeHeight = canvasHeight - topPipeHeight - pipeGap;

        pipes.push({
            x: canvasWidth,
            topHeight: topPipeHeight,
            bottomHeight: bottomPipeHeight,
        });
    }

    function drawPipes() {
        ctx.fillStyle = 'green';
        pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            // Bottom pipe
            ctx.fillRect(pipe.x, canvasHeight - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
        });
    }

    function updatePipes() {
        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
        });

        // Remove pipes that have gone off the screen
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    }

    function checkCollisions() {
        // Check for collision with the pipes
        for (let pipe of pipes) {
            if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
                if (bird.y < pipe.topHeight || bird.y + bird.height > canvasHeight - pipe.bottomHeight) {
                    gameOver();
                    return;
                }
            }
        }

        // Check for collision with the ground
        if (bird.y + bird.height > canvasHeight) {
            gameOver();
        }
    }

    function gameOver() {
        cancelAnimationFrame(gameLoopId);
        alert('Game Over! Press OK to restart.');
        restartGame();
    }

    function restartGame() {
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        pipeFrequency = 180;
        pipeSpeed = 1.5;
        gameLoop();
    }

    // Input handling
    window.addEventListener('keydown', event => {
        if (event.key === ' ') {
            bird.flap();
        }
    });

    // Draw everything
    function draw() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        bird.draw();
        drawPipes();
    }

    // Update game state
    function update() {
        bird.update();
        updatePipes();
        checkCollisions();
    }

    // Game Loop
    let gameLoopId;

    function gameLoop() {
        draw();
        update();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // Generate pipes at regular intervals
    setInterval(generatePipe, pipeFrequency);

    // Start the game
    gameLoop();
})();
