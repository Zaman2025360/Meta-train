class DatabaseService {
    constructor() {
        this.dbName = 'webxrAppDB_v2';
        this.dbVersion = 14; // Increment version to force upgrade
        this.usersStore = 'users';
        this.scoresStore = 'scores';
        this.db = null;
        this.initializing = null;
        this.isInitialized = false;
    }

    async initDB() {
        // If already initialized, return the db
        if (this.isInitialized) return this.db;

        // If initialization is in progress, wait for it
        if (this.initializing) return await this.initializing;

        // Start initialization
        this.initializing = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Database upgrade needed, creating stores');

                // Create users store if it doesn't exist
                if (!db.objectStoreNames.contains(this.usersStore)) {
                    const usersStore = db.createObjectStore(this.usersStore, { keyPath: 'email' });
                    usersStore.createIndex('username', 'username', { unique: true });
                    console.log('Created users store');
                }

                // Create scores store if it doesn't exist
                if (!db.objectStoreNames.contains(this.scoresStore)) {
                    const scoresStore = db.createObjectStore(this.scoresStore, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    scoresStore.createIndex('email', 'email', { unique: false });
                    scoresStore.createIndex('score', 'score', { unique: false });
                    console.log('Created scores store');
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(`Database error: ${event.target.error}`);
            };

            request.onblocked = () => {
                console.warn('Database upgrade blocked');
                reject('Database upgrade blocked - please close other tabs using this app');
            };
        });

        try {
            return await this.initializing;
        } finally {
            this.initializing = null;
        }
    }

    async getDB() {
        if (!this.isInitialized) {
            return await this.initDB();
        }
        return this.db;
    }

    async clearDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);

            request.onsuccess = () => {
                this.db = null;
                this.isInitialized = false;
                resolve();
            };

            request.onerror = (event) => {
                reject(`Error deleting database: ${event.target.error}`);
            };
        });
    }
}

const databaseService = new DatabaseService();

// For development/debugging
window.clearAppDatabase = () => databaseService.clearDatabase();

export default databaseService;