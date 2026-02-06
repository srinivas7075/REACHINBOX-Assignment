import { pool } from '../config';
import fs from 'fs';
import path from 'path';

async function initDB() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema initialization...');
        await pool.query(schemaSql);
        console.log('Database schema initialized.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
