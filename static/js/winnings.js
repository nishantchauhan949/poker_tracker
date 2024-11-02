document.addEventListener('DOMContentLoaded', () => {
    fetchWinnings();
});

function fetchWinnings() {
    fetch('/api/matches')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(matches => {
            const tableBody = document.querySelector('#winnings-table tbody');
            matches.forEach(match => {
                const row = document.createElement('tr');

                const matchIdCell = document.createElement('td');
                matchIdCell.textContent = match.match_id;

                const playersCell = document.createElement('td');
                playersCell.textContent = match.players.join(', ');

                const betsCell = document.createElement('td');
                betsCell.textContent = match.rounds.map(round =>
                    round.map(bet => `${bet.player}: ${bet.bet}`).join(', ')
                ).join(' | ');

                const winnerCell = document.createElement('td');
                winnerCell.textContent = match.winner ? match.winner.name : 'N/A';

                const winningsCell = document.createElement('td');
                winningsCell.textContent = match.winner ? match.winner.winnings : 'N/A';

                row.appendChild(matchIdCell);
                row.appendChild(playersCell);
                row.appendChild(betsCell);
                row.appendChild(winnerCell);
                row.appendChild(winningsCell);
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching winnings:', error));
}
