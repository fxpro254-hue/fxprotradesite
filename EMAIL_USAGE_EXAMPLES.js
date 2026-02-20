/**
 * Email System Usage Examples
 * Copy these examples to quickly integrate email functionality anywhere in your app
 */

// ============================================================================
// EXAMPLE 1: Send Welcome Email (Community Feature)
// ============================================================================

// Frontend - Community Registration
import { handleRegisterUser } from '@/api/community.api';

const registerWithEmail = async () => {
    const result = await handleRegisterUser(
        'CR123456',          // loginId
        'John Doe',          // fullName
        '👤',                // avatar
        'user@example.com'   // email (optional)
    );
    
    if (result.success) {
        console.log('User registered and welcome email sent!');
    }
};

// ============================================================================
// EXAMPLE 2: Send Notification Email (Backend)
// ============================================================================

// Backend - server/index.js or any server file
const { sendEmail } = require('./emailService');

app.post('/api/send-trade-notification', async (req, res) => {
    const { email, userName, tradeDetails } = req.body;
    
    const result = await sendEmail({
        to: email,
        templateType: 'notification',
        templateData: {
            userName: userName,
            title: 'Trade Completed Successfully',
            message: `Your bot has completed a trade: ${tradeDetails}`,
            actionUrl: 'https://fxprotrades.site',
            actionText: 'View Trade Details'
        }
    });
    
    res.json(result);
});

// ============================================================================
// EXAMPLE 3: Copy Trading Request Email
// ============================================================================

// Step 1: Add template type to src/services/email/templates/types.ts
/*
export interface EmailTemplateData {
    // ... existing types
    copyTradingRequest: {
        userName: string;
        providerName: string;
        requestDate: string;
    };
}
*/

// Step 2: Create template in server/emailService.js
const copyTradingRequestTemplate = (data) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff444f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .button { background: #ff444f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Copy Trading Request</h1>
    </div>
    <div class="content">
        <p>Hi ${data.userName},</p>
        <p><strong>${data.providerName}</strong> has requested to copy your trades.</p>
        <p>Request received on: ${data.requestDate}</p>
        <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL}/copy-trading/requests" class="button">
                Review Request
            </a>
        </p>
    </div>
</body>
</html>
    `;
};

// Step 3: Add to getEmailTemplate function
// In server/emailService.js, add this case:
/*
case 'copyTradingRequest':
    return {
        html: copyTradingRequestTemplate(data),
        text: `Hi ${data.userName}, ${data.providerName} has requested to copy your trades.`,
        subject: `New Copy Trading Request from ${data.providerName}`
    };
*/

// Step 4: Use it in your code
const { sendEmail } = require('./emailService');

const notifyProviderOfRequest = async (providerEmail, providerName, requesterName) => {
    return await sendEmail({
        to: providerEmail,
        templateType: 'copyTradingRequest',
        templateData: {
            userName: providerName,
            providerName: requesterName,
            requestDate: new Date().toLocaleDateString()
        }
    });
};

// ============================================================================
// EXAMPLE 4: Batch Email Sending
// ============================================================================

// Backend - Send email to multiple users
const { sendEmail } = require('./emailService');

const notifyAllActiveTraders = async () => {
    const activeTraders = await prisma.user.findMany({
        where: { status: 'active' }
    });
    
    const results = await Promise.allSettled(
        activeTraders.map(trader =>
            sendEmail({
                to: trader.email,
                templateType: 'notification',
                templateData: {
                    userName: trader.fullName,
                    title: 'Important Update',
                    message: 'Check out our new trading features!'
                }
            })
        )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Sent ${successful}/${activeTraders.length} emails`);
};

// ============================================================================
// EXAMPLE 5: API Endpoint for Frontend Email Requests
// ============================================================================

// Backend API endpoint
app.post('/api/send-custom-email', async (req, res) => {
    try {
        const { to, templateType, templateData } = req.body;
        
        // Validate request
        if (!to || !templateType || !templateData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const { sendEmail } = require('./emailService');
        const result = await sendEmail({ to, templateType, templateData });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Frontend usage
const sendCustomEmail = async (recipient: string, message: string) => {
    const response = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: recipient,
            templateType: 'notification',
            templateData: {
                userName: 'User',
                title: 'Custom Notification',
                message: message
            }
        })
    });
    
    return await response.json();
};

// ============================================================================
// EXAMPLE 6: Email with Error Handling
// ============================================================================

const sendEmailWithRetry = async (emailOptions, maxRetries = 3) => {
    const { sendEmail } = require('./emailService');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendEmail(emailOptions);
            
            if (result.success) {
                console.log(`✅ Email sent on attempt ${attempt}`);
                return result;
            }
            
            if (attempt < maxRetries) {
                console.log(`⚠️ Attempt ${attempt} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        } catch (error) {
            console.error(`❌ Attempt ${attempt} error:`, error);
            if (attempt === maxRetries) {
                return { success: false, error: error.message };
            }
        }
    }
    
    return { success: false, error: 'Max retries exceeded' };
};

// ============================================================================
// EXAMPLE 7: Schedule Email for Later (with simple queue)
// ============================================================================

// Simple email queue implementation
const emailQueue = [];

const scheduleEmail = (emailOptions, sendAfterMinutes) => {
    const sendTime = Date.now() + (sendAfterMinutes * 60 * 1000);
    
    emailQueue.push({
        ...emailOptions,
        sendTime
    });
    
    console.log(`Email scheduled for ${new Date(sendTime).toLocaleString()}`);
};

// Process queue periodically
setInterval(async () => {
    const now = Date.now();
    const { sendEmail } = require('./emailService');
    
    const emailsToSend = emailQueue.filter(e => e.sendTime <= now);
    
    for (const email of emailsToSend) {
        await sendEmail(email);
        const index = emailQueue.indexOf(email);
        emailQueue.splice(index, 1);
    }
}, 60000); // Check every minute

// Usage
scheduleEmail({
    to: 'user@example.com',
    templateType: 'notification',
    templateData: {
        userName: 'John',
        title: 'Reminder',
        message: 'Your trial expires in 24 hours'
    }
}, 60); // Send after 60 minutes

// ============================================================================
// EXAMPLE 8: Email Verification Flow
// ============================================================================

// Generate verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification code (in database or cache)
const verificationCodes = new Map();

const sendVerificationEmail = async (email, userName) => {
    const code = generateVerificationCode();
    verificationCodes.set(email, {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });
    
    const { sendEmail } = require('./emailService');
    return await sendEmail({
        to: email,
        templateType: 'verification',
        templateData: {
            userName,
            verificationCode: code,
            expiryTime: '15 minutes'
        }
    });
};

// Verify code
const verifyCode = (email, code) => {
    const stored = verificationCodes.get(email);
    
    if (!stored) return false;
    if (stored.expiresAt < Date.now()) {
        verificationCodes.delete(email);
        return false;
    }
    if (stored.code !== code) return false;
    
    verificationCodes.delete(email);
    return true;
};

// ============================================================================
// QUICK CHECKLIST FOR ADDING EMAILS TO A NEW FEATURE
// ============================================================================

/*
1. ✅ Define template data type in src/services/email/templates/types.ts
2. ✅ Create HTML template in server/emailService.js
3. ✅ Add case to getEmailTemplate() function
4. ✅ Add API endpoint if needed (or use existing /api/send-email)
5. ✅ Call sendEmail() from your feature code
6. ✅ Handle success/error responses gracefully
7. ✅ Test with ENABLE_EMAILS=false first
8. ✅ Test with real email in development
9. ✅ Monitor delivery in Resend dashboard
10. ✅ Deploy and celebrate! 🎉
*/
