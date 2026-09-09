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
    Sparkles,
    Volume2,
    Quote
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
    const { t, language } = useLanguage();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);
    const overlayRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(duration || 90);
    const [brushColor, setBrushColor] = useState('#FFFFFF');
    const [brushRadius, setBrushRadius] = useState(4);
    const [activeTool, setActiveTool] = useState('brush'); // 'brush' | 'square' | 'circle' | 'triangle' | 'star'
    const [chatTab, setChatTab] = useState('global'); // 'global' | 'team'
    const [msgInput, setMsgInput] = useState('');

    // Drag-to-draw shape state
    const [isDrawingShape, setIsDrawingShape] = useState(false);
    const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
    const [shapeCurrent, setShapeCurrent] = useState({ x: 0, y: 0 });

    // Quick Reaction Emojis
    const quickEmojis = ['🔥', '😂', '👏', '🎨', '🤔', '❤️', '😱', '🎉'];

    // Timer countdown
    useEffect(() => {
        setTimeLeft(duration || 90);
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

    // Load incoming drawing for non-painters
    useEffect(() => {
        if (role !== 'painter' && canvasRef.current && drawingData) {
            try {
                canvasRef.current.loadSaveData(drawingData, true);
            } catch (e) {
                console.error('Drawing load error:', e);
            }
        }
    }, [drawingData, role]);

    // Scroll chat to bottom on new messages
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

    const getCanvasCoords = (e) => {
        if (!overlayRef.current) return { x: 0, y: 0 };
        const rect = overlayRef.current.getBoundingClientRect();
        const scaleX = 550 / rect.width;
        const scaleY = 360 / rect.height;
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
        return {
            x: Math.max(0, Math.min(550, (clientX - rect.left) * scaleX)),
            y: Math.max(0, Math.min(360, (clientY - rect.top) * scaleY))
        };
    };

    const handleShapePointerDown = (e) => {
        if (role !== 'painter' || activeTool === 'brush') return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        setIsDrawingShape(true);
        setShapeStart(coords);
        setShapeCurrent(coords);
    };

    const handleShapePointerMove = (e) => {
        if (!isDrawingShape) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        setShapeCurrent(coords);
    };

    const handleShapePointerUp = (e) => {
        if (!isDrawingShape) return;
        setIsDrawingShape(false);
        commitShapeToCanvas(activeTool, shapeStart, shapeCurrent);
    };

    const interpolateSegment = (p1, p2, step = 3) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const count = Math.max(1, Math.ceil(dist / step));
        const pts = [];
        for (let i = 0; i < count; i++) {
            const t = i / count;
            pts.push({
                x: Math.round((p1.x + dx * t) * 10) / 10,
                y: Math.round((p1.y + dy * t) * 10) / 10
            });
        }
        return pts;
    };

    const createDensePolygonPoints = (vertices, step = 3) => {
        const dense = [];
        for (let i = 0; i < vertices.length - 1; i++) {
            dense.push(...interpolateSegment(vertices[i], vertices[i + 1], step));
        }
        dense.push(vertices[vertices.length - 1]);
        return dense;
    };

    const commitShapeToCanvas = (shapeType, start, current) => {
        if (role !== 'painter' || !canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const currentDataStr = canvas.getSaveData();
            const currentData = JSON.parse(currentDataStr);

            const minX = Math.min(start.x, current.x);
            const maxX = Math.max(start.x, current.x);
            const minY = Math.min(start.y, current.y);
            const maxY = Math.max(start.y, current.y);

            let w = maxX - minX;
            let h = maxY - minY;

            // Eğer sadece tıklandıysa (sürükleme < 5px), varsayılan 70x70 boyut ata
            if (w < 5 && h < 5) {
                w = 70;
                h = 70;
            }

            const centerX = (minX + (w === 70 && maxX - minX < 5 ? minX + w : maxX)) / 2;
            const centerY = (minY + (h === 70 && maxY - minY < 5 ? minY + h : maxY)) / 2;
            const radiusX = Math.max(10, w / 2);
            const radiusY = Math.max(10, h / 2);
            const left = centerX - radiusX;
            const right = centerX + radiusX;
            const top = centerY - radiusY;
            const bottom = centerY + radiusY;

            const newLine = {
                brushColor,
                brushRadius: Math.max(2, brushRadius / 2),
                points: []
            };

            if (shapeType === 'square') {
                const squareVertices = [
                    { x: left, y: top },
                    { x: right, y: top },
                    { x: right, y: bottom },
                    { x: left, y: bottom },
                    { x: left, y: top }
                ];
                newLine.points = createDensePolygonPoints(squareVertices, 3);
            } else if (shapeType === 'circle') {
                const totalPoints = 64;
                for (let i = 0; i <= totalPoints; i++) {
                    const angle = (i / totalPoints) * Math.PI * 2;
                    newLine.points.push({
                        x: Math.round((centerX + Math.cos(angle) * radiusX) * 10) / 10,
                        y: Math.round((centerY + Math.sin(angle) * radiusY) * 10) / 10
                    });
                }
            } else if (shapeType === 'triangle') {
                const triangleVertices = [
                    { x: centerX, y: top },
                    { x: right, y: bottom },
                    { x: left, y: bottom },
                    { x: centerX, y: top }
                ];
                newLine.points = createDensePolygonPoints(triangleVertices, 3);
            } else if (shapeType === 'star') {
                const starVertices = [];
                for (let i = 0; i <= 10; i++) {
                    const angle = (i * Math.PI) / 5 - Math.PI / 2;
                    const rx = (i % 2 === 0) ? radiusX : radiusX * 0.42;
                    const ry = (i % 2 === 0) ? radiusY : radiusY * 0.42;
                    starVertices.push({
                        x: Math.round((centerX + rx * Math.cos(angle)) * 10) / 10,
                        y: Math.round((centerY + ry * Math.sin(angle)) * 10) / 10
                    });
                }
                newLine.points = createDensePolygonPoints(starVertices, 2.5);
            }

            if (newLine.points.length > 0) {
                currentData.lines.push(newLine);
                canvas.loadSaveData(JSON.stringify(currentData), true);
                onDrawUpdate(JSON.stringify(currentData));
            }
        } catch (err) {
            console.error("Shape add error:", err);
        }
    };

    const renderShapePreview = () => {
        if (!isDrawingShape || activeTool === 'brush') return null;

        const minX = Math.min(shapeStart.x, shapeCurrent.x);
        const maxX = Math.max(shapeStart.x, shapeCurrent.x);
        const minY = Math.min(shapeStart.y, shapeCurrent.y);
        const maxY = Math.max(shapeStart.y, shapeCurrent.y);

        const w = Math.max(4, maxX - minX);
        const h = Math.max(4, maxY - minY);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radiusX = w / 2;
        const radiusY = h / 2;

        const strokeWidth = Math.max(2, brushRadius / 2);

        if (activeTool === 'square') {
            return (
                <rect
                    x={minX}
                    y={minY}
                    width={w}
                    height={h}
                    stroke={brushColor}
                    strokeWidth={strokeWidth}
                    fill="rgba(0, 240, 255, 0.15)"
                    strokeDasharray="5 5"
                />
            );
        }
        if (activeTool === 'circle') {
            return (
                <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx={radiusX}
                    ry={radiusY}
                    stroke={brushColor}
                    strokeWidth={strokeWidth}
                    fill="rgba(0, 240, 255, 0.15)"
                    strokeDasharray="5 5"
                />
            );
        }
        if (activeTool === 'triangle') {
            const points = `${centerX},${minY} ${maxX},${maxY} ${minX},${maxY}`;
            return (
                <polygon
                    points={points}
                    stroke={brushColor}
                    strokeWidth={strokeWidth}
                    fill="rgba(0, 240, 255, 0.15)"
                    strokeDasharray="5 5"
                />
            );
        }
        if (activeTool === 'star') {
            let pts = [];
            for (let i = 0; i <= 10; i++) {
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const rx = (i % 2 === 0) ? radiusX : radiusX * 0.42;
                const ry = (i % 2 === 0) ? radiusY : radiusY * 0.42;
                pts.push(`${centerX + rx * Math.cos(angle)},${centerY + ry * Math.sin(angle)}`);
            }
            return (
                <polygon
                    points={pts.join(' ')}
                    stroke={brushColor}
                    strokeWidth={strokeWidth}
                    fill="rgba(0, 240, 255, 0.15)"
                    strokeDasharray="5 5"
                />
            );
        }
        return null;
    };

    const sendChat = (e) => {
        if (e) e.preventDefault();
        if (!msgInput.trim()) return;
        onSendMessage(msgInput.trim(), chatTab);
        setMsgInput('');
    };

    const handleQuickEmoji = (emoji) => {
        onSendMessage(emoji, chatTab);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const vibrantPalette = [
        '#FFFFFF', // White
        '#00f0ff', // Electric Cyan
        '#ff2d75', // Sunset Pink
        '#ffd600', // Yellow
        '#10b981', // Emerald Green
        '#8b5cf6', // Neon Violet
        '#ff7849', // Coral Orange
        '#1e293b'  // Dark Charcoal
    ];

    const filteredMessages = (messages || []).filter(m => m.type === chatTab);

    return (
        <div className="gameboard-container">
            {/* TOP BAR: GAME STATUS */}
            <header className="game-topbar glass-panel">
                <div className="topbar-left">
                    <div className="game-round-pill">
                        <span className="pill-dot"></span>
                        <span>{t('round')} {round} / {totalRounds}</span>
                    </div>
                </div>

                <div className="topbar-center">
                    <div className={`game-timer-pill ${timeLeft <= 10 ? 'timer-critical' : ''}`}>
                        <Clock size={18} className="timer-icon" />
                        <span className="timer-digits">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="topbar-right">
                    <div className={`role-tag-badge role-${role}`}>
                        {role === 'describer' && (
                            <>
                                <Mic size={16} />
                                <span>{t('describer')}</span>
                            </>
                        )}
                        {role === 'painter' && (
                            <>
                                <Paintbrush size={16} />
                                <span>{t('painter')}</span>
                            </>
                        )}
                        {role === 'spectator' && (
                            <>
                                <Eye size={16} />
                                <span>{t('spectator')}</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* 3-COLUMN MAIN LAYOUT */}
            <div className="game-layout-grid">
                {/* 1. LEFT SIDEBAR: PLAYERS */}
                <aside className="game-panel players-panel glass-panel">
                    <div className="panel-header">
                        <Users size={16} className="text-cyan" />
                        <span>{t('players')}</span>
                    </div>

                    <div className="players-list-scroll">
                        {(players || []).map(p => (
                            <div key={p.id} className={`player-roster-item ${p.id === myId ? 'is-me' : ''}`}>
                                <div className="roster-avatar">
                                    {(p.name || '?')[0].toUpperCase()}
                                </div>
                                <div className="roster-info">
                                    <span className="roster-name">{p.name || '???'}</span>
                                    {p.id === myId && <span className="roster-me-pill">{language === 'tr' ? 'Sen' : 'You'}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="panel-footer">
                        <button className="game-leave-btn" onClick={onLeave}>
                            <LogOut size={15} />
                            <span>{t('leaveRoom')}</span>
                        </button>
                    </div>
                </aside>

                {/* 2. CENTER: CANVAS & INTERACTIVE WORKSPACE */}
                <main className="game-center-workspace">
                    {/* DESCRIBER VIEW */}
                    {role === 'describer' && (
                        <div className="describer-workspace">
                            <div className="describer-prompt-card glass-panel">
                                <div className="prompt-header">
                                    <Volume2 size={18} className="text-pink" />
                                    <span>{language === 'tr' ? 'Hedef Kelime / İpucu (Partnerine Sesle Anlat)' : 'Secret Target (Describe this via Voice)'}</span>
                                </div>
                                <div className="prompt-content">
                                    <Quote size={24} className="prompt-quote-icon" />
                                    <p className="prompt-text">{image?.description || 'Loading...'}</p>
                                </div>
                                <div className="prompt-partner-info">
                                    <Paintbrush size={16} />
                                    <span><strong>{partnerName}</strong> {t('partnerDrawing')}</span>
                                </div>
                            </div>

                            <div className="canvas-frame glass-panel">
                                <CanvasDraw
                                    ref={canvasRef}
                                    disabled={true}
                                    backgroundColor="#0c0e1e"
                                    canvasWidth={550}
                                    canvasHeight={360}
                                    hideGrid={true}
                                    immediateLoading={true}
                                    style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* PAINTER VIEW */}
                    {role === 'painter' && (
                        <div className="painter-workspace">
                            <div className="painter-hint-bar glass-panel">
                                <Mic size={16} className="text-cyan pulse-anim" />
                                <span><strong>{partnerName}</strong> {language === 'tr' ? 'anlatıyor, dikkatle dinle ve çiz!' : 'is describing, listen & draw!'}</span>
                            </div>

                            <div className="canvas-frame painter-canvas glass-panel">
                                <CanvasDraw
                                    ref={canvasRef}
                                    onChange={handleDraw}
                                    brushColor={brushColor}
                                    brushRadius={brushRadius}
                                    backgroundColor="#0c0e1e"
                                    canvasWidth={550}
                                    canvasHeight={360}
                                    hideGrid={true}
                                    lazyRadius={0}
                                    immediateLoading={true}
                                    disabled={activeTool !== 'brush'}
                                    style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                                />

                                {/* Interactive Shape Overlay when shape tool is active */}
                                {activeTool !== 'brush' && (
                                    <div
                                        ref={overlayRef}
                                        className="shape-drawing-overlay"
                                        onPointerDown={handleShapePointerDown}
                                        onPointerMove={handleShapePointerMove}
                                        onPointerUp={handleShapePointerUp}
                                        onPointerCancel={handleShapePointerUp}
                                    >
                                        <svg className="shape-preview-svg" viewBox="0 0 550 360">
                                            {renderShapePreview()}
                                        </svg>
                                    </div>
                                )}

                                {/* Shape Tool Drag Tip */}
                                {activeTool !== 'brush' && (
                                    <div className="shape-drag-tip-pill">
                                        <span>📐 {language === 'tr' ? 'Tuvalde sürükleyerek boyutu ve konumu belirleyin' : 'Click & drag on canvas to scale & position'}</span>
                                    </div>
                                )}

                                {/* Floating Shape Tools on Canvas side */}
                                <div className="shape-toolbar-dock">
                                    <button
                                        className={`shape-dock-btn ${activeTool === 'brush' ? 'active' : ''}`}
                                        onClick={() => setActiveTool('brush')}
                                        title="Freehand Brush"
                                        type="button"
                                    >
                                        <Paintbrush size={18} />
                                    </button>
                                    <button
                                        className={`shape-dock-btn ${activeTool === 'square' ? 'active' : ''}`}
                                        onClick={() => setActiveTool('square')}
                                        title="Drag to Draw Square"
                                        type="button"
                                    >
                                        <Square size={18} />
                                    </button>
                                    <button
                                        className={`shape-dock-btn ${activeTool === 'circle' ? 'active' : ''}`}
                                        onClick={() => setActiveTool('circle')}
                                        title="Drag to Draw Circle"
                                        type="button"
                                    >
                                        <Circle size={18} />
                                    </button>
                                    <button
                                        className={`shape-dock-btn ${activeTool === 'triangle' ? 'active' : ''}`}
                                        onClick={() => setActiveTool('triangle')}
                                        title="Drag to Draw Triangle"
                                        type="button"
                                    >
                                        <Triangle size={18} />
                                    </button>
                                    <button
                                        className={`shape-dock-btn ${activeTool === 'star' ? 'active' : ''}`}
                                        onClick={() => setActiveTool('star')}
                                        title="Drag to Draw Star"
                                        type="button"
                                    >
                                        <Star size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Painter Bottom Controls Dock */}
                            <div className="painter-controls-dock glass-panel">
                                {/* Color Swatches */}
                                <div className="dock-color-swatches">
                                    {vibrantPalette.map(color => (
                                        <button
                                            key={color}
                                            className={`color-swatch-btn ${brushColor === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setBrushColor(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>

                                <div className="dock-separator"></div>

                                {/* Brush Size Slider with Preview */}
                                <div className="dock-brush-slider">
                                    <div
                                        className="brush-size-preview-dot"
                                        style={{
                                            width: `${Math.max(6, Math.min(24, brushRadius))}px`,
                                            height: `${Math.max(6, Math.min(24, brushRadius))}px`,
                                            backgroundColor: brushColor
                                        }}
                                    />
                                    <span className="brush-radius-label">{brushRadius}px</span>
                                    <input
                                        type="range"
                                        min="2"
                                        max="36"
                                        value={brushRadius}
                                        onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                                        className="styled-range-input"
                                    />
                                </div>

                                <div className="dock-separator"></div>

                                {/* Undo & Clear */}
                                <div className="dock-action-btns">
                                    <button className="dock-btn undo-btn" onClick={handleUndo} title={t('undo')}>
                                        <Undo size={18} />
                                    </button>
                                    <button className="dock-btn clear-btn" onClick={handleClear} title={t('clear')}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SPECTATOR VIEW */}
                    {role === 'spectator' && (
                        <div className="spectator-workspace">
                            <div className="spectator-info-bar glass-panel">
                                <Sparkles size={18} className="text-cyan" />
                                <span>{teamInfo || (language === 'tr' ? 'Oyun canlı olarak izleniyor' : 'Watching game live')}</span>
                            </div>

                            <div className="canvas-frame glass-panel">
                                <CanvasDraw
                                    ref={canvasRef}
                                    disabled={true}
                                    backgroundColor="#0c0e1e"
                                    canvasWidth={550}
                                    canvasHeight={360}
                                    hideGrid={true}
                                    immediateLoading={true}
                                    style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* 3. RIGHT SIDEBAR: MODERN DISCORD-STYLE CHAT */}
                <aside className="game-panel chat-panel glass-panel">
                    <div className="chat-panel-tabs">
                        <button
                            className={`chat-tab-btn ${chatTab === 'global' ? 'active' : ''}`}
                            onClick={() => setChatTab('global')}
                        >
                            <Globe size={14} />
                            <span>{t('globalChat')}</span>
                        </button>
                        <button
                            className={`chat-tab-btn team-tab ${chatTab === 'team' ? 'active' : ''}`}
                            onClick={() => setChatTab('team')}
                        >
                            <Users2 size={14} />
                            <span>{t('teamChat')}</span>
                        </button>
                    </div>

                    <div className="chat-stream-container" ref={scrollRef}>
                        {filteredMessages.length === 0 && (
                            <div className="chat-empty-state">
                                <MessageSquare size={24} className="text-muted" />
                                <span>{t('noMessages')}</span>
                            </div>
                        )}

                        {filteredMessages.map((m, i) => {
                            const isMine = m.senderId === myId;
                            return (
                                <div key={i} className={`chat-message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                    <div className="msg-header">
                                        <span className="sender-tag">{m.senderName}</span>
                                    </div>
                                    <div className="msg-body">
                                        {m.message}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Emojis Bar */}
                    <div className="quick-emojis-bar">
                        {quickEmojis.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                className="emoji-quick-btn"
                                onClick={() => handleQuickEmoji(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <form className="chat-input-row" onSubmit={sendChat}>
                        <input
                            type="text"
                            placeholder={t('typeMessage')}
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            maxLength={100}
                        />
                        <button type="submit" className="chat-send-btn" disabled={!msgInput.trim()}>
                            <Send size={15} />
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
}

export default GameBoard;
