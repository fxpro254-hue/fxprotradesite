import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import './community-floating-icon.scss';

const Community = lazy(() => import('../../pages/community/community'));

const CommunityFloatingIcon = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [showCommunityTab, setShowCommunityTab] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking on the floating icon itself
            if (popupRef.current && !popupRef.current.contains(target)) {
                const floatingIcon = document.querySelector('.community-floating-icon');
                if (floatingIcon && !floatingIcon.contains(target)) {
                    setShowPopup(false);
                }
            }
        };

        if (showPopup) {
            // Add small delay to prevent immediate closing
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showPopup]);

    // Toggle popup function
    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };

    // Show community tab view
    const handleGoToCommunity = () => {
        setShowCommunityTab(true);
    };

    // Go back to info view
    const handleBackToInfo = () => {
        setShowCommunityTab(false);
    };

    return (
        <>
            <div
                className='community-floating-icon'
                onClick={togglePopup}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePopup();
                    }
                }}
                title='Community'
                aria-label='Community toggle'
                aria-expanded={showPopup}
            >
                <div className='community-icon-content'>
                    <span className='community-icon-emoji'>👥</span>
                </div>
            </div>

            {showPopup && (
                <div className='community-popup' ref={popupRef}>
                    {!showCommunityTab ? (
                        <>
                            <div className='popup-header'>
                                <h3>Community</h3>
                                <button
                                    className='popup-close'
                                    onClick={() => setShowPopup(false)}
                                    aria-label='Close popup'
                                >
                                    ✕
                                </button>
                            </div>

                            <div className='popup-content'>
                                <p className='popup-description'>
                                    Connect with traders worldwide, share ideas, and discuss trading strategies.
                                </p>

                                <div className='popup-features'>
                                    <div className='feature-item'>
                                        <span className='feature-icon'>💬</span>
                                        <span className='feature-text'>Live Chat</span>
                                    </div>
                                    <div className='feature-item'>
                                        <span className='feature-icon'>👨‍🤝‍👨</span>
                                        <span className='feature-text'>Network</span>
                                    </div>
                                    <div className='feature-item'>
                                        <span className='feature-icon'>📈</span>
                                        <span className='feature-text'>Share Ideas</span>
                                    </div>
                                    <div className='feature-item'>
                                        <span className='feature-icon'>🏆</span>
                                        <span className='feature-text'>Leaderboard</span>
                                    </div>
                                </div>

                                <button
                                    className='join-button'
                                    onClick={handleGoToCommunity}
                                >
                                    Join Community
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='popup-header'>
                                <button
                                    className='popup-back'
                                    onClick={handleBackToInfo}
                                    aria-label='Go back'
                                >
                                    ←
                                </button>
                                <h3>Community Chat</h3>
                                <button
                                    className='popup-close'
                                    onClick={() => setShowPopup(false)}
                                    aria-label='Close popup'
                                >
                                    ✕
                                </button>
                            </div>

                            <div className='community-tab-container'>
                                <Suspense
                                    fallback={
                                        <div className='community-loading'>
                                            <div className='spinner'></div>
                                            <p>Loading Community...</p>
                                        </div>
                                    }
                                >
                                    <Community />
                                </Suspense>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default CommunityFloatingIcon;
