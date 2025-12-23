# Learn More Popup Implementation

## Overview
A "Learn More" popup has been successfully added to the application. It displays to logged-in users on each page load to promote trading education resources.

## Features

✅ **Conditional Display**
- Only shows when user is authenticated (`isAuthorized`)
- Dismisses automatically after each session (stored in `sessionStorage`)
- Respects dark/light theme preferences

✅ **User-Friendly Design**
- Clean, modern modal popup with smooth animations
- Fade-in overlay and slide-up content
- Close button (✕) for easy dismissal
- Responsive design that works on mobile and desktop

✅ **Content**
- Headline: "Trade Smarter with Our Learning Resources"
- Feature list with checkmarks highlighting key offerings:
  - Video tutorials on trading strategies
  - Live trading sessions
  - Expert tips and insights
  - Step-by-step guides for beginners

✅ **Call-to-Action**
- Primary "Learn More" button that opens `https://learn.binaryfx.site` in a new tab
- Secondary "Close" button to dismiss the popup
- Both actions dismiss the popup for the current session

## Technical Implementation

### Files Created
1. **`src/components/learn-more-popup/LearnMorePopup.tsx`**
   - React component with TypeScript
   - Uses `useApiBase()` hook to check authentication status
   - Integrates with i18n for multilingual support
   - Respects theme (dark/light mode) from localStorage

2. **`src/components/learn-more-popup/LearnMorePopup.scss`**
   - Comprehensive styling with theme support
   - Animations: fadeIn (overlay) and slideUp (content)
   - Responsive breakpoints for mobile compatibility
   - Button hover and active states
   - Accessibility features (aria-label for close button)

### File Modified
- **`src/app/App.tsx`**
  - Added import for `LearnMorePopup`
  - Placed component inside `CoreStoreProvider` and `TranslationProvider` (necessary for hooks and translations to work)

## Behavior

### First Page Load (Logged In)
- Popup appears automatically
- User can click "Learn More" to visit learn.binaryfx.site
- Or click "Close" to dismiss

### After Dismissal
- Popup won't show again in the same browser session
- `sessionStorage` tracks dismissal (key: `learn_more_popup_dismissed_this_session`)
- On a new session/page reload, the popup reappears (if still logged in)

### If Not Logged In
- Popup never displays
- Automatically shows when user logs in

## Customization Options

To modify the behavior, edit `LearnMorePopup.tsx`:

1. **Change the URL**: Update the URL in `handleLearnMore()`:
   ```tsx
   window.open('https://your-new-url.com', '_blank');
   ```

2. **Change dismissal behavior**: Modify the storage key logic:
   ```tsx
   // To show popup multiple times per session, remove the sessionStorage check
   // To persist dismissal across sessions, use localStorage instead
   ```

3. **Add a delay**: Wrap the state update in a timeout:
   ```tsx
   useEffect(() => {
       if (isAuthorized) {
           const sessionDismissed = sessionStorage.getItem('learn_more_popup_dismissed_this_session') === 'true';
           if (!sessionDismissed) {
               const timer = setTimeout(() => setShowPopup(true), 3000); // 3 second delay
               return () => clearTimeout(timer);
           }
       }
   }, [isAuthorized]);
   ```

## Styling Notes

- **Primary Color**: `#667eea` (used for buttons and accents)
- **Z-index**: `9999` (ensures popup appears above other elements)
- **Animation Duration**: `0.3s` (smooth but responsive)
- **Theme Support**: Automatically adapts to dark/light theme

## Testing

1. Log in to the application
2. Refresh the page - popup should appear
3. Click "Learn More" - should open `https://learn.binaryfx.site` in new tab
4. Refresh again - popup should NOT appear (dismissed in same session)
5. Open in new tab/incognito - popup should appear again (new session)

---

**Note**: The popup uses localization keys for multi-language support. Ensure your translation system has these keys available or they'll display as fallback English text.
