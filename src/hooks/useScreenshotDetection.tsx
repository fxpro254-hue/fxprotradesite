import { useEffect, useState } from 'react';

interface ScreenshotDetectionResult {
    isScreenshotDetected: boolean;
    resetScreenshotDetection: () => void;
}

/**
 * Custom hook to detect when a user takes a screenshot
 * This works by detecting various screenshot-related events and behaviors
 */
export const useScreenshotDetection = (): ScreenshotDetectionResult => {
    const [isScreenshotDetected, setIsScreenshotDetected] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('📸 Screenshot detection initialized - Try taking a screenshot!');
            console.log('📸 Supported shortcuts: PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5');
        }
        
        let lastHiddenTime = 0;

        // Method 1: Detect keyboard shortcuts (Windows/Mac)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Key pressed:', e.key, 'KeyCode:', e.keyCode, 'Shift:', e.shiftKey, 'Meta:', e.metaKey, 'Ctrl:', e.ctrlKey);
            }
            
            // Windows: PrintScreen, Win+Shift+S, Alt+PrintScreen
            // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
            const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
            const isWindowsSnippingTool = (e.shiftKey && e.metaKey && e.key.toLowerCase() === 's') || 
                                          (e.shiftKey && e.key === 'Meta' && e.metaKey);
            const isMacScreenshot = 
                e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
            
            if (isPrintScreen || isWindowsSnippingTool || isMacScreenshot) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('📸 Screenshot detected via keyboard shortcut!');
                }
                setIsScreenshotDetected(true);
            }
        };

        // Method 2: Detect visibility change (some screenshot tools hide the page briefly)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                lastHiddenTime = Date.now();
            } else {
                const hiddenDuration = Date.now() - lastHiddenTime;
                // If page was hidden for less than 300ms, it might be a screenshot
                if (hiddenDuration > 0 && hiddenDuration < 300) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('📸 Possible screenshot detected via visibility change');
                    }
                    setIsScreenshotDetected(true);
                }
            }
        };

        // Method 3: Detect blur events (some screenshot tools cause brief blur)
        let blurTime = 0;
        const handleBlur = () => {
            blurTime = Date.now();
        };

        const handleFocus = () => {
            const blurDuration = Date.now() - blurTime;
            if (blurDuration > 0 && blurDuration < 200) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('📸 Possible screenshot detected via blur/focus');
                }
                setIsScreenshotDetected(true);
            }
        };

        // Method 4: Detect clipboard access (some tools copy screenshot to clipboard)
        const handleCopy = () => {
            // Check if copying from the page itself (not user selection)
            const selection = window.getSelection();
            if (!selection || selection.toString().length === 0) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('📸 Possible screenshot detected via clipboard');
                }
                setIsScreenshotDetected(true);
            }
        };

        // Add all event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('copy', handleCopy);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('copy', handleCopy);
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
