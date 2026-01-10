import React, { useEffect, useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { useLanguage } from '../context/LanguageContext';
import {
    Trophy,
    ArrowRight,
    LogOut,
    Target,
    Paintbrush,
    Star,
    CheckCircle,
    Info,
    AlertCircle
} from 'lucide-react';

function Results({
    image,
    drawing,
    team,
    round,
    totalRounds,
    isLastRound,
    isHost,
    onVote,
    onNextRound,
    onLeave,
    hasVoted
}) {
    const { t } = useLanguage();
    const canvasRef = useRef(null);
    const [hoverScore, setHoverScore] = useState(0);

    useEffect(() => {
        if (drawing && canvasRef.current) {
            const timer = setTimeout(() => {
                try {
                    canvasRef.current.loadSaveData(drawing, true);
                } catch (e) {
                    console.error('Result drawing load error:', e);
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [drawing]);

    const teamDisplay = team || { describerName: '???', painterName: '???' };

    return (
        <div className="results-container section-animate">
            <header className="results-header">
                <div className="header-round">
                    <Info size={14} /> {t('round')} {round}/{totalRounds}
                </div>
                <div className="header-title">{t('results')}</div>
                <div className="header-actions">
                    <button className="btn leave-btn mini" onClick={onLeave}>
                        <LogOut size={16} /> {t('leaveRoom')}
                    </button>
                </div>
            </header>

            <div className="results-grid">
                <div className="result-card target-card">
                    <div className="card-header">
                        <Target size={16} className="header-icon" />
                        <span>{t('targetWord')}</span>
                    </div>
                    <div className="card-body">
                        <div className="image-placeholder">
                            <p className="description-text">"{image?.description || t('noDrawingData')}"</p>
                        </div>
                        <div className="team-badge">
                            <strong>{teamDisplay.describerName}</strong> ({t('describer')})
                        </div>
                    </div>
                </div>

                <div className="result-card drawing-card">
                    <div className="card-header">
                        <Paintbrush size={16} className="header-icon" />
                        <span>{t('drawnResult')}</span>
                    </div>
                    <div className="card-body canvas-body relative-canvas" style={{ minHeight: '320px' }}>
                        {drawing ? (
                            <CanvasDraw
                                ref={canvasRef}
                                disabled={true}
                                hideGrid={true}
                                backgroundColor="#222"
                                canvasWidth={550}
                                canvasHeight={380}
                                immediateLoading={true}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div className="no-drawing">
                                <AlertCircle size={40} color="rgba(255,255,255,0.2)" />
                                <p>{t('noDrawingData')}</p>
                            </div>
                        )}
                        <div className="team-badge">
                            <strong>{teamDisplay.painterName}</strong> ({t('painter')})
                        </div>
                    </div>
                </div>
            </div>

            <div className="voting-container">
                {!hasVoted ? (
                    <div className="voting-section fade-in">
                        <h3>{t('rateDrawing')}</h3>
                        <div className="vote-options">
                            {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                    key={score}
                                    className={`vote-star-btn ${hoverScore >= score ? 'hovered' : ''}`}
                                    onClick={() => onVote(score)}
                                    onMouseEnter={() => setHoverScore(score)}
                                    onMouseLeave={() => setHoverScore(0)}
                                >
                                    <Star
                                        size={32}
                                        fill={hoverScore >= score ? "var(--accent-warning)" : "transparent"}
                                        color={hoverScore >= score ? "var(--accent-warning)" : "rgba(255,255,255,0.2)"}
                                    />
                                    <span className="score-label">{score}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="status-area">
                        <div className="voted-badge">
                            <CheckCircle size={20} /> {t('voteSubmitted')} {t('waitingForVotes')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Results;
