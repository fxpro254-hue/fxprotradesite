const fs = require('fs');
const https = require('https');
const FormData = require('form-data');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Telegram file sending endpoint
app.post('/send-telegram-file', async (req, res) => {
    const { botToken, chatId, fileName, caption, replyMarkup } = req.body;
    
    if (!botToken || !chatId || !fileName) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters: botToken, chatId, or fileName' 
        });
    }

    const filePath = path.join(__dirname, 'public', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            success: false, 
            error: `File not found: ${fileName}` 
        });
    }

    try {
        console.log('📤 Sending file with data:', { fileName, caption: caption?.substring(0, 50) + '...', hasReplyMarkup: !!replyMarkup });
        
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('document', fs.createReadStream(filePath), {
            filename: fileName,
            contentType: getContentType(fileName)
        });
        
        if (caption) {
            form.append('caption', caption);
            form.append('parse_mode', 'HTML');
        }
        
        if (replyMarkup) {
            console.log('🔘 Adding reply markup:', JSON.stringify(replyMarkup, null, 2));
            form.append('reply_markup', JSON.stringify(replyMarkup));
        }

        const options = {
            method: 'POST',
            host: 'api.telegram.org',
            path: `/bot${botToken}/sendDocument`,
            headers: form.getHeaders()
        };

        const request = https.request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.ok) {
                        res.json({ success: true, result });
                    } else {
                        res.status(400).json({ success: false, error: result.description });
                    }
                } catch (parseError) {
                    res.status(500).json({ success: false, error: 'Failed to parse Telegram response' });
                }
            });
        });

        request.on('error', (error) => {
            console.error('Request error:', error);
            res.status(500).json({ success: false, error: error.message });
        });

        form.pipe(request);

    } catch (error) {
        console.error('File sending error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to get content type based on file extension
function getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.xml':
            return 'application/xml';
        case '.pdf':
            return 'application/pdf';
        case '.txt':
            return 'text/plain';
        case '.json':
            return 'application/json';
        default:
            return 'application/octet-stream';
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Telegram File Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
});
