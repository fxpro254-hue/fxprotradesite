import React from 'react';
import { observer } from 'mobx-react-lite';
import { getAppId } from '@/components/shared';
import Button from '@/components/shared_ui/button';
import Modal from '@/components/shared_ui/modal';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import './login-required-modal.scss';

const LoginRequiredModal = observer(() => {
    const { client } = useStore();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [showRiskDisclaimer, setShowRiskDisclaimer] = React.useState(false);

    // Check if user should see the login modal
    React.useEffect(() => {
        const isCallbackPage = window.location.pathname === '/callback';
        const shouldShowModal = !client?.is_logged_in && !isCallbackPage && client !== undefined;
        setIsModalOpen(shouldShowModal);
    }, [client?.is_logged_in]);

    const handleLogin = () => {
        const app_id = getAppId();
        const oauth_url = 'https://oauth.deriv.com/oauth2/authorize';
        const redirect_uri = encodeURIComponent(`${window.location.origin}/callback`);
        const url = `${oauth_url}?app_id=${app_id}&affiliate_token=rVf-VSveO71k0YPxVS0A2Nd7ZgqdRLk&utm_campaign=myaffiliates&l=EN&brand=deriv&redirect_uri=${redirect_uri}`;
        window.location.href = url;
    };

    const handleCreateAccount = () => {
        const url = `https://track.deriv.com/__rVf-VSveO71k0YPxVS0A2Nd7ZgqdRLk/1/`;
        window.open(url, '_blank');
    };

    const handleRiskDisclaimer = () => {
        setShowRiskDisclaimer(true);
    };

    const closeRiskDisclaimer = () => {
        setShowRiskDisclaimer(false);
    };

    // Don't render if user is logged in or client is not initialized
    if (client?.is_logged_in || client === undefined) {
        return null;
    }

    const isAnyModalOpen = (isModalOpen && !showRiskDisclaimer) || showRiskDisclaimer;

    return (
        <>
        {isAnyModalOpen && <div className='modal-backdrop' onClick={(e) => e.stopPropagation()} />}
        <Modal
            is_open={isModalOpen && !showRiskDisclaimer}
            className='login-required-modal'
            width='480px'
            should_close_on_click_outside={false}
            has_close_icon={false}
            portalId='modal_root'
        >
            <Modal.Body>
                <div className='login-required-modal__content'>
                    <div className='login-required-modal__logo'>
                        <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M12 2L2 7L12 12L22 7L12 2Z' fill='url(#gradient1)'/>
                            <path d='M2 17L12 22L22 17V7L12 12L2 7V17Z' fill='url(#gradient2)'/>
                            <defs>
                                <linearGradient id='gradient1' x1='2' y1='2' x2='22' y2='12'>
                                    <stop offset='0%' stopColor='#00a8e8'/>
                                    <stop offset='100%' stopColor='#0066ff'/>
                                </linearGradient>
                                <linearGradient id='gradient2' x1='2' y1='7' x2='22' y2='22'>
                                    <stop offset='0%' stopColor='#0066ff'/>
                                    <stop offset='100%' stopColor='#00a8e8'/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className='login-required-modal__header'>
                        <Text as='h1' className='login-required-modal__title'>
                            Welcome to Binaryfx
                        </Text>
                        <Text as='p' className='login-required-modal__subtitle'>
                            Sign in to access your trading workspace
                        </Text>
                    </div>
                    
                    <div className='login-required-modal__actions'>
                        <Button
                            onClick={handleLogin}
                            primary
                            large
                            className='login-required-modal__login-btn'
                        >
                            <svg className='btn-icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' fill='currentColor'/>
                            </svg>
                            Login with Deriv
                        </Button>
                        
                        <Button
                            onClick={handleCreateAccount}
                            secondary
                            large
                            className='login-required-modal__create-btn'
                        >
                            <svg className='btn-icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='currentColor'/>
                            </svg>
                            Create Account
                        </Button>
                    </div>

                    <div className='login-required-modal__footer'>
                        <Text className='footer-text'>
                            Powered by <span className='deriv-badge'>Deriv</span>
                        </Text>
                        <button 
                            className='risk-disclaimer-btn'
                            onClick={handleRiskDisclaimer}
                        >
                            Risk Disclaimer
                        </button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal
            is_open={showRiskDisclaimer}
            className='risk-disclaimer-modal'
            width='520px'
            should_close_on_click_outside={true}
            has_close_icon={true}
            onClickClose={closeRiskDisclaimer}
            portalId='modal_root'
        >
            <Modal.Body>
                <div className='risk-disclaimer-modal__content'>
                    <Text as='h2' className='risk-disclaimer-modal__title'>
                        Risk Disclaimer
                    </Text>
                    
                    <Text as='p' className='risk-disclaimer-modal__text'>
                        Deriv offers complex derivatives, such as options and contracts for difference ("CFDs"). These products may not be suitable for all clients, and trading them puts you at risk. Please make sure that you understand the following risks before trading Deriv products:
                    </Text>

                    <ul className='risk-disclaimer-modal__list'>
                        <li>You may lose some or all of the money you invest in the trade.</li>
                        <li>If your trade involves currency conversion, exchange rates will affect your profit and loss.</li>
                        <li>You should never trade with borrowed money or with money that you cannot afford to lose.</li>
                    </ul>

                    <Button
                        onClick={closeRiskDisclaimer}
                        primary
                        large
                        className='risk-disclaimer-modal__close-btn'
                    >
                        I Understand
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
        </>
    );
});

export default LoginRequiredModal;
