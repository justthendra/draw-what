import React from 'react';
import {
    Check,
    Clock,
    X,
    Rocket,
    LogOut,
    Users
} from 'lucide-react';

function Lobby({
    roomId,
    players,
    isHost,
    maxPlayers,
    onToggleReady,
    onStartGame,
    onLeave,
    myId
}) {
    const allReady = players.filter(p => p.id !== myId).every(p => p.isReady);
    const canStart = players.length >= 2 && allReady;

    return (
        <div className="lobby section-animate">
            <div className="lobby-header">
                <h1>🎨 Draw What?!</h1>
                <div className="room-code">
                    <span>Oda Kodu:</span>
                    <strong>{roomId}</strong>
                </div>
            </div>

            <div className="players-list">
                <h3><Users size={18} /> Oyuncular ({players.length}/{maxPlayers})</h3>
                <ul>
                    {players.map((player) => (
                        <li key={player.id} className={player.isReady ? 'ready' : ''}>
                            <span className="player-name">
                                {player.name}
                                {player.id === myId && ' (Sen)'}
                            </span>
                            <span className="player-status">
                                {player.isReady ? (
                                    <><Check size={16} color="#4ade80" /> Hazır</>
                                ) : (
                                    <><Clock size={16} color="#fbbf24" /> Bekliyor</>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="lobby-actions">
                {!isHost && (
                    <button
                        className="btn ready-btn"
                        onClick={onToggleReady}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                        {players.find(p => p.id === myId)?.isReady ? (
                            <><X size={18} /> Hazır Değilim</>
                        ) : (
                            <><Check size={18} /> Hazırım</>
                        )}
                    </button>
                )}

                {isHost && (
                    <button
                        className="btn start-btn"
                        onClick={onStartGame}
                        disabled={!canStart}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                        {canStart ? (
                            <><Rocket size={20} /> Oyunu Başlat</>
                        ) : (
                            <><Clock size={18} /> {players.length < 2 ? 'En az 2 oyuncu gerekli' : 'Oyuncular bekleniyor...'}</>
                        )}
                    </button>
                )}

                <button
                    className="btn leave-btn"
                    onClick={onLeave}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    <LogOut size={18} /> Ayrıl
                </button>
            </div>
        </div>
    );
}

export default Lobby;
