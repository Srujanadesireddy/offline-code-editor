# Offline-First Collaborative Code Editor

A web-based **Offline-First Collaborative Code Editor** that allows users to create and manage coding projects, edit files using the Monaco Editor, work without an internet connection, synchronize offline changes when the connection is restored, and collaborate with other users in real time.

## Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Forgot password functionality
- Password reset functionality

### 📁 Project Management

- Create projects
- Delete projects
- Join projects using invite codes
- Share projects with other users
- View owned and joined projects

### 📂 File & Folder Management

- Create files and folders
- Rename files and folders
- Delete files and folders
- Move files
- Organize project files using the file explorer

### 💻 Code Editor

- Monaco Editor-based coding environment
- Syntax highlighting
- Multiple file tabs
- File explorer
- Breadcrumb navigation
- Integrated terminal interface

### 📡 Offline-First Functionality

The application continues to work when the internet connection is unavailable.

- Project and file data stored locally using IndexedDB
- Code changes can be made while offline
- Offline operations are added to a synchronization queue
- Pending changes are automatically synchronized when connectivity is restored
- Network status is displayed in the editor
- Locally saved changes are preserved during offline usage

### 🔄 Automatic Synchronization

When the connection is restored:

1. Pending offline operations are detected.
2. Operations are processed from the synchronization queue.
3. Changes are sent to the backend server.
4. Successfully synchronized operations are removed from the queue.

Supported synchronized operations include:

- Create Project
- Delete Project
- Create Folder
- Delete Folder
- Rename Folder
- Create File
- Update File
- Rename File
- Move File
- Delete File

### 👥 Real-Time Collaboration

The application supports real-time collaboration using **Socket.IO**.

- Multiple users can join the same project
- Users can edit files collaboratively
- File changes are broadcast in real time
- Connected collaborators are displayed in the editor
- Users can see who is currently connected to the project

### 🕒 Version History

The editor maintains previous versions of files.

- File versions are created when files are updated
- Version history can be viewed from the editor
- Previous versions can be restored
- Individual versions can be deleted
- Version information includes the creator and timestamp

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Client   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite UI    │
                    │     Monaco Editor    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐
     │    IndexedDB    │              │  Express Server │
     │ Local Storage   │              │    REST API     │
     └────────┬────────┘              └────────┬────────┘
              │                                │
              ▼                                ▼
     ┌─────────────────┐              ┌─────────────────┐
     │   Sync Engine   │              │     MongoDB     │
     │ Offline Queue   │              │     Database    │
     └────────┬────────┘              └─────────────────┘
              │
              │ Offline Synchronization
              │
              ▼
     ┌──────────────────────┐
     │ Connection Restored  │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │    Sync Operations   │
     │      with Server     │
     └──────────────────────┘


              Real-Time Collaboration
                         │
                         ▼
                  ┌───────────────┐
                  │   Socket.IO   │
                  │ Collaboration │
                  └───────┬───────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                  User A      User B
```

---

## Offline Synchronization Flow

```text
User edits file
       │
       ▼
Check network status
       │
   ┌───┴────┐
   │        │
Online   Offline
   │        │
   ▼        ▼
Server   IndexedDB
Update   Operation Queue
   │        │
   └────┬───┘
        │
        ▼
Connection Restored
        │
        ▼
    Sync Engine
        │
        ▼
Send Pending Operations
        │
        ▼
   Server Updated
        │
        ▼
Remove Synced Operations
```

---

## Real-Time Collaboration Flow

```text
User A
   │
   │ File Change
   ▼
Socket.IO Server
   │
   │ Broadcast
   ▼
User B
   │
   ▼
Editor Updated
```

Multiple users connected to the same project receive file changes through the Socket.IO collaboration channel.

---

## Version History Flow

```text
File Update
     │
     ▼
Create File Version
     │
     ▼
Store Version in MongoDB
     │
     ▼
Version History Panel
     │
     ├── View Version
     ├── Restore Version
     └── Delete Version
```

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Monaco Editor
- Axios
- React Router
- Socket.IO Client
- IndexedDB

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

---

## Project Structure

```text
offline-code-editor/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── editor/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── collaboration/
│   │   ├── database/
│   │   └── sync/
│   │
│   └── package.json
│
├── server/
│   ├── collaboration/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Srujanadesireddy/offline-code-editor.git
```

### 2. Install Frontend Dependencies

```bash
cd offline-code-editor/client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd offline-code-editor/server
npm install
```

### 4. Start the Backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the Frontend

Inside the client directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Testing Offline Mode

To test the offline-first functionality:

1. Start the frontend and backend.
2. Open a project.
3. Open a file in the editor.
4. Disconnect the internet or stop the backend server.
5. Modify the file.
6. The changes are stored locally in IndexedDB.
7. Restore the network/server connection.
8. The synchronization engine detects pending operations.
9. The changes are synchronized with the backend.
10. Successfully synchronized operations are removed from the queue.

---

## Security

The application uses:

- JWT authentication
- Protected API routes
- Password reset functionality
- Authenticated project and file operations
- MongoDB for persistent server-side storage

---

## Academic Project

This project demonstrates the practical implementation of:

- Offline-first web applications
- Local data persistence
- Synchronization mechanisms
- REST APIs
- Real-time communication
- Collaborative editing
- Authentication
- Database management
- Version control concepts

---

## Current Implementation

The project currently provides:

- User authentication
- Project management
- File and folder management
- Monaco-based code editing
- Offline file editing
- IndexedDB local storage
- Automatic synchronization
- Real-time collaboration
- Project sharing
- Collaborator presence
- File version history
- Password reset

---

## Future Scope

Possible future improvements include:

- Advanced conflict resolution
- More sophisticated concurrent editing
- Additional programming language support
- Code execution and compilation
- Enhanced collaboration controls
- Advanced synchronization strategies
- Deployment to cloud infrastructure

---

## License

This project is developed for academic and educational purposes.