import React, { useEffect, useState } from 'react';
import ScoreService from './services/ScoreService';
import Leaderboard from './Leaderboard';
import StatsDashboard from './StatsDashboard';
import './styles/Home.css';

export const Home = ({ onStartExperience, onLogout, username }) => {
    const [userScores, setUserScores] = useState([]);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        if (username) {
            // Get this user's personal scores
            ScoreService.getScoresByEmail(username).then(scores => {
                // Sort by score (highest first)
                const sortedScores = scores.sort((a, b) => b.score - a.score);
                setUserScores(sortedScores);
            });
        }
    }, [username]);

    return (
        <div className="home-container">
            <div className="content">
                <div className="user-welcome">
                    {username && <h2>Welcome, {username}!</h2>}
                    <div className="user-actions">
                        <button
                            className="stats-toggle-button"
                            onClick={() => setShowStats(!showStats)}
                        >
                            {showStats ? 'Hide Stats' : 'Show Stats'}
                        </button>
                        <button className="logout-button" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <h1>Welcome to Meta Train 360!</h1>
                <p className="tagline">An immersive WebXR shooting game experience.</p>
                <p className="highlight">Optimized for <strong>Meta Quest</strong> and other VR headsets.</p>

                {/* Stats Dashboard (toggleable) */}
                {showStats && <StatsDashboard />}

                {/* Only show this section if stats dashboard is hidden */}
                {!showStats && (
                    <>
                        <div className="features">
                            <div className="feature">
                                <h3>🔹 Immersive VR</h3>
                                <p>Fully interactive 3D environment with smooth controls.</p>
                            </div>
                            <div className="feature">
                                <h3>🎯 Shooting Mechanics</h3>
                                <p>Engaging gameplay with real-time target tracking.</p>
                            </div>
                            <div className="feature">
                                <h3>🏆 Score Tracking</h3>
                                <p>Compete and track your best scores dynamically.</p>
                            </div>
                        </div>

                        <div className="game-stats-container">
                            <div className="personal-stats">
                                {userScores.length > 0 && (
                                    <div className="personal-scores-section">
                                        <h3>Your Top Scores</h3>
                                        <ul className="personal-scores-list">
                                            {userScores.slice(0, 5).map((score, index) => (
                                                <li key={index}>
                                                    <span className="score-value">{score.score}</span> -
                                                    <span className="score-date">{new Date(score.timestamp).toLocaleString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* The Leaderboard Component */}
                            <Leaderboard />
                        </div>
                    </>
                )}

                <button className="start-button" onClick={onStartExperience}>
                    🚀 Start Experience
                </button>

                <div className="instructions">
                    <h3>How to Play</h3>
                    <ul>
                        <li>Click "Start Experience" above.</li>
                        <li>Press "Enter VR" on the next screen.</li>
                        <li>Use your controller to aim and shoot targets.</li>
                        <li>Score high and challenge yourself!</li>
                    </ul>
                </div>
            </div>

            <footer>
                <p className="footer-text">© 2025 VR Shooting Experience. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Home;