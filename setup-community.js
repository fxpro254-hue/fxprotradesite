#!/usr/bin/env node

/**
 * Community Feature Setup Script
 * 
 * This script will:
 * 1. Install Prisma dependencies
 * 2. Generate Prisma Client
 * 3. Push the schema to the database
 * 4. Initialize default categories
 */

const { execSync } = require('child_process');

const runCommand = (command) => {
    try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Failed to execute: ${command}`);
        return false;
    }
};

console.log('🚀 Setting up Community Feature...\n');

// Step 1: Install Prisma dependencies
console.log('📦 Installing Prisma dependencies...');
const installSuccess = runCommand('npm install @prisma/client && npm install -D prisma');

if (!installSuccess) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

// Step 2: Generate Prisma Client
console.log('\n🔧 Generating Prisma Client...');
const generateSuccess = runCommand('npx prisma generate');

if (!generateSuccess) {
    console.error('❌ Failed to generate Prisma Client');
    process.exit(1);
}

// Step 3: Push schema to database
console.log('\n📊 Pushing schema to database...');
const pushSuccess = runCommand('npx prisma db push');

if (!pushSuccess) {
    console.error('❌ Failed to push schema to database');
    process.exit(1);
}

console.log('\n✅ Community Feature setup completed successfully!');
console.log('\n📝 Next steps:');
console.log('1. Make sure your .env file has the database URLs');
console.log('2. Run the app and the categories will be initialized automatically');
console.log('3. The community tab will now use the real database!\n');
