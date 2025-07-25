# Telegram Bot File Sender Setup

## Overview
This system combines a browser-based trading signals detector with a Node.js server for sending bot files via Telegram.

## Architecture
- **Client Side**: `public/signals-detector/signals.js` - Detects trading signals and displays them
- **Server Side**: `telegram-file-server.js` - Handles file uploads to Telegram using Node.js

## Setup Instructions

### 1. Install Dependencies
```bash
npm install express cors form-data
```

### 2. Start the Telegram File Server
```bash
npm run telegram-server
```
The server will start on `http://localhost:3001`

### 3. Configure Your Telegram Bot
1. Create a bot via @BotFather on Telegram
2. Get your bot token (format: `123456789:ABCdefGhIjklMnOpQrStUvWxYz`)
3. Get your channel/chat ID (format: `@channelname` or `-1001234567890`)
4. Update the configuration in the web interface

### 4. File Location
Place your bot files in the `public/` directory:
- `public/Market wizard v1.5.xml` ✅

## How It Works

### Signal Detection
The system monitors multiple volatility indices and detects:
- **Rise/Fall Signals**: When trend percentages exceed thresholds
- **Over/Under Signals**: When digit frequencies are favorable

### Automatic File Sending
When signals are detected:
1. A signal message is sent to Telegram
2. The Market Wizard bot file is automatically sent
3. Includes specific instructions for each signal type

### API Endpoints

#### POST `/send-telegram-file`
Sends a file from the public directory to Telegram.

**Request Body:**
```json
{
  "botToken": "your_bot_token",
  "chatId": "@your_channel",
  "fileName": "Market wizard v1.5.xml",
  "caption": "Bot description with HTML formatting"
}
```

**Response:**
```json
{
  "success": true,
  "result": { /* Telegram API response */ }
}
```

## File Types Supported
- `.xml` (Bot files)
- `.pdf` (Documents)
- `.txt` (Text files)
- `.json` (Data files)

## Testing
1. Use the "Test Bot File" button in the web interface
2. Check the server console for logs
3. Verify files are sent to your Telegram channel

## Troubleshooting

### Common Issues
- **Server not running**: Make sure `npm run telegram-server` is active
- **File not found**: Ensure the file exists in `public/` directory
- **Telegram errors**: Check bot token and chat ID configuration
- **CORS errors**: The server has CORS enabled for all origins

### Server Logs
Check the terminal running `telegram-server` for detailed logs:
- File sending attempts
- Telegram API responses
- Error messages

## Security Notes
- Keep your bot token secure
- Don't commit tokens to version control
- Consider using environment variables for production

## Signal Thresholds
- **Rise Signal**: 255-tick > 57% AND 55-tick > 55%
- **Fall Signal**: 255-tick > 57% AND 55-tick > 55%
- **Over 2**: Digits 7,8,9 all < 10%
- **Under 7**: Digits 0,1,2 all < 10%
