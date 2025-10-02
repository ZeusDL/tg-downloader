const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const input = require('input');
const fs = require('fs');
const path = require('path');

// Configuration
const apiId = ; // Get from https://my.telegram.org/apps
const apiHash = ''; // Get from https://my.telegram.org/apps
const stringSession = new StringSession(''); // Leave empty for first time

// Initialize client
const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

// Create download directory
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

// Main function
async function main() {
    console.log('Starting Telegram Channel Downloader...');
    
    // Connect and authenticate
    await client.start({
        phoneNumber: async () => await input.text('Enter your phone number: '),
        password: async () => await input.text('Enter your password (if 2FA enabled): '),
        phoneCode: async () => await input.text('Enter the code you received: '),
        onError: (err) => console.log(err),
    });
    
    console.log('Successfully connected!');
    console.log('Your session string:', client.session.save());
    
    // Show menu
    await showMenu();
}

// Menu system
async function showMenu() {
    console.log('\n=== Telegram Channel Downloader ===');
    console.log('1. Download all media from a channel');
    console.log('2. Download specific message by ID');
    console.log('3. Download recent N messages');
    console.log('4. Listen to channel (real-time download)');
    console.log('5. Download by date range');
    console.log('6. Exit');
    
    const choice = await input.text('Enter your choice (1-6): ');
    
    switch(choice) {
        case '1':
            await downloadAllMedia();
            break;
        case '2':
            await downloadSpecificMessage();
            break;
        case '3':
            await downloadRecentMessages();
            break;
        case '4':
            await listenToChannel();
            break;
        case '5':
            await downloadByDateRange();
            break;
        case '6':
            console.log('Exiting...');
            await client.disconnect();
            process.exit(0);
        default:
            console.log('Invalid choice!');
            await showMenu();
    }
}

// Feature 1: Download all media from channel
async function downloadAllMedia() {
    const channelUsername = await input.text('Enter channel username (without @): ');
    const customPrefix = await input.text('Enter filename prefix (optional): ');
    
    try {
        const entity = await client.getEntity(channelUsername);
        console.log(`Fetching messages from ${channelUsername}...`);
        
        let count = 0;
        for await (const message of client.iterMessages(entity, { limit: undefined })) {
            if (message.media) {
                await downloadMedia(message, customPrefix, count++);
            }
        }
        
        console.log(`\nDownload complete! Total files: ${count}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    await showMenu();
}

// Feature 2: Download specific message by ID
async function downloadSpecificMessage() {
    const channelUsername = await input.text('Enter channel username (without @): ');
    const messageId = parseInt(await input.text('Enter message ID: '));
    const customFilename = await input.text('Enter custom filename (with extension, optional): ');
    
    try {
        const entity = await client.getEntity(channelUsername);
        const messages = await client.getMessages(entity, { ids: [messageId] });
        const message = messages[0];
        
        if (message && message.media) {
            await downloadMedia(message, customFilename, 0, true);
            console.log('Download complete!');
        } else {
            console.log('Message not found or has no media.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    await showMenu();
}

// Feature 3: Download recent N messages
async function downloadRecentMessages() {
    const channelUsername = await input.text('Enter channel username (without @): ');
    const limit = parseInt(await input.text('How many recent messages to download?: '));
    const customPrefix = await input.text('Enter filename prefix (optional): ');
    
    try {
        const entity = await client.getEntity(channelUsername);
        console.log(`Fetching recent ${limit} messages...`);
        
        let count = 0;
        for await (const message of client.iterMessages(entity, { limit })) {
            if (message.media) {
                await downloadMedia(message, customPrefix, count++);
            }
        }
        
        console.log(`\nDownload complete! Total files: ${count}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    await showMenu();
}

// Feature 4: Listen to channel (real-time downloads)
async function listenToChannel() {
    const channelUsername = await input.text('Enter channel username (without @): ');
    const autoPrefix = await input.text('Enter filename prefix (optional): ');
    
    try {
        const entity = await client.getEntity(channelUsername);
        console.log(`Listening to ${channelUsername}... Press Ctrl+C to stop.`);
        
        let count = 0;
        client.addEventHandler(async (event) => {
            const message = event.message;
            if (message.media) {
                console.log('\nNew media detected!');
                await downloadMedia(message, autoPrefix, count++);
            }
        }, new NewMessage({ chats: [entity] }));
        
        // Keep listening
        await new Promise(() => {});
    } catch (error) {
        console.error('Error:', error.message);
        await showMenu();
    }
}

// Feature 5: Download by date range
async function downloadByDateRange() {
    const channelUsername = await input.text('Enter channel username (without @): ');
    const startDate = await input.text('Enter start date (YYYY-MM-DD): ');
    const endDate = await input.text('Enter end date (YYYY-MM-DD): ');
    const customPrefix = await input.text('Enter filename prefix (optional): ');
    
    try {
        const entity = await client.getEntity(channelUsername);
        const offsetDate = new Date(startDate);
        const minDate = new Date(endDate);
        
        console.log(`Fetching messages from ${startDate} to ${endDate}...`);
        
        let count = 0;
        for await (const message of client.iterMessages(entity, { 
            offsetDate, 
            reverse: false 
        })) {
            if (message.date < minDate) break;
            
            if (message.media) {
                await downloadMedia(message, customPrefix, count++);
            }
        }
        
        console.log(`\nDownload complete! Total files: ${count}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    await showMenu();
}

// Core download function
async function downloadMedia(message, customName = '', index = 0, useCustomName = false) {
    try {
        const buffer = await client.downloadMedia(message.media);
        
        if (!buffer) {
            console.log('Failed to download media from message', message.id);
            return;
        }
        
        // Determine file extension
        let extension = '.bin';
        if (message.photo) {
            extension = '.jpg';
        } else if (message.video) {
            extension = '.mp4';
        } else if (message.document) {
            const fileName = message.document.attributes.find(
                attr => attr.className === 'DocumentAttributeFilename'
            )?.fileName;
            if (fileName) {
                extension = path.extname(fileName);
            }
        }
        
        // Generate filename
        let filename;
        if (useCustomName && customName) {
            filename = customName;
        } else if (customName) {
            filename = `${customName}_${index}${extension}`;
        } else {
            filename = `media_${message.id}${extension}`;
        }
        
        const filePath = path.join(downloadDir, filename);
        
        // Save file
        fs.writeFileSync(filePath, buffer);
        console.log(`Downloaded: ${filename} (Message ID: ${message.id})`);
        
        // Save metadata
        const metadataPath = path.join(downloadDir, `${filename}.json`);
        const metadata = {
            messageId: message.id,
            date: message.date.toISOString(),
            caption: message.text || '',
            views: message.views || 0,
            fileSize: buffer.length
        };
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        
    } catch (error) {
        console.error(`Error downloading message ${message.id}:`, error.message);
    }
}

// Start the application
main().catch(console.error);
