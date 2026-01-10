import React, { useState } from 'react';
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
    ArrowLeft
} from 'lucide-react';

function JoinScreen({ onCreateRoom, onJoinRoom }) {
    const [mode, setMode] = useState(null); // 'create' | 'join'
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) {
            setError('İsim giriniz');
            return;
        }
        // Rastgele oda kodu oluştur
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        onCreateRoom(newRoomId, name.trim(), maxPlayers);
    };

    const handleJoin = () => {
        if (!name.trim()) {
            setError('İsim giriniz');
            return;
        }
        if (!roomId.trim()) {
            setError('Oda kodu giriniz');
            return;
        }
        onJoinRoom(roomId.trim().toUpperCase(), name.trim());
    };

    return (
        <div className="join-screen">
            {/* Dekoratif elementler */}
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>

            <div className="join-header">
                <div className="logo-icon">
                    🎨
                </div>
                <h1>Draw What?!</h1>
                <p className="tagline">Çiz, Anlat, Kazan!</p>
                <p className="description">
                    Arkadaşlarınla birlikte oyna! Bir kişi anlatır, diğeri çizer.
                    En iyi çizimi yapan takım kazanır!
                </p>
            </div>

            {!mode && (
                <div className="mode-selection">
                    <button className="btn mode-btn create" onClick={() => setMode('create')}>
                        <span className="btn-icon"><Home size={32} /></span>
                        <span className="btn-text">
                            <strong>Oda Oluştur</strong>
                            <small>Yeni bir oyun başlat</small>
                        </span>
                    </button>
                    <button className="btn mode-btn join" onClick={() => setMode('join')}>
                        <span className="btn-icon"><LogIn size={32} /></span>
                        <span className="btn-text">
                            <strong>Odaya Katıl</strong>
                            <small>Arkadaşının odasına gir</small>
                        </span>
                    </button>
                </div>
            )}

            {mode && (
                <div className="join-form">
                    <button className="back-btn" onClick={() => { setMode(null); setError(''); }}>
                        <ArrowLeft size={16} /> Geri
                    </button>

                    <div className="input-group">
                        <label><User size={16} /> Oyuncu Adın</label>
                        <input
                            type="text"
                            placeholder="İsmin..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                        />
                    </div>

                    {mode === 'join' && (
                        <div className="input-group">
                            <label><Key size={16} /> Oda Kodu</label>
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
                            <label><Users size={16} /> Maksimum Oyuncu</label>
                            <div className="player-options">
                                {[2, 4, 6].map(num => (
                                    <button
                                        key={num}
                                        className={`option-btn ${maxPlayers === num ? 'active' : ''}`}
                                        onClick={() => setMaxPlayers(num)}
                                    >
                                        {num} Kişi
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
                        {mode === 'create' ? <><Rocket size={20} /> Oda Oluştur</> : <><Gamepad2 size={20} /> Odaya Katıl</>}
                    </button>
                </div>
            )}

            <div className="join-footer">
                <div className="features">
                    <span><Target size={14} /> Takım Oyunu</span>
                    <span><Clock size={14} /> 90 Saniye</span>
                    <span><Trophy size={14} /> Skorlar</span>
                </div>
            </div>
        </div>
    );
}

export default JoinScreen;
