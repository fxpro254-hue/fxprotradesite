/**
 * Test Email Service
 * Run this script to test if emails are being sent correctly
 * 
 * Usage: node test-email.js your-email@example.com
 */

require('dotenv').config();
const { sendWelcomeEmail } = require('./server/emailService');

const testEmail = process.argv[2];

if (!testEmail) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node test-email.js your-email@example.com');
    process.exit(1);
}

console.log('🧪 Testing email service...');
console.log('📧 Sending test email to:', testEmail);
console.log('');

sendWelcomeEmail(testEmail, 'Test User', 'TEST_' + Date.now())
    .then(result => {
        console.log('');
        console.log('='.repeat(50));
        console.log('📬 Email Test Result:');
        console.log('='.repeat(50));
        console.log('Success:', result.success);
        console.log('Message ID:', result.messageId || 'N/A');
        console.log('Error:', result.error || 'None');
        console.log('='.repeat(50));
        
        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('📭 Check your inbox at:', testEmail);
        } else {
            console.log('❌ Email failed to send');
            console.log('Error details:', result.error);
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('');
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
