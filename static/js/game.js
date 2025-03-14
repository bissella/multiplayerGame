document.addEventListener('DOMContentLoaded', function() {
    // Game configuration
    const moveDistance = 10; // Pixels to move in each step
    const worldWidth = document.getElementById('gameWorld').offsetWidth;
    const worldHeight = document.getElementById('gameWorld').offsetHeight;
    
    // Get player elements
    const currentPlayerElement = document.getElementById('currentPlayer');
    const playerId = currentPlayerElement.dataset.id;
    const playersList = document.getElementById('playersList');
    
    // Movement control buttons
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    // Player position state
    let playerPosition = {
        x: 50, // Starting X position (%)
        y: 50  // Starting Y position (%)
    };
    
    // Other players in the game
    const otherPlayers = {};
    
    // Initialize Socket.IO connection
    const socket = io();
    
    // Initial setup - position player on load
    function initGame() {
        // Fetch player's saved position from the server
        fetch('/api/position')
            .then(response => response.json())
            .then(data => {
                playerPosition.x = data.x;
                playerPosition.y = data.y;
                updatePlayerPosition();
            })
            .catch(error => console.error('Error fetching position:', error));
        
        // Setup keyboard controls
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // Update player position on the screen
    function updatePlayerPosition() {
        // Constrain position within game world boundaries
        playerPosition.x = Math.max(0, Math.min(100, playerPosition.x));
        playerPosition.y = Math.max(0, Math.min(100, playerPosition.y));
        
        // Update player element position
        currentPlayerElement.style.left = `${playerPosition.x}%`;
        currentPlayerElement.style.top = `${playerPosition.y}%`;
    }
    
    // Save position to server
    function savePosition() {
        fetch('/api/position', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerPosition)
        }).catch(error => console.error('Error saving position:', error));
    }
    
    // Handle keyboard movement
    function handleKeyDown(event) {
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                playerPosition.y -= moveDistance / 5;
                moved = true;
                break;
            case 'ArrowDown':
                playerPosition.y += moveDistance / 5;
                moved = true;
                break;
            case 'ArrowLeft':
                playerPosition.x -= moveDistance / 5;
                moved = true;
                break;
            case 'ArrowRight':
                playerPosition.x += moveDistance / 5;
                moved = true;
                break;
        }
        
        if (moved) {
            updatePlayerPosition();
            socket.emit('move', playerPosition);
            savePosition();
        }
    }
    
    // Add a new player to the game world
    function addPlayer(playerData) {
        if (playerData.id == playerId) return; // Skip if it's the current player
        
        // Create player element if it doesn't exist
        if (!otherPlayers[playerData.id]) {
            const playerElement = document.createElement('div');
            playerElement.className = 'player other-player';
            playerElement.id = `player-${playerData.id}`;
            
            const nameElement = document.createElement('div');
            nameElement.className = 'player-name';
            nameElement.textContent = playerData.username;
            
            playerElement.appendChild(nameElement);
            document.getElementById('gameWorld').appendChild(playerElement);
            
            otherPlayers[playerData.id] = {
                element: playerElement,
                data: playerData
            };
            
            // Add to online players list
            updatePlayersList();
        }
        
        // Update position
        updateOtherPlayerPosition(playerData);
    }
    
    // Update position of another player
    function updateOtherPlayerPosition(playerData) {
        if (otherPlayers[playerData.id]) {
            const playerElement = otherPlayers[playerData.id].element;
            otherPlayers[playerData.id].data = {
                ...otherPlayers[playerData.id].data,
                x: playerData.x,
                y: playerData.y
            };
            
            playerElement.style.left = `${playerData.x}%`;
            playerElement.style.top = `${playerData.y}%`;
        }
    }
    
    // Remove a player from the game
    function removePlayer(playerId) {
        if (otherPlayers[playerId]) {
            otherPlayers[playerId].element.remove();
            delete otherPlayers[playerId];
            updatePlayersList();
        }
    }
    
    // Update the list of online players
    function updatePlayersList() {
        playersList.innerHTML = '';
        
        // Add current player
        const currentPlayerItem = document.createElement('li');
        currentPlayerItem.textContent = `${currentPlayerElement.querySelector('.player-name').textContent} (You)`;
        playersList.appendChild(currentPlayerItem);
        
        // Add other players
        Object.values(otherPlayers).forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.textContent = player.data.username;
            playersList.appendChild(playerItem);
        });
    }
    
    // Socket.IO event handlers
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('world_state', function(players) {
        players.forEach(player => {
            if (player.id != playerId) {
                addPlayer(player);
            }
        });
    });
    
    socket.on('user_connected', function(playerData) {
        console.log('User connected:', playerData.username);
        addPlayer(playerData);
    });
    
    socket.on('user_disconnected', function(data) {
        console.log('User disconnected:', data.id);
        removePlayer(data.id);
    });
    
    socket.on('player_moved', function(playerData) {
        if (playerData.id != playerId) {
            updateOtherPlayerPosition(playerData);
        }
    });
    
    // Button click handlers
    btnUp.addEventListener('click', function() {
        playerPosition.y -= moveDistance;
        updatePlayerPosition();
        socket.emit('move', playerPosition);
        savePosition();
    });
    
    btnDown.addEventListener('click', function() {
        playerPosition.y += moveDistance;
        updatePlayerPosition();
        socket.emit('move', playerPosition);
        savePosition();
    });
    
    btnLeft.addEventListener('click', function() {
        playerPosition.x -= moveDistance;
        updatePlayerPosition();
        socket.emit('move', playerPosition);
        savePosition();
    });
    
    btnRight.addEventListener('click', function() {
        playerPosition.x += moveDistance;
        updatePlayerPosition();
        socket.emit('move', playerPosition);
        savePosition();
    });
    
    // Initialize the game
    initGame();
});
