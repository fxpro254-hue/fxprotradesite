# Screenshot Detection - Debugging & Testing Guide

## 🔍 What Was Fixed

### Changes Made:

1. **Enhanced Keyboard Detection**
   - Added detailed console logging for all key presses
   - Improved Windows Snipping Tool detection (Win+Shift+S)
   - Added support for more keyboard combinations

2. **Added Debug Console Logs**
   - Hook initialization message
   - Every keypress is now logged with details
   - Modal open/close events logged
   - WhatsApp link click logged

3. **Test Button Added** (Development Only)
   - Red button in bottom-right corner
   - Only visible in development mode
   - Click to test the modal without taking a screenshot
   - Auto-removed in production builds

## 🧪 How to Test

### Method 1: Use the Test Button (Easiest)
1. Run your app: `npm run dev`
2. Look for the red "🧪 Test Screenshot" button in the bottom-right corner
3. Click it to trigger the modal
4. Verify the modal appears
5. Test both buttons (Send to WhatsApp & Maybe Later)

### Method 2: Take an Actual Screenshot
1. Open the browser console (F12)
2. Watch for the message: "📸 Screenshot detection initialized"
3. Try these methods:

   **Windows:**
   - Press `PrintScreen` key
   - Press `Win + Shift + S` (Snipping Tool)
   - Press `Alt + PrintScreen`

   **Mac:**
   - Press `Cmd + Shift + 3` (full screen)
   - Press `Cmd + Shift + 4` (selection)
   - Press `Cmd + Shift + 5` (screenshot menu)

4. Check console for detection logs
5. Modal should appear

### Method 3: Browser DevTools Simulation
```javascript
// Open browser console and paste this:
document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'PrintScreen',
    keyCode: 44,
    bubbles: true
}));
```

## 🐛 Troubleshooting

### Issue: "Modal doesn't appear"

**Check Console Logs:**
```
✅ Should see: "📸 Screenshot detection initialized"
✅ When pressing keys: "Key pressed: [key info]"
✅ On detection: "📸 Screenshot detected via keyboard shortcut!"
✅ Modal opens: "📸 Screenshot modal opened!"
```

**If you DON'T see these logs:**
- The hook might not be initialized
- Check if Layout component is rendering
- Verify imports are correct

### Issue: "Test button doesn't appear"

**Possible causes:**
- Not in development mode
- Check `process.env.NODE_ENV` in console
- Button might be behind other elements (check z-index)

**Solutions:**
```javascript
// In console, check:
console.log('NODE_ENV:', process.env.NODE_ENV);

// If it's not 'development', temporarily change the condition in index.tsx:
{true && ( // Change from process.env.NODE_ENV === 'development'
    <button ...>
```

### Issue: "Keys not detected"

**Check keyboard focus:**
- Click on the page first (ensure focus is on the document)
- Don't have DevTools input focused
- Try pressing keys multiple times

**Look for console output:**
```
Key pressed: PrintScreen KeyCode: 44 Shift: false Meta: false Ctrl: false
```

If you see this but no detection, the conditions might need adjustment for your system.

### Issue: "Modal appears but buttons don't work"

**Check console for:**
- "📱 Opening WhatsApp..." (when clicking Send button)
- Any error messages

**Verify:**
- Popup blocker isn't active
- WhatsApp is installed (on mobile)
- Phone number format is correct (no spaces, no +)

### Issue: "TypeScript/Compile Errors"

**Existing errors in Layout component are NOT from our feature:**
- Lines 36, 44, 50, 52 - these are pre-existing
- Our new code is clean (verified)

## 📊 Console Output Reference

### Normal Startup:
```
📸 Screenshot detection initialized - Try taking a screenshot!
📸 Supported shortcuts: PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5
```

### When Pressing Keys:
```
Key pressed: s KeyCode: 83 Shift: true Meta: true Ctrl: false
Key pressed: PrintScreen KeyCode: 44 Shift: false Meta: false Ctrl: false
```

### When Screenshot Detected:
```
📸 Screenshot detected via keyboard shortcut!
📸 Screenshot modal opened!
```

### When Clicking "Send to WhatsApp":
```
📱 Opening WhatsApp...
```

## 🔧 Quick Fixes

### Force Modal to Always Show (Testing Only)
In `src/components/layout/index.tsx`, temporarily change:
```tsx
<ScreenshotPromptModal
    isOpen={true} // Force it to always show
    onClose={resetScreenshotDetection}
    whatsappNumber='254740009453'
/>
```

### Make Test Button Always Visible
Change:
```tsx
{true && ( // Remove: process.env.NODE_ENV === 'development'
    <button ...>
```

### Add More Keyboard Shortcuts
In `useScreenshotDetection.tsx`, add to the detection:
```tsx
const isCustomShortcut = e.ctrlKey && e.shiftKey && e.key === 'P'; // Ctrl+Shift+P
if (isPrintScreen || isWindowsSnippingTool || isMacScreenshot || isCustomShortcut) {
    // ...
}
```

## 📝 Files to Check

1. **Hook:** `src/hooks/useScreenshotDetection.tsx`
   - Detection logic
   - Event listeners
   - Console logs

2. **Modal:** `src/components/screenshot-prompt/screenshot-prompt-modal.tsx`
   - UI component
   - Button handlers
   - WhatsApp integration

3. **Integration:** `src/components/layout/index.tsx`
   - Hook usage
   - Modal rendering
   - Test button

4. **Styles:** `src/components/screenshot-prompt/screenshot-prompt-modal.scss`
   - Visual appearance
   - Animations

## ✅ Verification Checklist

- [ ] Console shows "Screenshot detection initialized"
- [ ] Test button appears in bottom-right
- [ ] Test button triggers modal
- [ ] Modal has proper styling
- [ ] "Send to WhatsApp" button opens WhatsApp
- [ ] "Maybe Later" button closes modal
- [ ] Actual screenshots trigger modal
- [ ] No console errors
- [ ] Modal closes properly
- [ ] WhatsApp link has correct number

## 🎯 Next Steps

Once testing is complete and working:

1. **Remove test button** from production:
   - It's already wrapped in `process.env.NODE_ENV === 'development'`
   - Will auto-hide in production builds

2. **Adjust detection sensitivity** if needed:
   - Fine-tune keyboard combinations
   - Add/remove detection methods

3. **Customize messaging**:
   - Edit WhatsApp message text
   - Modify modal copy

4. **Add cooldown** (optional):
   - Prevent multiple prompts in short time
   - Track last shown time

## 📞 Still Not Working?

Contact via WhatsApp: +254740009453

Share:
1. Console logs (screenshots or copy)
2. Which testing method you tried
3. Which browser/OS you're using
4. Any error messages
