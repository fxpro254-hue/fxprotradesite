import React from 'react';
import BrandedLoader from './branded-loader';

type FuturisticLoaderProps = {
    message?: string;
};

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({ message }) => {
    return (
        <BrandedLoader 
            message={message || "Loading..."}
            subMessage="Please wait"
        />
    );
};

export default FuturisticLoader;
