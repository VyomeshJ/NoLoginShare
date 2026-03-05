# NoLoginShare

**NoLoginShare** is a simple and secure file-sharing platform that allows users to upload files and generate shareable links without creating an account. Files can optionally be protected with a password and automatically expire after a selected time period.

**Live Website:**  
https://nologinshare.vyomeshj.com/

---

# Features

- Upload files without creating an account
- Generate a shareable link
- Requires password protection
- Automatic file expiration
  - 6 hours
  - 12 hours
  - 24 hours
- Secure AES-256-GCM encryption
- Passwords securely hashed with bcrypt
- SQLite database to store file path and other necessary info

---

# Tech Stack

## Backend
-  Node.js  
- Express
- Multer – file upload handling
- Crypto (AES-256-GCM) – encryption
- bcrypt – password hashing
- SQLite3 – database storage

## Frontend
- Next.js

## Deployment
- Hosted on a self-hosted home server
- Running inside a Docker container

---

# How It Works

1. A user uploads a file through the web interface.
2. The backend:
   - Encrypts the file using AES-256-GCM
   - Hashes the password using bcrypt (if provided)
   - Stores metadata in SQLite3
3. A unique shareable link is generated.
4. The file remains accessible for the selected duration:
   - 6 hours
   - 12 hours
   - 24 hours
5. Once expired, the file is automatically removed.
