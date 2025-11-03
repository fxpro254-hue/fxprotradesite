import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log(`Screenshot detection active! Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
        
        let lastBlurTime = 0;
        let lastHiddenTime = 0;
        let screenshotAttempts = 0;

        // Mobile-specific: Detect visibility changes (most reliable on mobile)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                lastHiddenTime = Date.now();
                console.log('📱 Page hidden (screenshot might be taken)');
            } else {
                const duration = Date.now() - lastHiddenTime;
                // Mobile screenshots typically cause 100-800ms visibility change
                if (lastHiddenTime > 0 && duration > 50 && duration < 1000) {
                    screenshotAttempts++;
                    console.log(`📸 Screenshot detected! Hidden for ${duration}ms (attempt ${screenshotAttempts})`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // Desktop-specific: Blur/focus detection
        const handleBlur = () => {
            if (!isMobile) {
                lastBlurTime = Date.now();
                console.log('🖥️ Window blur detected');
            }
        };

        const handleFocus = () => {
            if (!isMobile) {
                const duration = Date.now() - lastBlurTime;
                if (lastBlurTime > 0 && duration > 50 && duration < 2000) {
                    console.log(`🖥️ Screenshot detected! Unfocused for ${duration}ms`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // Keyboard detection (works on some devices)
        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('⌨️ Screenshot detected via keyboard!');
                setIsScreenshotDetected(true);
            }
        };

        // Mobile-specific: Detect user leaving app (screenshot notification appears)
        const handlePageHide = () => {
            if (isMobile) {
                console.log('📱 Page hide event (possible screenshot)');
                setIsScreenshotDetected(true);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('keydown', handleKeyDown);
        
        // Mobile-specific listeners
        if (isMobile) {
            window.addEventListener('pagehide', handlePageHide);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('keydown', handleKeyDown);
            if (isMobile) {
                window.removeEventListener('pagehide', handlePageHide);
            }
        };
    }, []);

    const resetScreenshotDetection = () => {
        setIsScreenshotDetected(false);
    };

    return {
        isScreenshotDetected,
        resetScreenshotDetection,
    };
};
