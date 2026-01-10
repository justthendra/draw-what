# 🎨 Draw What?! - Discord Activity

Multiplayer drawing game for Discord Activities. Teams work together: one describes, one draws!

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install --prefix client
npm install --prefix server

# Run client (in one terminal)
npm run dev --prefix client

# Run server (in another terminal)
npm start --prefix server
```

### Production Deployment
See `implementation_plan.md` for detailed deployment instructions.

## 🎮 How to Play
1. Create or join a room
2. Teams are formed automatically
3. Describer sees the prompt and explains it
4. Painter draws based on the description
5. Everyone votes on how well they did
6. Highest score wins!

## 🛠️ Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.IO
- **Discord SDK**: @discord/embedded-app-sdk
