# Email System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BINARYFX BOT EMAIL SYSTEM                            │
│                          Universal & Reusable                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │  Community   │    │ Copy Trading │    │  Any Feature │                 │
│  │   Feature    │    │   Feature    │    │    Future    │                 │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                 │
│         │                   │                   │                          │
│         │ User enters       │ Trade event       │ Any event                │
│         │ email (optional)  │ triggers email    │ triggers email           │
│         │                   │                   │                          │
│         ▼                   ▼                   ▼                          │
│  ┌──────────────────────────────────────────────────────┐                 │
│  │          Frontend Email Service (Optional)            │                 │
│  │         src/services/email/emailService.ts            │                 │
│  │                                                        │                 │
│  │  - Type-safe email sending                            │                 │
│  │  - Template data validation                           │                 │
│  │  - Error handling                                     │                 │
│  └──────────────────────────┬───────────────────────────┘                 │
│                              │                                              │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               │ HTTP Request
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                    API Endpoints (server/index.js)              │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │                                                                 │         │
│  │  POST /api/users/register                                      │         │
│  │  ├─ Registers user                                             │         │
│  │  └─ Sends welcome email if email provided                      │         │
│  │                                                                 │         │
│  │  POST /api/send-email                                          │         │
│  │  ├─ General email sending endpoint                             │         │
│  │  └─ Accepts: to, templateType, templateData                    │         │
│  │                                                                 │         │
│  └────────────────────────┬───────────────────────────────────────┘         │
│                            │                                                 │
│                            ▼                                                 │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │            Email Service (server/emailService.js)               │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │                                                                 │         │
│  │  Functions:                                                     │         │
│  │  ├─ sendEmail(options)                                         │         │
│  │  ├─ sendWelcomeEmail(email, userName, loginId)                │         │
│  │  ├─ validateEmailConfig()                                      │         │
│  │  └─ getEmailTemplate(type, data)                               │         │
│  │                                                                 │         │
│  │  Configuration:                                                 │         │
│  │  ├─ RESEND_API_KEY (from env)                                  │         │
│  │  ├─ EMAIL_FROM (sender address)                                │         │
│  │  ├─ ENABLE_EMAILS (enable/disable)                             │         │
│  │  └─ APP_URL (for links in emails)                              │         │
│  │                                                                 │         │
│  └────────────────────────┬───────────────────────────────────────┘         │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │
                             │ Resend API Call
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMAIL TEMPLATES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Welcome Email    │  │ Notification     │  │  Future          │          │
│  │                  │  │ Email            │  │  Templates       │          │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤          │
│  │ • User name      │  │ • Title          │  │ • Copy trading   │          │
│  │ • Login ID       │  │ • Message        │  │ • Verification   │          │
│  │ • Features list  │  │ • Action button  │  │ • Password reset │          │
│  │ • CTA button     │  │ • Custom content │  │ • And more...    │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  Each template includes:                                                     │
│  ✓ HTML version (beautiful, responsive)                                     │
│  ✓ Plain text version (fallback)                                            │
│  ✓ Subject line (dynamic)                                                   │
│                                                                              │
└──────────────────────────┬───────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESEND API SERVICE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │                    Resend.com Platform                          │         │
│  ├────────────────────────────────────────────────────────────────┤         │
│  │                                                                 │         │
│  │  ✓ Email delivery infrastructure                               │         │
│  │  ✓ Deliverability optimization                                 │         │
│  │  ✓ Bounce & spam handling                                      │         │
│  │  ✓ Analytics & tracking                                        │         │
│  │  ✓ Rate limiting                                                │         │
│  │                                                                 │         │
│  └────────────────────────┬───────────────────────────────────────┘         │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER'S INBOX                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  📧 Welcome to FxProTrades Bot Community!                         │         │
│  │  ───────────────────────────────────────────────────────────   │         │
│  │  From: FxProTrades Bot <noreply@binaryfx.site>                    │         │
│  │                                                                 │         │
│  │  [Beautiful HTML email with branding, features, and CTA]       │         │
│  │                                                                 │         │
│  │  ┌─────────────────────────────────────┐                       │         │
│  │  │     Start Exploring →               │                       │         │
│  │  └─────────────────────────────────────┘                       │         │
│  │                                                                 │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                              EMAIL FLOW SEQUENCE
═══════════════════════════════════════════════════════════════════════════════

1️⃣  User Action
    └─ User creates account in Community
    └─ Enters username and email (optional)

2️⃣  Frontend Request
    └─ Calls handleRegisterUser(loginId, fullName, avatar, email)
    └─ POST /api/users/register

3️⃣  Backend Processing
    └─ Creates user in database
    └─ Checks if email provided
    └─ If yes, calls sendWelcomeEmail()

4️⃣  Email Service
    └─ Validates configuration
    └─ Gets email template
    └─ Calls Resend API

5️⃣  Email Delivery
    └─ Resend sends email
    └─ Returns message ID
    └─ Logs success/failure

6️⃣  User Receives Email
    └─ Beautiful HTML email in inbox
    └─ Click through to app
    └─ Start using features


═══════════════════════════════════════════════════════════════════════════════
                            INTEGRATION POINTS
═══════════════════════════════════════════════════════════════════════════════

✅ Community Feature (IMPLEMENTED)
   └─ Welcome email on signup
   └─ Optional email collection
   └─ Full error handling

🔄 Copy Trading Feature (READY TO IMPLEMENT)
   └─ Request notifications
   └─ Acceptance/rejection emails
   └─ Performance updates

🔄 Trading Notifications (READY TO IMPLEMENT)
   └─ Trade completion alerts
   └─ Stop loss/take profit triggers
   └─ Daily summaries

🔄 User Notifications (READY TO IMPLEMENT)
   └─ Account updates
   └─ Security alerts
   └─ Feature announcements


═══════════════════════════════════════════════════════════════════════════════
                              KEY FEATURES
═══════════════════════════════════════════════════════════════════════════════

🎯 Universal Design
   └─ Works across all features
   └─ Consistent API
   └─ Reusable templates

🔒 Secure
   └─ API keys on server only
   └─ No sensitive data in frontend
   └─ Environment-based config

📱 Mobile Friendly
   └─ Responsive templates
   └─ Tested across devices
   └─ Optimized for all clients

⚡ Fast Integration
   └─ 5-minute setup
   └─ Copy-paste examples
   └─ Comprehensive docs

🛡️ Error Resilient
   └─ Graceful failures
   └─ Detailed logging
   └─ Retry support

📊 Observable
   └─ Resend dashboard
   └─ Delivery tracking
   └─ Open rate metrics
```
