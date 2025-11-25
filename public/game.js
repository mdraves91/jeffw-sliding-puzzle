document.addEventListener('DOMContentLoaded', () => {
    /****************************************************************************
     * DOM ELEMENTS
    ****************************************************************************/
   const boardEl = document.getElementById('game-board');
   const messageEl = document.getElementById('message');
   const moveCounterEl = document.getElementById('move-counter');
   const resetBtn = document.getElementById('reset-btn');
//    const solveBtn = document.getElementById('solve-btn');
   
   /******************************************************************************
    * CONSTANTS & VARIABLES
   ******************************************************************************/
    let TARGET_STATE = [
        'blue', 'red', 'yellow',
        'green', null, 'green',
        'blue', 'red', 'yellow'
    ];
    const SIZE = 9;
    const MIDDLE_CELL_INDEX = 4;
    
    let gameInProgress = true;
    let moveCounter = 0;
    let GAME_STATE = [];
    
    /******************************************************************************
     * GAME STUFF
     ******************************************************************************/
    function initGame() {
        moveCounter = 0;
        boardEl.innerHTML = '';
        
        resetGameState();
        ensureMiddleEmpty(TARGET_STATE)
        ensureMiddleEmpty(GAME_STATE);
        createBoardElements();
        updateBoardGraphics();
    }

    function resetGameState() {
        // Clear the old state
        while(GAME_STATE.length > 0) {
            GAME_STATE.pop();
        }
        
        // shuffle the target state and initial starting states
        TARGET_STATE = shuffle(TARGET_STATE)
        const newState = shuffle(TARGET_STATE);
        
        // Push the shuffled rows into the game state
        GAME_STATE.push(...newState);
    }

    // Fisher-Yates shuffle an input array, and return a copy
    function shuffle(arr) {
        let array = JSON.parse(JSON.stringify(arr));
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    
    /**
     * Ensure the middle cell is empty by swapping it with the empty cell.
     */
    function ensureMiddleEmpty(state) {
        if (state[MIDDLE_CELL_INDEX] !== null) {
            // Find the empty cell and swap it with the middle
            const emptyCellIndex = findEmptyCell(state);
            swapCells(MIDDLE_CELL_INDEX, emptyCellIndex, state);
        }
    }
    
    /**
     * Swap the contents of two cells in the game state.
     * @param {number} cellIndex1 - The index of the first cell.
     * @param {number} cellIndex2 - The index of the second cell.
     * @param {Array} gameState - The game state to swap cells in.
     */
    function swapCells(cellIndex1, cellIndex2, gameState) {
        const temp = gameState[cellIndex1];
        gameState[cellIndex1] = gameState[cellIndex2];
        gameState[cellIndex2] = temp;
    }
    
    /**
     * Find the index of the empty cell in the game state.
     * @returns {number} The index of the empty cell.
     */
    function findEmptyCell(state) {
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            if (state[cellIndex] === null) {
                return cellIndex;
            }
        }
        return null;
    }

    /**
     * Create the board's DOM elements and add them to the board.
     */
    function createBoardElements() {
        // Create the cells, their initial css classes, and add them to the board
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            cellElement.dataset.index = cellIndex;
            cellElement.dataset.target = 'blank';
            cellElement.dataset.current = 'blank';

            if (TARGET_STATE[cellIndex]) {
                cellElement.dataset.target = TARGET_STATE[cellIndex];
            }
            if (GAME_STATE[cellIndex]) {
                cellElement.textContent = GAME_STATE[cellIndex].toUpperCase().charAt(0);
                cellElement.dataset.current = GAME_STATE[cellIndex];
            }
            
            cellElement.onmousedown = (e) => { handleCellClick(e.target.dataset.index); };
            cellElement.ontouchstart = (e) => { handleCellClick(e.target.dataset.index); };
            boardEl.appendChild(cellElement);
        }
    }

    /**
     * Handles a cell click event.
     * @param {number} clickedCellIndex - The index of the clicked cell.
     */
    function handleCellClick(clickedCellIndex) {
        const emptyCellIndex = findEmptyCell(GAME_STATE);
        
        // Check if the clicked cell is adjacent to the empty cell
        // If it is 1, they are adjacent horizontally
        // If it is 3, they are adjacent vertically
        if ((Math.abs(clickedCellIndex - emptyCellIndex) === 1) || Math.abs(clickedCellIndex - emptyCellIndex) === 3) {
            
            // Check if move is valid (no vertical moves in middle column)
            if (clickedCellIndex % 3 === 1 && emptyCellIndex % 3 === 1 && clickedCellIndex !== emptyCellIndex) {
                // Show invalid move feedback
                const cellElement = document.querySelector(`.cell[data-index="${clickedCellIndex}"]`);
                cellElement.classList.add('invalid-move');                
                setTimeout(() => {
                    cellElement.classList.remove('invalid-move');
                }, 400);
                
                return;
            }
            
            swapCells(clickedCellIndex, emptyCellIndex, GAME_STATE);
            moveCounter += gameInProgress ? 1 : 0;
            if (gameInProgress && isGameWon()) {
                messageEl.textContent = `Congratulations! You won in ${moveCounter} moves!`;
                gameInProgress = false;
            }
            updateBoardGraphics();
        }
    }
    
    function updateBoardGraphics() {
        const cellElements = document.querySelectorAll('.cell').values().toArray().sort((a, b) => a.dataset.index - b.dataset.index);
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            const cellElement = cellElements[cellIndex];
                
            if (GAME_STATE[cellIndex]) {
                cellElement.textContent = GAME_STATE[cellIndex].toUpperCase().charAt(0);
                cellElement.dataset.current = GAME_STATE[cellIndex];
            } else {
                cellElement.textContent = '';
                cellElement.dataset.current = 'blank';
            }
        }
        moveCounterEl.textContent = moveCounter;
    }
    
    function isGameWon() {
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            if (GAME_STATE[cellIndex] !== TARGET_STATE[cellIndex]) {
                return false;
            }
        }
        return true;
    }

    /****************************************************************************
     * SOLVER
     ****************************************************************************/
    function solvePuzzle(gameState, targetState) {
        const workQueue = new Array();
        const hashesSeen = new Set();
        const targetHash = hashGameState(targetState);
    
        hashesSeen.add(hashGameState(gameState));
        
        const queueItem = {
            moveCount: 0,
            emptyTileIndex: gameState.indexOf(null),
            gameState: gameState,
            moves: [],
        }
        workQueue.push(queueItem);
    
        while(workQueue.length > 0) {
            const currentState = workQueue.shift();
            for(const move of getPossibleMoves(currentState)) {            
                const newGameState = [...currentState.gameState];
                
                // Swap cells
                swapCells(currentState.emptyTileIndex, move.swapWithIndex, newGameState);
                
                // If the new state is the target state, return it
                // If the new state has been seen previously, skip it
                // Otherwise, add it to the queue
                const newHash = hashGameState(newGameState);
                const newState = {
                    moveCount: currentState.moveCount + 1,
                    emptyTileIndex: move.swapWithIndex,
                    gameState: newGameState,
                    moves: [...currentState.moves, move],
                }
                if(newHash === targetHash) {
                    return newState;
                }
                else if (hashesSeen.has(newHash)) {
                    continue;
                }
                else {
                    hashesSeen.add(newHash);
                    workQueue.push(newState);
                }
            }
        }
        throw new Error("All possibilities exhausted, no solution found");
    }

    function hashGameState(gameState) {
        const hash = gameState
            .map(color => color || '_')
            .map(color => color.charAt(0).toUpperCase())
            .join('');
        return hash;
    }
    
    function getPossibleMoves(queueItem) {
        // The tiles are numbered as such
        // 0 1 2
        // 3 4 5
        // 6 7 8
        switch(queueItem.emptyTileIndex) {
            case 0: return [{label: "←", swapWithIndex:1}, {label: "↑", swapWithIndex:3}];
            case 1: return [{label: "→", swapWithIndex:0}, {label: "←", swapWithIndex:2}];
            case 2: return [{label: "→", swapWithIndex:1}, {label: "↑", swapWithIndex:5}];
            case 3: return [{label: "↓", swapWithIndex:0}, {label: "←", swapWithIndex:4}, {label: "↑", swapWithIndex:6}];
            case 4: return [{label: "→", swapWithIndex:3}, {label: "←", swapWithIndex:5}];
            case 5: return [{label: "↓", swapWithIndex:2}, {label: "→", swapWithIndex:4}, {label: "↑", swapWithIndex:8}];
            case 6: return [{label: "↓", swapWithIndex:3}, {label: "←", swapWithIndex:7}];
            case 7: return [{label: "→", swapWithIndex:6}, {label: "←", swapWithIndex:8}];
            case 8: return [{label: "↓", swapWithIndex:5}, {label: "→", swapWithIndex:7}];
        }
    }

    // solveBtn.addEventListener('click', () => {
    //     const solution = solvePuzzle(GAME_STATE, TARGET_STATE);
    //     const solutionSteps = solution.moves;
    //     const solutionPane = document.getElementById('solution-pane');
    //     const solutionStepsEl = document.getElementById('solution-steps');
    //     solutionStepsEl.innerHTML = '';
    //     solutionSteps.forEach((move, index) => {
    //         const stepEl = document.createElement('div');
    //         stepEl.className = 'solution-step';
    //         stepEl.textContent = `${index + 1}. ${move.label}`;
    //         solutionStepsEl.appendChild(stepEl);
    //     });
    //     solutionPane.style.display = 'block';
    // });
    /****************************************************************************
     * GAME INIT
     ****************************************************************************/
    resetBtn.addEventListener('click', initGame);
    initGame();
});
