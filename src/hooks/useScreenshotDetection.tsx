import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        console.log(`📱 Screenshot detection active!`);
        console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'} | iOS: ${isIOS} | Android: ${isAndroid}`);
        
        let lastBlurTime = 0;
        let lastHiddenTime = 0;
        let lastFocusLossTime = 0;
        let screenshotAttempts = 0;
        let wasVisible = true;

        // MOBILE DETECTION METHOD 1: Visibility API (works on most mobile browsers)
        const handleVisibilityChange = () => {
            const now = Date.now();
            
            if (document.hidden) {
                lastHiddenTime = now;
                wasVisible = false;
                console.log('📱 Page became hidden at', new Date(now).toLocaleTimeString());
            } else {
                if (!wasVisible && lastHiddenTime > 0) {
                    const duration = now - lastHiddenTime;
                    console.log(`📱 Page became visible after ${duration}ms`);
                    
                    // Mobile screenshots typically hide page for 50ms-3000ms
                    if (duration > 30 && duration < 5000) {
                        screenshotAttempts++;
                        console.log(`✅ Screenshot detected via visibility! (${duration}ms, attempt #${screenshotAttempts})`);
                        setIsScreenshotDetected(true);
                    }
                }
                wasVisible = true;
            }
        };

        // MOBILE DETECTION METHOD 2: Window blur/focus (Android mostly)
        const handleBlur = () => {
            const now = Date.now();
            lastBlurTime = now;
            lastFocusLossTime = now;
            console.log('📱 Window blur at', new Date(now).toLocaleTimeString());
        };

        const handleFocus = () => {
            const now = Date.now();
            const blurDuration = lastBlurTime > 0 ? now - lastBlurTime : 0;
            
            if (blurDuration > 0) {
                console.log(`📱 Window focus after ${blurDuration}ms blur`);
                
                // Mobile: screenshots cause 100ms-3000ms blur
                // Desktop: screenshots cause 50ms-2000ms blur
                const minTime = isMobile ? 50 : 50;
                const maxTime = isMobile ? 5000 : 2000;
                
                if (blurDuration > minTime && blurDuration < maxTime) {
                    console.log(`✅ Screenshot detected via blur/focus! (${blurDuration}ms)`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // MOBILE DETECTION METHOD 3: Page freeze/resume (iOS Safari)
        const handleFreeze = () => {
            console.log('📱 Page freeze event (iOS screenshot indicator)');
            setIsScreenshotDetected(true);
        };

        const handleResume = () => {
            const now = Date.now();
            if (lastFocusLossTime > 0) {
                const duration = now - lastFocusLossTime;
                console.log(`📱 Page resume after ${duration}ms`);
                if (duration > 30 && duration < 5000) {
                    console.log(`✅ Screenshot detected via resume! (${duration}ms)`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // MOBILE DETECTION METHOD 4: Pause/resume (works on some Android browsers)
        const handlePause = () => {
            console.log('📱 Page pause event');
            lastFocusLossTime = Date.now();
        };

        // Desktop keyboard detection
        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('✅ Screenshot detected via keyboard!');
                setIsScreenshotDetected(true);
            }
        };

        // MOBILE DETECTION METHOD 5: User leaves and returns quickly
        const handleBeforeUnload = () => {
            lastFocusLossTime = Date.now();
        };

        // MOBILE DETECTION METHOD 6: Touch events pattern (experimental)
        let touchCount = 0;
        let lastTouchTime = 0;
        const handleTouchStart = () => {
            const now = Date.now();
            if (now - lastTouchTime < 500) {
                touchCount++;
                if (touchCount >= 2) {
                    console.log('📱 Multiple quick touches detected (possible screenshot gesture)');
                }
            } else {
                touchCount = 1;
            }
            lastTouchTime = now;
        };

        // Add all event listeners
        console.log('🔧 Setting up event listeners...');
        
        // Core listeners (all devices)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('keydown', handleKeyDown);
        
        // Mobile-specific listeners
        if (isMobile) {
            console.log('📱 Adding mobile-specific listeners...');
            
            // iOS-specific events
            if (isIOS) {
                document.addEventListener('freeze', handleFreeze);
                document.addEventListener('resume', handleResume);
                document.addEventListener('pause', handlePause);
            }
            
            // Android-specific events
            if (isAndroid) {
                window.addEventListener('pagehide', handleFreeze);
                window.addEventListener('pageshow', handleResume);
            }
            
            // General mobile events
            window.addEventListener('beforeunload', handleBeforeUnload);
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
        }

        console.log('✅ Screenshot detection initialized');

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('keydown', handleKeyDown);
            
            if (isMobile) {
                if (isIOS) {
                    document.removeEventListener('freeze', handleFreeze);
                    document.removeEventListener('resume', handleResume);
                    document.removeEventListener('pause', handlePause);
                }
                if (isAndroid) {
                    window.removeEventListener('pagehide', handleFreeze);
                    window.removeEventListener('pageshow', handleResume);
                }
                window.removeEventListener('beforeunload', handleBeforeUnload);
                document.removeEventListener('touchstart', handleTouchStart);
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
