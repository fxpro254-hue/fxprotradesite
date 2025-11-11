# Community Feature - Setup Guide

## Overview
The Community feature provides a real-time chat system integrated with Deriv authentication and PostgreSQL database using Prisma ORM.

## Features
- ✅ Three chat categories (General, Support, Strategies)
- ✅ Real-time messaging
- ✅ Reply to messages
- ✅ Image and video attachments
- ✅ User profiles with stats
- ✅ Deriv authentication integration
- ✅ PostgreSQL database with Prisma

## Database Schema

### Models
1. **User** - Stores Deriv user information
   - loginId (Deriv login ID)
   - fullName (from Deriv account)
   - avatar, bio, status
   - joinedDate, lastSeen

2. **Category** - Chat categories
   - name (general, support, strategies)
   - description, icon
   - messageCount

3. **Message** - Chat messages
   - content, timestamps
   - user reference
   - category reference
   - reply functionality
   - attachments

4. **Attachment** - Message attachments
   - type (image, video)
   - url

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Configure Environment Variables
Make sure your `.env` file contains:
```env
DATABASE_URL="postgres://..."
PRISMA_DATABASE_URL="prisma+postgres://..."
```

### 3. Initialize Database
```bash
# Run the setup script
node setup-community.js

# Or manually:
npx prisma generate
npx prisma db push
```

### 4. Verify Setup
```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## File Structure
```
bot/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── api/
│   │   └── community.api.ts    # API handlers
│   ├── services/
│   │   └── community.service.ts # Database operations
│   ├── hooks/
│   │   └── useDerivAuth.ts     # Deriv authentication hook
│   ├── lib/
│   │   └── prisma.ts           # Prisma client instance
│   └── pages/
│       └── community/
│           ├── community.tsx    # Community component
│           └── community.scss   # Styles
└── setup-community.js           # Setup script
```

## Usage

### Deriv Authentication
The community feature automatically fetches user information from Deriv:
```typescript
import { useDerivAuth } from '@/hooks/useDerivAuth';

const { user, loading } = useDerivAuth();
// user.loginId - Deriv login ID
// user.fullName - User's full name
```

### API Functions

#### Get Categories
```typescript
import { handleGetCategories } from '@/api/community.api';

const result = await handleGetCategories();
```

#### Get Messages
```typescript
import { handleGetMessages } from '@/api/community.api';

const result = await handleGetMessages(categoryId, limit);
```

#### Create Message
```typescript
import { handleCreateMessage } from '@/api/community.api';

const result = await handleCreateMessage({
    content: 'Hello!',
    userId: user.id,
    categoryId: category.id,
    replyToId: optionalReplyId,
    attachments: optionalAttachments
});
```

#### Register User
```typescript
import { handleRegisterUser } from '@/api/community.api';

const result = await handleRegisterUser(loginId, fullName);
```

#### Update User Status
```typescript
import { handleUpdateUserStatus } from '@/api/community.api';

const result = await handleUpdateUserStatus(loginId, 'online');
```

## Integration with Community Component

The community component will need to be updated to:
1. Use `useDerivAuth` hook to get current user
2. Register user on first visit
3. Load messages from database
4. Send messages to database
5. Update user status (online/offline)

## Database Maintenance

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma db push --force-reset
```

### Generate New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Security Considerations

1. **Authentication**: Always verify Deriv authentication before allowing operations
2. **Authorization**: Users can only delete their own messages
3. **Rate Limiting**: Consider implementing rate limiting for message creation
4. **Content Moderation**: Add moderation system for inappropriate content
5. **File Upload**: Implement secure file upload with size and type restrictions

## Next Steps

1. ✅ Database schema created
2. ✅ Service layer implemented
3. ✅ API handlers created
4. ✅ Deriv authentication hook ready
5. ⏳ Update Community component to use real database
6. ⏳ Add file upload functionality
7. ⏳ Implement WebSocket for real-time updates
8. ⏳ Add message reactions and editing

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL in .env
- Check network connectivity to Prisma database
- Ensure SSL mode is correct

### Prisma Client Errors
- Run `npx prisma generate` after schema changes
- Delete node_modules/.prisma and regenerate

### Authentication Issues
- Ensure Deriv API is initialized
- Check user authorization status
- Verify loginId is available

## Support
For issues or questions, check the Prisma documentation:
- https://www.prisma.io/docs
