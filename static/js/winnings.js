// winnings.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/matches')  // Adjust this URL to match your API endpoint
        .then(response => response.json())
        .then(matches => {
            const tableBody = document.querySelector('#winnings-table tbody');
            tableBody.innerHTML = ''; // Clear existing content

            matches.forEach(match => {
                const { match_id, players, rounds, winner } = match;

                // Prepare arrays to hold individual bets
                const preFoldBets = [];
                const flopBets = [];
                const turnBets = [];
                const riverBets = [];

                // Distribute bets to their respective rounds
                rounds.forEach((round, index) => {
                    round.forEach(bet => {
                        // Push bets to the corresponding round array
                        if (index === 0) {
                            preFoldBets.push(`${bet.player}: ${bet.bet}`);
                        } else if (index === 1) {
                            flopBets.push(`${bet.player}: ${bet.bet}`);
                        } else if (index === 2) {
                            turnBets.push(`${bet.player}: ${bet.bet}`);
                        } else if (index === 3) {
                            riverBets.push(`${bet.player}: ${bet.bet}`);
                        }
                    });
                });

                // Create a new row with individual bets
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${match_id}</td>
                    <td>${players.join(', ')}</td>
                    <td>${preFoldBets.join(', ')}</td>
                    <td>${flopBets.join(', ')}</td>
                    <td>${turnBets.join(', ')}</td>
                    <td>${riverBets.join(', ')}</td>
                    <td>${winner.name}</td>
                    <td>${winner.winnings}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching matches:', error));
});
