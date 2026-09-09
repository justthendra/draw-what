import React, { useEffect } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle2, DoorClosed } from 'lucide-react';

export function InfoModal({ isOpen, title, message, type = 'info', onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                if (isOpen && onClose) onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        if (type === 'room_closed' || title?.toLowerCase().includes('oda')) {
            return <DoorClosed size={34} className="modal-icon text-pink" />;
        }
        if (type === 'error') {
            return <XCircle size={34} className="modal-icon text-red" />;
        }
        if (type === 'warning') {
            return <AlertTriangle size={34} className="modal-icon text-amber" />;
        }
        if (type === 'success') {
            return <CheckCircle2 size={34} className="modal-icon text-green" />;
        }
        return <Info size={34} className="modal-icon text-cyan" />;
    };

    return (
        <div className="custom-modal-backdrop" onClick={onClose}>
            <div className={`custom-modal-card glass-panel modal-${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-halo">
                    {getIcon()}
                </div>
                
                <h3 className="modal-title">{title || 'Bilgilendirme'}</h3>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <button className="primary-action-btn modal-confirm-btn" onClick={onClose} autoFocus>
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InfoModal;
