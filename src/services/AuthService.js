import databaseService from './DatabaseService';

class AuthService {
    constructor() {
        this.usersStore = databaseService.usersStore;
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

    async registerUser(user) {
        return this.withDB(async (db) => {
            // Check if user exists first
            const existingUser = await this.getUserByEmail(user.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.usersStore], 'readwrite');
                const store = transaction.objectStore(this.usersStore);

                const newUser = {
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    createdAt: new Date().toISOString()
                };

                const request = store.add(newUser);

                request.onsuccess = () => {
                    const { password, ...userWithoutPassword } = newUser;
                    resolve(userWithoutPassword);
                };

                request.onerror = (event) => {
                    reject(new Error(`Error creating user: ${event.target.error}`));
                };
            });
        });
    }

    async loginUser(email, password) {
        return this.withDB(async (db) => {
            const user = await this.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return userWithoutPassword;
        });
    }

    async getUserByEmail(email) {
        return this.withDB((db) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.usersStore], 'readonly');
                const store = transaction.objectStore(this.usersStore);
                const request = store.get(email);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    reject(new Error(`Error retrieving user: ${event.target.error}`));
                };
            });
        });
    }
    // Log out user
    logoutUser() {
        localStorage.removeItem('currentUser');
    }

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    // Get current user
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
}

export default new AuthService();