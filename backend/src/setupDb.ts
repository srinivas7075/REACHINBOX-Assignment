
import { pool } from './config';

async function setup() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scheduled_emails (
                id SERIAL PRIMARY KEY,
                recipient_email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                body TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                scheduled_time TIMESTAMP,
                sent_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table scheduled_emails created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await pool.end();
    }
}

setup();
