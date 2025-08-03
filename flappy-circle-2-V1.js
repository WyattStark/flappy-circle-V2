<script type="text/javascript">
        var gk_isXlsx = false;
        var gk_xlsxFileLookup = {};
        var gk_fileData = {};
        function filledCell(cell) {
          return cell !== '' && cell != null;
        }
        function loadFileData(filename) {
        if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
            try {
                var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];

                // Convert sheet to JSON to filter blank rows
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                // Filter out blank rows (rows where all cells are empty, null, or undefined)
                var filteredData = jsonData.filter(row => row.some(filledCell));

                // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
                var headerRowIndex = filteredData.findIndex((row, index) =>
                  row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
                );
                // Fallback
                if (headerRowIndex === -1 || headerRowIndex > 25) {
                  headerRowIndex = 0;
                }

                // Convert filtered JSON back to CSV
                var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
                csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
                return csv;
            } catch (e) {
                console.error(e);
                return "";
            }
        }
        return gk_fileData[filename] || "";
        }
        </script><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird</title>
    <style>
        canvas {
            border: 2px solid black;
            display: block;
            margin: 0 auto;
            background-color: #87CEEB;
        }
        body {
            text-align: center;
            font-family: Arial, sans-serif;
        }
        #score {
            font-size: 24px;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div id="score">Score: 0</div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const scoreDisplay = document.getElementById('score');

            // Check if canvas context is available
            if (!ctx) {
                console.error('Canvas context not supported!');
                alert('Your browser does not support HTML5 canvas.');
                return;
            }

            // Game objects
            const bird = {
                x: 100,
                y: canvas.height / 2,
                width: 40,
                height: 30,
                velocity: 0,
                gravity: 0.5,
                jump: -10
            };

            let pipes = [];
            let score = 0;
            let gameOver = false;
            const pipeWidth = 50;
            const gap = 150;
            const pipeSpeed = 3;

            // Pipe class
            class Pipe {
                constructor() {
                    this.x = canvas.width;
                    this.gapY = Math.random() * (canvas.height - gap - 200) + 100;
                    this.width = pipeWidth;
                    this.passed = false;
                }

                draw() {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(this.x, 0, this.width, this.gapY);
                    ctx.fillRect(this.x, this.gapY + gap, this.width, canvas.height - this.gapY - gap);
                }

                update() {
                    this.x -= pipeSpeed;
                }
            }

            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !gameOver) {
                    bird.velocity = bird.jump;
                }
                if (e.code === 'Space' && gameOver) {
                    bird.y = canvas.height / 2;
                    bird.velocity = 0;
                    pipes = [];
                    score = 0;
                    scoreDisplay.textContent = `Score: ${score}`;
                    gameOver = false;
                }
            });

            // Game loop
            function gameLoop() {
                if (gameOver) {
                    ctx.fillStyle = 'black';
                    ctx.font = '48px Arial';
                    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
                    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 100, canvas.height / 2 + 60);
                    ctx.fillText('Press Space to Restart', canvas.width / 2 - 150, canvas.height / 2 + 120);
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw start message if score is 0 and game hasn't started
                if (score === 0 && pipes.length === 0) {
                    ctx.fillStyle = 'black';
                    ctx.font = '24px Arial';
                    ctx.fillText('Press Space to Start', canvas.width / 2 - 100, canvas.height / 2);
                }

                // Update and draw bird
                bird.velocity += bird.gravity;
                bird.y += bird.velocity;
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
                ctx.fill();

                // Spawn pipes
                if (Math.random() < 0.015) {
                    pipes.push(new Pipe());
                }

                // Update and draw pipes
                pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
                pipes.forEach(pipe => {
                    pipe.update();
                    pipe.draw();

                    // Check collision
                    if (bird.x + bird.width > pipe.x &&
                        bird.x < pipe.x + pipe.width &&
                        (bird.y < pipe.gapY || bird.y + bird.height > pipe.gapY + gap)) {
                        gameOver = true;
                    }

                    // Score points
                    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                        score += 1;
                        scoreDisplay.textContent = `Score: ${score}`;
                        pipe.passed = true;
                    }
                });

                // Check if bird hits boundaries
                if (bird.y + bird.height > canvas.height || bird.y < 0) {
                    gameOver = true;
                }

                requestAnimationFrame(gameLoop);
            }

            // Start game
            console.log('Game loop started');
            gameLoop();
        });
    </script>
</body>
</html>
