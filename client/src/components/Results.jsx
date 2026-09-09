import React, { useEffect, useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { useLanguage } from '../context/LanguageContext';
import {
    Target,
    Paintbrush,
    Star,
    CheckCircle2,
    Info,
    AlertCircle,
    LogOut,
    Sparkles,
    Quote
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
    const { t, language } = useLanguage();
    const canvasRef = useRef(null);
    const [hoverScore, setHoverScore] = useState(0);
    const [selectedScore, setSelectedScore] = useState(null);

    useEffect(() => {
        if (drawing && canvasRef.current) {
            const timer = setTimeout(() => {
                try {
                    canvasRef.current.loadSaveData(drawing, true);
                } catch (e) {
                    console.error('Result drawing load error:', e);
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [drawing]);

    const teamDisplay = team || { describerName: '???', painterName: '???' };

    const handleStarClick = (score) => {
        setSelectedScore(score);
        onVote(score);
    };

    return (
        <div className="results-wrapper">
            {/* Ambient Background Glows */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>

            <div className="results-container">
                {/* Header */}
                <header className="results-topbar glass-panel">
                    <div className="header-round-pill">
                        <Info size={14} className="text-cyan" />
                        <span>{t('round')} {round} / {totalRounds}</span>
                    </div>

                    <div className="header-title-badge">
                        <Sparkles size={16} className="text-gold" />
                        <h2>{t('results')}</h2>
                    </div>

                    <button className="header-leave-btn" onClick={onLeave}>
                        <LogOut size={14} />
                        <span>{t('leaveRoom')}</span>
                    </button>
                </header>

                {/* Showdown Comparison Grid */}
                <div className="results-showdown-grid">
                    {/* 1. Target Card */}
                    <div className="showdown-card target-side glass-panel">
                        <div className="card-badge target-badge">
                            <Target size={16} />
                            <span>{t('targetWord')}</span>
                        </div>

                        <div className="card-inner-content target-body">
                            <Quote size={32} className="quote-watermark" />
                            <p className="target-description-text">
                                "{image?.description || t('noDrawingData')}"
                            </p>
                        </div>

                        <div className="card-author-pill">
                            <span className="role-chip describer-chip">{t('describer')}</span>
                            <span className="author-name">{teamDisplay.describerName}</span>
                        </div>
                    </div>

                    {/* 2. Drawing Card */}
                    <div className="showdown-card drawing-side glass-panel">
                        <div className="card-badge drawing-badge">
                            <Paintbrush size={16} />
                            <span>{t('drawnResult')}</span>
                        </div>

                        <div className="card-inner-content canvas-frame">
                            {drawing ? (
                                <CanvasDraw
                                    ref={canvasRef}
                                    disabled={true}
                                    hideGrid={true}
                                    backgroundColor="#0c0e1e"
                                    canvasWidth={550}
                                    canvasHeight={340}
                                    immediateLoading={true}
                                    style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                                />
                            ) : (
                                <div className="no-drawing-state">
                                    <AlertCircle size={36} className="text-muted" />
                                    <p>{t('noDrawingData')}</p>
                                </div>
                            )}
                        </div>

                        <div className="card-author-pill">
                            <span className="role-chip painter-chip">{t('painter')}</span>
                            <span className="author-name">{teamDisplay.painterName}</span>
                        </div>
                    </div>
                </div>

                {/* Voting Action Section */}
                <div className="voting-action-box glass-panel">
                    {!hasVoted ? (
                        <div className="voting-interactive-area">
                            <h3 className="voting-headline">{t('rateDrawing')}</h3>
                            <p className="voting-subhead">
                                {language === 'tr' ? 'Çizim hedefe ne kadar benziyor? (1-5 Yıldız)' : 'How well does the drawing match the prompt?'}
                            </p>

                            <div className="star-rating-row">
                                {[1, 2, 3, 4, 5].map((score) => {
                                    const isHighlighted = (hoverScore || selectedScore || 0) >= score;
                                    return (
                                        <button
                                            key={score}
                                            type="button"
                                            className={`star-score-btn ${isHighlighted ? 'active-star' : ''}`}
                                            onClick={() => handleStarClick(score)}
                                            onMouseEnter={() => setHoverScore(score)}
                                            onMouseLeave={() => setHoverScore(0)}
                                            title={`${score} Star${score > 1 ? 's' : ''}`}
                                        >
                                            <Star
                                                size={36}
                                                fill={isHighlighted ? '#fbbf24' : 'transparent'}
                                                stroke={isHighlighted ? '#fbbf24' : 'rgba(255,255,255,0.25)'}
                                                className="star-icon"
                                            />
                                            <span className="score-num">{score}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="voted-success-state">
                            <div className="voted-pulse-icon">
                                <CheckCircle2 size={32} className="text-green" />
                            </div>
                            <div className="voted-text-group">
                                <h4>{t('voteSubmitted')}</h4>
                                <p>{t('waitingForVotes')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Results;
