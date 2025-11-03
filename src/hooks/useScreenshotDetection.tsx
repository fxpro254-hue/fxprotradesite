import { useEffect, useState } from 'react';import { useEffect, useState } from 'react';



interface ScreenshotDetectionResult {interface ScreenshotDetectionResult {

    isScreenshotDetected: boolean;    isScreenshotDetected: boolean;

    resetScreenshotDetection: () => void;    resetScreenshotDetection: () => void;

}    showFloatingButton: boolean;

}

export const useScreenshotDetection = (): ScreenshotDetectionResult => {

    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);export const useScreenshotDetection = (): ScreenshotDetectionResult => {

    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {    const [showFloatingButton, setShowFloatingButton] = useState(false);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            useEffect(() => {

        console.log(`📱 AGGRESSIVE screenshot detection active! Device: ${isMobile ? 'Mobile' : 'Desktop'}`);        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        let lastBlurTime = 0;        const isAndroid = /Android/i.test(navigator.userAgent);

        let lastHiddenTime = 0;        

        let detectionCount = 0;        console.log(`📱 Screenshot detection active!`);

        console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'} | iOS: ${isIOS} | Android: ${isAndroid}`);

        // AGGRESSIVE METHOD 1: Visibility changes - catches EVERYTHING        

        const handleVisibilityChange = () => {        // Show floating button after 3 seconds on mobile (user might take screenshots)

            const now = Date.now();        if (isMobile) {

                        const timer = setTimeout(() => {

            if (document.hidden) {                console.log('📱 Showing floating screenshot share button');

                lastHiddenTime = now;                setShowFloatingButton(true);

                console.log('📱 Page HIDDEN at', new Date(now).toLocaleTimeString());            }, 3000);

            } else {            

                if (lastHiddenTime > 0) {            return () => clearTimeout(timer);

                    const duration = now - lastHiddenTime;        }

                    console.log(`📱 Page VISIBLE after ${duration}ms`);        

                            // Desktop detection methods

                    // VERY AGGRESSIVE: Any visibility change between 10ms - 15 seconds        let lastBlurTime = 0;

                    if (duration > 10 && duration < 15000) {        let lastHiddenTime = 0;

                        detectionCount++;

                        console.log(`✅ ✅ ✅ SCREENSHOT DETECTED via visibility! Duration: ${duration}ms (#${detectionCount})`);        const handleVisibilityChange = () => {

                        setIsScreenshotDetected(true);            if (document.hidden) {

                    }                lastHiddenTime = Date.now();

                }                console.log('�️ Page hidden');

            }            } else {

        };                const duration = Date.now() - lastHiddenTime;

                if (lastHiddenTime > 0 && duration > 50 && duration < 2000) {

        // AGGRESSIVE METHOD 2: Blur/Focus - catches EVERYTHING                    console.log(`✅ Screenshot detected via visibility! (${duration}ms)`);

        const handleBlur = () => {                    setIsScreenshotDetected(true);

            lastBlurTime = Date.now();                }

            console.log('📱 Window BLUR at', new Date(lastBlurTime).toLocaleTimeString());            }

        };        };



        const handleFocus = () => {        const handleBlur = () => {

            if (lastBlurTime > 0) {            lastBlurTime = Date.now();

                const duration = Date.now() - lastBlurTime;            console.log('🖥️ Window blur');

                console.log(`📱 Window FOCUS after ${duration}ms`);        };

                

                // VERY AGGRESSIVE: Any blur between 10ms - 15 seconds        const handleFocus = () => {

                if (duration > 10 && duration < 15000) {            const duration = Date.now() - lastBlurTime;

                    console.log(`✅ ✅ ✅ SCREENSHOT DETECTED via blur/focus! Duration: ${duration}ms`);            if (lastBlurTime > 0 && duration > 50 && duration < 2000) {

                    setIsScreenshotDetected(true);                console.log(`✅ Screenshot detected via blur/focus! (${duration}ms)`);

                }                setIsScreenshotDetected(true);

            }            }

        };        };



        // METHOD 3: Keyboard        const handleKeyDown = (e: KeyboardEvent) => {

        const handleKeyDown = (e: KeyboardEvent) => {            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;

            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';

            const isWinSnip = e.shiftKey && e.metaKey && e.code === 'KeyS';            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);

            const isMacShot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);            

                        if (isPrintScreen || isWinSnip || isMacShot) {

            if (isPrintScreen || isWinSnip || isMacShot) {                console.log('✅ Screenshot detected via keyboard!');

                console.log('✅ ✅ ✅ SCREENSHOT DETECTED via keyboard!');                setIsScreenshotDetected(true);

                setIsScreenshotDetected(true);            }

            }        };

        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Add listeners        window.addEventListener('blur', handleBlur);

        document.addEventListener('visibilitychange', handleVisibilityChange);        window.addEventListener('focus', handleFocus);

        window.addEventListener('blur', handleBlur);        document.addEventListener('keydown', handleKeyDown);

        window.addEventListener('focus', handleFocus);

        document.addEventListener('keydown', handleKeyDown);        return () => {

            document.removeEventListener('visibilitychange', handleVisibilityChange);

        console.log('✅ All detection methods ACTIVE - will catch ANY page hide/blur events!');            window.removeEventListener('blur', handleBlur);

            window.removeEventListener('focus', handleFocus);

        return () => {            document.removeEventListener('keydown', handleKeyDown);

            document.removeEventListener('visibilitychange', handleVisibilityChange);        };

            window.removeEventListener('blur', handleBlur);    }, []);

            window.removeEventListener('focus', handleFocus);

            document.removeEventListener('keydown', handleKeyDown);    const resetScreenshotDetection = () => {

        };        setIsScreenshotDetected(false);

    }, []);    };



    const resetScreenshotDetection = () => {    return {

        setIsScreenshotDetected(false);        isScreenshotDetected,

    };        resetScreenshotDetection,

        showFloatingButton,

    return {    };

        isScreenshotDetected,};

        resetScreenshotDetection,
    };
};
