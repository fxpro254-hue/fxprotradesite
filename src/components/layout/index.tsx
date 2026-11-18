import clsx from 'clsx';
import { Outlet } from 'react-router-dom';
import { useDevice } from '@deriv-com/ui';
import { DisclaimerButton } from '../disclaimer';
import Footer from './footer';
import AppHeader from './header';
import Body from './main-body';
import NotificationBanner from '../notification-banner';
import CommunityFloatingIcon from '../community-floating-icon';
import NetworkSpeedIndicator from '../network-speed-indicator';
import './layout.scss';

const Layout = () => {
    const { isDesktop } = useDevice();

    const isCallbackPage = window.location.pathname === '/callback';

    return (
        <div className={clsx('layout', { responsive: isDesktop })}>
            {!isCallbackPage && <AppHeader />}
           {/* {!isCallbackPage && <NotificationBanner />} */}
            <Body>
                <Outlet />
            </Body>
            {!isCallbackPage && <DisclaimerButton />}
            {!isCallbackPage && isDesktop && <Footer />}
            {!isCallbackPage && <CommunityFloatingIcon />}
            {!isCallbackPage && <NetworkSpeedIndicator />}
        </div>
    );
};

export default Layout;
