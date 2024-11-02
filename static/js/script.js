document.getElementById('create-match').addEventListener('click', createMatch);
document.getElementById('submit-players').addEventListener('click', submitPlayers);
document.getElementById('submit-bets').addEventListener('click', submitBets);
document.getElementById('new-round').addEventListener('click', newRound);
document.getElementById('declare-winner').addEventListener('click', declareWinner);

let matchId = null;
let playerNames = [];

function createMatch() {
    const playerCount = document.getElementById('player-count').value;
    if (playerCount < 2 || playerCount > 10) {
        alert("Please enter a valid number of players (2-10).");
        return;
    }

    playerNames = [];  // Reset player names
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = ''; // Clear previous players

    for (let i = 1; i <= playerCount; i++) {
        playersDiv.innerHTML += `<input type="text" id="player${i}" placeholder="Player ${i} Name">`;
    }

    document.getElementById('players-input').classList.remove('hidden');
    document.getElementById('bets-input').classList.add('hidden');
}

function submitPlayers() {
    const playerCount = document.querySelectorAll('#players input').length;

    for (let i = 1; i <= playerCount; i++) {
        playerNames.push(document.getElementById(`player${i}`).value);
    }

    fetch('/api/match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ players: playerNames })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Error creating match.");
        }
    })
    .then(data => {
        matchId = data.match_id;
        console.log(`Match created with ID: ${matchId}`);
        document.getElementById('players-input').classList.add('hidden');

        // Prepare to enter bets
        const betsDiv = document.getElementById('bets');
        betsDiv.innerHTML = ''; // Clear previous bets
        playerNames.forEach((name, index) => {
            betsDiv.innerHTML += `<input type="number" id="bet${index + 1}" placeholder="${name}'s Bet">`;
        });
        document.getElementById('bets-input').classList.remove('hidden');
    })
    .catch(error => alert(error.message));
}

function submitBets() {
    if (!matchId) {
        alert("No match has been created.");
        return;
    }

    const bets = [];
    playerNames.forEach((name, index) => {
        const bet = document.getElementById(`bet${index + 1}`).value || 0;
        bets.push({ player: name, bet: parseFloat(bet) });
    });

    fetch(`/api/match/${matchId}/bet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bets)
    })
    .then(response => {
        if (response.ok) {
            console.log('Bets submitted successfully.');
            document.getElementById('new-round').classList.remove('hidden');
        } else {
            alert("Error submitting bets.");
        }
    });
}

function newRound() {
    if (!matchId) {
        alert("No match has been created.");
        return;
    }

    fetch(`/api/match/${matchId}/new_round`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            console.log('Moved to the next round.');
            fetch(`/api/match/${matchId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.current_round <= data.total_rounds) { // Use <= to ensure it prompts for all rounds
                        alert(`Current Round: ${data.current_round}`);
                        // Prepare for the next round's bets
                        const betsDiv = document.getElementById('bets');
                        betsDiv.innerHTML = ''; // Clear previous bets
                        playerNames.forEach((name, index) => {
                            betsDiv.innerHTML += `<input type="number" id="bet${index + 1}" placeholder="${name}'s Bet">`;
                        });
                        document.getElementById('bets-input').classList.remove('hidden');
                    } else {
                        alert("All rounds are complete. Please declare a winner.");
                        document.getElementById('declare-winner').classList.remove('hidden');
                    }
                });
        } else {
            alert("Error moving to the next round.");
        }
    });
}

function declareWinner() {
    if (!matchId) {
        alert("No match has been created.");
        return;
    }

    const winner = prompt("Enter the name of the winner:");
    const winnings = prompt("Enter the winnings for the winner:");

    fetch(`/api/match/${matchId}/declare_winner`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ winner: winner, winnings: winnings })  // Send winnings as well
    })
    .then(response => {
        if (response.ok) {
            console.log('Winner declared successfully.');
            alert(`Winner: ${winner}, Winnings: ${winnings}`);
            resetMatch();  // Reset match to start a new game
        } else {
            alert("Error declaring winner.");
        }
    });
}

function resetMatch() {
    matchId = null;
    playerNames = [];
    document.getElementById('player-count').value = '';
    document.getElementById('players-input').classList.add('hidden');
    document.getElementById('bets-input').classList.add('hidden');
    document.getElementById('match-history').innerHTML = ''; // Reset match history
}
