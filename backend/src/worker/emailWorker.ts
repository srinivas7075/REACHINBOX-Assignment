import { Worker, Job } from 'bullmq';
import { redisConfig, redisConnection, pool } from '../config';
import { emailQueueName, emailQueue } from '../queue/emailQueue';
import nodemailer from 'nodemailer';

// Ethereal Transporter
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Create Ethereal account if not exists (or use env)
    // For this assignment, we'll try to use env or generate one
    if (process.env.EMAIL_USER) {
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        const account = await nodemailer.createTestAccount();
        console.log('Created Ethereal Account:', account.user, account.pass);
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass,
            },
        });
    }
    return transporter;
}

interface EmailJobData {
    scheduledEmailId: number;
    recipient: string;
    subject: string;
    body: string;
    senderId: number; // For rate limiting per user
}

console.log('Initializing Email Worker for queue:', emailQueueName);

export const emailWorker = new Worker(
    emailQueueName,
    async (job: Job<EmailJobData>) => {
        const { scheduledEmailId, recipient, subject, body, senderId } = job.data;
        console.log(`Processing job ${job.id} for email ${scheduledEmailId}`);

        // RATE LIMIT CHECK
        const currentHour = new Date().toISOString().slice(0, 13); // 2023-10-27T10
        const limitKey = `rate_limit:${senderId}:${currentHour}`;
        const limit = parseInt(process.env.MAX_EMAILS_PER_HOUR || '10');

        const currentCount = await redisConnection.incr(limitKey);
        // Set expiry for 1 hour + buffer if new key
        if (currentCount === 1) {
            await redisConnection.expire(limitKey, 3600);
        }

        if (currentCount > limit) {
            console.log(`Rate limit exceeded for sender ${senderId}. Rescheduling...`);
            // Decrement back since we are not sending
            await redisConnection.decr(limitKey);

            // Calculate delay to next hour window
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0);
            const delay = nextHour.getTime() - now.getTime();

            // Reschedule
            await emailQueue.add(job.name, job.data, {
                delay: delay + Math.random() * 1000 // Add jitter
            });
            return; // Exit w/o processing
        }

        // DELAY (Simulate throttling)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s minimal delay

        try {
            const transport = await getTransporter();
            const info = await transport.sendMail({
                from: '"ReachInbox Scheduler" <noreply@reachinbox.ai>',
                to: recipient,
                subject: subject,
                text: body,
                html: `<p>${body}</p>`
            });

            console.log(`Email sent: ${info.messageId}`); // Preview URL available in info

            // Update DB
            await pool.query(
                `UPDATE scheduled_emails SET status = 'sent', sent_at = NOW(), job_id = $1 WHERE id = $2`,
                [job.id, scheduledEmailId]
            );

        } catch (error: any) {
            console.error('CRITICAL WORKER ERROR:', error);
            await pool.query(
                `UPDATE scheduled_emails SET status = 'failed', error_message = $1 WHERE id = $2`,
                [error.message, scheduledEmailId]
            );
            throw error; // Let BullMQ retry
        }
    },
    {
        connection: redisConfig,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
        limiter: {
            max: 5, // Safety limiter in BullMQ, but we rely on manual Logic above for strict hourly
            duration: 1000
        }
    }
);

emailWorker.on('completed', job => {
    console.log(`Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
});
