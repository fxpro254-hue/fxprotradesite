import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import './community-floating-icon.scss';

const Community = lazy(() => import('../../pages/community/community'));

const CommunityFloatingIcon = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [showCommunityTab, setShowCommunityTab] = useState(true); // Directly show community tab
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
                    <div className='popup-header'>
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
                </div>
            )}
        </>
    );
};

export default CommunityFloatingIcon;
