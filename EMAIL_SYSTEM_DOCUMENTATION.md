# Email System Documentation

## Overview

A universal email system built with Resend API that can be used across the entire FxProTrades Bot application. The system is designed to be flexible, reusable, and easy to integrate into any feature.

## Features

✅ **Universal Design** - Can be used in community, copy trading, notifications, and more
✅ **Template System** - HTML and plain text email templates
✅ **Type Safety** - Full TypeScript support with type definitions
✅ **Easy Integration** - Simple API for sending emails
✅ **Server-side Security** - API keys stored securely on the backend
✅ **Environment Control** - Enable/disable emails per environment
✅ **Error Handling** - Graceful error handling with detailed logging

## Architecture

```
Email System Structure:
├── src/services/email/           # Frontend email service (TypeScript)
│   ├── config.ts                 # Email configuration
│   ├── emailService.ts           # Main email service
│   ├── templates/
│   │   ├── index.ts             # Template exports
│   │   ├── types.ts             # Template type definitions
│   │   └── welcome.ts           # Welcome email template
│   └── index.ts                 # Public exports
│
└── server/                       # Backend email service (Node.js)
    ├── emailService.js          # Server-side email service
    └── index.js                 # API endpoints
```

## Setup

### 1. Get Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Generate an API key from the dashboard

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration (Resend API)
RESEND_API_KEY=re_123abc...         # Your Resend API key
EMAIL_FROM=FxProTrades Bot <noreply@binaryfx.site>  # Verified sender email
ENABLE_EMAILS=true                  # Enable/disable email sending
APP_URL=https://bot.binaryfx.site   # Your app URL for links in emails
```

### 3. Install Dependencies

Already installed:
```bash
npm install resend
```

## Usage

### Current Implementation: Community Welcome Emails

When a user creates an account in the community feature, they are automatically sent a welcome email.

**How it works:**

1. User enters username and optional email in the community signup modal
2. Frontend calls `handleRegisterUser()` with email parameter
3. Backend creates user and calls `sendWelcomeEmail()` if email provided
4. User receives a beautiful HTML welcome email

**Code Example:**

```typescript
// Frontend (community.tsx)
const userResult = await handleRegisterUser(
    loginId, 
    usernameInput.trim(),
    undefined,           // avatar
    emailInput.trim()    // email
);
```

```javascript
// Backend (server/index.js)
if (email && isNewUser) {
    const emailResult = await sendWelcomeEmail(email, fullName, loginId);
    if (emailResult.success) {
        console.log('✅ Welcome email sent to:', email);
    }
}
```

### Adding Email to Other Features

#### Example: Copy Trading Notifications

1. **Create a new template** (if needed):

```typescript
// src/services/email/templates/copyTrading.ts
export const copyTradingRequestTemplate = (data: EmailTemplateData['copyTradingRequest']) => {
    return `
    <!DOCTYPE html>
    <html>
    <body>
        <h1>New Copy Trading Request</h1>
        <p>Hi ${data.userName},</p>
        <p>${data.providerName} has requested to copy your trades.</p>
        <p>Request Date: ${data.requestDate}</p>
    </body>
    </html>
    `;
};
```

2. **Use the email service**:

```typescript
import { sendEmail } from '@/services/email';

// Send email
const result = await sendEmail({
    to: 'user@example.com',
    templateType: 'copyTradingRequest',
    templateData: {
        userName: 'John Doe',
        providerName: 'Jane Smith',
        requestDate: new Date().toLocaleDateString()
    }
});

if (result.success) {
    console.log('Email sent!', result.messageId);
}
```

#### Example: Notification Emails

```typescript
import { sendNotificationEmail } from '@/services/email';

await sendNotificationEmail(
    'user@example.com',
    'John Doe',
    'Trade Alert',
    'Your bot has completed a successful trade!',
    'https://bot.binaryfx.site/trades',
    'View Trade Details'
);
```

### Server-side Integration

For backend features, use the server-side email service:

```javascript
const { sendEmail, sendWelcomeEmail } = require('./emailService');

// Send any email
const result = await sendEmail({
    to: 'user@example.com',
    templateType: 'notification',
    templateData: {
        userName: 'John',
        title: 'Important Update',
        message: 'Your subscription is expiring soon.'
    }
});

// Send welcome email
await sendWelcomeEmail('user@example.com', 'John Doe', 'CR123456');
```

## Available Templates

### 1. Welcome Email (`welcome`)
Sent when users create an account.

**Data:**
```typescript
{
    userName: string;
    loginId: string;
}
```

### 2. Notification Email (`notification`)
General purpose notification template.

**Data:**
```typescript
{
    userName: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
}
```

### Future Templates (Ready to implement)

- `passwordReset` - Password reset emails
- `verification` - Email verification
- `copyTradingRequest` - Copy trading requests
- `copyTradingAccepted` - Request accepted notifications
- `copyTradingRejected` - Request rejected notifications
- `communityMention` - Community mentions
- `communityReply` - Reply notifications

## Creating New Templates

1. **Define the template data type** in `src/services/email/templates/types.ts`:

```typescript
export interface EmailTemplateData {
    // ... existing templates
    myNewTemplate: {
        userName: string;
        customField: string;
    };
}
```

2. **Create the template file** (e.g., `src/services/email/templates/myTemplate.ts`):

```typescript
import { EmailTemplateData } from './types';

export const myNewTemplate = (data: EmailTemplateData['myNewTemplate']): string => {
    return `<!DOCTYPE html>...`; // Your HTML
};

export const myNewTemplateText = (data: EmailTemplateData['myNewTemplate']): string => {
    return `Plain text version...`;
};
```

3. **Add to template index** (`src/services/email/templates/index.ts`):

```typescript
import { myNewTemplate, myNewTemplateText } from './myTemplate';

export const getEmailTemplate = (type, data) => {
    switch (type) {
        // ... existing cases
        case 'myNewTemplate':
            return {
                html: myNewTemplate(data),
                text: myNewTemplateText(data),
                subject: `Subject for ${data.userName}`,
            };
    }
};
```

4. **Update server-side templates** in `server/emailService.js` with the same template.

## API Endpoints

### POST `/api/send-email`

Send an email using a template.

**Request:**
```json
{
    "to": "user@example.com",
    "templateType": "welcome",
    "templateData": {
        "userName": "John Doe",
        "loginId": "CR123456"
    }
}
```

**Response:**
```json
{
    "success": true,
    "messageId": "abc123..."
}
```

### POST `/api/users/register`

Register a user and optionally send welcome email.

**Request:**
```json
{
    "loginId": "CR123456",
    "fullName": "John Doe",
    "avatar": "👤",
    "email": "user@example.com"
}
```

## Configuration Options

### Email Configuration

```typescript
// src/services/email/config.ts
export const emailConfig = {
    apiKey: process.env.RESEND_API_KEY,
    defaultFrom: process.env.EMAIL_FROM,
    isProduction: process.env.NODE_ENV === 'production',
    enabled: process.env.ENABLE_EMAILS !== 'false',
};
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Your Resend API key | `re_abc123...` |
| `EMAIL_FROM` | Yes | Verified sender email | `FxProTrades <noreply@binaryfx.site>` |
| `ENABLE_EMAILS` | No | Enable/disable emails | `true` (default) |
| `APP_URL` | No | App URL for email links | `https://bot.binaryfx.site` |

## Testing

### Development Testing

For development, you can:

1. **Use Resend's test mode** - Sign up for a free account and use their test domain
2. **Disable emails** - Set `ENABLE_EMAILS=false` to test without sending
3. **Check logs** - All email operations are logged to console

### Viewing Sent Emails

1. Log into [Resend Dashboard](https://resend.com/emails)
2. View all sent emails, delivery status, and open rates
3. Test email rendering across different clients

## Error Handling

The email service includes comprehensive error handling:

```typescript
const result = await sendEmail({...});

if (result.success) {
    console.log('✅ Email sent:', result.messageId);
} else {
    console.error('❌ Email failed:', result.error);
    // Handle error gracefully - don't fail the main operation
}
```

**Best Practice:** Email failures should not prevent user registration or other critical operations. Log errors and continue.

## Best Practices

1. **Always include plain text** - Provide both HTML and plain text versions
2. **Make emails optional** - Don't require email for core features
3. **Handle failures gracefully** - Log errors but don't fail operations
4. **Test templates** - Preview templates in different email clients
5. **Respect privacy** - Only send emails users have opted into
6. **Include unsubscribe** - Add unsubscribe links where applicable
7. **Keep it simple** - Avoid complex CSS, use tables for layout
8. **Optimize images** - Use small, optimized images
9. **Mobile friendly** - Ensure emails look good on mobile devices
10. **Track metrics** - Monitor open rates and engagement in Resend dashboard

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify `ENABLE_EMAILS=true`
3. Check sender email is verified in Resend
4. Look for errors in server logs

### Template not rendering

1. Validate HTML syntax
2. Check template data is passed correctly
3. Test with plain text version first
4. Use Resend's template preview

### Rate limiting

Resend has rate limits based on your plan:
- Free: 100 emails/day
- Pro: 50,000 emails/month

Monitor usage in the Resend dashboard.

## Future Enhancements

- [ ] Email preferences system
- [ ] Email queue for batch sending
- [ ] Email analytics integration
- [ ] A/B testing for templates
- [ ] Scheduled emails
- [ ] Email templates editor
- [ ] Unsubscribe management
- [ ] Email verification flow
- [ ] Multi-language support
- [ ] Email attachments support

## Support

For issues or questions:
- Check Resend documentation: https://resend.com/docs
- Review server logs for detailed error messages
- Test in development with `ENABLE_EMAILS=false` first

## License

This email system is part of FxProTrades Bot and follows the same license.
