-----

# 📲 Telegram Channel Downloader

A powerful and easy-to-use Node.js command-line tool to download media from public and private Telegram channels with a variety of options.

-----

## ✨ Features

This script comes packed with features to make downloading content from Telegram a breeze:

  * 📥 **Download All Media:** Grab every single media file from a channel, from the very beginning to the latest post.
  * 🆔 **Download by Message ID:** Target and download media from a specific message by providing its ID.
  * 🕒 **Download Recent Messages:** Quickly save media from the last 'N' number of messages in a channel.
  * 📡 **Real-time Listener:** Actively listen to a channel and automatically download new media as soon as it's posted.
  * 📅 **Date Range Downloader:** Download all media posted within a specific date range.
  * 📝 **Metadata Generation:** For each downloaded file, a corresponding `.json` file is created containing message ID, date, caption, and other useful info.
  * 🔐 **Session Management:** Automatically saves your session so you don't have to log in every time.
  * 💬 **Interactive CLI:** A simple and intuitive command-line menu to guide you through the options.

-----

## 🚀 Getting Started

Follow these steps to get the downloader up and running on your local machine.

### Prerequisites

  * [Node.js](https://nodejs.org/) (version 14 or higher)
  * NPM (usually comes with Node.js)
  * A Telegram Account

### 1\. Installation

Clone this repository or download the `telegram-downloader.js` file.

Open your terminal or command prompt and navigate to the project directory. Then, install the required dependencies:

```bash
npm install telegram input
```

### 2\. Get Your Telegram API Credentials

You need to get your own `apiId` and `apiHash` from Telegram.

1.  Go to [my.telegram.org](https://my.telegram.org) and log in with your Telegram account.
2.  Click on **"API development tools"**.
3.  Fill in the "App title" and "Short name" (you can call it "Downloader").
4.  You will get your `apiId` and `apiHash`.

### 3\. Configure the Script

Open the `telegram-downloader.js` file in a text editor and replace the placeholder values for `apiId` and `apiHash` with the credentials you just obtained.

```javascript
// Configuration
const apiId = 1234567; // Replace with your API ID
const apiHash = 'YOUR_API_HASH'; // Replace with your API Hash
```

-----

## 📖 How to Use

1.  **Run the script from your terminal:**

    ```bash
    node telegram-downloader.js
    ```

2.  **First-time Login:** The first time you run the script, it will ask for your phone number, password (if you have 2FA enabled), and the login code sent to you by Telegram.

3.  **Session String:** After a successful login, a session string will be printed to the console. Copy this string and paste it inside the `new StringSession('')` in the script for future use. This will prevent you from having to log in every time.

    ```javascript
    const stringSession = new StringSession('PASTE_YOUR_SESSION_STRING_HERE');
    ```

4.  **Choose an Option:** Once logged in, you will see the main menu. Simply type the number corresponding to the action you want to perform and press Enter.

    ```
    === Telegram Channel Downloader ===
    1. Download all media from a channel
    2. Download specific message by ID
    3. Download recent N messages
    4. Listen to channel (real-time download)
    5. Download by date range
    6. Exit
    ```

5.  **Follow the Prompts:** The script will ask for necessary information like the channel username (without the `@`) and other options.

6.  **Find Your Files:** All downloaded media and metadata files will be saved in a `downloads` folder created in the same directory as the script.

-----

Happy downloading\! 🎉
