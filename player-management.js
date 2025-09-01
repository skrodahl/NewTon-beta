// player-management.js - Player Operations and Statistics

function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a player name');
        return;
    }

    if (players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Player already exists');
        return;
    }

    const player = {
        id: Date.now(),
        name: name,
        paid: false,
        stats: {
            shortLegs: 0,
            highOuts: [],
            tons: 0,
            oneEighties: 0
        },
        placement: null,
        eliminated: false
    };

    players.push(player);
    nameInput.value = '';
    
    updatePlayersDisplay();
    updatePlayerCount();
    saveTournament();
    updateResultsTable();
}

function removePlayer(playerId) {
    if (confirm('Are you sure you want to remove this player?')) {
        players = players.filter(p => p.id !== playerId);
        updatePlayersDisplay();
        updatePlayerCount();
        saveTournament();
	updateResultsTable();
    }
}

function togglePaid(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.paid = !player.paid;
        updatePlayersDisplay();
        updatePlayerCount();
        saveTournament();
	updateResultsTable();
    }
}

function openStatsModal(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    currentStatsPlayer = player;
    document.getElementById('statsPlayerName').textContent = `${player.name} - Statistics`;
    document.getElementById('statsTons').value = player.stats.tons || 0;
    // Convert old format to new format if needed
    if (typeof player.stats.shortLegs === 'number') {
        player.stats.shortLegs = [];
    }
    updateShortLegsList();
    document.getElementById('stats180s').value = player.stats.oneEighties || 0;
    
    updateHighOutsList();
    document.getElementById('statsModal').style.display = 'block';
}

function addHighOut() {
    const score = parseInt(document.getElementById('statsHighOut').value);
    if (!score || score < 101 || score > 170) {
        alert('Please enter a valid high out score (101-170)');
        return;
    }

    if (!currentStatsPlayer.stats.highOuts) {
        currentStatsPlayer.stats.highOuts = [];
    }

    currentStatsPlayer.stats.highOuts.push(score);
    document.getElementById('statsHighOut').value = '';
    updateHighOutsList();
}

function updateHighOutsList() {
    const container = document.getElementById('highOutsList');
    if (!currentStatsPlayer || !currentStatsPlayer.stats.highOuts) {
        container.innerHTML = '';
        return;
    }

    const html = currentStatsPlayer.stats.highOuts.map((score, index) => `
        <span style="background: #f8f9fa; padding: 5px 10px; margin: 2px; border-radius: 3px; display: inline-block;">
            ${score} <button onclick="removeHighOut(${index})" style="background: none; border: none; color: red; cursor: pointer;">×</button>
        </span>
    `).join('');
    
    container.innerHTML = `<div style="margin-top: 10px;"><strong>High Outs:</strong><br>${html}</div>`;
}

function removeHighOut(index) {
    if (currentStatsPlayer && currentStatsPlayer.stats.highOuts) {
        currentStatsPlayer.stats.highOuts.splice(index, 1);
        updateHighOutsList();
    }
}

function saveStats() {
    if (!currentStatsPlayer) return;

    currentStatsPlayer.stats.tons = parseInt(document.getElementById('statsTons').value) || 0;
    currentStatsPlayer.stats.oneEighties = parseInt(document.getElementById('stats180s').value) || 0;

    updatePlayersDisplay();
    // Call saveTournament if it exists, otherwise just continue
    if (typeof saveTournament === 'function') {
        saveTournament();
    }

    // Refresh the results table dynamically
    if (typeof updateResultsTable === 'function') {
        updateResultsTable();
    }

    closeStatsModal();
}

// Simple fallback functions to prevent errors
function safeSaveTournament() {
    if (typeof saveTournament === 'function') {
        saveTournament();
    }
}

function closeStatsModal() {
    document.getElementById('statsModal').style.display = 'none';
    currentStatsPlayer = null;
}

function updatePlayersDisplay() {
    const container = document.getElementById('playersContainer');
    
    if (players.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No players added yet</p>';
        return;
    }

    const html = players.map(player => `
        <div class="player-card ${player.paid ? 'paid' : ''}">
            <div class="player-header">
                <span class="player-name">${player.name}</span>
                <div>
                    <label style="margin-right: 10px;">
                        <input type="checkbox" class="paid-checkbox" ${player.paid ? 'checked' : ''} 
                               onchange="togglePaid(${player.id})"> Paid
                    </label>
                    <button onclick="removePlayer(${player.id})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 5px 8px; cursor: pointer;">×</button>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
		<span>Short Legs:</span>
		<span>${Array.isArray(player.stats.shortLegs) ? player.stats.shortLegs.length : 0}</span>
                </div>
                <div class="stat-item">
                    <span>High Outs:</span>
                    <span>${(player.stats.highOuts || []).length}</span>
                </div>
                <div class="stat-item">
                    <span>Tons:</span>
                    <span>${player.stats.tons || 0}</span>
                </div>
                <div class="stat-item">
                    <span>180s:</span>
                    <span>${player.stats.oneEighties || 0}</span>
                </div>
            </div>
            <button class="btn" style="width: 100%; margin-top: 10px; padding: 8px;" onclick="openStatsModal(${player.id})">
                Edit Statistics
            </button>
        </div>
    `).join('');

    container.innerHTML = html;
    updatePlayerManagementState();
}

function updatePlayerCount() {
    const totalPlayers = players.length;
    const paidPlayers = players.filter(p => p.paid).length;
    
    document.getElementById('playerCount').textContent = totalPlayers;
    document.getElementById('paidCount').textContent = paidPlayers;
}

function clearAllPlayers() {
    if (confirm('Are you sure you want to remove all players? This cannot be undone.')) {
        players = [];
        updatePlayersDisplay();
        updatePlayerCount();
        saveTournament();
    }
}

function addShortLeg() {
    const darts = parseInt(document.getElementById('statsShortLegDarts').value);
    if (!darts || darts < 9 || darts > 21) {
        alert('Please enter valid dart count (9-21)');
        return;
    }

    if (!Array.isArray(currentStatsPlayer.stats.shortLegs)) {
        currentStatsPlayer.stats.shortLegs = [];
    }

    currentStatsPlayer.stats.shortLegs.push(darts);
    document.getElementById('statsShortLegDarts').value = '';
    updateShortLegsList();
}

function updateShortLegsList() {
    const container = document.getElementById('shortLegsList');
    if (!currentStatsPlayer || !Array.isArray(currentStatsPlayer.stats.shortLegs)) {
        container.innerHTML = '';
        return;
    }

    const html = currentStatsPlayer.stats.shortLegs.map((darts, index) => `
        <span style="background: #f8f9fa; padding: 5px 10px; margin: 2px; border-radius: 3px; display: inline-block;">
            ${darts} <button onclick="removeShortLeg(${index})" style="background: none; border: none; color: red; cursor: pointer;">×</button>
        </span>
    `).join('');

    container.innerHTML = `<div style="margin-top: 10px;"><strong>Short Legs:</strong><br>${html}</div>`;
}

function removeShortLeg(index) {
    if (currentStatsPlayer && Array.isArray(currentStatsPlayer.stats.shortLegs)) {
        currentStatsPlayer.stats.shortLegs.splice(index, 1);
        updateShortLegsList();
    }
}

function updatePlayerManagementState() {
    const tournamentActive = tournament && tournament.status === 'active' && tournament.bracket && matches && matches.length > 0;
    const tournamentExists = !!tournament;

    // Get UI elements
    const addBtn = document.querySelector('button[onclick="addPlayer()"]');
    const clearBtn = document.querySelector('button[onclick="clearAllPlayers()"]');
    const playerInput = document.getElementById('playerName');
    const playersContainer = document.getElementById('playersContainer');

    if (tournamentActive) {
        // Lock player management during active tournament
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = 'Tournament Active';
            addBtn.style.opacity = '0.6';
        }
        if (clearBtn) {
            clearBtn.disabled = true;
            clearBtn.style.opacity = '0.6';
        }
        if (playerInput) {
            playerInput.disabled = true;
            playerInput.placeholder = 'Tournament in progress';
            playerInput.style.opacity = '0.6';
        }
    } else {
        // Restore normal state
        if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = 'Add Player';
            addBtn.style.opacity = '1';
        }
        if (clearBtn) {
            clearBtn.disabled = false;
            clearBtn.style.opacity = '1';
        }
        if (playerInput) {
            playerInput.disabled = false;
            playerInput.placeholder = 'Enter player name';
            playerInput.style.opacity = '1';
        }
    }

    if (!tournamentExists && playersContainer) {
        // Show message when no tournament exists
        playersContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Please create a tournament first before adding players</p>';
    }
}
