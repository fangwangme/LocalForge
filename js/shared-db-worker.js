// shared-db-worker.js
// Pure in-memory SQLite - persistence handled by index.html via File System Access API
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.min.js');

// Global state
let SQL = null;
let db = null;
let ports = [];

initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
}).then(async module => {
    SQL = module;
    console.log('[SharedWorker] SQL.js ready (no IDB cache)');
    broadcast({ type: 'WORKER_READY' });
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
            port.postMessage({ type: 'DB_OPENED', recovered: false });
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
                        console.log('[SharedWorker] Database opened from file data.');
                    } else if (!db) {
                        db = new SQL.Database();
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
                        // No IDB save - index.html handles persistence via File System Access API
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
