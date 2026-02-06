
import nodemailer from 'nodemailer';

async function createTestAccount() {
    try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('ETHEREAL_USER=' + testAccount.user);
        console.log('ETHEREAL_PASS=' + testAccount.pass);
    } catch (err) {
        console.error('Failed to create account', err);
    }
}

createTestAccount();
