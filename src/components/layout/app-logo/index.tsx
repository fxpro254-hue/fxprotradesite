import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <a className='app-header__logo' href='https://app.binaryfx.site' target='_blank' rel='noopener noreferrer'>
            <img src='/deriv-logo.png' alt='BinaryFX' className='app-header__logo-image' />
        </a>
    );
};
