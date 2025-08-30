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
}

function removePlayer(playerId) {
    if (confirm('Are you sure you want to remove this player?')) {
        players = players.filter(p => p.id !== playerId);
        updatePlayersDisplay();
        updatePlayerCount();
        saveTournament();
    }
}

function togglePaid(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.paid = !player.paid;
        updatePlayersDisplay();
        updatePlayerCount();
        saveTournament();
    }
}

function openStatsModal(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    currentStatsPlayer = player;
    document.getElementById('statsPlayerName').textContent = `${player.name} - Statistics`;
    document.getElementById('statsShortLegs').value = player.stats.shortLegs || 0;
    document.getElementById('statsTons').value = player.stats.tons || 0;
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

    currentStatsPlayer.stats.shortLegs = parseInt(document.getElementById('statsShortLegs').value) || 0;
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
                    <span>${player.stats.shortLegs || 0}</span>
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
