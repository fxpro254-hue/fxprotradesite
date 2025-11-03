import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log(`📱 Screenshot detection active! Device: ${isMobile ? 'MOBILE (disabled)' : 'DESKTOP'}`);
        
        // Disable on mobile - browser limitations prevent reliable detection
        if (isMobile) {
            console.log('📱 Screenshot detection disabled on mobile devices');
            return;
        }
        
        // DESKTOP ONLY: Real screenshot detection
        let lastBlurTime = 0;
        let lastHiddenTime = 0;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                lastHiddenTime = Date.now();
            } else if (lastHiddenTime > 0) {
                const duration = Date.now() - lastHiddenTime;
                if (duration > 50 && duration < 2000) {
                    console.log(`✅ Screenshot detected (visibility: ${duration}ms)`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        const handleBlur = () => {
            lastBlurTime = Date.now();
        };

        const handleFocus = () => {
            if (lastBlurTime > 0) {
                const duration = Date.now() - lastBlurTime;
                if (duration > 50 && duration < 2000) {
                    console.log(`✅ Screenshot detected (blur: ${duration}ms)`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('✅ Screenshot detected (keyboard)');
                setIsScreenshotDetected(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('keydown', handleKeyDown);
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
