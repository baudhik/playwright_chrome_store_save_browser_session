A Chrome extension that captures, manages, and restores complete browser sessions including cookies, localStorage, sessionStorage, and IndexedDB data. Perfect for managing multiple user accounts and testing different authentication states! 🚀


<img width="350" height="508" alt="image" src="https://github.com/user-attachments/assets/47885005-2548-4c49-b23c-bacbcc346437" />


✨ Features
💾 Save Sessions: Capture complete browser state (cookies, storage, IndexedDB) with custom profile names

🔄 Load Profiles: Instantly restore any saved session in a new tab

🔃 Refresh Profiles: Update existing profiles with current session data (auto-navigates to correct domain)

📤 Export to Playwright: Generate Playwright-compatible JSON files for automated testing

📦 Backup & Restore: Export all profiles to a single file and restore them later

🌐 Multi-Domain Support: Handles complex authentication flows across Google services (Gmail, Drive, etc.)

🎯 Use Cases
👥 Multi-Account Management: Switch between different user accounts instantly

🧪 Testing: Save authenticated states for QA testing

⚡ Development: Quickly switch between different user roles/permissions

🤖 Automation: Export sessions for Playwright/Puppeteer scripts

📥 Installation
Clone this repository 📋

Open Chrome → Extensions → Enable Developer Mode 🔧

Click "Load unpacked" and select the project folder 📁

🚀 Usage
💾 Save Profile: Navigate to a website, enter profile name, click "Save/Update Session"

🔄 Load Profile: Click any profile name to restore that session in a new tab

🔃 Refresh Profile: Click ↻ to update profile with current session data

📤 Export: Click ⬇ to download Playwright JSON for individual profiles

📦 Backup All: Export all profiles to a single backup file

📥 Restore: Import previously exported backup files

⚙️ Technical Details
🆕 Manifest V3 compatible

Supports 🕵️ incognito mode with separate cookie stores

Handles 🗄️ IndexedDB export/import

🌍 Cross-domain cookie management for complex auth flows

🎯 Auto-navigation for profile refresh across different domains

🔑 Permissions
storage: Save/load profiles 💾

cookies: Capture/restore authentication cookies 🍪

tabs: Create/manage browser tabs 📑

downloads: Export backup files 📥

scripting: Access page storage APIs 📜

<all_urls>: Work across all websites 🌐
