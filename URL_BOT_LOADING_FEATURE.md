# URL Bot Loading Feature

## Overview

The bot builder now supports loading bots via URL parameters, making it easy to share specific bots with others. This feature includes:

1. **URL Parameter Support**: Load any bot by adding a `bot` parameter to the URL
2. **Share Buttons**: Each bot in the free bots section has a share button that generates a shareable link
3. **Automatic Loading**: When visiting a URL with a bot parameter, the bot automatically loads into the bot builder

## Usage

### Sharing a Bot

1. Navigate to the Free Bots section
2. Find the bot you want to share
3. Click the share button (📤 icon) in the top-right corner of the bot card
4. The shareable link is automatically copied to your clipboard
5. Share the link with others

### Loading a Bot via URL

Users can load a specific bot by visiting a URL with the following format:

```
https://your-domain.com/?bot=BOT_NAME&tab=bot_builder
```

**Examples:**
- `https://localhost:8445/?bot=BOT%20V3&tab=bot_builder`
- `https://localhost:8445/?bot=Market%20wizard%20v1.5&tab=bot_builder`
- `https://localhost:8445/?bot=Even_Odd%20Killer%20bot&tab=bot_builder`

### URL Parameters

- `bot` - The exact name of the bot to load (URL encoded)
- `tab` - Optional parameter to specify which tab to open (defaults to bot_builder)

## Technical Implementation

### Key Components Modified

1. **Main Component (`src/pages/main/main.tsx`)**
   - Added bot parameter detection in useEffect
   - Implemented automatic bot loading on page load
   - Added share functionality with clipboard integration

2. **Free Bot Search Bar (`src/pages/dashboard/free-bot-search-bar.tsx`)**
   - Added share buttons to search results
   - Implemented share functionality for search items

3. **Styles (`src/pages/main/free-bots.scss`)**
   - Added styles for share buttons
   - Responsive design for mobile and desktop

### Features

#### URL Parameter Loading
- Detects `bot` parameter on page load
- Finds matching bot by title or filename
- Automatically loads bot into workspace
- Removes parameter from URL after loading
- Works with URL-encoded bot names

#### Share Functionality
- Copy-to-clipboard integration
- Visual feedback with notifications
- Fallback to alert dialog if clipboard fails
- Share buttons on both grid view and search results

#### Error Handling
- Graceful handling of invalid bot names
- Fallback notifications for clipboard failures
- Console logging for debugging

## Browser Compatibility

- Modern browsers with Clipboard API support
- Fallback alert dialog for older browsers
- Works with all URL encoding scenarios

## Example Usage Scenarios

1. **Community Sharing**: Users can share their favorite bots via social media or messaging apps
2. **Documentation**: Include direct links to specific bots in tutorials or guides  
3. **Customer Support**: Support agents can send direct links to recommended bots
4. **Educational Content**: Teachers can link directly to specific bots for lessons

## Testing

To test the feature:

1. Navigate to Free Bots section
2. Click share button on any bot
3. Open the copied URL in a new browser tab/window
4. Verify the bot loads automatically in the bot builder

## Future Enhancements

Potential improvements could include:
- Pre-configured settings in URL parameters
- Custom bot loading from external sources
- Social media preview cards for shared links
- Analytics tracking for shared bot usage
