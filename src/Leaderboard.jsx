import React, { useEffect, useState } from 'react';
import ScoreService from './services/ScoreService';
import './styles/Leaderboard.css';

const Leaderboard = () => {
    const [leaderboardScores, setLeaderboardScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);
                const scores = await ScoreService.getAllScores();
                setLeaderboardScores(scores);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard data:', err);
                setError('Failed to load leaderboard data');
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    // Format email to show only first part or username
    const formatUserIdentifier = (email) => {
        return email.split('@')[0];
    };

    // Format date to be more readable
    const formatDate = (dateString) => {
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="leaderboard-loading">Loading leaderboard...</div>;
    if (error) return <div className="leaderboard-error">{error}</div>;

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">🏆 Leaderboard</h2>

            {leaderboardScores.length === 0 ? (
                <p className="no-scores-message">No scores recorded yet. Be the first to play!</p>
            ) : (
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardScores.map((score, index) => (
                            <tr key={index} className={index < 3 ? `rank-${index + 1}` : ''}>
                                <td className="rank-cell">{index + 1}</td>
                                <td className="player-cell">{formatUserIdentifier(score.email)}</td>
                                <td className="score-cell">{score.score}</td>
                                <td className="date-cell">{formatDate(score.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Leaderboard;