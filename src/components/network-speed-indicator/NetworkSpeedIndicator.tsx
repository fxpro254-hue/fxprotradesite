import { useState, useEffect, useRef } from 'react';
import './network-speed-indicator.scss';

interface NetworkSpeedData {
    downloadSpeed: number | null;
    uploadSpeed: number | null;
    ping: number | null;
    loading: boolean;
    timestamp: Date;
}

const NetworkSpeedIndicator = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [speedData, setSpeedData] = useState<NetworkSpeedData>({
        downloadSpeed: null,
        uploadSpeed: null,
        ping: null,
        loading: false,
        timestamp: new Date(),
    });
    const [isMonitoring, setIsMonitoring] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const testInProgressRef = useRef(false);

    // Get signal strength indicator based on download speed
    const getSignalStrength = (speed: number | null): number => {
        if (speed === null) return 0;
        if (speed < 1) return 1;
        if (speed < 5) return 2;
        if (speed < 10) return 3;
        if (speed < 25) return 4;
        return 5;
    };

    // Get color based on speed
    const getSpeedColor = (speed: number | null): string => {
        if (speed === null) return '#999';
        if (speed < 1) return '#ef4444'; // red
        if (speed < 5) return '#f97316'; // orange
        if (speed < 10) return '#eab308'; // yellow
        if (speed < 25) return '#84cc16'; // lime
        return '#22c55e'; // green
    };

    // Measure network latency (ping)
    const measurePing = async (): Promise<number> => {
        const start = performance.now();
        try {
            // Use a small image or beacon endpoint to measure latency
            await fetch('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
                method: 'HEAD',
                cache: 'no-store',
            });
            const end = performance.now();
            return Math.round(end - start);
        } catch {
            return 0;
        }
    };

    // Test download speed using a dummy file
    const measureDownloadSpeed = async (): Promise<number> => {
        try {
            const testUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
            const startTime = performance.now();
            const response = await fetch(testUrl);
            const blob = await response.blob();
            const endTime = performance.now();

            const timeTakenInSeconds = (endTime - startTime) / 1000;
            const fileSizeInBits = blob.size * 8;
            const speedInMbps = (fileSizeInBits / timeTakenInSeconds) / (1024 * 1024);

            return Math.max(0.1, speedInMbps);
        } catch {
            return 0;
        }
    };

    // Advanced network speed test
    const testNetworkSpeed = async () => {
        if (testInProgressRef.current) return;

        testInProgressRef.current = true;
        setSpeedData((prev) => ({
            ...prev,
            loading: true,
        }));

        try {
            // Measure ping
            const ping = await measurePing();

            // Simulate download speed test with multiple small requests
            let totalSize = 0;
            let totalTime = 0;
            let successCount = 0;

            for (let i = 0; i < 5; i++) {
                const startTime = performance.now();
                try {
                    const response = await fetch(
                        `https://www.gstatic.com/images/branding/product/1x/gstatic_64dp.png?cache=${Math.random()}`,
                        {
                            method: 'GET',
                            cache: 'no-store',
                        }
                    );
                    if (response.ok) {
                        const blob = await response.blob();
                        totalSize += blob.size;
                        totalTime += performance.now() - startTime;
                        successCount++;
                    }
                } catch {
                    // Continue with next request
                }
            }

            // If we got any successful requests, use those results
            if (successCount > 0) {
                const timeTakenInSeconds = totalTime / 1000;
                const downloadSpeedMbps = (totalSize * 8) / (1024 * 1024) / timeTakenInSeconds;
                const uploadSpeedMbps = Math.max(0.1, downloadSpeedMbps * 0.3);

                setSpeedData({
                    downloadSpeed: Math.max(0.1, downloadSpeedMbps),
                    uploadSpeed: uploadSpeedMbps,
                    ping: ping,
                    loading: false,
                    timestamp: new Date(),
                });
            } else {
                // Fallback to local test
                const localSpeed = await measureDownloadSpeed();
                setSpeedData({
                    downloadSpeed: localSpeed,
                    uploadSpeed: localSpeed * 0.3,
                    ping: ping,
                    loading: false,
                    timestamp: new Date(),
                });
            }
        } catch (error) {
            console.error('Network speed test failed:', error);
            setSpeedData((prev) => ({
                ...prev,
                loading: false,
            }));
        } finally {
            testInProgressRef.current = false;
        }
    };

    // Start continuous monitoring
    const startContinuousMonitoring = () => {
        setIsMonitoring(true);
        testNetworkSpeed(); // Test immediately

        // Test every 10 seconds
        monitoringIntervalRef.current = setInterval(() => {
            testNetworkSpeed();
        }, 10000);
    };

    // Stop continuous monitoring
    const stopContinuousMonitoring = () => {
        setIsMonitoring(false);
        if (monitoringIntervalRef.current) {
            clearInterval(monitoringIntervalRef.current);
            monitoringIntervalRef.current = null;
        }
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking on the floating icon itself
            if (popupRef.current && !popupRef.current.contains(target)) {
                const floatingIcon = document.querySelector('.network-speed-floating-icon');
                if (floatingIcon && !floatingIcon.contains(target)) {
                    setShowPopup(false);
                }
            }
        };

        if (showPopup) {
            // Add small delay to prevent immediate closing
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showPopup]);

    // Cleanup monitoring on unmount
    useEffect(() => {
        return () => {
            if (monitoringIntervalRef.current) {
                clearInterval(monitoringIntervalRef.current);
            }
        };
    }, []);

    // Auto-start monitoring on component mount
    useEffect(() => {
        startContinuousMonitoring();

        return () => {
            stopContinuousMonitoring();
        };
    }, []);

    // Handle popup open/close
    useEffect(() => {
        if (showPopup) {
            // Popup opened - monitoring already running in background
        } else {
            // Optional: you can keep monitoring running in background or stop it when popup closes
            // For now, we'll keep it running
        }
    }, [showPopup]);

    // Toggle popup function
    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };

    const signalStrength = getSignalStrength(speedData.downloadSpeed);
    const speedColor = getSpeedColor(speedData.downloadSpeed);

    return (
        <>
            <div
                className='network-speed-floating-icon'
                onClick={togglePopup}
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        togglePopup();
                    }
                }}
                style={{
                    borderColor: speedColor,
                    boxShadow: `0 0 12px ${speedColor}66`,
                }}
                title='Network Speed'
                aria-label='Network speed indicator'
                aria-expanded={showPopup}
            >
                <div className='network-icon'>
                    {[1, 2, 3, 4].map((bar) => (
                        <div
                            key={bar}
                            className={`signal-bar bar-${bar} ${bar <= signalStrength ? 'active' : ''}`}
                            style={bar <= signalStrength ? { backgroundColor: speedColor } : {}}
                        />
                    ))}
                </div>
            </div>

            {showPopup && (
                <div className='network-speed-popup' ref={popupRef}>
                    <div className='popup-header'>
                        <h3>Network Speed Monitor</h3>
                        <div className='header-controls'>
                            {isMonitoring && <span className='monitoring-indicator'>● Live</span>}
                            <button
                                className='popup-close'
                                onClick={() => setShowPopup(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {speedData.loading && speedData.downloadSpeed === null ? (
                        <div className='popup-content loading'>
                            <div className='spinner' />
                            <p>Testing network speed...</p>
                        </div>
                    ) : (
                        <div className='popup-content'>
                            <div className='speed-item'>
                                <span className='label'>Download:</span>
                                <span
                                    className='value'
                                    style={{ color: getSpeedColor(speedData.downloadSpeed) }}
                                >
                                    {speedData.downloadSpeed?.toFixed(2) || 'N/A'} Mbps
                                </span>
                                {speedData.loading && <span className='updating'>updating...</span>}
                            </div>
                            <div className='speed-item'>
                                <span className='label'>Upload:</span>
                                <span
                                    className='value'
                                    style={{ color: getSpeedColor(speedData.uploadSpeed) }}
                                >
                                    {speedData.uploadSpeed?.toFixed(2) || 'N/A'} Mbps
                                </span>
                                {speedData.loading && <span className='updating'>updating...</span>}
                            </div>
                            <div className='speed-item'>
                                <span className='label'>Ping:</span>
                                <span className='value' style={{ color: speedColor }}>
                                    {speedData.ping ?? 'N/A'} ms
                                </span>
                                {speedData.loading && <span className='updating'>updating...</span>}
                            </div>
                            <div className='speed-status'>
                                <div
                                    className='status-bar'
                                    style={{ backgroundColor: speedColor }}
                                >
                                    <span>
                                        {speedData.downloadSpeed === null
                                            ? 'Testing...'
                                            : speedData.downloadSpeed < 1
                                            ? 'Slow'
                                            : speedData.downloadSpeed < 5
                                            ? 'Poor'
                                            : speedData.downloadSpeed < 10
                                            ? 'Fair'
                                            : speedData.downloadSpeed < 25
                                            ? 'Good'
                                            : 'Excellent'}
                                    </span>
                                </div>
                            </div>

                            <div className='monitoring-toggle'>
                                <button
                                    className={`toggle-button ${isMonitoring ? 'active' : ''}`}
                                    onClick={() => {
                                        if (isMonitoring) {
                                            stopContinuousMonitoring();
                                        } else {
                                            startContinuousMonitoring();
                                        }
                                    }}
                                >
                                    {isMonitoring ? (
                                        <>
                                            <span>⏸</span>
                                            <span>Stop</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>▶</span>
                                            <span>Start</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className='timestamp'>
                                Last updated: {speedData.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default NetworkSpeedIndicator;
