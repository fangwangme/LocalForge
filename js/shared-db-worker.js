// shared-db-worker.js
// using staticfile.org CDN which is reliable in China
importScripts('https://cdn.staticfile.org/sql.js/1.10.2/sql-wasm.min.js');

const DB_STORE_NAME = 'localforge_store';
const DB_KEY_NAME = 'sqlite_db_dump';
const IDB_NAME = 'LocalForgeIDB';

// Global state
let SQL = null;
let db = null;
let ports = [];

// IndexedDB helpers
function openIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const idb = e.target.result;
            if (!idb.objectStoreNames.contains(DB_STORE_NAME)) {
                idb.createObjectStore(DB_STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function loadFromIDB() {
    try {
        const idb = await openIDB();
        const tx = idb.transaction(DB_STORE_NAME, 'readonly');
        const store = tx.objectStore(DB_STORE_NAME);
        const request = store.get(DB_KEY_NAME);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('[SharedWorker] loadFromIDB error:', err);
        return null;
    }
}

async function saveToIDB(data) {
    try {
        const idb = await openIDB();
        const tx = idb.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        store.put(data, DB_KEY_NAME);
        return new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    } catch (err) {
        console.error('[SharedWorker] saveToIDB error:', err);
    }
}

initSqlJs({
    locateFile: file => `https://cdn.staticfile.org/sql.js/1.10.2/${file}`
}).then(async module => {
    SQL = module;

    // Try auto-load from IDB
    const savedData = await loadFromIDB();
    if (savedData) {
        try {
            db = new SQL.Database(new Uint8Array(savedData));
            console.log('[SharedWorker] Auto-loaded database from IndexedDB');
        } catch (e) {
            console.error('[SharedWorker] Failed to open saved DB:', e);
            db = null;
        }
    }

    broadcast({ type: 'WORKER_READY' });
    if (db) broadcast({ type: 'DB_OPENED', recovered: true });

}).catch(err => {
    console.error('[SharedWorker] Failed to load sql.js:', err);
    broadcast({ type: 'WORKER_ERROR', message: 'Failed to load SQL engine' });
});

self.onconnect = function (e) {
    const port = e.ports[0];
    ports.push(port);
    console.log('[SharedWorker] New connection. Total clients:', ports.length);

    port.postMessage({ type: 'CONNECTED', clientId: Date.now() });

    if (SQL) {
        port.postMessage({ type: 'WORKER_READY' });
        if (db) {
            port.postMessage({ type: 'DB_OPENED', recovered: true });
        }
    }

    port.onmessage = async function (e) {
        const msg = e.data;

        if (!SQL) {
            if (msg.type !== 'PING') {
                port.postMessage({ type: 'WORKER_ERROR', message: 'SQL engine not ready', requestId: msg.requestId });
            }
            return;
        }

        try {
            switch (msg.type) {
                case 'OPEN_DB':
                    if (msg.data) {
                        db = new SQL.Database(new Uint8Array(msg.data));
                        await saveToIDB(msg.data); // Initial save
                        console.log('[SharedWorker] Database opened from file data.');
                    } else if (!db) {
                        // Only create new if we didn't load one yet
                        db = new SQL.Database();
                        await saveToIDB(db.export());
                        console.log('[SharedWorker] New empty database created.');
                    }
                    port.postMessage({
                        type: 'QuerySuccess',
                        requestId: msg.requestId,
                        result: true
                    });
                    broadcast({ type: 'DB_OPENED' });
                    break;

                case 'EXEC_SQL':
                    if (!db) throw new Error('Database not open');

                    let result = [];
                    if (msg.sql.trim().toUpperCase().startsWith('SELECT')) {
                        result = db.exec(msg.sql, msg.params);
                    } else {
                        db.run(msg.sql, msg.params);
                        // Save on write
                        // Debounce? For safety, just save for now. 
                        // Note: exporting whole DB is expensive for large DBs. 
                        // But for this app, it's safer.
                        saveToIDB(db.export()).catch(e => console.error(e));
                    }

                    port.postMessage({
                        type: 'QuerySuccess',
                        requestId: msg.requestId,
                        result: result
                    });

                    if (!msg.sql.trim().toUpperCase().startsWith('SELECT')) {
                        broadcast({ type: 'DB_UPDATED', sourceRequestId: msg.requestId }, port);
                    }
                    break;

                case 'EXPORT_DB':
                    if (!db) throw new Error('Database not open');
                    const array = db.export();
                    port.postMessage({
                        type: 'DB_EXPORTED',
                        requestId: msg.requestId,
                        data: array
                    }, [array.buffer]);
                    break;

                case 'CLOSE_DB':
                    if (db) {
                        db.close();
                        db = null;
                        // Should we clear IDB? Probably not, user might want to resume.
                        broadcast({ type: 'DB_CLOSED' });
                    }
                    break;
            }
        } catch (err) {
            console.error('[SharedWorker] Error processing message:', msg.type, err);
            port.postMessage({
                type: 'QueryError',
                requestId: msg.requestId,
                message: err.message
            });
        }
    };
};

function broadcast(msg, excludePort = null) {
    ports.forEach(p => {
        // if (p !== excludePort) 
        p.postMessage(msg);
    });
}
