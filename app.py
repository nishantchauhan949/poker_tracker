import json
import os
from datetime import datetime

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Define the path for the matches directory
MATCHES_DIR = 'matches'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/match', methods=['POST'])
def create_match():
    player_names = request.json.get('players', [])
    match_id = datetime.now().strftime("%Y%m%d%H%M%S")  # Create a unique match ID

    # Create initial match data
    match_data = {
        "match_id": match_id,
        "players": player_names,
        "rounds": [],  # Initialize rounds as an empty list
        "current_round": 1,
        "total_rounds": 4,  # Set total rounds here
        "winner": None
    }

    # Save the match data to a JSON file
    with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'w') as f:
        json.dump(match_data, f)

    return jsonify({'match_id': match_id}), 201  # Return match ID and success status


@app.route('/api/match/<match_id>', methods=['GET'])
def get_match(match_id):
    try:
        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'r') as f:
            match_data = json.load(f)
        return jsonify(match_data)
    except FileNotFoundError:
        return jsonify({'error': 'Match not found'}), 404


@app.route('/api/match/<match_id>/new_round', methods=['POST'])
def new_round(match_id):
    try:
        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'r') as f:
            match_data = json.load(f)

        # Check if we can increment to the next round
        if match_data['current_round'] <= match_data['total_rounds']:
            match_data['current_round'] += 1  # Increment round

            with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'w') as f:
                json.dump(match_data, f)

            return jsonify({'success': True})
        else:
            return jsonify({'error': 'All rounds are complete'}), 400  # Return an error if all rounds are complete
    except FileNotFoundError:
        return jsonify({'error': 'Match not found'}), 404


@app.route('/api/match/<match_id>/bet', methods=['POST'])
def submit_bets(match_id):
    try:
        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'r') as f:
            match_data = json.load(f)

        bets = request.json
        # Ensure that the current round has an entry in rounds
        while len(match_data['rounds']) < match_data['current_round']:
            match_data['rounds'].append([])  # Add a new round entry

        # Store the bets for the current round
        match_data['rounds'][match_data['current_round'] - 1] = bets

        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'w') as f:
            json.dump(match_data, f)

        return jsonify({'success': True}), 200
    except FileNotFoundError:
        return jsonify({'error': 'Match not found'}), 404


@app.route('/api/match/<match_id>/declare_winner', methods=['POST'])
def declare_winner(match_id):
    try:
        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'r') as f:
            match_data = json.load(f)

        winner = request.json.get('winner')
        winnings = request.json.get('winnings')

        match_data['winner'] = {
            'name': winner,
            'winnings': winnings
        }

        with open(os.path.join(MATCHES_DIR, f'match_{match_id}.json'), 'w') as f:
            json.dump(match_data, f)

        return jsonify({'success': True}), 200
    except FileNotFoundError:
        return jsonify({'error': 'Match not found'}), 404


@app.route('/api/match/winnings', methods=['GET'])
def get_winnings():
    matches = []  # List to hold match data
    for filename in os.listdir(MATCHES_DIR):
        if filename.endswith('.json'):
            with open(os.path.join(MATCHES_DIR, filename), 'r') as f:
                match_data = json.load(f)
                matches.append(match_data)

    return jsonify(matches)


@app.route('/winnings.html')
def winnings_page():
    return render_template('winnings.html')


@app.route('/api/matches')
def get_matches():
    matches = []
    for filename in os.listdir('matches'):
        if filename.endswith('.json'):
            with open(os.path.join('matches', filename), 'r') as f:
                match_data = json.load(f)
                matches.append(match_data)
    return jsonify(matches)


if __name__ == '__main__':
    app.run(debug=True)
