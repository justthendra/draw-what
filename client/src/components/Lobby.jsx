import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Check,
    Clock,
    X,
    Rocket,
    LogOut,
    Users,
    Copy,
    CheckCheck,
    Crown,
    Sparkles,
    UserPlus
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
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState(false);

    const allReady = players.filter(p => p.id !== myId).every(p => p.isReady);
    const canStart = players.length >= 2 && allReady;

    const me = players.find(p => p.id === myId);
    const isMeReady = me?.isReady;

    const handleCopyCode = () => {
        if (!roomId) return;
        navigator.clipboard?.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Boş yuvaları hesapla
    const emptySlots = Math.max(0, (maxPlayers || 4) - players.length);

    return (
        <div className="lobby-wrapper">
            {/* Ambient Background Glows */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            <div className="lobby-card glass-panel">
                {/* Header with Room Info */}
                <div className="lobby-header">
                    <div className="lobby-title-area">
                        <div className="app-badge">
                            <span>🎨 {t('appTitle')}</span>
                        </div>
                        <h2 className="lobby-heading">{t('lobby')}</h2>
                    </div>

                    {/* Room Code Card with One-Click Copy */}
                    <div className="room-code-badge" onClick={handleCopyCode} title={t('copyCode')}>
                        <span className="code-label">{t('roomCode')}</span>
                        <span className="code-value">{roomId}</span>
                        <div className="copy-icon-wrap">
                            {copied ? <CheckCheck size={16} className="copied-icon" /> : <Copy size={16} />}
                        </div>
                        {copied && <div className="copy-toast">{t('copied')}</div>}
                    </div>
                </div>

                {/* Players Section */}
                <div className="lobby-players-section">
                    <div className="section-header">
                        <div className="header-left">
                            <Users size={18} className="text-cyan" />
                            <h3>{t('players')}</h3>
                        </div>
                        <span className="player-count-pill">
                            {players.length} / {maxPlayers}
                        </span>
                    </div>

                    <div className="players-grid">
                        {players.map((player) => {
                            const isMe = player.id === myId;
                            const isThisPlayerHost = player.isHost || (isHost && isMe);

                            return (
                                <div
                                    key={player.id}
                                    className={`lobby-player-card ${player.isReady ? 'is-ready' : 'is-waiting'} ${isMe ? 'is-me' : ''}`}
                                >
                                    <div className="player-avatar-wrap">
                                        <div className="avatar-ring">
                                            <span className="avatar-letter">
                                                {(player.name || '?')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        {isThisPlayerHost && (
                                            <div className="crown-badge" title="Host">
                                                <Crown size={14} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="player-details">
                                        <span className="player-name-text">
                                            {player.name}
                                            {isMe && <span className="me-tag">({language === 'tr' ? 'Sen' : 'You'})</span>}
                                        </span>
                                        <span className={`status-pill ${player.isReady ? 'ready' : 'waiting'}`}>
                                            {player.isReady ? (
                                                <>
                                                    <Check size={12} />
                                                    <span>{t('ready')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={12} />
                                                    <span>{t('waiting')}</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty Slots */}
                        {Array.from({ length: emptySlots }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="lobby-player-card empty-slot">
                                <div className="empty-avatar-wrap">
                                    <UserPlus size={18} />
                                </div>
                                <div className="player-details">
                                    <span className="empty-slot-text">
                                        {language === 'tr' ? 'Oyuncu Bekleniyor...' : 'Waiting for player...'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lobby Bottom Actions */}
                <div className="lobby-footer-actions">
                    <button className="leave-room-btn" onClick={onLeave}>
                        <LogOut size={16} />
                        <span>{t('leaveRoom')}</span>
                    </button>

                    <div className="main-action-wrap">
                        {!isHost && (
                            <button
                                className={`lobby-action-btn ${isMeReady ? 'cancel-ready-btn' : 'ready-btn'}`}
                                onClick={onToggleReady}
                            >
                                {isMeReady ? (
                                    <>
                                        <X size={18} />
                                        <span>{t('cancelReady')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        <span>{t('setReady')}</span>
                                    </>
                                )}
                            </button>
                        )}

                        {isHost && (
                            <button
                                className={`lobby-action-btn start-game-btn ${canStart ? 'can-start pulse-glow' : 'disabled'}`}
                                onClick={onStartGame}
                                disabled={!canStart}
                            >
                                {canStart ? (
                                    <>
                                        <Rocket size={18} />
                                        <span>{t('startGameBtn')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={18} />
                                        <span>{t('waitingForPlayers')}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Lobby;
