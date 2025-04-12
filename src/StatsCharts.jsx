import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ScoreService from './services/ScoreService';
import AuthService from './services/AuthService';
import databaseService from './services/DatabaseService';

const StatsCharts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartsData, setChartsData] = useState({
        userSignups: [],
        leaderboardScores: []
    });
    const [timePeriod, setTimePeriod] = useState('month'); // Default to month
    const signupChartRef = useRef(null);
    const leaderboardChartRef = useRef(null);
    const signupChartInstance = useRef(null);
    const leaderboardChartInstance = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const users = await fetchAllUsers();
                const allScores = await ScoreService.getAllScores();

                setChartsData({
                    userSignups: users,
                    leaderboardScores: allScores
                });
            } catch (error) {
                console.error("Error fetching chart data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            if (signupChartInstance.current) {
                signupChartInstance.current.destroy();
            }
            if (leaderboardChartInstance.current) {
                leaderboardChartInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!isLoading && signupChartRef.current && leaderboardChartRef.current) {
            renderSignupChart();
            renderLeaderboardChart();
        }
    }, [isLoading, chartsData, timePeriod]);

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

    const renderSignupChart = () => {
        const { userSignups } = chartsData;
        if (!signupChartRef.current || userSignups.length === 0) return;

        const sortedUsers = [...userSignups].sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        let labels = [];
        let data = [];
        const signupsMap = {};

        if (timePeriod === 'day') {
            sortedUsers.forEach(user => {
                const date = new Date(user.createdAt);
                const dayKey = date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: '2-digit' });
                signupsMap[dayKey] = (signupsMap[dayKey] || 0) + 1;
            });
        } else if (timePeriod === 'week') {
            sortedUsers.forEach(user => {
                const date = new Date(user.createdAt);
                const year = date.getFullYear();
                const weekNumber = getWeekNumber(date);
                const weekKey = `${year}-W${weekNumber}`;
                signupsMap[weekKey] = (signupsMap[weekKey] || 0) + 1;
            });
        } else if (timePeriod === 'month') {
            sortedUsers.forEach(user => {
                const date = new Date(user.createdAt);
                const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                signupsMap[monthKey] = (signupsMap[monthKey] || 0) + 1;
            });
        }

        labels = Object.keys(signupsMap);
        data = Object.values(signupsMap);

        if (signupChartInstance.current) {
            signupChartInstance.current.destroy();
        }

        const ctx = signupChartRef.current.getContext('2d');
        signupChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Users',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 20,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `User Signups by ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} new users`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Signups'
                        },
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            maxTicksLimit: timePeriod === 'day' ? 10 : 20
                        }
                    }
                }
            }
        });
    };

    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const renderLeaderboardChart = () => {
        const { leaderboardScores } = chartsData;
        if (!leaderboardChartRef.current || leaderboardScores.length === 0) return;

        const topScores = [...leaderboardScores].slice(0, 10);

        if (leaderboardChartInstance.current) {
            leaderboardChartInstance.current.destroy();
        }

        const ctx = leaderboardChartRef.current.getContext('2d');
        leaderboardChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topScores.map(score => score.email ? score.email.split('@')[0] : 'Unknown'),
                datasets: [{
                    label: 'Top Scores',
                    data: topScores.map(score => score.score),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Leaderboard'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Player'
                        }
                    }
                }
            }
        });
    };

    if (isLoading) {
        return <div>Loading chart data...</div>;
    }

    if (chartsData.userSignups.length === 0) {
        return <div>No user signup data available.</div>;
    }

    return (
        <div className="stats-charts">
            <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setTimePeriod('day')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: timePeriod === 'day' ? '#4bc0c0' : '#e0e0e0',
                            color: timePeriod === 'day' ? 'white' : 'black',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setTimePeriod('week')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: timePeriod === 'week' ? '#4bc0c0' : '#e0e0e0',
                            color: timePeriod === 'week' ? 'white' : 'black',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setTimePeriod('month')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: timePeriod === 'month' ? '#4bc0c0' : '#e0e0e0',
                            color: timePeriod === 'month' ? 'white' : 'black',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Month
                    </button>
                </div>
                <canvas ref={signupChartRef} />
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
                <canvas ref={leaderboardChartRef} />
            </div>
        </div>
    );
};

export default StatsCharts;