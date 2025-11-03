import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        console.log('Screenshot detection active! Try Win+Shift+S or PrintScreen');
        
        let lastBlurTime = 0;
        let lastHiddenTime = 0;

        const handleBlur = () => {
            lastBlurTime = Date.now();
            console.log('Window blur detected');
        };

        const handleFocus = () => {
            const duration = Date.now() - lastBlurTime;
            if (lastBlurTime > 0 && duration > 50 && duration < 2000) {
                console.log(`Screenshot detected! Unfocused for ${duration}ms`);
                setIsScreenshotDetected(true);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                lastHiddenTime = Date.now();
            } else {
                const duration = Date.now() - lastHiddenTime;
                if (lastHiddenTime > 0 && duration < 1500) {
                    console.log(`Screenshot detected! Hidden for ${duration}ms`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('Screenshot detected via keyboard!');
                setIsScreenshotDetected(true);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
