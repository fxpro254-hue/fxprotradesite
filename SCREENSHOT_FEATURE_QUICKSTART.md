# Screenshot Detection - Quick Start Guide

## 🎯 What's Been Added

A fully functional screenshot detection system that prompts users to share screenshots via WhatsApp!

## ✨ Features Implemented

1. **Automatic Detection** - Detects when users take screenshots using:
   - Keyboard shortcuts (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5)
   - Browser visibility changes
   - Focus/blur events
   - Clipboard activity

2. **Beautiful Modal UI** - Shows an elegant prompt with:
   - Animated icon with pulse effect
   - WhatsApp-branded button
   - "Maybe Later" dismiss option
   - Dark mode support
   - Mobile responsive design

3. **WhatsApp Integration** - One-click to:
   - Open WhatsApp chat
   - Pre-filled message
   - Direct to your number: +254740009453

## 🚀 How to Use

### The feature is already active! 

Just take a screenshot and see it in action:
- **Windows**: Press `PrintScreen` or `Win + Shift + S`
- **Mac**: Press `Cmd + Shift + 4` or `Cmd + Shift + 3`

### Customize WhatsApp Number

Edit `src/components/layout/index.tsx`:
```tsx
<ScreenshotPromptModal
    isOpen={isScreenshotDetected}
    onClose={resetScreenshotDetection}
    whatsappNumber='YOUR_NUMBER_HERE' // Change to your WhatsApp number
/>
```

### Customize Message

Edit `src/components/screenshot-prompt/screenshot-prompt-modal.tsx`:
```tsx
const message = encodeURIComponent(
    'Your custom message here!'
);
```

### Disable on Specific Pages

In `src/components/layout/index.tsx`:
```tsx
// Example: Disable on settings page
const isSettingsPage = window.location.pathname.includes('settings');

<ScreenshotPromptModal
    isOpen={isScreenshotDetected && !isSettingsPage}
    onClose={resetScreenshotDetection}
    whatsappNumber='254740009453'
/>
```

## 📁 Files Created

```
src/
├── hooks/
│   └── useScreenshotDetection.tsx        (Detection logic)
├── components/
│   └── screenshot-prompt/
│       ├── index.tsx                     (Export)
│       ├── screenshot-prompt-modal.tsx   (Modal component)
│       └── screenshot-prompt-modal.scss  (Styles)
└── components/layout/
    └── index.tsx                         (Updated with integration)
```

## 🎨 Styling

The modal automatically adapts to:
- ✅ Light/Dark themes
- ✅ Mobile/Desktop screens
- ✅ Your app's existing design system

Colors used:
- Primary (WhatsApp): `#25d366` → `#128c7e` gradient
- Icon: `#667eea` → `#764ba2` gradient

## 🧪 Testing

1. Start your dev server: `npm run dev`
2. Open the app in browser
3. Take a screenshot using any method
4. Modal should appear instantly
5. Click "Send to WhatsApp" to test integration
6. Verify WhatsApp opens with pre-filled message

## ⚙️ Configuration Options

### Add Cooldown (Prevent Spam)

Add to `useScreenshotDetection.tsx`:
```tsx
const [lastDetectionTime, setLastDetectionTime] = useState(0);

// In detection logic:
const now = Date.now();
if (now - lastDetectionTime < 30000) { // 30 second cooldown
    return;
}
setLastDetectionTime(now);
setIsScreenshotDetected(true);
```

### Add Analytics Tracking

In `screenshot-prompt-modal.tsx`:
```tsx
import { Analytics } from '@deriv-com/analytics';

const handleSendToWhatsApp = () => {
    Analytics.trackEvent('screenshot_shared', {
        source: 'screenshot_detection',
        timestamp: new Date().toISOString(),
    });
    // ... existing code
};
```

### Custom Styling

Override styles in `screenshot-prompt-modal.scss`:
```scss
.screenshot-prompt-modal {
    &__button--primary {
        background: your-custom-gradient;
        // ... your styles
    }
}
```

## 🔧 Troubleshooting

**Modal doesn't appear?**
- Check browser console for errors
- Verify you're not on callback/endpoint pages (feature disabled there)
- Try different screenshot methods

**WhatsApp doesn't open?**
- Verify phone number format (no spaces, no +, just digits)
- Check if popup blockers are enabled
- Ensure WhatsApp is installed (mobile)

**Styling issues?**
- Clear browser cache
- Check if SCSS is compiling
- Verify CSS class names match

## 🎯 Next Steps

Consider adding:
- [ ] Session storage to track how many times user dismissed
- [ ] A/B testing different messages
- [ ] Multiple contact options (Email, Telegram, etc.)
- [ ] Screenshot count analytics
- [ ] User preference to disable feature
- [ ] Custom messages per page/feature

## 📞 Support

Questions? Contact via WhatsApp: +254740009453

---

**Built with ❤️ for better user engagement!**
