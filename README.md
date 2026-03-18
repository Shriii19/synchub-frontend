# SyncHub Frontend

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**Modern Real-time Chat Application Frontend**

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 About The Project

SyncHub Frontend is a sleek, modern, and responsive chat application built with React and real-time communication capabilities. It provides an intuitive user interface for instant messaging with beautiful animations and a seamless user experience.

### ✨ Key Features

- 💬 **Real-time Messaging** - Instant message delivery with Socket.io
- 🎨 **Modern UI/UX** - Beautiful interface built with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based user authentication
- 👥 **Online Status** - See who's online in real-time
- ✍️ **Typing Indicators** - Know when someone is typing
- 💅 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development
- 🎭 **Smooth Animations** - Engaging user experience with animations
- 📱 **Mobile Friendly** - Optimized for mobile devices

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library for building user interfaces |
| **Vite** | Next-generation frontend tooling |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Socket.io Client** | Real-time bidirectional communication |
| **Axios** | HTTP client for API requests |
| **React Router DOM** | Client-side routing |
| **ESLint** | Code linting and quality |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend server running (see [backend repo](https://github.com/Shriii19/synchub-backend))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shriii19/synchub-frontend.git
   cd synchub-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update the backend URL in the Socket.io connection and axios requests if needed:
   - Default: `http://localhost:5000`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

The application will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── vite.svg              # Vite logo
├── src/
│   ├── assets/               # Static assets
│   │   └── react.svg
│   ├── pages/
│   │   ├── Login.jsx        # Login/Register page
│   │   └── Chat.jsx         # Main chat interface
│   ├── App.jsx              # Main app component with routing
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles with Tailwind
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── package.json             # Dependencies and scripts
└── .gitignore               # Git ignore rules
```

---

## 🎨 Features Overview

### 🔐 Authentication System
- User registration with email validation
- Secure login with JWT tokens
- Persistent sessions with localStorage
- Token-based API authentication

### 💬 Chat Interface
- Real-time message sending and receiving
- Message history loading
- Auto-scrolling to latest messages
- Typing indicators
- Online user count
- Message timestamps
- User identification

### 🎭 User Experience
- Smooth scrolling animations
- Loading states
- Error handling
- Responsive layout
- Clean and intuitive design
- Emoji and text support

---

## 🌐 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 🔧 Configuration

### Vite Configuration
The project uses Vite for fast development and optimized builds. Configuration can be modified in `vite.config.js`.

### Tailwind CSS
Tailwind is configured with the `@tailwindcss/vite` plugin for instant updates and modern CSS features.

### ESLint
Code quality is maintained with ESLint and React-specific rules.

---

## 🚀 Future Scope

### Phase 1: User Experience Enhancements
- 🎨 **Themes** - Dark/Light mode toggle
- 🎵 **Sound Effects** - Notification sounds for new messages
- 😊 **Emoji Picker** - Built-in emoji selector
- 📝 **Message Formatting** - Markdown support for rich text
- 🖼️ **User Avatars** - Profile picture uploads and display

### Phase 2: Advanced Chat Features
- 📎 **File Sharing** - Drag-and-drop file uploads with preview
- 🔍 **Message Search** - Search through chat history
- 📌 **Pin Messages** - Pin important messages at the top
- ✏️ **Edit Messages** - Edit sent messages
- 🗑️ **Delete Messages** - Delete own messages
- ↩️ **Reply to Messages** - Thread-like message replies
- 🎭 **Reactions** - React to messages with emojis

### Phase 3: Room & Organization
- 🚪 **Multiple Rooms** - Create and join different chat rooms
- 🔒 **Private Rooms** - Password-protected rooms
- 👥 **Direct Messages** - One-on-one conversations
- 📊 **Room Info** - View room members and settings
- 🎯 **Mentions** - @mention specific users

### Phase 4: Real-time Features
- 📹 **Video Calls** - WebRTC video/audio calling
- 🎤 **Voice Messages** - Record and send voice clips
- 📺 **Screen Sharing** - Share screen in calls
- 🔔 **Push Notifications** - Browser notifications for messages
- 📍 **Location Sharing** - Share location in chat

### Phase 5: Social & Community
- 👤 **User Profiles** - Detailed user profile pages
- 🌐 **Status Updates** - Custom status messages
- 🔔 **Notification Center** - Centralized notification panel
- 🏆 **User Badges** - Achievement badges
- 📈 **Activity Tracking** - User activity insights

### Phase 6: Performance & Advanced
- ♿ **Accessibility** - WCAG compliance for all users
- 🌍 **Internationalization** - Multi-language support
- 💾 **Offline Support** - PWA capabilities with service workers
- 🔄 **Message Sync** - Cross-device message synchronization
- 🎮 **Keyboard Shortcuts** - Power user keyboard navigation
- 📱 **Mobile App** - React Native mobile version

### Phase 7: Enterprise Features
- 👔 **Admin Dashboard** - Comprehensive admin controls
- 📊 **Analytics** - User engagement analytics
- 🔐 **SSO Integration** - Single sign-on support
- 📝 **Audit Logs** - Activity logging and monitoring
- 🔗 **API Documentation** - Interactive API explorer
- 🤖 **Chatbot Integration** - Automated chat assistance

---

## 🎯 Performance Optimizations

- ⚡ Lightning-fast build times with Vite
- 📦 Code splitting for optimal bundle size
- 🔄 Lazy loading of components
- 🗜️ Asset optimization and compression
- 🚀 React 19 performance improvements
- 💨 TailwindCSS JIT for minimal CSS

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Laptops (1024px and up)
- 🖥️ Desktops (1280px and up)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

Project Link: [https://github.com/Shriii19/synchub-frontend](https://github.com/Shriii19/synchub-frontend)

Backend Repository: [https://github.com/Shriii19/synchub-backend](https://github.com/Shriii19/synchub-backend)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

---

<div align="center">

Made with ❤️ by the SyncHub Team

**⭐ Star us on GitHub — it motivates us a lot!**

</div>
