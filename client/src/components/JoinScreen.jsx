import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Paintbrush,
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
    Globe
} from 'lucide-react';

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
        // Rastgele oda kodu oluştur
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
        <div className="join-screen">
            {/* Dil Seçici */}
            <div className="language-selector">
                <button
                    className="lang-toggle"
                    onClick={() => setShowLangMenu(!showLangMenu)}
                >
                    <Globe size={18} />
                    {languages.find(l => l.code === language)?.flag}
                </button>
                {showLangMenu && (
                    <div className="lang-dropdown">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                className={`lang-option ${language === lang.code ? 'active' : ''}`}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setShowLangMenu(false);
                                }}
                            >
                                <span className="lang-flag">{lang.flag}</span>
                                <span className="lang-name">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Dekoratif elementler */}
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>

            <div className="join-header">
                <div className="logo-icon">
                    🎨
                </div>
                <h1>{t('appTitle')}</h1>
                <p className="tagline">{t('appSubtitle')}</p>
            </div>

            {!mode && (
                <div className="mode-selection">
                    <button className="btn mode-btn create" onClick={() => setMode('create')}>
                        <span className="btn-icon"><Home size={32} /></span>
                        <span className="btn-text">
                            <strong>{t('createRoom')}</strong>
                            <small>{language === 'tr' ? 'Yeni bir oyun başlat' : 'Start a new game'}</small>
                        </span>
                    </button>
                    <button className="btn mode-btn join" onClick={() => setMode('join')}>
                        <span className="btn-icon"><LogIn size={32} /></span>
                        <span className="btn-text">
                            <strong>{t('joinRoom')}</strong>
                            <small>{language === 'tr' ? 'Arkadaşının odasına gir' : 'Join friend\'s room'}</small>
                        </span>
                    </button>
                </div>
            )}

            {mode && (
                <div className="join-form">
                    <button className="back-btn" onClick={() => { setMode(null); setError(''); }}>
                        <ArrowLeft size={16} /> {t('back')}
                    </button>

                    <div className="input-group">
                        <label><User size={16} /> {t('yourName')}</label>
                        <input
                            type="text"
                            placeholder={t('enterName')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                        />
                    </div>

                    {mode === 'join' && (
                        <div className="input-group">
                            <label><Key size={16} /> {t('roomCode')}</label>
                            <input
                                type="text"
                                placeholder="ABCDEF"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="room-code-input"
                            />
                        </div>
                    )}

                    {mode === 'create' && (
                        <div className="max-players-selector">
                            <label><Users size={16} /> {t('maxPlayers')}</label>
                            <div className="player-options">
                                {[2, 4, 6].map(num => (
                                    <button
                                        key={num}
                                        className={`option-btn ${maxPlayers === num ? 'active' : ''}`}
                                        onClick={() => setMaxPlayers(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message"><AlertTriangle size={16} /> {error}</div>}

                    <button
                        className="btn submit-btn"
                        onClick={mode === 'create' ? handleCreate : handleJoin}
                    >
                        {mode === 'create' ? <><Rocket size={20} /> {t('createRoom')}</> : <><Gamepad2 size={20} /> {t('joinGame')}</>}
                    </button>
                </div>
            )}

            <div className="join-footer">
                <div className="features">
                    <span><Target size={14} /> {t('features.teamwork')}</span>
                    <span><Clock size={14} /> {t('features.realtime')}</span>
                    <span><Trophy size={14} /> {t('features.fun')}</span>
                </div>
            </div>
        </div>
    );
}

export default JoinScreen;
