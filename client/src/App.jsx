import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import JoinScreen from "./components/JoinScreen";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import Results from "./components/Results";
import Scoreboard from "./components/Scoreboard";
import "./App.css";

// Socket bağlantısı
// Discord Activity: discordsays.com proxy üzerinden /api prefix'i ile
// Normal site: doğrudan Render URL'sine
const isDiscordActivity = window.location.host.includes('discordsays.com');
const SERVER_URL = isDiscordActivity ? "" : (import.meta.env.VITE_SERVER_URL || "");
const SOCKET_PATH = isDiscordActivity ? "/api/socket.io" : "/socket.io";

const socket = io(SERVER_URL, {
  path: SOCKET_PATH,
  transports: ["polling", "websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
  autoConnect: false,
  withCredentials: false
});

function App() {
  // Bağlantı durumu
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Oyun durumu
  const [gamePhase, setGamePhase] = useState("join"); // join | lobby | playing | voting | results | ended
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Tur durumu
  const [role, setRole] = useState(null); // describer | painter | spectator
  const [currentImage, setCurrentImage] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [teamInfo, setTeamInfo] = useState("");
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [duration, setDuration] = useState(90);
  const [drawingData, setDrawingData] = useState(null);

  // Sonuç durumu
  const [resultImage, setResultImage] = useState(null);
  const [resultDrawing, setResultDrawing] = useState(null);
  const [resultTeam, setResultTeam] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLastRound, setIsLastRound] = useState(false);
  const [scores, setScores] = useState([]);
  const [winner, setWinner] = useState(null);

  // Sohbet durumu
  const [chatMessages, setChatMessages] = useState([]);

  // Stale closure koruması için Ref'ler
  const totalRoundsRef = useRef(0);
  useEffect(() => { totalRoundsRef.current = totalRounds; }, [totalRounds]);

  // Socket bağlantısını başlat
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Bağlandı:", socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Bağlantı hatası:", err);
      setIsConnected(false);
      setConnectionError(err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Bağlantı koptu:", reason);
      setIsConnected(false);
    });

    // Oyuncu olayları
    socket.on("player_joined", ({ players }) => {
      setPlayers(players);
    });

    socket.on("player_ready_changed", ({ players }) => {
      setPlayers(players);
    });

    socket.on("player_disconnected", ({ playerName, players }) => {
      console.log(`${playerName} ayrıldı`);
      if (players) setPlayers(players);
    });

    socket.on("room_closed", ({ reason }) => {
      alert(`Oda kapatıldı: ${reason}`);
      setGamePhase("join");
    });

    // Sohbet olayları
    socket.on("chat_message", (msg) => {
      setChatMessages(prev => [...prev, msg].slice(-50)); // Son 50 mesajı tut
    });

    // Oyun olayları
    socket.on("game_started", ({ teams, totalRounds }) => {
      console.log("🎮 Oyun başladı!", teams);
      setTotalRounds(totalRounds);
    });

    socket.on("round_start", (data) => {
      console.log("⏱️ Tur başladı:", data);
      setGamePhase("playing");
      setRole(data.role);
      setRound(data.round);
      setTotalRounds(data.totalRounds);
      setDuration(data.duration);
      setDrawingData(null);

      if (data.role === "describer") {
        setCurrentImage(data.image);
        setPartnerName(data.partnerName);
      } else if (data.role === "painter") {
        setPartnerName(data.partnerName);
      } else {
        setTeamInfo(data.teamInfo);
      }
    });

    socket.on("drawing_updated", ({ drawingData }) => {
      setDrawingData(drawingData);
    });

    socket.on("canvas_cleared", () => {
      setDrawingData(null);
    });

    socket.on("round_ended", (data) => {
      console.log("⏹️ Tur bitti:", data);
      setResultImage(data.image);
      setResultDrawing(data.drawing);
      setResultTeam(data.team);
      setHasVoted(false);
      // Ref üzerinden güncel totalRounds değerini al
      setIsLastRound(data.round >= totalRoundsRef.current);

      // Verilerin state'e oturması için küçük bir gecikme
      setTimeout(() => {
        setGamePhase("voting");
      }, 100);
    });

    socket.on("results_shown", (data) => {
      console.log("📊 Sonuçlar:", data);
      setGamePhase("results");
      setScores(data.scores);
      setIsLastRound(data.isLastRound);
    });

    socket.on("game_ended", (data) => {
      console.log("🏆 Oyun bitti:", data);
      setGamePhase("ended");
      setWinner(data.winner);
      setScores(data.scores);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("player_joined");
      socket.off("player_ready_changed");
      socket.off("player_disconnected");
      socket.off("room_closed");
      socket.off("chat_message");
      socket.off("game_started");
      socket.off("round_start");
      socket.off("drawing_updated");
      socket.off("canvas_cleared");
      socket.off("round_ended");
      socket.off("results_shown");
      socket.off("game_ended");
    };
  }, []);

  // Oda oluştur
  const handleCreateRoom = useCallback((roomId, name, maxPlayers) => {
    socket.emit("create_room", { roomId, name, maxPlayers }, (response) => {
      if (response.success) {
        setRoomId(roomId);
        setPlayers(response.room.players);
        setMaxPlayers(response.room.maxPlayers);
        setIsHost(true);
        setGamePhase("lobby");
      } else {
        alert(response.error);
      }
    });
  }, []);

  // Odaya katıl
  const handleJoinRoom = useCallback((roomId, name) => {
    socket.emit("join_room", { roomId, name }, (response) => {
      if (response.success) {
        setRoomId(roomId);
        setPlayers(response.room.players);
        setMaxPlayers(response.room.maxPlayers);
        setIsHost(response.room.hostId === socket.id);
        setGamePhase("lobby");
      } else {
        alert(response.error);
      }
    });
  }, []);

  // Hazır ol
  const handleToggleReady = useCallback(() => {
    socket.emit("toggle_ready");
  }, []);

  // Oyunu başlat
  const handleStartGame = useCallback(() => {
    socket.emit("start_game", (response) => {
      if (!response.success) {
        alert(response.error);
      }
    });
  }, []);

  // Çizim gönder
  const handleDrawUpdate = useCallback((data) => {
    socket.emit("draw_update", { drawingData: data });
  }, []);

  // Tuvali temizle
  const handleClearCanvas = useCallback(() => {
    socket.emit("clear_canvas");
  }, []);

  // Oy ver
  const handleVote = useCallback((score) => {
    socket.emit("submit_vote", { score });
    setHasVoted(true);
  }, []);

  // Sonraki tur
  const handleNextRound = useCallback(() => {
    if (!socket.connected) return alert("Bağlantı koptu, lütfen sayfayı yenileyin.");
    socket.emit("next_round");
  }, []);

  // Odadan ayrıl
  const handleLeaveRoom = useCallback(() => {
    socket.emit("leave_room");
    setRoomId(null);
    setPlayers([]);
    setGamePhase("join");
    setIsHost(false);
  }, []);

  // Mesaj gönder
  const handleSendMessage = useCallback((message, type) => {
    socket.emit("send_message", { message, type });
  }, []);

  // Render güvenliği için hata kontrolü
  const renderGame = () => {
    try {
      if (gamePhase === "join") {
        return (
          <JoinScreen
            isConnected={isConnected}
            error={connectionError}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      }

      if (gamePhase === "lobby") {
        return (
          <Lobby
            roomId={roomId}
            players={players}
            isHost={isHost}
            maxPlayers={maxPlayers}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeave={handleLeaveRoom}
            myId={socket.id}
          />
        );
      }

      if (gamePhase === "playing") {
        return (
          <GameBoard
            role={role}
            image={currentImage}
            partnerName={partnerName}
            teamInfo={teamInfo}
            round={round}
            totalRounds={totalRounds}
            duration={duration}
            drawingData={drawingData}
            players={players}
            messages={chatMessages}
            onDrawUpdate={handleDrawUpdate}
            onClearCanvas={handleClearCanvas}
            onSendMessage={handleSendMessage}
            onLeave={handleLeaveRoom}
            myId={socket.id}
          />
        );
      }

      if (gamePhase === "voting") {
        return (
          <Results
            image={resultImage}
            drawing={resultDrawing}
            team={resultTeam}
            round={round}
            totalRounds={totalRounds}
            isLastRound={isLastRound}
            isHost={isHost}
            onVote={handleVote}
            onNextRound={handleNextRound}
            onLeave={handleLeaveRoom}
            hasVoted={hasVoted}
          />
        );
      }

      if (gamePhase === "results" || gamePhase === "ended") {
        return (
          <Scoreboard
            scores={scores}
            winner={winner}
            isGameOver={gamePhase === "ended"}
            isHost={isHost}
            onNextRound={handleNextRound}
            onLeave={handleLeaveRoom}
          />
        );
      }

      return <div className="loading">Yükleniyor...</div>;
    } catch (err) {
      console.error("Render hatası:", err);
      return (
        <div className="error-screen">
          <h2>⚠️ Bir hata oluştu</h2>
          <p>Oyun verileri yüklenirken bir sorun yaşandı.</p>
          <button onClick={() => window.location.reload()}>Oyunu Yenile</button>
        </div>
      );
    }
  };

  return (
    <div className="app">
      {/* Bağlantı durumu */}
      <div className={`connection-bar ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Bağlı' : `🔴 ${connectionError || 'Bağlanıyor...'}`}
      </div>

      {/* Ana içerik */}
      <div className="main-content">
        {renderGame()}
      </div>
    </div>
  );
}

export default App;