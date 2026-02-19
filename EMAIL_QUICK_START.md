# Email System Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Resend API Key (2 minutes)

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email
4. Go to API Keys section
5. Click "Create API Key"
6. Copy your API key (starts with `re_`)

### Step 2: Add to Environment Variables (1 minute)

Add to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=FxProTrades Bot <noreply@binaryfx.site>
ENABLE_EMAILS=true
APP_URL=https://bot.binaryfx.site
```

**Important:** For development, you can use Resend's test domain:
```env
EMAIL_FROM=onboarding@resend.dev
```

### Step 3: Restart Your Server (30 seconds)

```bash
# Stop the community server (if running)
# Then restart it
npm run community-api
```

### Step 4: Test It! (1 minute)

1. Open your app in the browser
2. Go to the Community section
3. Enter a username
4. **Enter your email address**
5. Click "Continue"

You should receive a welcome email within seconds! 🎉

## ✅ Verify It Works

1. Check your inbox for the welcome email
2. Check your spam folder if you don't see it
3. Check the server console - you should see:
   ```
   ✅ Welcome email sent to: your@email.com
   ```
4. Log into [Resend Dashboard](https://resend.com/emails) to see the sent email

## 📧 Current Features

✅ **Welcome Emails** - Automatically sent when users join the community
✅ **Beautiful HTML Templates** - Professional, mobile-responsive design
✅ **Optional Email Collection** - Users can skip providing email
✅ **Error Handling** - Registration works even if email fails
✅ **Development Ready** - Works with Resend's test domain

## 🎯 Next Steps: Add Email to Your Feature

Want to add emails to copy trading or another feature? Here's how:

### Option 1: Use Existing Notification Template (Fastest)

```javascript
// Backend code
const { sendEmail } = require('./emailService');

await sendEmail({
    to: 'user@example.com',
    templateType: 'notification',
    templateData: {
        userName: 'John Doe',
        title: 'Trade Alert',
        message: 'Your bot completed a successful trade!'
    }
});
```

### Option 2: Create Custom Template

1. Edit `server/emailService.js`
2. Add your template function
3. Add case to `getEmailTemplate()`
4. Use `sendEmail()` with your new template type

See `EMAIL_USAGE_EXAMPLES.js` for detailed examples!

## 🔧 Troubleshooting

### "Email not sending"
- Check `RESEND_API_KEY` is set
- Make sure server is restarted after adding env vars
- Use Resend's test domain for development: `onboarding@resend.dev`

### "Email goes to spam"
- Use Resend's test domain for development
- For production, verify your domain in Resend

### "Template not working"
- Check server console for errors
- Validate your template data matches the template type
- Try the notification template first (it's simpler)

## 📚 Full Documentation

For complete documentation, see:
- `EMAIL_SYSTEM_DOCUMENTATION.md` - Full system documentation
- `EMAIL_USAGE_EXAMPLES.js` - Code examples for all use cases

## 🎨 Customize Welcome Email

The welcome email template is in `server/emailService.js`.

Search for `welcomeEmailTemplate` and customize:
- Colors (change `#ff444f` to your brand color)
- Logo text
- Welcome message
- Features list
- Button text and link

## 🚀 Production Checklist

Before going to production:

- [ ] Get production Resend API key
- [ ] Verify your domain in Resend
- [ ] Update `EMAIL_FROM` to use your domain
- [ ] Test email delivery
- [ ] Set `APP_URL` to production URL
- [ ] Monitor delivery rates in Resend dashboard

## 💡 Tips

1. **Start Simple** - Use the notification template for quick emails
2. **Test in Dev** - Use `onboarding@resend.dev` for testing
3. **Don't Block** - Email failures shouldn't block user operations
4. **Monitor** - Check Resend dashboard for delivery metrics
5. **Be Responsive** - All templates are mobile-friendly

## 🎉 You're All Set!

The email system is now ready to use anywhere in your app:
- ✅ Community welcome emails are working
- ✅ Infrastructure is in place
- ✅ Easy to extend to other features

Happy emailing! 📬
