import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log(` AGGRESSIVE screenshot detection active! Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
        
        let lastBlurTime = 0;
        let lastHiddenTime = 0;
        let detectionCount = 0;

        // AGGRESSIVE METHOD 1: Visibility changes - catches EVERYTHING
        const handleVisibilityChange = () => {
            const now = Date.now();
            
            if (document.hidden) {
                lastHiddenTime = now;
                console.log(' Page HIDDEN at', new Date(now).toLocaleTimeString());
            } else {
                if (lastHiddenTime > 0) {
                    const duration = now - lastHiddenTime;
                    console.log(` Page VISIBLE after ${duration}ms`);
                    
                    // VERY AGGRESSIVE: Any visibility change between 10ms - 15 seconds
                    if (duration > 10 && duration < 15000) {
                        detectionCount++;
                        console.log(`   SCREENSHOT DETECTED via visibility! Duration: ${duration}ms (#${detectionCount})`);
                        setIsScreenshotDetected(true);
                    }
                }
            }
        };

        // AGGRESSIVE METHOD 2: Blur/Focus - catches EVERYTHING
        const handleBlur = () => {
            lastBlurTime = Date.now();
            console.log(' Window BLUR at', new Date(lastBlurTime).toLocaleTimeString());
        };

        const handleFocus = () => {
            if (lastBlurTime > 0) {
                const duration = Date.now() - lastBlurTime;
                console.log(` Window FOCUS after ${duration}ms`);
                
                // VERY AGGRESSIVE: Any blur between 10ms - 15 seconds
                if (duration > 10 && duration < 15000) {
                    console.log(`   SCREENSHOT DETECTED via blur/focus! Duration: ${duration}ms`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // METHOD 3: Keyboard
        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('   SCREENSHOT DETECTED via keyboard!');
                setIsScreenshotDetected(true);
            }
        };

        // Add listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('keydown', handleKeyDown);

        console.log(' All detection methods ACTIVE - will catch ANY page hide/blur events!');

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
