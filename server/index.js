// server/index.js - Draw What?! Game Server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Allowed origins for CORS
const allowedOrigins = [
  "https://draw-what-client.vercel.app",
  "https://*.vercel.app",
  "https://*.discordsays.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for debugging
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("<h1>Draw What?! Server Çalışıyor! 🎨</h1>");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  allowUpgrades: true
});

// ============================================================
// RESİM HAVUZU (Basit çizimler/açıklamalar)
// ============================================================
const IMAGE_POOL = [
  { id: 1, description: "Güneş gözlüğü takan bir kedi", difficulty: "easy" },
  { id: 2, description: "Şapka takmış bir zürafa", difficulty: "easy" },
  { id: 3, description: "Bisiklet süren bir balık", difficulty: "medium" },
  { id: 4, description: "Yangın söndüren bir fil", difficulty: "medium" },
  { id: 5, description: "Pizza yiyen bir astronot", difficulty: "easy" },
  { id: 6, description: "Kaykay yapan bir penguen", difficulty: "easy" },
  { id: 7, description: "Kitap okuyan bir köpek", difficulty: "easy" },
  { id: 8, description: "Yağmurda dans eden bir tavuk", difficulty: "medium" },
  { id: 9, description: "Uçan bir kaplumbağa", difficulty: "easy" },
  { id: 10, description: "Boks yapan bir kanguru", difficulty: "medium" },
  { id: 11, description: "Piyano çalan bir ahtapot", difficulty: "hard" },
  { id: 12, description: "Sörf yapan bir maymun", difficulty: "medium" },
  { id: 13, description: "Yoga yapan bir ayı", difficulty: "medium" },
  { id: 14, description: "Selfie çeken bir papağan", difficulty: "hard" },
  { id: 15, description: "Uyuyan bir ejderha", difficulty: "medium" },
  { id: 16, description: "Kahve içen bir baykuş", difficulty: "easy" },
  { id: 17, description: "Basketbol oynayan bir zürafa", difficulty: "medium" },
  { id: 18, description: "Şemsiye tutan bir kurbağa", difficulty: "easy" },
  { id: 19, description: "Karate yapan bir panda", difficulty: "medium" },
  { id: 20, description: "Roket kullanan bir salyangoz", difficulty: "hard" }
];

// ============================================================
// ODA VERİ YAPISI
// ============================================================
const rooms = new Map();

function createRoom(roomId, hostId, hostName, maxPlayers = 4) {
  return {
    id: roomId,
    hostId: hostId,
    maxPlayers: Math.min(maxPlayers, 6), // Max 6 oyuncu
    players: [],
    phase: "lobby", // lobby | playing | voting | results
    currentRound: 0,
    totalRounds: 0, // Oyuncu sayısına göre belirlenir
    teams: [],
    currentTeamIndex: 0,
    currentImage: null,
    roundStartTime: null,
    roundDuration: 90, // saniye
    timer: null,
    drawings: new Map(),
    votes: new Map(),
    scores: new Map(),
    usedImages: []
  };
}

function addPlayerToRoom(room, playerId, playerName) {
  if (room.players.length >= room.maxPlayers) return false;
  if (room.players.find(p => p.id === playerId)) return false;

  room.players.push({
    id: playerId,
    name: playerName,
    isReady: false,
    isConnected: true
  });
  room.scores.set(playerId, 0);
  return true;
}

function removePlayerFromRoom(room, playerId) {
  const index = room.players.findIndex(p => p.id === playerId);
  if (index !== -1) {
    room.players.splice(index, 1);
    room.scores.delete(playerId);

    // Eğer lobi veya oyun devam ederken oyuncu sayısı 2'nin altına düşerse oda kapanmalı
    if (room.players.length < 2 && room.phase !== "results" && room.phase !== "ended") {
      return { success: true, shouldClose: true };
    }
    return { success: true, shouldClose: false };
  }
  return { success: false };
}

function createTeams(room) {
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  room.teams = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      room.teams.push({
        describer: shuffled[i].id,
        painter: shuffled[i + 1].id,
        describerName: shuffled[i].name,
        painterName: shuffled[i + 1].name
      });
    }
  }

  room.totalRounds = room.teams.length * 2;
  return room.teams;
}

function getRandomImage(room) {
  const available = IMAGE_POOL.filter(img => !room.usedImages.includes(img.id));
  if (available.length === 0) {
    room.usedImages = [];
    return IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)];
  }
  const image = available[Math.floor(Math.random() * available.length)];
  room.usedImages.push(image.id);
  return image;
}

// ============================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================
io.on("connection", (socket) => {
  console.log(`🔌 Bağlantı: ${socket.id}`);

  let currentRoom = null;
  let playerName = null;

  socket.on("create_room", (data, callback) => {
    const { roomId, name, maxPlayers } = data;
    if (rooms.has(roomId)) return callback({ success: false, error: "Bu oda zaten mevcut" });

    const room = createRoom(roomId, socket.id, name, maxPlayers);
    addPlayerToRoom(room, socket.id, name);
    rooms.set(roomId, room);

    socket.join(roomId);
    currentRoom = roomId;
    playerName = name;

    console.log(`🏠 Oda oluşturuldu: ${roomId} (Host: ${name})`);
    callback({ success: true, room: getRoomState(room) });
  });

  socket.on("join_room", (data, callback) => {
    const { roomId, name } = data;
    const room = rooms.get(roomId);

    if (!room) return callback({ success: false, error: "Oda bulunamadı" });
    if (room.phase !== "lobby") return callback({ success: false, error: "Oyun devam ediyor" });

    if (!addPlayerToRoom(room, socket.id, name)) {
      return callback({ success: false, error: "Oda dolu veya zaten odadasınız" });
    }

    socket.join(roomId);
    currentRoom = roomId;
    playerName = name;

    io.to(roomId).emit("player_joined", {
      player: { id: socket.id, name, isReady: false },
      players: room.players
    });

    callback({ success: true, room: getRoomState(room) });
  });

  socket.on("toggle_ready", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== "lobby") return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(currentRoom).emit("player_ready_changed", {
        playerId: socket.id,
        isReady: player.isReady,
        players: room.players
      });
    }
  });

  socket.on("start_game", (callback) => {
    if (!currentRoom) return callback({ success: false, error: "Odada değilsiniz" });
    const room = rooms.get(currentRoom);

    if (!room) return callback({ success: false, error: "Oda bulunamadı" });
    if (room.hostId !== socket.id) return callback({ success: false, error: "Sadece oda sahibi başlatabilir" });
    if (room.players.length < 2) return callback({ success: false, error: "En az 2 oyuncu gerekli" });

    const allReady = room.players.every(p => p.isReady || p.id === room.hostId);
    if (!allReady) return callback({ success: false, error: "Tüm oyuncular hazır değil" });

    createTeams(room);
    room.phase = "playing";
    room.currentRound = 1;
    room.currentTeamIndex = 0;
    room.currentImage = getRandomImage(room);

    io.to(currentRoom).emit("game_started", {
      teams: room.teams.map(t => ({ describerName: t.describerName, painterName: t.painterName })),
      totalRounds: room.totalRounds
    });

    startRound(room);
    callback({ success: true });
  });

  socket.on("draw_update", (data) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== "playing") return;

    const currentTeam = room.teams[room.currentTeamIndex];
    if (!currentTeam || currentTeam.painter !== socket.id) return;

    room.drawings.set(room.currentRound, data.drawingData);
    socket.to(currentRoom).emit("drawing_updated", { drawingData: data.drawingData, round: room.currentRound });
  });

  socket.on("clear_canvas", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== "playing") return;

    const currentTeam = room.teams[room.currentTeamIndex];
    if (!currentTeam || currentTeam.painter !== socket.id) return;

    io.to(currentRoom).emit("canvas_cleared");
  });

  socket.on("submit_vote", (data) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.phase !== "voting") return;

    room.votes.set(socket.id, Number(data.score) || 0);
    if (room.votes.size >= room.players.length) {
      calculateScores(room);
      showResults(room);
    }
  });

  socket.on("next_round", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    // Daha esnek host kontrolü: Eğer host koptuysa listedeki ilk kişiye yetki ver
    const actualHostId = room.players.length > 0 ? room.players[0].id : room.hostId;
    if (socket.id !== room.hostId && socket.id !== actualHostId) {
      return console.log(`🚫 Yetkisiz next_round denemesi: ${playerName}`);
    }

    if (room.currentRound >= room.totalRounds) {
      console.log(`🏁 Oyun bitti, final ekranına geçiliyor: ${currentRoom}`);
      endGame(room);
    } else {
      console.log(`➡️ Sonraki tura geçiliyor: ${room.currentRound + 1}/${room.totalRounds}`);
      room.currentTeamIndex = (room.currentTeamIndex + 1) % room.teams.length;

      // Her tur döngüsünden sonra rolleri takas et (isteğe bağlı, oyun tipine göre)
      if (room.currentRound % room.teams.length === 0) {
        room.teams.forEach(team => {
          const tempId = team.describer;
          team.describer = team.painter;
          team.painter = tempId;
          const tempName = team.describerName;
          team.describerName = team.painterName;
          team.painterName = tempName;
        });
      }

      room.currentRound++;
      room.currentImage = getRandomImage(room);
      room.votes.clear();
      startRound(room);
    }
  });

  socket.on("send_message", (data) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    const msgData = {
      senderId: socket.id,
      senderName: playerName,
      message: data.message,
      type: data.type,
      timestamp: Date.now()
    };

    if (data.type === "team") {
      const currentTeam = room.teams.find(t => t.describer === socket.id || t.painter === socket.id);
      if (currentTeam) {
        io.to(currentTeam.describer).emit("chat_message", msgData);
        io.to(currentTeam.painter).emit("chat_message", msgData);
      }
    } else {
      io.to(currentRoom).emit("chat_message", msgData);
    }
  });

  socket.on("leave_room", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    const leavingRoomId = currentRoom;

    if (room) {
      const isHost = room.hostId === socket.id;

      // Eğer oda sahibi ayrıldıysa odayı kapat ve DİĞER oyunculara bildir
      if (isHost) {
        console.log(`🚪 Oda sahibi ayrıldı, oda kapatılıyor: ${leavingRoomId}`);
        if (room.timer) clearTimeout(room.timer);
        rooms.delete(leavingRoomId);
        socket.to(leavingRoomId).emit("room_closed", {
          reason: "Oda sahibi odadan ayrıldı, oda kapatıldı."
        });
      } else {
        const result = removePlayerFromRoom(room, socket.id);
        if (result.success) {
          if (result.shouldClose) {
            if (room.timer) clearTimeout(room.timer);
            rooms.delete(leavingRoomId);
            socket.to(leavingRoomId).emit("room_closed", {
              reason: "Oyuncu sayısı yetersiz (Minimum 2 oyuncu gerekli)."
            });
          } else {
            socket.to(leavingRoomId).emit("player_disconnected", {
              playerId: socket.id,
              playerName: playerName,
              players: room.players
            });
          }
        }
      }
    }
    socket.leave(leavingRoomId);
    currentRoom = null;
  });

  socket.on("disconnect", () => {
    console.log(`❌ Bağlantı koptu: ${socket.id} (${playerName || 'Bilinmeyen'})`);
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      const leavingRoomId = currentRoom;

      if (room) {
        const isHost = room.hostId === socket.id;

        // Eğer oda sahibi koptuysa odayı kapat ve DİĞER oyunculara bildir
        if (isHost) {
          console.log(`🚪 Oda sahibinin bağlantısı koptu, oda kapatılıyor: ${leavingRoomId}`);
          if (room.timer) clearTimeout(room.timer);
          rooms.delete(leavingRoomId);
          socket.to(leavingRoomId).emit("room_closed", {
            reason: "Oda sahibinin bağlantısı koptu, oda kapatıldı."
          });
        } else {
          const result = removePlayerFromRoom(room, socket.id);
          if (result.success) {
            if (result.shouldClose) {
              if (room.timer) clearTimeout(room.timer);
              rooms.delete(leavingRoomId);
              socket.to(leavingRoomId).emit("room_closed", {
                reason: "Oyuncu sayısı yetersiz (Min 2 oyuncu gerekli)."
              });
            } else {
              socket.to(leavingRoomId).emit("player_disconnected", {
                playerId: socket.id,
                playerName: playerName,
                players: room.players
              });
            }
          }
        }
      }
    }
  });
});

function getRoomState(room) {
  return { id: room.id, hostId: room.hostId, maxPlayers: room.maxPlayers, players: room.players, phase: room.phase, currentRound: room.currentRound, totalRounds: room.totalRounds };
}

function startRound(room) {
  const currentTeam = room.teams[room.currentTeamIndex];
  room.phase = "playing";
  room.roundStartTime = Date.now();

  io.to(currentTeam.describer).emit("round_start", { role: "describer", image: room.currentImage, round: room.currentRound, totalRounds: room.totalRounds, duration: room.roundDuration, partnerName: currentTeam.painterName });
  io.to(currentTeam.painter).emit("round_start", { role: "painter", round: room.currentRound, totalRounds: room.totalRounds, duration: room.roundDuration, partnerName: currentTeam.describerName });

  room.players.forEach(p => {
    if (p.id !== currentTeam.describer && p.id !== currentTeam.painter) {
      io.to(p.id).emit("round_start", { role: "spectator", round: room.currentRound, totalRounds: room.totalRounds, duration: room.roundDuration, teamInfo: `${currentTeam.describerName} → ${currentTeam.painterName}` });
    }
  });

  if (room.timer) clearTimeout(room.timer);
  room.timer = setTimeout(() => endRound(room), room.roundDuration * 1000);
}

function endRound(room) {
  if (room.timer) clearTimeout(room.timer);
  room.phase = "voting";
  const currentTeam = room.teams[room.currentTeamIndex];
  io.to(room.id).emit("round_ended", { image: room.currentImage, drawing: room.drawings.get(room.currentRound) || null, team: { describerName: currentTeam.describerName, painterName: currentTeam.painterName }, round: room.currentRound });
}

function calculateScores(room) {
  const currentTeam = room.teams[room.currentTeamIndex];
  let totalScore = 0;
  room.votes.forEach((score) => totalScore += score);
  const avgScore = Math.round(totalScore / room.votes.size);
  room.scores.set(currentTeam.describer, (room.scores.get(currentTeam.describer) || 0) + avgScore);
  room.scores.set(currentTeam.painter, (room.scores.get(currentTeam.painter) || 0) + avgScore);
}

function showResults(room) {
  room.phase = "results";
  const scoresArray = [];
  room.scores.forEach((score, playerId) => {
    const player = room.players.find(p => p.id === playerId);
    if (player) scoresArray.push({ name: player.name, score });
  });
  scoresArray.sort((a, b) => b.score - a.score);
  io.to(room.id).emit("results_shown", { scores: scoresArray, round: room.currentRound, totalRounds: room.totalRounds, isLastRound: room.currentRound >= room.totalRounds });
}

function endGame(room) {
  room.phase = "ended";
  const scoresArray = [];
  room.scores.forEach((score, playerId) => {
    const player = room.players.find(p => p.id === playerId);
    if (player) scoresArray.push({ name: player.name, score });
  });
  scoresArray.sort((a, b) => b.score - a.score);
  io.to(room.id).emit("game_ended", { winner: scoresArray[0], scores: scoresArray });
  setTimeout(() => rooms.delete(room.id), 5 * 60 * 1000);
}

server.listen(3001, "0.0.0.0", () => {
  console.log("🎨 Draw What?! Server 3001 portunda hazır!");
});