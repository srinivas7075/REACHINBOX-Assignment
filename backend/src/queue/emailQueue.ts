import { Queue } from 'bullmq';
import { redisConfig } from '../config';

export const emailQueueName = 'email-queue';

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    },
});
