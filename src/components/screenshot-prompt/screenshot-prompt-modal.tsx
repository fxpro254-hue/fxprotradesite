import React, { useEffect } from 'react';
import Button from '@/components/shared_ui/button';
import { useTranslations } from '@deriv-com/translations';
import './screenshot-prompt-modal.scss';

interface ScreenshotPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    whatsappNumber?: string;
}

const ScreenshotPromptModal: React.FC<ScreenshotPromptModalProps> = ({
    isOpen,
    onClose,
    whatsappNumber = '254740009453',
}) => {
    const { localize } = useTranslations();

    useEffect(() => {
        if (isOpen) {
            console.log('📸 Screenshot toast opened!');
            console.log('📸 Toast should be visible now');
        }
    }, [isOpen]);

    const handleSendToWhatsApp = () => {
        if (process.env.NODE_ENV === 'development') {
            console.log('📱 Opening WhatsApp...');
        }
        const message = encodeURIComponent(
            'Hi! I just took a screenshot and wanted to share it with you.'
        );
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const handleMaybeLater = () => {
        onClose();
    };

    if (!isOpen) return null;

    console.log('📸 Rendering screenshot toast - isOpen:', isOpen);

    return (
        <div className={`screenshot-prompt-toast ${isOpen ? 'screenshot-prompt-toast--visible' : ''}`}>
            <button 
                className='screenshot-prompt-toast__close' 
                onClick={onClose}
                aria-label='Close'
            >
                ×
            </button>
            
            <div className='screenshot-prompt-toast__content'>
                <div className='screenshot-prompt-toast__preview'>
                    <svg width='48' height='48' viewBox='0 0 24 24' fill='none'>
                        <path
                            d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
                            fill='currentColor'
                            opacity='0.5'
                        />
                        <circle cx='12' cy='12' r='2' fill='currentColor' />
                    </svg>
                </div>
                
                <div className='screenshot-prompt-toast__text'>
                    <div className='screenshot-prompt-toast__icon'>📸</div>
                    <h3 className='screenshot-prompt-toast__title'>
                        {localize('Screenshot Detected!')}
                    </h3>
                    <p className='screenshot-prompt-toast__description'>
                        {localize('Share it with us via WhatsApp?')}
                    </p>
                </div>
                
                <div className='screenshot-prompt-toast__actions'>
                    <Button
                        className='screenshot-prompt-toast__button screenshot-prompt-toast__button--whatsapp'
                        onClick={handleSendToWhatsApp}
                        text={localize('Send to WhatsApp')}
                        primary
                    />
                    <button 
                        className='screenshot-prompt-toast__button screenshot-prompt-toast__button--later'
                        onClick={handleMaybeLater}
                    >
                        {localize('Maybe Later')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScreenshotPromptModal;
