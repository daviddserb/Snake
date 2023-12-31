const GRID = document.getElementById("grid");
const GRID_HEIGHT = 20, GRID_WIDTH = 15;
var squaresMatrix = Array(GRID_WIDTH).fill().map(() => Array(GRID_HEIGHT).fill());

// Snake initial position - snakeArray is an array of objects, and each object contains 2 properties
var snakeArray = [{lineS: 7, colS: 5}, {lineS: 7, colS: 6}, {lineS: 7, colS: 7}];
var snakeDirection = "standing";
const SNAKE_SPEED = 100;

const GAME_STATUS = document.getElementById("gameStatus");
var isGameLost = false;

const SCORE = document.getElementById("score");
var cntApples = 0;

const PAUSE_BUTTON = document.getElementById("pauseButton");
var isGamePaused = false;

let gameInterval; // Declare a variable to store the interval identifier

function generateBoard() {
    // Create the squares
	for (let row = 0; row < GRID_WIDTH; ++row) {
		for (let col = 0; col < GRID_HEIGHT; ++col) {
			let square = document.createElement("div");
		    GRID.appendChild(square); // Add the square to the grid

		    // Snake initial position
		    if (row == 7 && col >= 5 && col <= 7) square.classList.add("snake");

		    /// First apple initial position
		    if (row == 7 && col == 16) square.classList.add("apple");

		    squaresMatrix[row][col] = square;
		}
	}
}

function setSnakeDirection(e) {
	if (isGamePaused) return;

	let arrow = e.code;

	if (snakeDirection === "standing" && (arrow === "ArrowUp" || arrow === "ArrowRight" || arrow === "ArrowDown")) {
		gameInterval = setInterval(snakeMove, SNAKE_SPEED); // Start the game
		PAUSE_BUTTON.style.display = "inline-block"; // Show the Pause button
	}

	if (arrow == "ArrowLeft" && snakeDirection != "standing" && snakeDirection != "right") {
		snakeDirection = "left";
	} else if (arrow == "ArrowUp" && snakeDirection != "down") {
		snakeDirection = "up";
	} else if (arrow == "ArrowRight" && snakeDirection != "left") {
		snakeDirection = "right";
	} else if (arrow == "ArrowDown" && snakeDirection != "up") {
		snakeDirection = "down";
	}
}

// Snake moves means - remove tail and increase head
function snakeMove() {
	if (isGameLost == true || didSnakeWin() == true) return;

  	let snakeTailLine = snakeArray[0].lineS;
	let snakeTailCol = snakeArray[0].colS;

	// Remove snake tail
	squaresMatrix[snakeTailLine][snakeTailCol].classList.remove("snake");
	snakeArray.shift();

	let snakeHeadLine = snakeArray[snakeArray.length - 1].lineS;
	let snakeHeadCol = snakeArray[snakeArray.length - 1].colS;

	if (snakeDirection == "down") {
		++snakeHeadLine;
		// if snake hits bottom border => restart from top
		if (snakeHeadLine == GRID_WIDTH) snakeHeadLine = 0;
	} else if (snakeDirection == "up") {
		--snakeHeadLine;
		//if snake hits top border => restart from bottom
		if (snakeHeadLine == -1) snakeHeadLine = GRID_WIDTH - 1;
	} else if (snakeDirection == "right") {
		++snakeHeadCol;
		//if snake hits right border => restart from left
		if (snakeHeadCol == GRID_HEIGHT) snakeHeadCol = 0;
	} else {
		--snakeHeadCol;
		//if snake hits left border => restart from right
		if (snakeHeadCol == -1) snakeHeadCol = GRID_HEIGHT - 1;
	}

	// Increase snake head
	snakeArray.push({lineS: snakeHeadLine, colS: snakeHeadCol});
	if (didSnakeHitItself() == false) {
		squaresMatrix[snakeHeadLine][snakeHeadCol].classList.add("snake");
		didSnakeEatApple(snakeHeadLine, snakeHeadCol, snakeTailLine, snakeTailCol);
	}
}

function didSnakeHitItself() {
    for (let row = 0; row < snakeArray.length; ++row) {
		for (let col = row + 1; col < snakeArray.length; ++col) {
			if (snakeArray[row].lineS == snakeArray[col].lineS && snakeArray[row].colS == snakeArray[col].colS) {
                isGameLost = true;
                gameFinished();
			}
		}
	}
	return false;
}

// If Snake eat apple => increase snake tail
function didSnakeEatApple(snakeHeadLine, snakeHeadCol, snakeTailLine, snakeTailCol) {
	if (squaresMatrix[snakeHeadLine][snakeHeadCol].classList.contains("snake") && squaresMatrix[snakeHeadLine][snakeHeadCol].classList.contains("apple")) {
		squaresMatrix[snakeHeadLine][snakeHeadCol].classList.remove("apple")

		squaresMatrix[snakeTailLine][snakeTailCol].classList.add("snake");
		snakeArray.unshift({lineS: snakeTailLine, colS: snakeTailCol});

		eatAppleSound()
		
		SCORE.innerHTML = ++cntApples;
		if (didSnakeWin() == false) spawnNewApple();
	}
}

function eatAppleSound() {
	var eatAppleSound = document.getElementById("eatAppleSound");
	eatAppleSound.play();
}

function spawnNewApple() {
    let availablePositions = [];

    for (let row = 0; row < GRID_WIDTH; ++row) {
        for (let col = 0; col < GRID_HEIGHT; ++col) {
            if (!squaresMatrix[row][col].classList.contains("snake")) {
                availablePositions.push({ row, col });
            }
        }
    }

    if (availablePositions.length > 0) {
        let randomIndex = Math.floor(Math.random() * availablePositions.length);
        let { row, col } = availablePositions[randomIndex];
        squaresMatrix[row][col].classList.add("apple");
    }
}

function didSnakeWin() {
	const snakeInitialDimension = 3;

	if (snakeArray.length == GRID_WIDTH * GRID_HEIGHT - snakeInitialDimension) {
        gameFinished();
	}
	return false;
}

function gameFinished() {
    clearInterval(gameInterval);
    printStatusGame();
    clearPauseButton();
    return true;
}

function togglePause() {	
    isGamePaused = !isGamePaused;

	PAUSE_BUTTON.innerHTML = isGamePaused ? "▶" : "||";

    PAUSE_BUTTON.classList.toggle("pause", isGamePaused);
    PAUSE_BUTTON.classList.toggle("resume", !isGamePaused);

    if (isGamePaused) clearInterval(gameInterval);
    else gameInterval = setInterval(snakeMove, SNAKE_SPEED);
}

function clearPauseButton() {
	PAUSE_BUTTON.style.display = "none";
}

function printStatusGame() {
	GAME_STATUS.innerHTML = isGameLost ? "GAME OVER! YOU LOST!" : "CONGRATULATIONS! YOU WON!";
}

generateBoard();