import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailQueue } from './queue/emailQueue';
import { emailWorker } from './worker/emailWorker';
import { pool } from './config';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';

dotenv.config();

const app = express();
console.log('Worker Status:', emailWorker.isRunning() ? 'Running' : 'Stopped');

app.use(cors({
    origin: '*', // Allow all for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// API: Schedule Emails
app.post('/api/schedule', upload.single('file'), async (req: any, res: any) => {
    try {
        const { subject, body, startTime, rateLimit, startDelay, senderId } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'No CSV file uploaded' });

        // Store Job Config if needed (omitted for brevity, typically stored in Campaign/SenderConfig)

        const recipients: string[] = [];

        fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (data: any) => {
                // Assuming CSV has 'email' column
                if (data.email) recipients.push(data.email);
                else if (Object.values(data)[0]) recipients.push(Object.values(data)[0] as string); // Fallback
            })
            .on('end', async () => {
                // Enqueue Jobs
                const initialDelay = startTime ? new Date(startTime).getTime() - Date.now() : 0;
                const delayMs = initialDelay > 0 ? initialDelay : 0;
                const staggerConfig = parseInt(startDelay || '0') * 1000; // delay between emails

                console.log(`Scheduling ${recipients.length} emails. Start delay: ${delayMs}ms. Stagger: ${staggerConfig}ms`);

                // Insert into DB first
                const scheduleTimestamp = startTime ? new Date(startTime) : new Date();

                for (let i = 0; i < recipients.length; i++) {
                    const email = recipients[i];

                    // DB Insert
                    const result = await pool.query(
                        `INSERT INTO scheduled_emails (recipient_email, subject, body, scheduled_time, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
                        [email, subject, body, scheduleTimestamp]
                    );
                    const id = result.rows[0].id;

                    // BullMQ Add
                    const jobDelay = delayMs + (i * staggerConfig); // Optional staggering

                    await emailQueue.add('send-email', {
                        scheduledEmailId: id,
                        recipient: email,
                        subject,
                        body,
                        senderId: parseInt(senderId || '1') // Default sender
                    }, {
                        delay: jobDelay
                    });
                }

                res.json({ message: 'Emails scheduled successfully', count: recipients.length });
                fs.unlinkSync(file.path); // Cleanup
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API: Get Scheduled API
app.get('/api/scheduled-emails', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM scheduled_emails WHERE status = 'pending' OR status = 'failed' ORDER BY created_at DESC`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching scheduled emails:', error);
        res.status(500).json({ error: 'Fetch failed' });
    }
});

// API: Get Sent API
app.get('/api/sent-emails', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM scheduled_emails WHERE status = 'sent' ORDER BY sent_at DESC`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
