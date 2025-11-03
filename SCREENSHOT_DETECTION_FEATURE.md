# Screenshot Detection Feature 📸

## Overview
This feature automatically detects when users take screenshots of your application and prompts them to share the screenshot via WhatsApp. It's designed to encourage user engagement and gather valuable feedback.

## How It Works

### Detection Methods
The feature uses multiple detection strategies to identify when a screenshot is taken:

1. **Keyboard Shortcuts Detection**
   - Windows: `PrintScreen`, `Win + Shift + S`, `Alt + PrintScreen`
   - Mac: `Cmd + Shift + 3`, `Cmd + Shift + 4`, `Cmd + Shift + 5`

2. **Visibility Change Detection**
   - Detects when the page is briefly hidden (< 300ms), which often occurs during screenshot capture

3. **Focus/Blur Detection**
   - Monitors rapid blur/focus events (< 200ms) that can indicate screenshot tool activation

4. **Clipboard Activity**
   - Detects copy events that might indicate screenshot tools copying to clipboard

### User Experience
When a screenshot is detected:
1. A beautiful modal appears with an animated icon
2. User is prompted to send the screenshot to your WhatsApp
3. Two options are provided:
   - **Send to WhatsApp**: Opens WhatsApp with a pre-filled message
   - **Maybe Later**: Dismisses the modal

## Files Created

### 1. Hook: `useScreenshotDetection.tsx`
- **Location**: `src/hooks/useScreenshotDetection.tsx`
- **Purpose**: Provides screenshot detection logic
- **Returns**: 
  - `isScreenshotDetected`: Boolean indicating if screenshot was detected
  - `resetScreenshotDetection`: Function to reset the detection state

### 2. Component: `ScreenshotPromptModal.tsx`
- **Location**: `src/components/screenshot-prompt/screenshot-prompt-modal.tsx`
- **Purpose**: Beautiful modal UI that prompts users
- **Props**:
  - `isOpen`: Controls modal visibility
  - `onClose`: Callback when modal is closed
  - `whatsappNumber`: WhatsApp number to send message to (default: `254740009453`)

### 3. Styles: `screenshot-prompt-modal.scss`
- **Location**: `src/components/screenshot-prompt/screenshot-prompt-modal.scss`
- **Features**:
  - Responsive design (mobile & desktop)
  - Dark mode support
  - Smooth animations
  - WhatsApp-branded primary button

### 4. Integration: `Layout Component`
- **Location**: `src/components/layout/index.tsx`
- **Integration**: Feature is globally enabled across all pages

## Configuration

### Customizing WhatsApp Number
Edit the WhatsApp number in `src/components/layout/index.tsx`:

```tsx
<ScreenshotPromptModal
    isOpen={isScreenshotDetected}
    onClose={resetScreenshotDetection}
    whatsappNumber='YOUR_WHATSAPP_NUMBER' // Change this
/>
```

### Customizing Message
Edit the pre-filled message in `screenshot-prompt-modal.tsx`:

```tsx
const message = encodeURIComponent(
    'Your custom message here'
);
```

### Disabling on Specific Pages
To disable on specific pages, add conditions in the Layout component:

```tsx
const shouldShowScreenshotPrompt = !isCallbackPage && !isEndpointPage;

<ScreenshotPromptModal
    isOpen={isScreenshotDetected && shouldShowScreenshotPrompt}
    onClose={resetScreenshotDetection}
    whatsappNumber='254740009453'
/>
```

## Features

✅ **Multi-Platform Support**: Works on Windows, Mac, and mobile devices
✅ **Non-Intrusive**: Only appears when screenshot is detected
✅ **Beautiful UI**: Modern design with smooth animations
✅ **Dark Mode**: Automatically adapts to theme
✅ **Mobile Responsive**: Optimized for all screen sizes
✅ **Dismissible**: Users can easily close if not interested
✅ **Direct WhatsApp Integration**: One-click to send message

## Technical Details

### Browser Compatibility
- ✅ Chrome/Edge/Brave (Chromium-based)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Detection accuracy varies by browser and screenshot method

### Performance
- Minimal overhead: Only event listeners, no polling
- Efficient cleanup on component unmount
- No external dependencies beyond existing packages

### Privacy
- No screenshots are captured or stored
- Only detects the action, not the content
- User has full control to share or not

## Testing

To test the feature:
1. Run the application
2. Press `PrintScreen` (Windows) or `Cmd + Shift + 4` (Mac)
3. Modal should appear
4. Click "Send to WhatsApp" to verify WhatsApp integration
5. Click "Maybe Later" to dismiss

## Future Enhancements

Potential improvements:
- [ ] Add analytics tracking for screenshot events
- [ ] Allow multiple WhatsApp numbers (team support)
- [ ] Add email option alongside WhatsApp
- [ ] Cooldown period to avoid multiple prompts
- [ ] Custom messaging per page/feature
- [ ] A/B testing different prompt messages

## Troubleshooting

### Modal doesn't appear
- Check browser console for errors
- Verify the Layout component is rendering
- Ensure event listeners are attached (check browser DevTools)

### WhatsApp link doesn't work
- Verify the phone number format (international format without + or spaces)
- Ensure WhatsApp is installed on mobile devices
- Check if popup blockers are preventing the window from opening

## Support

For issues or questions, contact via WhatsApp: +254740009453
