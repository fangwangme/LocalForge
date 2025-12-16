// shared-db-worker.js
// Pure in-memory SQLite with single-writer coordination
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.min.js');

// Global state
let SQL = null;
let db = null;
let ports = [];
let writerPort = null;  // The port that is responsible for writing to file
let writerClientId = null;

initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
}).then(async module => {
    SQL = module;
    console.log('[SharedWorker] SQL.js ready');
    broadcast({ type: 'WORKER_READY' });
}).catch(err => {
    console.error('[SharedWorker] Failed to load sql.js:', err);
    broadcast({ type: 'WORKER_ERROR', message: 'Failed to load SQL engine' });
});

self.onconnect = function (e) {
    const port = e.ports[0];
    const clientId = Date.now() + '_' + Math.random();
    ports.push({ port, clientId });
    console.log('[SharedWorker] New connection:', clientId, 'Total clients:', ports.length);

    port.postMessage({ type: 'CONNECTED', clientId });

    if (SQL) {
        port.postMessage({ type: 'WORKER_READY' });
        if (db) {
            port.postMessage({ type: 'DB_OPENED', recovered: false });
        }
    }

    // Notify about current writer status
    port.postMessage({
        type: 'WRITER_STATUS',
        isWriter: false,
        hasWriter: writerPort !== null
    });

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
                    // Only initialize if no database exists yet
                    if (db) {
                        console.log('[SharedWorker] Database already open, ignoring init request');
                        port.postMessage({
                            type: 'QuerySuccess',
                            requestId: msg.requestId,
                            result: true
                        });
                        port.postMessage({ type: 'DB_OPENED', alreadyOpen: true });
                    } else if (msg.data) {
                        db = new SQL.Database(new Uint8Array(msg.data));
                        console.log('[SharedWorker] Database opened from file data.');
                        port.postMessage({
                            type: 'QuerySuccess',
                            requestId: msg.requestId,
                            result: true
                        });
                        broadcast({ type: 'DB_OPENED' });
                    } else {
                        db = new SQL.Database();
                        console.log('[SharedWorker] New empty database created.');
                        port.postMessage({
                            type: 'QuerySuccess',
                            requestId: msg.requestId,
                            result: true
                        });
                        broadcast({ type: 'DB_OPENED' });
                    }
                    break;

                case 'CLAIM_WRITER':
                    // Request to become the writer
                    if (writerPort === null) {
                        writerPort = port;
                        writerClientId = msg.clientId;
                        console.log('[SharedWorker] Writer claimed by:', msg.clientId);
                        port.postMessage({
                            type: 'WRITER_STATUS',
                            isWriter: true,
                            hasWriter: true
                        });
                        // Notify others that there's now a writer
                        broadcastExclude({
                            type: 'WRITER_STATUS',
                            isWriter: false,
                            hasWriter: true
                        }, port);
                    } else if (writerPort === port) {
                        // Already the writer
                        port.postMessage({
                            type: 'WRITER_STATUS',
                            isWriter: true,
                            hasWriter: true
                        });
                    } else {
                        // Someone else is the writer
                        console.log('[SharedWorker] Writer request denied, already claimed by:', writerClientId);
                        port.postMessage({
                            type: 'WRITER_STATUS',
                            isWriter: false,
                            hasWriter: true
                        });
                    }
                    break;

                case 'RELEASE_WRITER':
                    if (writerPort === port) {
                        console.log('[SharedWorker] Writer released by:', writerClientId);
                        writerPort = null;
                        writerClientId = null;
                        broadcast({
                            type: 'WRITER_STATUS',
                            isWriter: false,
                            hasWriter: false
                        });
                    }
                    break;

                case 'EXEC_SQL':
                    if (!db) throw new Error('Database not open');

                    let result = [];
                    if (msg.sql.trim().toUpperCase().startsWith('SELECT')) {
                        result = db.exec(msg.sql, msg.params);
                    } else {
                        db.run(msg.sql, msg.params);
                    }

                    port.postMessage({
                        type: 'QuerySuccess',
                        requestId: msg.requestId,
                        result: result
                    });

                    if (!msg.sql.trim().toUpperCase().startsWith('SELECT')) {
                        // Broadcast update to all, include info about who should write
                        broadcast({
                            type: 'DB_UPDATED',
                            sourceRequestId: msg.requestId,
                            writerClientId: writerClientId
                        });
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

    // Handle port disconnection (page close/refresh)
    // Note: There's no reliable 'close' event for MessagePort in SharedWorker
    // We'll use a ping/timeout mechanism or rely on page's beforeunload
};

function broadcast(msg) {
    ports.forEach(p => {
        try {
            p.port.postMessage(msg);
        } catch (e) {
            // Port might be closed, remove it
            removePort(p.port);
        }
    });
}

function broadcastExclude(msg, excludePort) {
    ports.forEach(p => {
        if (p.port !== excludePort) {
            try {
                p.port.postMessage(msg);
            } catch (e) {
                removePort(p.port);
            }
        }
    });
}

function removePort(port) {
    const index = ports.findIndex(p => p.port === port);
    if (index !== -1) {
        const removed = ports.splice(index, 1)[0];
        console.log('[SharedWorker] Port removed:', removed.clientId, 'Remaining:', ports.length);

        // If the writer disconnected, release the writer role
        if (writerPort === port) {
            console.log('[SharedWorker] Writer disconnected, releasing...');
            writerPort = null;
            writerClientId = null;
            broadcast({
                type: 'WRITER_STATUS',
                isWriter: false,
                hasWriter: false
            });
        }
    }
}
