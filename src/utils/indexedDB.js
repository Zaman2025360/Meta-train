const DB_NAME = 'WebXRGameDB_v6';
const DB_VERSION = 6;
const USER_STORE = 'users';

// Initialize the database
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject('Error opening database: ' + event.target.errorCode);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create users object store with auto-incrementing ID
            if (!db.objectStoreNames.contains(USER_STORE)) {
                const store = db.createObjectStore(USER_STORE, { keyPath: 'id', autoIncrement: true });

                // Create indexes for quick lookups
                store.createIndex('username', 'username', { unique: true });
                store.createIndex('email', 'email', { unique: true });

                console.log('Database setup complete');
            }
        };
    });
};

// Check if a username or email already exists
export const checkUserExists = async (username, email) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readonly');
        const store = transaction.objectStore(USER_STORE);
        const usernameIndex = store.index('username');
        const emailIndex = store.index('email');

        const usernameRequest = usernameIndex.get(username);

        usernameRequest.onsuccess = () => {
            if (usernameRequest.result) {
                resolve(true); // Username exists
                return;
            }

            // Check email next
            const emailRequest = emailIndex.get(email);

            emailRequest.onsuccess = () => {
                resolve(!!emailRequest.result); // Return true if email exists
            };

            emailRequest.onerror = (event) => {
                reject(event.target.error);
            };
        };

        usernameRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Add a new user
export const addUser = async (userData) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readwrite');
        const store = transaction.objectStore(USER_STORE);

        const request = store.add(userData);

        request.onsuccess = (event) => {
            resolve(event.target.result); // Return the generated id
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Verify user credentials
export const verifyUser = async (username, password) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readonly');
        const store = transaction.objectStore(USER_STORE);
        const index = store.index('username');

        const request = index.get(username);

        request.onsuccess = () => {
            const user = request.result;

            if (user && user.password === password) {
                resolve(user); // Return user if credentials match
            } else {
                resolve(null); // No match found
            }
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Get user by ID
export const getUserById = async (userId) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readonly');
        const store = transaction.objectStore(USER_STORE);

        const request = store.get(userId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Update user data (like high score)
export const updateUser = async (userId, userData) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readwrite');
        const store = transaction.objectStore(USER_STORE);

        // First get the current user data
        const getRequest = store.get(userId);

        getRequest.onsuccess = () => {
            const user = getRequest.result;
            if (!user) {
                reject(new Error('User not found'));
                return;
            }

            // Update with new data
            const updatedUser = { ...user, ...userData };

            // Put the updated user back
            const putRequest = store.put(updatedUser);

            putRequest.onsuccess = () => {
                resolve(updatedUser);
            };

            putRequest.onerror = (event) => {
                reject(event.target.error);
            };
        };

        getRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// Get top scores
export const getTopScores = async (limit = 10) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USER_STORE], 'readonly');
        const store = transaction.objectStore(USER_STORE);

        const request = store.openCursor();
        const users = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                users.push({
                    id: cursor.value.id,
                    username: cursor.value.username,
                    highScore: cursor.value.highScore || 0
                });
                cursor.continue();
            } else {
                // Sort by high score (descending) and take the top 'limit'
                const topScores = users
                    .sort((a, b) => b.highScore - a.highScore)
                    .slice(0, limit);

                resolve(topScores);
            }
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};