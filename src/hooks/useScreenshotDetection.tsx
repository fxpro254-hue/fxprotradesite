import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
    showFloatingButton: boolean;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        console.log(`📱 Screenshot detection active!`);
        console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'} | iOS: ${isIOS} | Android: ${isAndroid}`);
        
        // Show floating button after 3 seconds on mobile (user might take screenshots)
        if (isMobile) {
            const timer = setTimeout(() => {
                console.log('📱 Showing floating screenshot share button');
                setShowFloatingButton(true);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
        
        // Desktop detection methods
        let lastBlurTime = 0;
        let lastHiddenTime = 0;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                lastHiddenTime = Date.now();
                console.log('�️ Page hidden');
            } else {
                const duration = Date.now() - lastHiddenTime;
                if (lastHiddenTime > 0 && duration > 50 && duration < 2000) {
                    console.log(`✅ Screenshot detected via visibility! (${duration}ms)`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        const handleBlur = () => {
            lastBlurTime = Date.now();
            console.log('🖥️ Window blur');
        };

        const handleFocus = () => {
            const duration = Date.now() - lastBlurTime;
            if (lastBlurTime > 0 && duration > 50 && duration < 2000) {
                console.log(`✅ Screenshot detected via blur/focus! (${duration}ms)`);
                setIsScreenshotDetected(true);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('✅ Screenshot detected via keyboard!');
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
        showFloatingButton,
    };
};
