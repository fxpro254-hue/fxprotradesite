import React, { createContext, useContext, useState, ReactNode } from 'react';

type Platform = 'bot' | 'trader';

interface PlatformContextType {
    currentPlatform: Platform;
    togglePlatform: (platform: Platform) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPlatform, setCurrentPlatform] = useState<Platform>('bot');

    const togglePlatform = (platform: Platform) => {
        setCurrentPlatform(platform);
    };

    return (
        <PlatformContext.Provider value={{ currentPlatform, togglePlatform }}>
            {children}
        </PlatformContext.Provider>
    );
};

export const usePlatform = () => {
    const context = useContext(PlatformContext);
    if (context === undefined) {
        throw new Error('usePlatform must be used within a PlatformProvider');
    }
    return context;
};
