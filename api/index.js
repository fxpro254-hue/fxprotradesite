const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const app = express();
const prismaClient = new PrismaClient();
const prisma = prismaClient.$extends(withAccelerate());

// CORS configuration
const corsOptions = {
    origin: ['https://bot.binaryfx.site', 'https://www.bot.binaryfx.site', 'http://localhost:8443', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Community API is running',
        endpoints: {
            health: '/api/health',
            categories: '/api/categories',
            messages: '/api/messages/:categoryId',
            register: '/api/users/register',
            reactions: '/api/reactions'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Community API is running' });
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });
        
        const formattedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            messageCount: cat._count.messages
        }));
        
        res.json({ success: true, data: formattedCategories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get messages for a category
app.get('/api/messages/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        
        const messages = await prisma.message.findMany({
            where: { categoryId },
            include: {
                user: true,
                replyTo: {
                    include: {
                        user: true
                    }
                },
                attachments: true,
                reactions: true
            },
            orderBy: { createdAt: 'asc' },
            take: limit
        });
        
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new message
app.post('/api/messages', async (req, res) => {
    try {
        const { userId, categoryId, content, replyToId, attachments } = req.body;
        
        const message = await prisma.message.create({
            data: {
                content,
                userId,
                categoryId,
                replyToId,
                attachments: attachments ? {
                    create: attachments
                } : undefined
            },
            include: {
                user: true,
                replyTo: {
                    include: {
                        user: true
                    }
                },
                attachments: true
            }
        });
        
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Register or get user
app.post('/api/users/register', async (req, res) => {
    try {
        const { loginId, fullName, avatar } = req.body;
        
        let user = await prisma.user.findUnique({
            where: { loginId }
        });
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    loginId,
                    fullName,
                    avatar: avatar || '👤',
                    status: 'online',
                    bio: 'Trading enthusiast'
                }
            });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user status
app.patch('/api/users/:loginId/status', async (req, res) => {
    try {
        const { loginId } = req.params;
        const { status } = req.body;
        
        const user = await prisma.user.update({
            where: { loginId },
            data: { status }
        });
        
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add or remove reaction
app.post('/api/reactions', async (req, res) => {
    try {
        const { messageId, emoji, userId } = req.body;
        
        let reaction = await prisma.reaction.findUnique({
            where: {
                messageId_emoji: {
                    messageId,
                    emoji
                }
            }
        });
        
        if (reaction) {
            const userIds = reaction.userIds;
            const userIndex = userIds.indexOf(userId);
            
            if (userIndex > -1) {
                const updatedUserIds = userIds.filter(id => id !== userId);
                
                if (updatedUserIds.length === 0) {
                    await prisma.reaction.delete({
                        where: { id: reaction.id }
                    });
                    res.json({ success: true, action: 'deleted' });
                } else {
                    reaction = await prisma.reaction.update({
                        where: { id: reaction.id },
                        data: { userIds: updatedUserIds }
                    });
                    res.json({ success: true, action: 'removed', data: reaction });
                }
            } else {
                reaction = await prisma.reaction.update({
                    where: { id: reaction.id },
                    data: { userIds: [...userIds, userId] }
                });
                res.json({ success: true, action: 'added', data: reaction });
            }
        } else {
            reaction = await prisma.reaction.create({
                data: {
                    messageId,
                    emoji,
                    userIds: [userId]
                }
            });
            res.json({ success: true, action: 'created', data: reaction });
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user stats
app.get('/api/users/:loginId/stats', async (req, res) => {
    try {
        const { loginId } = req.params;
        
        const user = await prisma.user.findUnique({
            where: { loginId },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            data: {
                ...user,
                messageCount: user._count.messages
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove the root route we added earlier since we already have it
// Export for Vercel serverless
module.exports = app;
