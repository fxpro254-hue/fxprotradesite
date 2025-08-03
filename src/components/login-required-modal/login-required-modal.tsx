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
    const [funnyMessage, setFunnyMessage] = React.useState('');

    const funnyMessages = [
        "🎭 Hold up! You're trying to trade without an account? That's like trying to drive without a car!",
        "🚀 Whoa there, space cadet! Even astronauts need a license to fly rockets.",
        "🎪 Welcome to the circus! But first, you need a ticket (aka account) to see the show.",
        "🕵️ Detected: Unauthorized trading attempt! Please present your trading credentials, agent.",
        "🎯 You've found the secret trading portal! Now you just need the secret key... (it's an account).",
        "🏴‍☠️ Arrr! Even pirates need to register their ships before sailing the trading seas!",
        "🎮 Boss battle detected! But you need to create your character first, player.",
        "🧙‍♂️ *waves magic wand* Poof! You need an account to unlock these trading spells!"
    ];

    // Check if user should see the login modal
    React.useEffect(() => {
        const isCallbackPage = window.location.pathname === '/callback';
        const shouldShowModal = !client?.is_logged_in && !isCallbackPage && client !== undefined;
        
        if (shouldShowModal) {
            // Pick a random funny message
            const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
            setFunnyMessage(randomMessage);
        }
        
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
        // Redirect to Deriv signup page
        const redirect_uri = encodeURIComponent(`${window.location.origin}/callback`);
        const url = `https://track.deriv.com/__rVf-VSveO71k0YPxVS0A2Nd7ZgqdRLk/1/`;
        window.open(url, '_blank');
        // Note: The above URL should be updated with the correct affiliate token and app ID as
    };

    // Don't render if user is logged in or client is not initialized
    if (client?.is_logged_in || client === undefined) {
        return null;
    }

    return (
        <Modal
            is_open={isModalOpen}
            className='login-required-modal'
            width='500px'
            should_close_on_click_outside={false}
            has_close_icon={false}
            is_vertical_centered
        >
            <Modal.Body>
                <div className='login-required-modal__content'>
                    <div className='login-required-modal__emoji'>
                        🎪
                    </div>
                    
                    <Text
                        as='h1'
                        align='center'
                        weight='bold'
                        className='login-required-modal__title'
                    >
                        {localize('Oops! Authentication Required!')}
                    </Text>
                    
                    <Text
                        as='p'
                        align='center'
                        className='login-required-modal__funny-message'
                    >
                        {funnyMessage}
                    </Text>
                    
                    <Text
                        as='p'
                        align='center'
                        className='login-required-modal__description'
                    >
                        {localize('Join the Binary FX party! We promise it\'s more fun than watching paint dry... probably. 🎉')}
                    </Text>
                    
                    <div className='login-required-modal__actions'>
                        <Button
                            onClick={handleLogin}
                            primary
                            large
                            className='login-required-modal__login-btn'
                        >
                            {localize('🔐 Login (I have an account)')}
                        </Button>
                        
                        <Button
                            onClick={handleCreateAccount}
                            secondary
                            large
                            className='login-required-modal__create-btn'
                        >
                            {localize('🎯 Create Account (Let\'s do this!)')}
                        </Button>
                    </div>
                    
                    <div className='login-required-modal__footer'>
                        <Text
                            as='p'
                            align='center'
                            className='login-required-modal__footer-text'
                        >
                            {localize('Don\'t worry, we don\'t bite... much. 😉')}
                        </Text>
                        
                        <div className='login-required-modal__social-mini'>
                            <Text
                                as='p'
                                align='center'
                                className='login-required-modal__social-text'
                            >
                                {localize('Follow us for trading memes:')}
                            </Text>
                            <div className='login-required-modal__social-links-mini'>
                                <a 
                                    href='https://t.me/binaryfx_site' 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    className='login-required-modal__social-link-mini'
                                    title='Telegram'
                                >
                                    📱
                                </a>
                                <a 
                                    href='https://youtube.com/@binary_fx?si=t-M-Ihq8gVZEaRBG' 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    className='login-required-modal__social-link-mini'
                                    title='YouTube'
                                >
                                    📺
                                </a>
                                <a 
                                    href='https://tiktok.com/@binary_fx_academy' 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    className='login-required-modal__social-link-mini'
                                    title='TikTok'
                                >
                                    🎵
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default LoginRequiredModal;
