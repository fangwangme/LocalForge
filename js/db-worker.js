// db-worker.js

// Load sql.js from CDN
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.min.js');

let db = null;
let SQL = null;

// Initialize sql.js
initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
}).then(module => {
    SQL = module;
    postMessage({ type: 'WORKER_READY' });
}).catch(err => {
    console.error('[Worker] Failed to load sql.js:', err);
    postMessage({ type: 'WORKER_ERROR', message: 'Failed to load SQL engine' });
});

self.onmessage = function (e) {
    const msg = e.data;

    if (!SQL) {
        // Queue or error if SQL not ready? For now just error.
        if (msg.type !== 'PING') {
            postMessage({ type: 'WORKER_ERROR', message: 'SQL engine not ready', requestId: msg.requestId });
        }
        return;
    }

    try {
        switch (msg.type) {
            case 'OPEN_DB':
                if (msg.data) {
                    db = new SQL.Database(new Uint8Array(msg.data));
                    console.log('[Worker] Database opened from file data.');
                } else {
                    db = new SQL.Database();
                    console.log('[Worker] New empty database created.');
                }
                postMessage({ type: 'DB_OPENED', requestId: msg.requestId });
                break;

            case 'EXEC_SQL':
                if (!db) throw new Error('Database not open');
                // msg.sql can be a string
                // msg.params is array or object
                // If it's a SELECT, we usually use .exec for multiple results, or .run/prepare
                // To keep it simple and consistent with previous sync usage:
                // If it returns data, use exec. If it's insert/update, use run.
                // But .exec returns array of {columns, values}.

                // Let's check if it implies a return value.
                // Actually, .exec works for everything but .run is faster for non-select?
                // The main thread used `db.exec` for SELECT and `db.run` for updates.

                let result = [];
                if (msg.sql.trim().toUpperCase().startsWith('SELECT')) {
                    result = db.exec(msg.sql, msg.params);
                    // result is [{columns:[], values:[]}]
                } else {
                    db.run(msg.sql, msg.params);
                    // no result needed, maybe just empty array to signify success
                }

                postMessage({
                    type: 'QuerySuccess',
                    requestId: msg.requestId,
                    result: result
                });
                break;

            case 'EXPORT_DB':
                if (!db) throw new Error('Database not open');
                const binaryArray = db.export();
                postMessage({
                    type: 'DB_EXPORTED',
                    requestId: msg.requestId,
                    data: binaryArray
                }, [binaryArray.buffer]); // Transferable
                break;

            case 'CLOSE_DB':
                if (db) {
                    db.close();
                    db = null;
                }
                break;
        }
    } catch (err) {
        console.error('[Worker] Error processing message:', msg.type, err);
        postMessage({
            type: 'QueryError',
            requestId: msg.requestId,
            message: err.message
        });
    }
};
