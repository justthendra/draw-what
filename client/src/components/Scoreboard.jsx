import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Crown,
    Medal,
    RefreshCw,
    Rocket,
    LogOut,
    Trophy,
    Sparkles,
    Clock
} from 'lucide-react';

function Scoreboard({ scores, winner, isGameOver, isHost, onNextRound, onLeave }) {
    const { t, language } = useLanguage();

    const safeScores = scores || [];
    // Sıralı ilk 3
    const topThree = safeScores.slice(0, 3);
    const others = safeScores.slice(3);

    // Podyum sıralaması (2. sol, 1. orta, 3. sağ)
    const podiumOrder = [];
    if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2, pos: 'second' });
    if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1, pos: 'first' });
    if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3, pos: 'third' });

    return (
        <div className="scoreboard-wrapper">
            {/* Ambient Glows */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            {/* Confetti Particles on Game Over */}
            {isGameOver && (
                <div className="confetti-container">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`confetti-piece piece-${(i % 5) + 1}`} style={{
                            left: `${(i * 3.3) % 100}%`,
                            animationDelay: `${(i * 0.15) % 2.5}s`,
                            animationDuration: `${2.5 + ((i % 3) * 0.5)}s`
                        }} />
                    ))}
                </div>
            )}

            <div className="scoreboard-card glass-panel">
                {/* Header */}
                <div className="scoreboard-header">
                    {isGameOver ? (
                        <div className="game-over-banner">
                            <div className="trophy-sparkle-wrap">
                                <Trophy size={48} className="trophy-gold pulse-anim" />
                                <Sparkles size={20} className="sparkle-float" />
                            </div>
                            <h1 className="game-over-title">{t('gameOver')}</h1>
                            <p className="winner-announce">
                                <span>{winner ? `${winner} ${language === 'tr' ? 'Kazandı!' : 'Wins!'}` : t('winner')}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="round-scores-banner">
                            <div className="scoreboard-badge">
                                <Trophy size={20} className="text-gold" />
                                <span>{t('finalScores')}</span>
                            </div>
                            <h2 className="round-scores-title">{t('results')}</h2>
                        </div>
                    )}
                </div>

                {/* 3D PODIUM SECTION */}
                {podiumOrder.length > 0 && (
                    <div className="podium-showcase">
                        {podiumOrder.map((player) => {
                            const rank = player.rank;
                            return (
                                <div key={player.name} className={`podium-column column-${player.pos} rank-${rank}`}>
                                    <div className="podium-avatar-card">
                                        <div className={`podium-icon-halo halo-${rank}`}>
                                            {rank === 1 && <Crown size={32} className="crown-icon-glow" />}
                                            {rank === 2 && <Medal size={26} className="medal-silver" />}
                                            {rank === 3 && <Medal size={24} className="medal-bronze" />}
                                        </div>
                                        <span className="podium-player-name">{player.name}</span>
                                        <div className="podium-score-pill">
                                            <span>{player.score} {t('points')}</span>
                                        </div>
                                    </div>

                                    {/* Pedestal Block */}
                                    <div className={`pedestal-block block-${rank}`}>
                                        <span className="pedestal-rank-num">#{rank}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* OTHERS LIST (Ranks 4+) */}
                {others.length > 0 && (
                    <div className="leaderboard-others-box">
                        <div className="others-table-header">
                            <span className="col-rank">{t('rank')}</span>
                            <span className="col-player">{t('player')}</span>
                            <span className="col-score">{t('score')}</span>
                        </div>
                        <div className="others-rows-scroll">
                            {others.map((player, index) => (
                                <div key={player.name} className="others-table-row">
                                    <span className="col-rank rank-tag">#{index + 4}</span>
                                    <span className="col-player user-name">{player.name}</span>
                                    <span className="col-score user-score-tag">{player.score} {t('points')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="scoreboard-footer-actions">
                    {isGameOver ? (
                        <div className="game-over-actions">
                            <button className="primary-action-btn restart-game-btn" onClick={() => window.location.reload()}>
                                <RefreshCw size={18} />
                                <span>{t('playAgain')}</span>
                            </button>
                            <button className="secondary-action-btn" onClick={onLeave}>
                                <LogOut size={16} />
                                <span>{t('leaveRoom')}</span>
                            </button>
                        </div>
                    ) : (
                        isHost ? (
                            <div className="host-control-panel">
                                <p className="host-guide-text">{t('hostHint')}</p>
                                <div className="host-btn-row">
                                    <button className="primary-action-btn next-round-btn pulse-glow" onClick={onNextRound}>
                                        <Rocket size={18} />
                                        <span>{t('nextRoundBtn')}</span>
                                    </button>
                                    <button className="secondary-action-btn" onClick={onLeave}>
                                        <LogOut size={16} />
                                        <span>{t('leaveRoom')}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="waiting-host-box">
                                <div className="waiting-pulse-dot"></div>
                                <span>{t('waitingForHost')}</span>
                                <div className="dot-flashing"></div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Scoreboard;
