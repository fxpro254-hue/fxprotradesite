import App from './App';

export const AuthWrapper = () => {
    // These keys were populated by the former URL-token callback.
    ['authToken', 'accountsList', 'clientAccounts', 'callback_token'].forEach(key => localStorage.removeItem(key));
    return <App />;
};
