// js/db-client.js
// Database client with single-writer coordination

class DbClient {
    constructor() {
        this.worker = null;
        this.pendingRequests = new Map();
        this.isReady = false;
        this.listeners = new Set();
        this.isOpen = false;
        this.isWriter = false;       // Am I the designated file writer?
        this.hasWriter = false;      // Does any client have writer role?
        this.clientId = null;
        this.connect();
    }

    connect() {
        if (window.location.protocol === 'file:') {
            console.warn('[LocalForge] Running on file:// protocol. SharedWorker may not work correctly.');
        }

        // IMPORTANT: Do NOT add dynamic versioning (like Date.now()) to SharedWorker URL!
        // All pages must connect to the SAME worker instance.
        this.worker = new SharedWorker('js/shared-db-worker.js');

        this.worker.port.onmessage = (e) => {
            const msg = e.data;
            console.log('[DbClient] 📩 Msg:', msg.type, msg);

            switch (msg.type) {
                case 'CONNECTED':
                    this.clientId = msg.clientId;
                    console.log('[DbClient] Connected with clientId:', this.clientId);
                    break;

                case 'WORKER_READY':
                    console.log('[DbClient] ✅ Worker Ready');
                    this.isReady = true;
                    this.notifyListeners('ready');
                    break;

                case 'DB_OPENED':
                    console.log('[DbClient] 🗄️ Database Opened');
                    this.isOpen = true;
                    this.notifyListeners('db_opened');
                    break;

                case 'WRITER_STATUS':
                    const wasWriter = this.isWriter;
                    const hadWriter = this.hasWriter;
                    this.isWriter = msg.isWriter;
                    this.hasWriter = msg.hasWriter;
                    console.log('[DbClient] ✍️ Writer status:', this.isWriter ? 'I am writer' : 'Not writer',
                        '| hasWriter:', this.hasWriter);

                    if (wasWriter !== this.isWriter) {
                        this.notifyListeners('writer_changed', { isWriter: this.isWriter });
                    }

                    // Auto-claim writer if no one has it (previous writer disconnected)
                    if (hadWriter && !this.hasWriter && !this.isWriter) {
                        console.log('[DbClient] 🔄 No writer detected, auto-claiming...');
                        setTimeout(() => this.claimWriter(), Math.random() * 500); // Small random delay to avoid race
                    }
                    break;

                case 'DB_UPDATED':
                    // Pass info about whether this client should write
                    this.notifyListeners('db_updated', {
                        sourceRequestId: msg.sourceRequestId,
                        shouldWrite: this.isWriter
                    });
                    break;

                case 'QuerySuccess':
                    const req = this.pendingRequests.get(msg.requestId);
                    if (req) {
                        this.pendingRequests.delete(msg.requestId);
                        req.resolve(msg.result);
                    }
                    break;

                case 'QueryError':
                    const errReq = this.pendingRequests.get(msg.requestId);
                    if (errReq) {
                        this.pendingRequests.delete(msg.requestId);
                        errReq.reject(new Error(msg.message));
                    }
                    break;

                case 'DB_EXPORTED':
                    const expReq = this.pendingRequests.get(msg.requestId);
                    if (expReq) {
                        this.pendingRequests.delete(msg.requestId);
                        expReq.resolve(msg.data);
                    }
                    break;
            }
        };

        this.worker.port.start();

        // Release writer role when page is unloading
        window.addEventListener('beforeunload', () => {
            if (this.isWriter) {
                this.releaseWriter();
            }
        });
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
        return this._request('EXEC_SQL', { sql, params });
    }

    async execute(sql, params = []) {
        return this._request('EXEC_SQL', { sql, params });
    }

    async export() {
        return this._request('EXPORT_DB');
    }

    // Request to become the writer (for file persistence)
    claimWriter() {
        console.log('[DbClient] Claiming writer role...');
        this.worker.port.postMessage({
            type: 'CLAIM_WRITER',
            clientId: this.clientId
        });
    }

    // Release writer role (called on page unload or manually)
    releaseWriter() {
        console.log('[DbClient] Releasing writer role...');
        this.stopPeriodicSync();
        this.worker.port.postMessage({ type: 'RELEASE_WRITER' });
    }

    // Start periodic file sync (only for writer)
    startPeriodicSync(intervalMs = 10000) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        console.log(`[DbClient] Starting periodic sync every ${intervalMs}ms`);

        // Initial sync
        if (this.isWriter) {
            this.notifyListeners('sync_to_file');
        }

        this.syncInterval = setInterval(() => {
            if (this.isWriter) {
                console.log('[DbClient] ⏱️ Periodic sync triggered');
                this.notifyListeners('sync_to_file');
            }
        }, intervalMs);
    }

    // Stop periodic sync
    stopPeriodicSync() {
        if (this.syncInterval) {
            console.log('[DbClient] Stopping periodic sync');
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    on(event, callback) {
        this.listeners.add({ event, callback });
    }

    off(event, callback) {
        this.listeners.forEach(l => {
            if (l.event === event && l.callback === callback) {
                this.listeners.delete(l);
            }
        });
    }

    notifyListeners(event, data = null) {
        this.listeners.forEach(l => {
            if (l.event === event) l.callback(data);
        });
    }
}

export const db = new DbClient();
