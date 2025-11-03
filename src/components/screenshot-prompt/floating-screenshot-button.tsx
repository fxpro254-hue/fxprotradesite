import { useState } from 'react';
import './floating-screenshot-button.scss';

interface FloatingScreenshotButtonProps {
    whatsappNumber: string;
}

export const FloatingScreenshotButton = ({ whatsappNumber }: FloatingScreenshotButtonProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const handleShare = () => {
        const message = encodeURIComponent('Hi! I took a screenshot and wanted to share it with you.');
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        setIsDismissed(true);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    return (
        <div className={`floating-screenshot-button ${isExpanded ? 'expanded' : ''}`}>
            {!isExpanded ? (
                <button
                    className="fab-icon"
                    onClick={() => setIsExpanded(true)}
                    aria-label="Share screenshot"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                </button>
            ) : (
                <div className="fab-expanded">
                    <div className="fab-content">
                        <div className="fab-icon-large">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <div className="fab-text">
                            <h4>Took a screenshot?</h4>
                            <p>Share it with us on WhatsApp!</p>
                        </div>
                    </div>
                    <div className="fab-actions">
                        <button className="fab-btn fab-btn-dismiss" onClick={handleDismiss}>
                            Not now
                        </button>
                        <button className="fab-btn fab-btn-share" onClick={handleShare}>
                            Share on WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
