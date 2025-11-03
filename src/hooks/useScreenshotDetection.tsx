import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log(`📱 ULTRA screenshot detection active! Device: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
        console.log('🔥 Testing: Please take a screenshot now and watch console...');
        
        let lastBlurTime = 0;
        let lastHiddenTime = 0;
        let detectionCount = 0;

        // METHOD 1: Page Visibility - ALWAYS TRIGGER
        const handleVisibilityChange = () => {
            const now = Date.now();
            const wasHidden = document.hidden;
            
            console.log(`👁️ Visibility changed: ${wasHidden ? 'HIDDEN' : 'VISIBLE'} at ${new Date(now).toLocaleTimeString()}`);
            
            if (wasHidden) {
                lastHiddenTime = now;
            } else {
                if (lastHiddenTime > 0) {
                    const duration = now - lastHiddenTime;
                    console.log(`⏱️ Was hidden for ${duration}ms`);
                    
                    // ULTRA AGGRESSIVE: Trigger on ANY visibility change
                    if (duration > 1) {
                        detectionCount++;
                        console.log(`🚨🚨🚨 SCREENSHOT DETECTED! Method: Visibility | Duration: ${duration}ms | Count: ${detectionCount}`);
                        setIsScreenshotDetected(true);
                    }
                }
            }
        };

        // METHOD 2: Window Blur/Focus - ALWAYS TRIGGER  
        const handleBlur = () => {
            lastBlurTime = Date.now();
            console.log(`💨 BLUR at ${new Date(lastBlurTime).toLocaleTimeString()}`);
        };

        const handleFocus = () => {
            if (lastBlurTime > 0) {
                const duration = Date.now() - lastBlurTime;
                console.log(`🎯 FOCUS after ${duration}ms`);
                
                // ULTRA AGGRESSIVE: Trigger on ANY blur
                if (duration > 1) {
                    console.log(`🚨🚨🚨 SCREENSHOT DETECTED! Method: Blur/Focus | Duration: ${duration}ms`);
                    setIsScreenshotDetected(true);
                }
            }
        };

        // METHOD 3: Page Hide/Show (mobile specific)
        const handlePageHide = () => {
            console.log('📴 PAGE HIDE EVENT');
            setIsScreenshotDetected(true);
        };

        const handlePageShow = () => {
            console.log('📱 PAGE SHOW EVENT');
        };

        // METHOD 4: Freeze/Resume (iOS specific)
        const handleFreeze = () => {
            console.log('❄️ FREEZE EVENT (iOS)');
            setIsScreenshotDetected(true);
        };

        const handleResume = () => {
            console.log('▶️ RESUME EVENT (iOS)');
        };

        // METHOD 5: Keyboard
        const handleKeyDown = (e: KeyboardEvent) => {
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';
            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWinSnip || isMacShot) {
                console.log('🚨🚨🚨 SCREENSHOT DETECTED! Method: Keyboard');
                setIsScreenshotDetected(true);
            }
        };

        // Add ALL listeners
        console.log('🔧 Adding listeners...');
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('freeze', handleFreeze as any);
        document.addEventListener('resume', handleResume as any);
        document.addEventListener('keydown', handleKeyDown);

        console.log('✅ ALL detection methods ACTIVE!');
        console.log('📸 Now take a screenshot and check if console shows detection...');

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener('freeze', handleFreeze as any);
            document.removeEventListener('resume', handleResume as any);
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
