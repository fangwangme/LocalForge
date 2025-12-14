// js/db-client.js

class DbClient {
    constructor() {
        this.worker = null;
        this.pendingRequests = new Map();
        this.isReady = false;
        this.listeners = new Set(); // For DB_UPDATED events
        this.isOpen = false;
        this.connect();
    }

    connect() {
        if (window.location.protocol === 'file:') {
            console.warn('[LocalForge] Running on file:// protocol. SharedWorker and IndexedDB may not work correctly. Please use a local server (e.g. python3 -m http.server) for best experience.');
        }

        this.worker = new SharedWorker(`js/shared-db-worker.js?v=${Date.now()}`);

        this.worker.port.onmessage = (e) => {
            const msg = e.data;
            console.log('[DbClient] 📩 Msg:', msg.type, msg);

            if (msg.type === 'WORKER_READY') {
                console.log('[DbClient] ✅ Worker Ready');
                this.isReady = true;
                this.notifyListeners('ready');
            } else if (msg.type === 'DB_OPENED') {
                console.log('[DbClient] 🗄️ Database Opened');
                this.isOpen = true; // DB is open
                this.notifyListeners('db_opened');
            } else if (msg.type === 'DB_UPDATED') {
                this.notifyListeners('db_updated');
            } else if (msg.type === 'QuerySuccess') {
                const req = this.pendingRequests.get(msg.requestId);
                if (req) {
                    this.pendingRequests.delete(msg.requestId);
                    req.resolve(msg.result);
                }
            } else if (msg.type === 'QueryError') {
                const req = this.pendingRequests.get(msg.requestId);
                if (req) {
                    this.pendingRequests.delete(msg.requestId);
                    req.reject(new Error(msg.message));
                }
            } else if (msg.type === 'DB_EXPORTED') {
                const req = this.pendingRequests.get(msg.requestId);
                if (req) {
                    this.pendingRequests.delete(msg.requestId);
                    req.resolve(msg.data);
                }
            }
        };

        this.worker.port.start();
    }

    _request(type, payload = {}) {
        return new Promise((resolve, reject) => {
            const requestId = type + '_' + Date.now() + '_' + Math.random();
            this.pendingRequests.set(requestId, { resolve, reject });
            this.worker.port.postMessage({
                type,
                requestId,
                ...payload
            });
        });
    }

    async init(data = null) {
        return this._request('OPEN_DB', { data });
    }

    async query(sql, params = []) {
        // Returns array of objects? sql.js returns {columns, values}
        // Let's normalize it here for easier usage in tools? 
        // Or keep raw sql.js format? 
        // Keeping raw format is safer but harder to use. 
        // Let's return raw first.
        return this._request('EXEC_SQL', { sql, params });
    }

    async execute(sql, params = []) {
        return this._request('EXEC_SQL', { sql, params });
    }

    async export() {
        return this._request('EXPORT_DB');
    }

    on(event, callback) {
        // Simple listener support
        // Events: ready, db_opened, db_updated
        this.listeners.add({ event, callback });
    }

    notifyListeners(event) {
        this.listeners.forEach(l => {
            if (l.event === event) l.callback();
        });
    }
}

export const db = new DbClient();
