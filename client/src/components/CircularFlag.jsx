import React from 'react';

export function CircularFlag({ code, size = 22, className = '' }) {
    const s = size;

    if (code === 'tr') {
        return (
            <svg width={s} height={s} viewBox="0 0 36 36" className={`circular-flag ${className}`} style={{ borderRadius: '50%', flexShrink: 0 }}>
                <circle cx="18" cy="18" r="18" fill="#e30a17" />
                {/* Crescent Outer */}
                <circle cx="15.5" cy="18" r="8.5" fill="#ffffff" />
                {/* Crescent Inner */}
                <circle cx="18" cy="18" r="6.8" fill="#e30a17" />
                {/* Star */}
                <polygon
                    points="21.5,18 25,19.2 22.8,16 22.8,20 25,16.8"
                    fill="#ffffff"
                    transform="rotate(-15 23 18)"
                />
            </svg>
        );
    }

    if (code === 'en' || code === 'gb') {
        return (
            <svg width={s} height={s} viewBox="0 0 36 36" className={`circular-flag ${className}`} style={{ borderRadius: '50%', flexShrink: 0 }}>
                <defs>
                    <clipPath id="uk-circle">
                        <circle cx="18" cy="18" r="18" />
                    </clipPath>
                </defs>
                <g clipPath="url(#uk-circle)">
                    <rect width="36" height="36" fill="#012169" />
                    {/* White Diagonals */}
                    <line x1="0" y1="0" x2="36" y2="36" stroke="#ffffff" strokeWidth="6" />
                    <line x1="0" y1="36" x2="36" y2="0" stroke="#ffffff" strokeWidth="6" />
                    {/* Red Diagonals */}
                    <line x1="0" y1="0" x2="36" y2="36" stroke="#c8102e" strokeWidth="2.5" />
                    <line x1="0" y1="36" x2="36" y2="0" stroke="#c8102e" strokeWidth="2.5" />
                    {/* White Cross */}
                    <line x1="18" y1="0" x2="18" y2="36" stroke="#ffffff" strokeWidth="10" />
                    <line x1="0" y1="18" x2="36" y2="18" stroke="#ffffff" strokeWidth="10" />
                    {/* Red Cross */}
                    <line x1="18" y1="0" x2="18" y2="36" stroke="#c8102e" strokeWidth="6" />
                    <line x1="0" y1="18" x2="36" y2="18" stroke="#c8102e" strokeWidth="6" />
                </g>
            </svg>
        );
    }

    if (code === 'de') {
        return (
            <svg width={s} height={s} viewBox="0 0 36 36" className={`circular-flag ${className}`} style={{ borderRadius: '50%', flexShrink: 0 }}>
                <defs>
                    <clipPath id="de-circle">
                        <circle cx="18" cy="18" r="18" />
                    </clipPath>
                </defs>
                <g clipPath="url(#de-circle)">
                    <rect x="0" y="0" width="36" height="12" fill="#000000" />
                    <rect x="0" y="12" width="36" height="12" fill="#dd0000" />
                    <rect x="0" y="24" width="36" height="12" fill="#ffce00" />
                </g>
            </svg>
        );
    }

    if (code === 'es') {
        return (
            <svg width={s} height={s} viewBox="0 0 36 36" className={`circular-flag ${className}`} style={{ borderRadius: '50%', flexShrink: 0 }}>
                <defs>
                    <clipPath id="es-circle">
                        <circle cx="18" cy="18" r="18" />
                    </clipPath>
                </defs>
                <g clipPath="url(#es-circle)">
                    <rect x="0" y="0" width="36" height="9" fill="#aa151b" />
                    <rect x="0" y="9" width="36" height="18" fill="#f1bf00" />
                    <rect x="0" y="27" width="36" height="9" fill="#aa151b" />
                    {/* Simplified Coat of Arms Circle */}
                    <circle cx="13" cy="18" r="3.5" fill="#aa151b" />
                    <circle cx="13" cy="18" r="2.2" fill="#f1bf00" />
                </g>
            </svg>
        );
    }

    if (code === 'fr') {
        return (
            <svg width={s} height={s} viewBox="0 0 36 36" className={`circular-flag ${className}`} style={{ borderRadius: '50%', flexShrink: 0 }}>
                <defs>
                    <clipPath id="fr-circle">
                        <circle cx="18" cy="18" r="18" />
                    </clipPath>
                </defs>
                <g clipPath="url(#fr-circle)">
                    <rect x="0" y="0" width="12" height="36" fill="#002395" />
                    <rect x="12" y="0" width="12" height="36" fill="#ffffff" />
                    <rect x="24" y="0" width="12" height="36" fill="#ed2939" />
                </g>
            </svg>
        );
    }

    return null;
}

export default CircularFlag;
