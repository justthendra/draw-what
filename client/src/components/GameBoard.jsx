import React, { useRef, useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { useLanguage } from '../context/LanguageContext';
import {
    Users,
    LogOut,
    Clock,
    Mic,
    Paintbrush,
    Eye,
    Square,
    Circle,
    Triangle,
    Star,
    Undo,
    Trash2,
    Globe,
    Users2,
    Send,
    MessageSquare,
    Rocket
} from 'lucide-react';

function GameBoard({
    role, // 'describer' | 'painter' | 'spectator'
    image,
    partnerName,
    teamInfo,
    round,
    totalRounds,
    duration,
    drawingData,
    players,
    messages,
    onDrawUpdate,
    onClearCanvas,
    onSendMessage,
    onLeave,
    myId
}) {
    const { t } = useLanguage();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [brushColor, setBrushColor] = useState('#FFFFFF');
    const [brushRadius, setBrushRadius] = useState(4);
    const [chatTab, setChatTab] = useState('global'); // 'global' | 'team'
    const [msgInput, setMsgInput] = useState('');

    // Timer
    useEffect(() => {
        setTimeLeft(duration);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [duration, round]);

    // Load incoming drawing
    useEffect(() => {
        if (role !== 'painter' && canvasRef.current && drawingData) {
            try {
                canvasRef.current.loadSaveData(drawingData, true);
            } catch (e) {
                console.error('Drawing load error:', e);
            }
        }
    }, [drawingData, role]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, chatTab]);

    const handleDraw = () => {
        if (role === 'painter' && canvasRef.current) {
            const data = canvasRef.current.getSaveData();
            onDrawUpdate(data);
        }
    };

    const handleClear = () => {
        if (canvasRef.current) {
            canvasRef.current.clear();
            onClearCanvas();
        }
    };

    const handleUndo = () => {
        if (role === 'painter' && canvasRef.current) {
            canvasRef.current.undo();
            onDrawUpdate(canvasRef.current.getSaveData());
        }
    };

    const addShape = (shapeType) => {
        if (role !== 'painter' || !canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const currentDataStr = canvas.getSaveData();
            const currentData = JSON.parse(currentDataStr);

            const newLine = {
                brushColor,
                brushRadius: Math.max(2, brushRadius / 2),
                points: []
            };

            const centerX = 275;
            const centerY = 190;
            const size = 60;

            if (shapeType === 'square') {
                newLine.points = [
                    { x: centerX - size, y: centerY - size },
                    { x: centerX + size, y: centerY - size },
                    { x: centerX + size, y: centerY + size },
                    { x: centerX - size, y: centerY + size },
                    { x: centerX - size, y: centerY - size }
                ];
            } else if (shapeType === 'circle') {
                for (let i = 0; i <= 24; i++) {
                    const angle = (i / 24) * Math.PI * 2;
                    newLine.points.push({
                        x: centerX + Math.cos(angle) * (size * 1.2),
                        y: centerY + Math.sin(angle) * (size * 1.2)
                    });
                }
            } else if (shapeType === 'triangle') {
                newLine.points = [
                    { x: centerX, y: centerY - size },
                    { x: centerX + size, y: centerY + size },
                    { x: centerX - size, y: centerY + size },
                    { x: centerX, y: centerY - size }
                ];
            } else if (shapeType === 'star') {
                for (let i = 0; i < 10; i++) {
                    const angle = (i * Math.PI) / 5;
                    const r = (i % 2 === 0) ? size * 1.5 : size * 0.7;
                    newLine.points.push({
                        x: centerX + r * Math.sin(angle),
                        y: centerY - r * Math.cos(angle)
                    });
                }
            }

            if (newLine.points.length > 0) {
                currentData.lines.push(newLine);
                canvas.loadSaveData(JSON.stringify(currentData), false);
                onDrawUpdate(JSON.stringify(currentData));
            }
        } catch (err) {
            console.error("Shape add error:", err);
        }
    };

    const sendChat = (e) => {
        e.preventDefault();
        if (!msgInput.trim()) return;
        onSendMessage(msgInput.trim(), chatTab);
        setMsgInput('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const colors = ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA500'];

    // Filtered messages
    const filteredMessages = messages.filter(m => m.type === chatTab);

    return (
        <div className="game-board full-layout">
            {/* LEFT SIDE: PLAYERS */}
            <aside className="game-sidebar players-sidebar">
                <div className="sidebar-header">
                    <h3><Users size={16} /> {t('players')}</h3>
                </div>
                <div className="sidebar-content">
                    {(players || []).map(p => (
                        <div key={p.id} className={`player-item ${p.id === myId ? 'me' : ''}`}>
                            <span className="player-avatar">{(p.name || '?')[0].toUpperCase()}</span>
                            <span className="player-name">{p.name || '???'}</span>
                        </div>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <button className="btn leave-btn mini" onClick={onLeave}>
                        <LogOut size={14} /> {t('leaveRoom')}
                    </button>
                </div>
            </aside>

            {/* CENTER: GAME AREA */}
            <main className="game-main-area">
                <header className="game-header">
                    <div className="round-info">{t('round')} {round}/{totalRounds}</div>
                    <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
                        <Clock size={20} /> {formatTime(timeLeft)}
                    </div>
                    <div className="role-badge">
                        {role === 'describer' && <><Mic size={14} /> {t('describer')}</>}
                        {role === 'painter' && <><Paintbrush size={14} /> {t('painter')}</>}
                        {role === 'spectator' && <><Eye size={14} /> {t('spectator')}</>}
                    </div>
                </header>

                <div className="game-view-container">
                    {role === 'describer' && (
                        <div className="describer-view">
                            <div className="image-section">
                                <div className="target-image">
                                    <p className="image-description">{image?.description}</p>
                                </div>
                                <p className="partner-hint"><Paintbrush size={16} /> <strong>{partnerName}</strong> {t('partnerDrawing')}</p>
                            </div>
                            <div className="drawing-section">
                                <CanvasDraw
                                    ref={canvasRef}
                                    disabled={true}
                                    backgroundColor="#222"
                                    canvasWidth={450}
                                    canvasHeight={320}
                                    hideGrid={true}
                                    immediateLoading={true}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </div>
                    )}

                    {role === 'painter' && (
                        <div className="painter-view">
                            <p className="partner-hint"><Mic size={18} /> <strong>{partnerName}</strong> {t('targetImage')}</p>

                            <div className="canvas-section-group">
                                <div className="canvas-wrapper">
                                    <div className="canvas-container relative-canvas">
                                        <CanvasDraw
                                            ref={canvasRef}
                                            onChange={handleDraw}
                                            brushColor={brushColor}
                                            brushRadius={brushRadius}
                                            backgroundColor="#222"
                                            canvasWidth={550}
                                            canvasHeight={380}
                                            hideGrid={true}
                                            lazyRadius={0}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                </div>

                                <aside className="shape-toolbar">
                                    <button className="shape-btn" onClick={() => addShape('square')}><Square size={20} /></button>
                                    <button className="shape-btn" onClick={() => addShape('circle')}><Circle size={20} /></button>
                                    <button className="shape-btn" onClick={() => addShape('triangle')}><Triangle size={20} /></button>
                                    <button className="shape-btn" onClick={() => addShape('star')}><Star size={20} /></button>
                                    <div className="toolbar-divider"></div>
                                    <button className="shape-btn active"><Paintbrush size={20} /></button>
                                </aside>
                            </div>

                            <div className="drawing-dock">
                                <div className="dock-section colors">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            className={`color-dot ${brushColor === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setBrushColor(color)}
                                        />
                                    ))}
                                </div>

                                <div className="dock-divider"></div>

                                <div className="dock-section brush-settings">
                                    <div className="slider-wrapper">
                                        <span className="slider-val">{brushRadius}px</span>
                                        <input
                                            type="range"
                                            min="1"
                                            max="40"
                                            value={brushRadius}
                                            onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="dock-divider"></div>

                                <div className="dock-section main-actions">
                                    <button className="action-btn undo" onClick={handleUndo} title={t('undo')}><Undo size={20} /></button>
                                    <button className="action-btn clear" onClick={handleClear} title={t('clear')}><Trash2 size={20} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {role === 'spectator' && (
                        <div className="spectator-view">
                            <p className="team-info"><Rocket size={18} /> {teamInfo}</p>
                            <CanvasDraw
                                ref={canvasRef}
                                disabled={true}
                                backgroundColor="#222"
                                canvasWidth={550}
                                canvasHeight={380}
                                hideGrid={true}
                                immediateLoading={true}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* RIGHT SIDE: CHAT */}
            <aside className="game-sidebar chat-sidebar">
                <div className="chat-tabs">
                    <button className={`tab-btn ${chatTab === 'global' ? 'active' : ''}`} onClick={() => setChatTab('global')}>
                        <Globe size={14} /> {t('globalChat')}
                    </button>
                    <button className={`tab-btn team-tab ${chatTab === 'team' ? 'active' : ''}`} onClick={() => setChatTab('team')}>
                        <Users2 size={14} /> {t('teamChat')}
                    </button>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {filteredMessages.length === 0 && (
                        <div className="chat-empty"><MessageSquare size={16} /> {t('noMessages')}</div>
                    )}
                    {filteredMessages.map((m, i) => (
                        <div key={i} className={`message ${m.senderId === myId ? 'mine' : ''}`}>
                            <span className="msg-sender">{m.senderName}:</span>
                            <span className="msg-text">{m.message}</span>
                        </div>
                    ))}
                </div>

                <form className="chat-input-area" onSubmit={sendChat}>
                    <input
                        type="text"
                        placeholder={t('typeMessage')}
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                    />
                    <button type="submit"><Send size={16} /></button>
                </form>
            </aside>
        </div>
    );
}

export default GameBoard;
