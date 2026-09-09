import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Home,
    LogIn,
    User,
    Key,
    Users,
    AlertTriangle,
    Rocket,
    Gamepad2,
    Target,
    Clock,
    Trophy,
    ArrowLeft,
    Globe,
    Sparkles,
    Check
} from 'lucide-react';

import { CircularFlag } from './CircularFlag';

function JoinScreen({ onCreateRoom, onJoinRoom }) {
    const { t, language, setLanguage, languages } = useLanguage();
    const [mode, setMode] = useState(null); // 'create' | 'join'
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState('');
    const [showLangMenu, setShowLangMenu] = useState(false);

    const handleCreate = () => {
        if (!name.trim()) {
            setError(t('errors.nameRequired'));
            return;
        }
        // 6 haneli rastgele oda kodu oluştur
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        onCreateRoom(newRoomId, name.trim(), maxPlayers);
    };

    const handleJoin = () => {
        if (!name.trim()) {
            setError(t('errors.nameRequired'));
            return;
        }
        if (!roomId.trim()) {
            setError(t('errors.roomCodeRequired'));
            return;
        }
        onJoinRoom(roomId.trim().toUpperCase(), name.trim());
    };

    return (
        <div className="join-screen-wrapper">
            {/* Ambient Background Glows */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>
            <div className="ambient-glow glow-3"></div>

            <div className="join-card glass-panel">
                {/* Language Selector */}
                <div className="language-selector">
                    <button
                        className="lang-toggle-btn"
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        title="Change Language"
                        type="button"
                    >
                        <CircularFlag code={language} size={26} />
                    </button>
                    {showLangMenu && (
                        <div className="lang-dropdown glass-popover">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setShowLangMenu(false);
                                    }}
                                >
                                    <CircularFlag code={lang.code} size={22} />
                                    <span className="lang-name">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Brand Header */}
                <div className="join-header">
                    <div className="logo-badge">
                        <span className="logo-emoji">🎨</span>
                        <div className="logo-sparkle"><Sparkles size={16} /></div>
                    </div>
                    <h1 className="brand-title">{t('appTitle')}</h1>
                    <p className="brand-tagline">{t('appSubtitle')}</p>
                </div>

                {/* Mode Selection */}
                {!mode && (
                    <div className="mode-selection">
                        <button className="mode-card create-mode" onClick={() => setMode('create')}>
                            <div className="mode-icon-box">
                                <Home size={26} />
                            </div>
                            <div className="mode-info">
                                <span className="mode-title">{t('createRoom')}</span>
                                <span className="mode-desc">
                                    {language === 'tr' ? 'Yeni bir oda kur & arkadaşları davet et' : 'Host a room & invite friends'}
                                </span>
                            </div>
                        </button>

                        <button className="mode-card join-mode" onClick={() => setMode('join')}>
                            <div className="mode-icon-box">
                                <LogIn size={26} />
                            </div>
                            <div className="mode-info">
                                <span className="mode-title">{t('joinRoom')}</span>
                                <span className="mode-desc">
                                    {language === 'tr' ? 'Mevcut bir oda koduna katıl' : 'Enter an existing room code'}
                                </span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Form Screen */}
                {mode && (
                    <div className="join-form-wrapper">
                        <button className="back-link-btn" onClick={() => { setMode(null); setError(''); }}>
                            <ArrowLeft size={16} /> {t('back')}
                        </button>

                        <div className="form-fields">
                            <div className="input-field-group">
                                <label className="field-label">
                                    <User size={15} /> {t('yourName')}
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder={t('enterName')}
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setError(''); }}
                                        maxLength={15}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {mode === 'join' && (
                                <div className="input-field-group">
                                    <label className="field-label">
                                        <Key size={15} /> {t('roomCode')}
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="ABCDEF"
                                            value={roomId}
                                            onChange={(e) => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
                                            maxLength={6}
                                            className="room-code-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === 'create' && (
                                <div className="input-field-group">
                                    <label className="field-label">
                                        <Users size={15} /> {t('maxPlayers')}
                                    </label>
                                    <div className="player-pills-selector">
                                        {[2, 4, 6].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                className={`player-pill ${maxPlayers === num ? 'active' : ''}`}
                                                onClick={() => setMaxPlayers(num)}
                                            >
                                                <Users size={14} />
                                                <span>{num} {language === 'tr' ? 'Oyuncu' : 'Players'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="error-banner">
                                    <AlertTriangle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                className={`primary-action-btn ${mode === 'create' ? 'create-action' : 'join-action'}`}
                                onClick={mode === 'create' ? handleCreate : handleJoin}
                            >
                                {mode === 'create' ? (
                                    <>
                                        <Rocket size={18} />
                                        <span>{t('createRoom')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Gamepad2 size={18} />
                                        <span>{t('joinGame')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Features Footer */}
                <div className="join-footer-features">
                    <div className="feature-pill">
                        <Target size={13} />
                        <span>{t('features.teamwork')}</span>
                    </div>
                    <div className="feature-pill">
                        <Clock size={13} />
                        <span>{t('features.realtime')}</span>
                    </div>
                    <div className="feature-pill">
                        <Trophy size={13} />
                        <span>{t('features.fun')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoinScreen;
