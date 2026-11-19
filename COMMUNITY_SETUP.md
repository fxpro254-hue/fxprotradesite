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

## Application files

- `api/index.js` serves the Vercel community API. `server/index.js` serves the standalone community API.
- `src/pages/community/community.tsx` uses the app's shared Deriv session and calls the community API through `src/api/community.api.ts`.
- `prisma/schema.prisma` defines the database schema. `setup-community.js` initializes the community data.

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
