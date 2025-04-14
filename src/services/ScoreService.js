import databaseService from './DatabaseService';

class ScoreService {
    constructor() {
        this.scoresStore = databaseService.scoresStore;
    }

    async withDB(callback) {
        try {
            const db = await databaseService.getDB();
            return await callback(db);
        } catch (error) {
            console.error('Database operation failed:', error);
            throw error;
        }
    }

    async saveScore(email, score) {
        return this.withDB((db) => {
            if (!email || typeof score !== 'number') {
                throw new Error('Invalid score data');
            }

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.scoresStore], 'readwrite');
                transaction.onerror = (event) => {
                    reject(new Error(`Transaction error: ${event.target.error}`));
                };

                const store = transaction.objectStore(this.scoresStore);
                const newScore = {
                    email,
                    score,
                    timestamp: new Date().toISOString()
                };

                // Always add a new score entry
                const addRequest = store.add(newScore);
                addRequest.onsuccess = () => resolve(newScore);
                addRequest.onerror = (event) =>
                    reject(new Error(`Failed to save score: ${event.target.error}`));
            });
        });
    }

    async getScoresByEmail(email) {
        if (!email) {
            throw new Error('Email is required to fetch scores');
        }

        return this.withDB((db) => {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = db.transaction([this.scoresStore], 'readonly');
                    const store = transaction.objectStore(this.scoresStore);
                    const emailIndex = store.index('email');
                    const request = emailIndex.getAll(email);

                    request.onsuccess = () => {
                        resolve(request.result || []);
                    };

                    request.onerror = (event) => {
                        reject(new Error(`Failed to fetch scores: ${event.target.error}`));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async getLastScoreByEmail(email) {
        if (!email) {
            throw new Error('Email is required to fetch the last score');
        }

        return this.withDB((db) => {
            return new Promise((resolve, reject) => {
                try {
                    const transaction = db.transaction([this.scoresStore], 'readonly');
                    const store = transaction.objectStore(this.scoresStore);
                    const emailIndex = store.index('email');
                    const request = emailIndex.getAll(email);

                    request.onsuccess = () => {
                        const scores = request.result || [];
                        if (scores.length === 0) {
                            resolve(null);
                        } else {
                            // Sort by timestamp descending and take the first (most recent)
                            const lastScore = scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                            resolve(lastScore);
                        }
                    };

                    request.onerror = (event) => {
                        reject(new Error(`Failed to fetch last score: ${event.target.error}`));
                    };
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async getAllScores() {
        return this.withDB((db) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.scoresStore], 'readonly');
                const store = transaction.objectStore(this.scoresStore);
                const request = store.getAll();

                request.onsuccess = () => {
                    const allScores = request.result;

                    // Get the highest score per user
                    const userBestScores = allScores.reduce((acc, score) => {
                        if (!acc[score.email] || score.score > acc[score.email].score) {
                            acc[score.email] = score;
                        }
                        return acc;
                    }, {});

                    // Convert to array and sort by score descending
                    const leaderboard = Object.values(userBestScores)
                        .sort((a, b) => b.score - a.score);

                    resolve(leaderboard);
                };

                request.onerror = (event) => {
                    reject(new Error(`Failed to fetch all scores: ${event.target.error}`));
                };
            });
        });
    }

    async getLeaderboard(limit = 10) {
        const allScores = await this.getAllScores();
        return allScores.slice(0, limit);
    }
}

const scoreService = new ScoreService();
export default scoreService;