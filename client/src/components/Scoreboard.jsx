import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Crown,
    Medal,
    RefreshCw,
    Rocket,
    LogOut,
    Trophy
} from 'lucide-react';

function Scoreboard({ scores, winner, isGameOver, isHost, onNextRound, onLeave }) {
    const { t } = useLanguage();

    // İlk 3 ve diğerlerini ayır
    const topThree = scores.slice(0, 3);
    const others = scores.slice(3);

    return (
        <div className="scoreboard-container">
            <div className="scoreboard-premium">
                {isGameOver && (
                    <div className="celebration-header">
                        <div className="winner-crown">
                            <Trophy size={60} color="var(--accent-warning)" />
                        </div>
                        <h1>{t('gameOver')}</h1>
                        <p className="subtext">{t('winner')}</p>
                    </div>
                )}

                {/* PODIUM SECTION - Top 3 */}
                <div className="podium-wrapper">
                    {topThree.map((player, index) => {
                        const rank = index + 1;
                        return (
                            <div key={player.name} className={`podium-item rank-${rank} animated-entry`}>
                                <div className="podium-glass">
                                    <div className="medal-sphere">
                                        {rank === 1 && <Crown size={38} color="#FFD700" className="icon-glow" />}
                                        {rank === 2 && <Medal size={32} color="#E0E0E0" />}
                                        {rank === 3 && <Medal size={28} color="#CD7F32" />}
                                    </div>
                                    <div className="player-meta">
                                        <span className="player-name">{player.name}</span>
                                        <div className="score-badge">{player.score} {t('points')}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* OTHERS LIST - Scrollable if too many */}
                {others.length > 0 && (
                    <div className="leaderboard-others animated-entry" style={{ animationDelay: '0.4s' }}>
                        <div className="list-header">
                            <span>{t('rank')}</span>
                            <span>{t('player')}</span>
                            <span>{t('score')}</span>
                        </div>
                        <div className="scrollable-list">
                            {others.map((player, index) => (
                                <div key={player.name} className="list-row animated-row">
                                    <span className="rank-num">#{index + 4}</span>
                                    <span className="user-name">{player.name}</span>
                                    <span className="user-score">{player.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="scoreboard-actions-box animated-entry" style={{ animationDelay: '0.5s' }}>
                    {isGameOver ? (
                        <button className="premium-btn restart" onClick={() => window.location.reload()}>
                            <RefreshCw size={22} /> {t('playAgain')}
                        </button>
                    ) : (
                        isHost ? (
                            <div className="host-panel">
                                <p className="host-hint">{t('hostHint')}</p>
                                <div className="host-actions-row">
                                    <button className="action-btn-equal next-round" onClick={onNextRound}>
                                        <Rocket size={18} /> {t('nextRoundBtn')}
                                    </button>
                                    <button className="action-btn-equal leave-room" onClick={onLeave}>
                                        <LogOut size={18} /> {t('leaveRoom')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="waiting-animation">
                                <span>{t('waitingForHost')}</span>
                                <div className="dots">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Scoreboard;
