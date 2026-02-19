# Email Not Sending - Debugging Guide

## Quick Test

Run this command to test email sending directly:

```bash
node test-email.js your-email@example.com
```

This will show you exactly what's happening with the email service.

## Step-by-Step Debugging

### 1. Check Server Logs

When you restart your server, you should see:

```
📧 Email Service Configuration:
  - API Key: re_6R6Z8q4...
  - From: BinaryFX <noreply@binaryfx.site>
  - Enabled: true
  - Environment: development
```

**If you DON'T see this**, the email service isn't loading properly.

### 2. Check Environment Variables

Make sure `.env` has:

```
RESEND_API_KEY=re_6R6Z8q4E_9JEnaMQjeGRgpZHB9YKi36oe
EMAIL_FROM=BinaryFX <noreply@binaryfx.site>
ENABLE_EMAILS=true
APP_URL=https://bot.binaryfx.site
```

### 3. Check Registration Flow

When a user registers, you should see these logs:

**Frontend:**
```
📝 [COMMUNITY] Submitting username: { loginId, username, email }
📬 [COMMUNITY] Registration result: { success, data, isNewUser }
```

**Backend:**
```
📝 User registration request: { loginId, fullName, hasEmail: true }
✅ New user created: { id, loginId }
📧 Sending welcome email to: user@example.com
```

**Email Service:**
```
📧 [EMAIL] Attempting to send email: { to, templateType, from }
✅ [EMAIL] Configuration valid
✅ [EMAIL] Emails are enabled
✅ [EMAIL] Template generated
📤 [EMAIL] Sending via Resend API...
📬 [EMAIL] Resend API response: { ... }
✅ [EMAIL] Email sent successfully
```

### 4. Common Issues

#### Issue 1: Email is undefined
**Logs show:** `hasEmail: false`

**Fix:** 
- Check if user is authenticated first
- Run `checkUserEmail()` in console to verify email is stored
- Email will be empty if user hasn't authenticated with Deriv

#### Issue 2: RESEND_API_KEY not set
**Logs show:** `API Key: ❌ NOT SET`

**Fix:**
- Make sure `.env` file exists in project root
- Restart server after changing `.env`
- Server must run `require('dotenv').config()`

#### Issue 3: Resend API Error
**Logs show:** `❌ [EMAIL] Error from Resend API:`

**Fix:**
- Check API key is valid (log in to resend.com)
- Verify domain is verified in Resend dashboard
- Check "from" email domain matches verified domain

#### Issue 4: isNewUser is false
**Logs show:** `ℹ️ Existing user found`

**Fix:**
- Email only sent for NEW users
- Delete user from database to test again
- Or use a different loginId

### 5. Test Endpoint

Use this to test email without creating account:

**In terminal:**
```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","userName":"Test User"}'
```

**Or in browser console:**
```javascript
fetch('http://localhost:3001/api/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'your-email@example.com',
        userName: 'Test User'
    })
})
.then(r => r.json())
.then(console.log);
```

### 6. What Should Happen

When everything works:

1. User authenticates → email stored in localStorage
2. User goes to Community → email auto-filled
3. User enters username → clicks Continue
4. Frontend sends: `{ loginId, fullName, email }`
5. Backend creates user (no email in DB)
6. Backend calls `sendWelcomeEmail(email, fullName, loginId)`
7. Email service validates config
8. Email service generates HTML template
9. Email service calls Resend API
10. Email sent! ✅

### 7. Checklist

- [ ] Server logs show email config on startup
- [ ] `.env` file has RESEND_API_KEY
- [ ] Email is verified in Resend dashboard
- [ ] User is authenticated (has email in localStorage)
- [ ] User is NEW (not existing in database)
- [ ] Server receives email in request body
- [ ] Email service attempts to send
- [ ] No errors in Resend API response

## Still Not Working?

Check these logs after creating account:

```javascript
// In browser console
checkUserEmail()  // Shows if email is stored

// In server logs
// Look for these patterns:
📝 User registration request: { hasEmail: ??? }
📧 Sending welcome email to: ???
✅ Welcome email sent successfully
```

If you see `hasEmail: false`, the email isn't being passed from frontend to backend.
If you see email but no "sent successfully", check the detailed [EMAIL] logs for the error.
