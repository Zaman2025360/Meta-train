import React, { useEffect, useState } from 'react';
import StatsCharts from './StatsCharts';
import ScoreService from './services/ScoreService';
import AuthService from './services/AuthService';
import databaseService from './services/DatabaseService';
import './styles/StatsDashboard.css';

const StatsDashboard = () => {
    const [stats, setStats] = useState({
        totalGames: 0,
        highestScore: 0,
        averageScore: 0,
        lastScore: null, // New field for last score
        recentScores: [],
        rank: 'N/A',
        totalUsers: 0,
        signupsToday: 0,
        signupsThisWeek: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) return;

                // Get personal scores
                const userScores = await ScoreService.getScoresByEmail(currentUser.email);
                const lastScore = await ScoreService.getLastScoreByEmail(currentUser.email);

                // Get all scores for ranking
                const allScores = await ScoreService.getAllScores();

                // Get all users for signup statistics
                const allUsers = await fetchAllUsers();

                // Calculate game statistics
                const totalGames = userScores.length;
                const highestScore = userScores.length > 0
                    ? Math.max(...userScores.map(score => score.score))
                    : 0;
                const averageScore = userScores.length > 0
                    ? userScores.reduce((sum, score) => sum + score.score, 0) / totalGames
                    : 0;

                // Sort by recent and take last 5
                const recentScores = [...userScores]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 5);

                // Calculate rank based on last score
                let rank = 'N/A';
                if (allScores.length > 0 && lastScore) {
                    const playerIndex = allScores.findIndex(score =>
                        score.email === currentUser.email
                    );
                    if (playerIndex !== -1) {
                        rank = `${playerIndex + 1} of ${allScores.length}`;
                    }
                }

                // Calculate user signup statistics
                const totalUsers = allUsers.length;

                // Calculate signups today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const signupsToday = allUsers.filter(user => {
                    const signupDate = new Date(user.createdAt);
                    return signupDate >= today;
                }).length;

                // Calculate signups this week
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                oneWeekAgo.setHours(0, 0, 0, 0);
                const signupsThisWeek = allUsers.filter(user => {
                    const signupDate = new Date(user.createdAt);
                    return signupDate >= oneWeekAgo;
                }).length;

                setStats({
                    totalGames,
                    highestScore,
                    averageScore,
                    lastScore: lastScore ? lastScore.score : 0,
                    recentScores,
                    rank,
                    totalUsers,
                    signupsToday,
                    signupsThisWeek
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const fetchAllUsers = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await databaseService.getDB();
                const transaction = db.transaction([databaseService.usersStore], 'readonly');
                const store = transaction.objectStore(databaseService.usersStore);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = (event) => {
                    reject(new Error(`Failed to fetch users: ${event.target.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    };

    if (isLoading) {
        return <div className="loading">Loading your statistics...</div>;
    }

    return (
        <div className="stats-dashboard">
            <div className="stats-summary">
                <h2>Game Stats</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Highest Score</h3>
                        <div className="stat-value">{stats.highestScore}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Last Score</h3>
                        <div className="stat-value">{stats.lastScore || 'N/A'}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Rank</h3>
                        <div className="stat-value">{stats.rank}</div>
                    </div>
                </div>
            </div>

            <div className="user-stats-summary">
                <h2>User Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Signups Today</h3>
                        <div className="stat-value">{stats.signupsToday}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Signups This Week</h3>
                        <div className="stat-value">{stats.signupsThisWeek}</div>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <h3>Statistics Charts</h3>
                <StatsCharts />
            </div>
        </div>
    );
};

export default StatsDashboard;