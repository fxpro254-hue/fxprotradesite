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
        // Redirect to Deriv signup page
        const redirect_uri = encodeURIComponent(`${window.location.origin}/callback`);
        const url = `https://track.deriv.com/__rVf-VSveO71k0YPxVS0A2Nd7ZgqdRLk/1/`;
        window.open(url, '_blank');
    };

    // Don't render if user is logged in or client is not initialized
    if (client?.is_logged_in || client === undefined) {
        return null;
    }

    return (
        <Modal
            is_open={isModalOpen}
            className='login-required-modal'
            width='400px'
            should_close_on_click_outside={false}
            has_close_icon={false}
            portalId='modal_root'
        >
            <Modal.Body>
                <div className='login-required-modal__content'>
                    <Text
                        as='h2'
                        align='center'
                        weight='bold'
                        className='login-required-modal__title'
                    >
                        {localize('Login Required')}
                    </Text>
                    
                    <Text
                        as='p'
                        align='center'
                        className='login-required-modal__description'
                    >
                        {localize('Please login or create an account to continue')}
                    </Text>
                    
                    <div className='login-required-modal__actions'>
                        <Button
                            onClick={handleLogin}
                            primary
                            large
                            className='login-required-modal__login-btn'
                        >
                            {localize('Login')}
                        </Button>
                        
                        <Button
                            onClick={handleCreateAccount}
                            secondary
                            large
                            className='login-required-modal__create-btn'
                        >
                            {localize('Create Account')}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default LoginRequiredModal;
