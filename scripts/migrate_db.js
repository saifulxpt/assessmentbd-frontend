const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function migrate() {
    console.log('Connecting to MySQL...');
    const mysqlConn = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'assessmentbd',
        timezone: 'Z',
    });

    console.log('Connecting to PostgreSQL...');
    const pgClient = new Client({
        connectionString: 'postgresql://root@127.0.0.1:5432/assessmentbd?schema=public'
    });
    await pgClient.connect();

    // Disable foreign key checks
    await pgClient.query("SET session_replication_role = 'replica';");

    // Get all tables from MySQL
    const [tables] = await mysqlConn.query(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = 'assessmentbd' AND table_type = 'BASE TABLE'
    `);

    for (const row of tables) {
        const tableName = row.TABLE_NAME;
        if (tableName === '_prisma_migrations') continue;

        console.log(`\nMigrating table: ${tableName}`);

        const [data] = await mysqlConn.query(`SELECT * FROM ${tableName}`);
        
        if (data.length === 0) {
            console.log(`No data in ${tableName}.`);
            continue;
        }

        const columns = Object.keys(data[0]);
        const colsStr = columns.map(c => `"${c}"`).join(', ');

        let inserted = 0;
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            const values = [];
            const params = [];
            let paramIndex = 1;

            for (const row of batch) {
                const rowParams = [];
                for (const col of columns) {
                    let val = row[col];
                    if (val === 1 && typeof val === 'number') val = 1;
                    if (val === 0 && typeof val === 'number') val = 0;
                    // Replace null bytes in strings if any
                    if (typeof val === 'string') {
                        val = val.replace(/\0/g, '');
                    }
                    params.push(val);
                    rowParams.push(`$${paramIndex++}`);
                }
                values.push(`(${rowParams.join(', ')})`);
            }

            const query = `INSERT INTO "${tableName}" (${colsStr}) VALUES ${values.join(', ')}`;
            
            try {
                await pgClient.query(query, params);
                inserted += batch.length;
            } catch (e) {
                console.error(`Error inserting into ${tableName}:`, e.message);
                break;
            }
        }
        console.log(`Successfully migrated ${inserted} rows into ${tableName}.`);
        
        try {
            await pgClient.query(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${tableName}";`);
        } catch (e) { }
    }

    // Re-enable foreign key checks
    await pgClient.query("SET session_replication_role = 'origin';");

    console.log('\nMigration complete!');
    await mysqlConn.end();
    await pgClient.end();
}

migrate().catch(console.error);
