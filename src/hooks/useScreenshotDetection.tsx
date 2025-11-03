import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log(`📱 Screenshot prompt system active! Device: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
        
        let promptTimer: NodeJS.Timeout;
        let hasShownPrompt = false;

        // DESKTOP: Real screenshot detection
        if (!isMobile) {
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
        }

        // MOBILE: Smart prompt system
        // Show prompt when user returns to page (likely after taking screenshot)
        const handleVisibilityChange = () => {
            if (!document.hidden && !hasShownPrompt) {
                // User just came back to the page
                console.log('� User returned to page - showing screenshot prompt');
                setIsScreenshotDetected(true);
                hasShownPrompt = true;
                
                // Reset after 30 seconds so it can show again
                setTimeout(() => {
                    hasShownPrompt = false;
                }, 30000);
            }
        };

        // Also show prompt periodically (every 2 minutes) while user is active
        const showPeriodicPrompt = () => {
            console.log('📱 Periodic screenshot prompt');
            setIsScreenshotDetected(true);
            
            // Schedule next prompt
            promptTimer = setTimeout(showPeriodicPrompt, 120000); // Every 2 minutes
        };

        // Start periodic prompts after 30 seconds
        promptTimer = setTimeout(showPeriodicPrompt, 30000);

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (promptTimer) clearTimeout(promptTimer);
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
