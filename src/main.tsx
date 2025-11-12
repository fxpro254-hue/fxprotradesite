import ReactDOM from 'react-dom/client';
import { AuthWrapper } from './app/AuthWrapper';
import { AnalyticsInitializer } from './utils/analytics';
import './styles/index.scss';

AnalyticsInitializer();

// Add debug utility to window for checking email storage
if (typeof window !== 'undefined') {
    (window as any).checkUserEmail = () => {
        const email = localStorage.getItem('userEmail');
        const token = localStorage.getItem('authToken');
        const activeLoginId = localStorage.getItem('active_loginid');
        
        console.log('%c=== User Email Storage Debug ===', 'color: #4CAF50; font-weight: bold; font-size: 14px');
        console.log('📧 Email:', email || '❌ Not stored yet');
        console.log('🔑 Auth Token:', token ? '✅ Present' : '❌ Missing');
        console.log('👤 Active Login ID:', activeLoginId || '❌ Not set');
        console.log('📦 All localStorage keys:', Object.keys(localStorage));
        
        if (!email && !token) {
            console.log('%c💡 TIP: Email will be stored automatically when you authenticate', 'color: #2196F3; font-style: italic');
            console.log('   You need to log in first!');
        }
        
        return { email, hasToken: !!token, activeLoginId };
    };
    
    console.log('%c🔍 Debug Utility Available!', 'color: #FF9800; font-weight: bold');
    console.log('Type %ccheckUserEmail()%c in console to check email storage', 'color: #4CAF50; font-weight: bold', 'color: inherit');
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AuthWrapper />);
