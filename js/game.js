import GameState from './gameState.js';

// Game state
let players = [];
let gameState = null;
let domElements = {};

// Game data
const boardData = [
    { id: 'go', name: 'GO', type: 'go' },
    { id: 'okinawa', name: '沖縄', price: 6000, rentLevels: [200, 1000, 3000, 9000, 16000, 25000], color: '#a52a2a', houseCost: 5000 },
    { id: 'chance1', name: 'チャンス', type: 'chance' },
    { id: 'hokkaido', name: '北海道', price: 6000, rentLevels: [400, 2000, 6000, 18000, 32000, 45000], color: '#a52a2a', houseCost: 5000 },
    { id: 'tax1', name: '所得税', type: 'tax', amount: 2000 },
    { id: 'shinkansen1', name: '新幹線', type: 'railroad', price: 20000 },
    { id: 'kyoto', name: '京都', price: 10000, rentLevels: [600, 3000, 9000, 27000, 40000, 55000], color: '#87ceeb', houseCost: 5000 },
    { id: 'chance2', name: 'チャンス', type: 'chance' },
    { id: 'osaka', name: '大阪', price: 10000, rentLevels: [600, 3000, 9000, 27000, 40000, 55000], color: '#87ceeb', houseCost: 5000 },
    { id: 'nagoya', name: '名古屋', price: 12000, rentLevels: [800, 4000, 10000, 30000, 45000, 60000], color: '#87ceeb', houseCost: 5000 },
    { id: 'jail', name: '刑務所', type: 'jail' },
    { id: 'fukuoka', name: '福岡', price: 14000, rentLevels: [1000, 5000, 15000, 45000, 62500, 75000], color: '#ff69b4', houseCost: 10000 },
    { id: 'electric', name: '電気会社', type: 'utility', price: 15000 },
    { id: 'sapporo', name: '札幌', price: 14000, rentLevels: [1000, 5000, 15000, 45000, 62500, 75000], color: '#ff69b4', houseCost: 10000 },
    { id: 'tokyo', name: '東京', price: 16000, rentLevels: [1200, 6000, 18000, 50000, 70000, 90000], color: '#ff69b4', houseCost: 10000 },
    { id: 'shinkansen2', name: '新幹線', type: 'railroad', price: 20000 },
    { id: 'yokohama', name: '横浜', price: 18000, rentLevels: [1400, 7000, 20000, 55000, 75000, 95000], color: '#ff8c00', houseCost: 10000 },
    { id: 'chance3', name: 'チャンス', type: 'chance' },
    { id: 'nagasaki', name: '長崎', price: 18000, rentLevels: [1400, 7000, 20000, 55000, 75000, 95000], color: '#ff8c00', houseCost: 10000 },
    { id: 'hiroshima', name: '広島', price: 20000, rentLevels: [1600, 8000, 22000, 60000, 80000, 100000], color: '#ff8c00', houseCost: 10000 },
    { id: 'parking', name: '無料駐車場', type: 'parking' },
    { id: 'nara', name: '奈良', price: 22000, rentLevels: [1800, 9000, 25000, 70000, 87500, 105000], color: '#ff0000', houseCost: 15000 },
    { id: 'chance4', name: 'チャンス', type: 'chance' },
    { id: 'kanazawa', name: '金沢', price: 22000, rentLevels: [1800, 9000, 25000, 70000, 87500, 105000], color: '#ff0000', houseCost: 15000 },
    { id: 'kobe', name: '神戸', price: 24000, rentLevels: [2000, 10000, 30000, 75000, 92500, 110000], color: '#ff0000', houseCost: 15000 },
    { id: 'shinkansen3', name: '新幹線', type: 'railroad', price: 20000 },
    { id: 'sendai', name: '仙台', price: 26000, rentLevels: [2200, 11000, 33000, 80000, 97500, 115000], color: '#ffff00', houseCost: 15000 },
    { id: 'nagano', name: '長野', price: 26000, rentLevels: [2200, 11000, 33000, 80000, 97500, 115000], color: '#ffff00', houseCost: 15000 },
    { id: 'water', name: '水道局', type: 'utility', price: 15000 },
    { id: 'kyushu', name: '九州', price: 28000, rentLevels: [2400, 12000, 36000, 85000, 102500, 120000], color: '#ffff00', houseCost: 15000 },
    { id: 'go_to_jail', name: '刑務所行き', type: 'go_to_jail' },
    { id: 'himeji', name: '姫路', price: 30000, rentLevels: [2600, 13000, 39000, 90000, 110000, 127500], color: '#32cd32', houseCost: 20000 },
    { id: 'naha', name: '那覇', price: 30000, rentLevels: [2600, 13000, 39000, 90000, 110000, 127500], color: '#32cd32', houseCost: 20000 },
    { id: 'chance5', name: 'チャンス', type: 'chance' },
    { id: 'kagoshima', name: '鹿児島', price: 32000, rentLevels: [2800, 15000, 45000, 100000, 120000, 140000], color: '#32cd32', houseCost: 20000 },
    { id: 'shinkansen4', name: '新幹線', type: 'railroad', price: 20000 },
    { id: 'chance6', name: 'チャンス', type: 'chance' },
    { id: 'sapporo2', name: '札幌', price: 35000, rentLevels: [3500, 17500, 50000, 110000, 130000, 150000], color: '#0000cd', houseCost: 20000 },
    { id: 'luxury_tax', name: '高級税', type: 'tax', amount: 7500 },
    { id: 'tokyo_station', name: '東京駅', price: 40000, rentLevels: [5000, 20000, 60000, 140000, 170000, 200000], color: '#0000cd', houseCost: 20000 }
];

// Initialize the game
function initGame() {
    // Initialize players
    const initialPlayers = [
        { 
            id: 'player1', 
            name: 'あなた', 
            money: 150000, 
            position: 0, 
            properties: [], 
            color: '#ff0000', 
            isHuman: true, 
            getOutOfJailCards: 0, 
            inJail: false, 
            jailTurns: 0,
            consecutiveDoubles: 0
        },
        { 
            id: 'cpu1', 
            name: 'CPU 1', 
            money: 150000, 
            position: 0, 
            properties: [], 
            color: '#0000ff', 
            isHuman: false, 
            getOutOfJailCards: 0, 
            inJail: false, 
            jailTurns: 0,
            consecutiveDoubles: 0
        },
        { 
            id: 'cpu2', 
            name: 'CPU 2', 
            money: 150000, 
            position: 0, 
            properties: [], 
            color: '#008000', 
            isHuman: false, 
            getOutOfJailCards: 0, 
            inJail: false, 
            jailTurns: 0,
            consecutiveDoubles: 0
        },
        { 
            id: 'cpu3', 
            name: 'CPU 3', 
            money: 150000, 
            position: 0, 
            properties: [], 
            color: '#ffa500', 
            isHuman: false, 
            getOutOfJailCards: 0, 
            inJail: false, 
            jailTurns: 0,
            consecutiveDoubles: 0
        }
    ];
    
    // Initialize the game state machine
    gameState = new GameState(initialPlayers, boardData, {
        onStateChange: handleStateChange,
        onPlayerMoved: (player, position) => {
            movePlayerTo(player, position, true);
        },
        onLogMessage: (message) => {
            const logEl = document.createElement('div');
            logEl.className = 'p-2 border-b border-gray-200';
            logEl.textContent = message;
            
            const logContainer = document.getElementById('log-container');
            if (logContainer) {
                logContainer.insertBefore(logEl, logContainer.firstChild);
                
                // Limit log entries
                while (logContainer.children.length > 50) {
                    logContainer.removeChild(logContainer.lastChild);
                }
            }
            
            // Also log to console
            console.log(message);
        },
        onPlayerBankrupt: (player) => {
            // Handle player bankruptcy
            const playerEl = document.getElementById(`player-${player.id}`);
            if (playerEl) {
                playerEl.classList.add('opacity-50');
            }
            
            // Remove player token
            const token = document.getElementById(`token-${player.id}`);
            if (token) {
                token.remove();
            }
        },
        onGameOver: (winner) => {
            // Handle game over
            showActionPanel(
                'ゲーム終了',
                `おめでとうございます！${winner.name} の勝利です！`,
                () => location.reload(),
                () => {}
            );
        }
    });
    
    // Store players reference
    players = gameState.players;
    
    // Draw the board
    drawBoard();
    
    // Cache DOM elements
    cacheDomElements();
    
    // Add event listeners
    addEventListeners();
    
    // Start the game
    gameState.startGame();
}

// Handle state changes from the state machine
function handleStateChange(state) {
    console.log('State changed:', state.value, state.context);
    
    const { context } = state;
    const currentPlayer = context.currentPlayer;
    
    // Update UI based on the current state
    if (currentPlayer) {
        updatePlayerInfo(currentPlayer);
    }
    
    // Update UI controls based on state
    updateUIControls(state);
    
    // Handle state-specific logic
    if (state.matches('playerTurn.rolling')) {
        // Show dice animation
        const { dice } = context;
        if (dice) {
            rollDiceAnimation(dice[0], dice[1]);
        }
    } 
    else if (state.matches('playerTurn.moving')) {
        // Move player on the board
        if (currentPlayer && typeof context.targetPosition === 'number') {
            movePlayerTo(currentPlayer, context.targetPosition);
        }
    }
    else if (state.matches('playerTurn.landing')) {
        // Handle landing on a space
        if (currentPlayer) {
            handleLanding(currentPlayer);
        }
    }
    else if (state.matches('playerTurn.jail')) {
        // Handle jail options
        if (currentPlayer) {
            if (currentPlayer.isHuman) {
                showJailOptions();
            } else {
                // AI jail logic
                handleCpuJailTurn(currentPlayer);
            }
        }
    }
    else if (state.matches('gameOver')) {
        // Game over state
        if (context.winner) {
            showActionPanel(
                'ゲーム終了',
                `おめでとうございます！${context.winner.name} の勝利です！`,
                () => location.reload(),
                () => {}
            );
        }
    }
}

// Update UI controls based on game state
function updateUIControls(state) {
    if (!domElements.rollDiceBtn || !domElements.endTurnBtn) return;
    
    // Reset all buttons
    domElements.rollDiceBtn.disabled = true;
    domElements.endTurnBtn.disabled = true;
    domElements.actionBuyBtn.disabled = true;
    domElements.actionPassBtn.disabled = true;
    
    const currentPlayer = state.context.currentPlayer;
    if (!currentPlayer) return;
    
    // Only enable controls for human player's turn
    if (currentPlayer.isHuman) {
        if (state.matches('playerTurn.idle')) {
            domElements.rollDiceBtn.disabled = false;
        }
        else if (state.matches('playerTurn.landing.property')) {
            domElements.actionBuyBtn.disabled = false;
            domElements.actionPassBtn.disabled = false;
        }
        else if (state.matches('playerTurn.afterRoll') || state.matches('playerTurn.afterAction')) {
            domElements.endTurnBtn.disabled = false;
        }
    }
}

// Show jail options for human player
function showJailOptions() {
    const player = gameState.getCurrentPlayer();
    if (!player) return;
    
    let buttons = [];
    
    if (player.getOutOfJailCards > 0) {
        buttons.push({
            text: '刑務所カードを使用',
            onClick: () => gameState.useGetOutOfJailCard()
        });
    }
    
    if (player.money >= 50) {
        buttons.push({
            text: '保釈金を支払う ($50)',
            onClick: () => gameState.payBail()
        });
    }
    
    buttons.push({
        text: 'サイコロを振る',
        onClick: () => gameState.rollDice()
    });
    
    showActionPanel(
        '刑務所にいます',
        'どうしますか？',
        () => {}, // No action on close
        () => {}, // No cancel action
        buttons
    );
}

// Handle CPU player's turn in jail
function handleCpuJailTurn(player) {
    if (!player) return;
    
    // Simple AI: Use card if available, otherwise try to roll
    if (player.getOutOfJailCards > 0) {
        // Use get out of jail card
        gameState.useGetOutOfJailCard();
    } else if (player.money >= 50) {
        // Pay bail if possible
        gameState.payBail();
    } else {
        // Roll the dice
        gameState.rollDice();
    }
}

// Show action panel with custom buttons
function showActionPanel(title, message, buttons) {
    // Clear previous buttons
    domElements.actionButtons.innerHTML = '';
    
    // Set title and message
    domElements.actionTitle.textContent = title;
    domElements.actionText.textContent = message;
    
    // Add buttons
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.addEventListener('click', () => {
            button.onClick();
            domElements.actionPanel.style.display = 'none';
        });
        domElements.actionButtons.appendChild(btn);
    });
    
    // Show panel
    domElements.actionPanel.style.display = 'block';
}

// Cache DOM elements for better performance
function cacheDomElements() {
    domElements = {
        rollDiceBtn: document.getElementById('roll-dice-btn'),
        manageAssetsBtn: document.getElementById('manage-assets-btn'),
        endTurnBtn: document.getElementById('end-turn-btn'),
        dice1: document.getElementById('dice1'),
        dice2: document.getElementById('dice2'),
        playersInfoContainer: document.getElementById('players-info-container'),
        actionPanel: document.getElementById('action-panel'),
        actionTitle: document.getElementById('action-title'),
        actionText: document.getElementById('action-text'),
        actionButtons: document.getElementById('action-buttons'),
        actionBuyBtn: document.getElementById('action-buy-btn'),
        actionPassBtn: document.getElementById('action-pass-btn'),
        logContainer: document.getElementById('log-container')
    };
}

// Add event listeners
function addEventListeners() {
    // Roll dice button
    domElements.rollDiceBtn.addEventListener('click', () => {
        // Disable button until next turn
        domElements.rollDiceBtn.disabled = true;
        gameState.rollDice();
    });
    
    // End turn button
    domElements.endTurnBtn.addEventListener('click', () => {
        gameState.nextPlayer();
    });
    
    // Buy property button
    domElements.actionBuyBtn.addEventListener('click', () => {
        gameState.buyProperty();
    });
    
    // Pass button
    domElements.actionPassBtn.addEventListener('click', () => {
        gameState.pass();
    });
    
    // Manage assets button
    domElements.manageAssetsBtn.addEventListener('click', () => {
        openManageAssetsModal();
    });
    
    // Action panel buttons
    domElements.actionBuyBtn.addEventListener('click', () => {
        const currentPlayer = gameState.getCurrentPlayer();
        const currentSpace = boardData[currentPlayer.position];
        if (currentPlayer.isHuman && currentSpace && currentSpace.price) {
            gameState.buyProperty();
        }
    });
    
    domElements.actionPassBtn.addEventListener('click', () => {
        domElements.actionPanel.classList.add('hidden');
        gameState.pass();
    });
}

// Draw the game board
function drawBoard() {
    const board = document.getElementById('board');
    
    // Clear the board first (except the center)
    const spaces = document.querySelectorAll('.space');
    spaces.forEach(space => space.remove());
    
    // Create spaces
    boardData.forEach((space, index) => {
        if (index === 0) return; // Skip GO as it's already in the HTML
        
        const spaceEl = document.createElement('div');
        spaceEl.id = `space-${index}`;
        spaceEl.className = 'space';
        
        if (space.color) {
            const colorBar = document.createElement('div');
            colorBar.className = 'color-bar';
            colorBar.style.backgroundColor = space.color;
            spaceEl.appendChild(colorBar);
        }
        
        const nameEl = document.createElement('div');
        nameEl.className = 'space-name';
        nameEl.textContent = space.name;
        spaceEl.appendChild(nameEl);
        
        if (space.price) {
            const priceEl = document.createElement('div');
            priceEl.className = 'price';
            priceEl.textContent = `¥${space.price.toLocaleString()}`;
            spaceEl.appendChild(priceEl);
        }
        
        board.appendChild(spaceEl);
    });
    
    // Draw player tokens
    players.forEach(player => {
        createPlayerToken(player);
    });
}

// Create player token
function createPlayerToken(player) {
    const token = document.createElement('div');
    token.className = 'player-token';
    token.id = `token-${player.id}`;
    token.style.backgroundColor = player.color;
    token.style.left = '50%';
    token.style.top = '50%';
    token.style.transform = 'translate(-50%, -50%)';
    
    const board = document.getElementById('board');
    board.appendChild(token);
    
    // Position the token
    movePlayerTo(player, player.position, false);
}

// Move player to a new position
function movePlayerTo(player, newPosition, passedGo = true) {
    const oldPosition = player.position;
    player.position = newPosition;
    
    // Check if player passed GO
    if (passedGo && newPosition < oldPosition) {
        player.money += 20000;
        addLog(`${player.name}がGOを通過して¥20,000を獲得しました`);
        updatePlayerInfo(player);
    }
    
    // Update token position
    const token = document.getElementById(`token-${player.id}`);
    if (token) {
        // Simple animation - in a real game, you'd want to animate the movement
        // For now, just update the position
        const space = document.getElementById(`space-${newPosition}`);
        if (space) {
            const rect = space.getBoundingClientRect();
            token.style.left = `${rect.left + rect.width / 2}px`;
            token.style.top = `${rect.top + rect.height / 2}px`;
        }
    }
    
    // Handle landing on the new space
    handleLanding(player);
}

// Handle player landing on a space
function handleLanding(player) {
    const space = boardData[player.position];
    if (!space) return;
    
    let message = `${player.name} が ${space.name} に止まりました`;
    addLog(message);
    
    // Handle different space types
    switch (space.type) {
        case 'property':
        case 'railroad':
        case 'utility':
            handlePropertyLanding(player, space);
            break;
            
        case 'chance':
            gameState.drawChanceCard();
            break;
            
        case 'tax':
            const taxAmount = space.amount || 200;
            gameState.payTax(taxAmount);
            break;
            
        case 'go_to_jail':
            gameState.goToJail();
            break;
            
        case 'jail':
            addLog(`${player.name}は刑務所を見学中です`);
            break;
            
        case 'parking':
            addLog(`${player.name}は無料駐車場に止まりました`);
            break;
            
        case 'go':
            addLog(`${player.name}がGOに止まりました`);
            break;
            
        default:
            // Do nothing for other space types
            break;
    }
}

// Handle property landing logic
function handlePropertyLanding(player, space) {
    const owner = players.find(p => p.properties.includes(space.id));
    
    if (owner) {
        if (owner.id === player.id) {
            addLog(`${player.name}は自分の${space.name}に止まりました`);
        } else {
            // Calculate rent based on property type and ownership
            let rent = 0;
            if (space.type === 'property') {
                const group = space.group;
                const ownedInGroup = boardData.filter(
                    s => s.group === group && owner.properties.includes(s.id)
                ).length;
                const totalInGroup = boardData.filter(s => s.group === group).length;
                
                if (ownedInGroup === totalInGroup) {
                    // Full set bonus
                    rent = space.rent[0] * 2;
                } else {
                    rent = space.rent[0];
                }
            } else if (space.type === 'railroad') {
                const ownedRailroads = boardData.filter(
                    s => s.type === 'railroad' && owner.properties.includes(s.id)
                ).length;
                rent = space.rent[Math.min(ownedRailroads - 1, 3)];
            } else if (space.type === 'utility') {
                const ownedUtilities = boardData.filter(
                    s => s.type === 'utility' && owner.properties.includes(s.id)
                ).length;
                const diceRoll = 7; // Default value, should use actual dice roll
                rent = diceRoll * (ownedUtilities === 2 ? 10 : 4);
            }
            
            // Process rent payment through game state
            gameState.payRent(owner.id, rent);
        }
    } else if (space.price) {
        // Property is unowned and can be purchased
        if (player.isHuman) {
            showActionPanel(
                '物件を購入しますか？',
                `${space.name}を¥${space.price.toLocaleString()}で購入しますか？`,
                () => gameState.buyProperty(),
                () => gameState.pass()
            );
        } else {
            // AI decision to buy
            if (player.money > space.price * 1.5) { // AI is more likely to buy if they have enough money
                gameState.buyProperty();
            } else {
                addLog(`${player.name}は${space.name}の購入をパスしました`);
                gameState.pass();
            }
        }
    }
}

// Show action panel with custom message and buttons
function showActionPanel(title, text, onConfirm, onCancel) {
    domElements.actionTitle.textContent = title;
    domElements.actionText.textContent = text;
    domElements.actionPanel.classList.remove('hidden');
    
    // Remove previous event listeners
    const newConfirmBtn = domElements.actionBuyBtn.cloneNode(true);
    const newPassBtn = domElements.actionPassBtn.cloneNode(true);
    
    domElements.actionBuyBtn.replaceWith(newConfirmBtn);
    domElements.actionPassBtn.replaceWith(newPassBtn);
    
    domElements.actionBuyBtn = newConfirmBtn;
    domElements.actionPassBtn = newPassBtn;
    
    // Add new event listeners
    domElements.actionBuyBtn.onclick = () => {
        domElements.actionPanel.classList.add('hidden');
        onConfirm();
    };
    
    domElements.actionPassBtn.onclick = () => {
        domElements.actionPanel.classList.add('hidden');
        onCancel();
    };
}

// Buy property
function buyProperty(player, spaceId) {
    const space = boardData.find(s => s.id === spaceId);
    if (!space || !space.price) return;
    
    player.money -= space.price;
    player.properties.push(spaceId);
    
    // Update UI
    updatePlayerInfo(player);
    updateBoardUI(spaceId);
    
    addLog(`${player.name}が${space.name}を¥${space.price.toLocaleString()}で購入しました`);
    
    // Close action panel if open
    domElements.actionPanel.classList.add('hidden');
}

// Update player info in the UI
function updatePlayerInfo(player) {
    const playerEl = document.getElementById(`player-${player.id}`);
    if (playerEl) {
        const moneyEl = playerEl.querySelector('.player-money');
        if (moneyEl) {
            moneyEl.textContent = `¥${player.money.toLocaleString()}`;
        }
    }
}

// Update board UI when property changes hands
function updateBoardUI(spaceId) {
    const space = boardData.find(s => s.id === spaceId);
    if (!space) return;
    
    const spaceEl = document.getElementById(`space-${boardData.indexOf(space)}`);
    if (!spaceEl) return;
    
    // Clear previous ownership indicators
    const oldIndicators = spaceEl.querySelectorAll('.owned-indicator, .house-indicator');
    oldIndicators.forEach(el => el.remove());
    
    // Find the owner
    const owner = players.find(p => p.properties.includes(spaceId));
    if (owner) {
        // Add ownership indicator
        const indicator = document.createElement('div');
        indicator.className = 'owned-indicator';
        indicator.style.backgroundColor = owner.color;
        spaceEl.appendChild(indicator);
        
        // Add houses if any
        if (space.houses > 0) {
            const houseContainer = document.createElement('div');
            houseContainer.className = 'house-indicator';
            
            if (space.houses === 5) {
                // Hotel
                const hotel = document.createElement('div');
                hotel.className = 'hotel-icon';
                hotel.textContent = 'H';
                houseContainer.appendChild(hotel);
            } else {
                // Houses
                for (let i = 0; i < space.houses; i++) {
                    const house = document.createElement('div');
                    house.className = 'house-icon';
                    houseContainer.appendChild(house);
                }
            }
            
            spaceEl.appendChild(houseContainer);
        }
    }
}

// Roll dice and move player - now just a wrapper for the state machine
function rollDiceAndMove(player) {
    // Delegate to the state machine
    gameState.rollDice();
}

// Continue CPU turn after rolling - now handled by the state machine
function continueCpuTurn(currentPlayer) {
    // This is now a no-op as the state machine handles CPU turns
    // The actual CPU logic is now in the gameState.js file
    return;
}

// End current player's turn
function endTurn() {
    gameState.nextPlayer();
}

// Start player's turn - now handled by the state machine
function startTurn() {
    const currentPlayer = gameState.getCurrentPlayer();
    
    // Update UI
    updatePlayerInfo(currentPlayer);
    
    // Enable/disable UI elements based on player type and state
    const isHumanTurn = currentPlayer && currentPlayer.isHuman;
    const currentState = gameState.getState();
    
    // Enable roll button if it's the player's turn and they can roll
    domElements.rollDiceBtn.disabled = !isHumanTurn || 
        currentState.matches('jail') || 
        currentState.matches('rolling');
        
    // End turn button is managed by the state machine
    domElements.endTurnBtn.disabled = true;
}

// Handle player going to jail - now just a wrapper for the state machine
function goToJail(player) {
    gameState.goToJail();
}

// Handle player's turn in jail - now just a wrapper for the state machine
function handleJailTurn(player, rolledDoubles) {
    // This is now handled by the state machine
    // The actual jail logic is in the turnMachine.js file
    gameState.handleJailTurn(rolledDoubles);
}

// Handle player bankruptcy - now just a wrapper for the state machine
function handleBankruptcy(player) {
    gameState.declareBankruptcy();
}

// Draw chance card - now handled by the state machine
function drawChanceCard(player) {
    gameState.drawChanceCard();
}

// Advance player to nearest space of a certain type
function advanceToNearest(player, type) {
    // Delegate to the state machine
    gameState.advanceToNearest(type);
}

// Open manage assets modal - now just a wrapper for the state machine
function openManageAssetsModal() {
    gameState.openManageAssetsModal();
}

// Add log message - now just a wrapper for the state machine
function addLog(message) {
    gameState.addLog(message);
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);
