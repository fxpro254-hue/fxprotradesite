const params = new URLSearchParams(window.location.search);
const status = document.getElementById('status');
const list = document.getElementById('accounts');
const logout = document.getElementById('logout');
const completedSignIn = params.has('code') && !params.has('error');

async function showAccounts() {
    if (params.has('code') || params.has('error')) {
        const callback = Object.fromEntries(['code', 'state', 'error'].map(key => [key, params.get(key)]));
        ['code', 'state', 'error', 'error_description', 'error_uri', 'session_state', 'iss'].forEach(key => params.delete(key));
        const query = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
        const result = await fetch('/api/deriv/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callback),
        });
        if (!result.ok) {
            status.textContent = result.status === 503
                ? 'The website could not save your Deriv session. Please try again later.'
                : 'Deriv sign-in could not be completed. Start a new sign-in to try again.';
            return;
        }

    }

    const result = await fetch('/api/deriv/accounts');
    if (result.status === 401) {
        status.textContent = 'Sign in to view your Deriv Options accounts.';
        return;
    }
    if (!result.ok) throw new Error('Accounts unavailable');

    const { accounts, unsupportedAccountCount } = await result.json();
    if (completedSignIn && accounts.some(account => account.status === 'active')) {
        window.location.replace('/');
        return;
    }
    status.textContent = accounts.length
        ? 'Deriv is connected. Return to FxPro Trades to open the trading workspace.'
        : unsupportedAccountCount
            ? 'Deriv is connected, but FxPro Trades could not read the Options accounts returned for this login.'
            : 'Deriv is connected. Deriv returned no Options accounts for this login.';
    for (const account of accounts) {
        const item = document.createElement('li');
        item.textContent = [account.account_type, account.account_id, account.currency, account.status].join(' · ');
        list.appendChild(item);
    }
    list.hidden = !accounts.length;
    logout.hidden = false;
}

logout.addEventListener('click', async () => {
    logout.disabled = true;
    try {
        const result = await fetch('/api/deriv/logout', { method: 'POST' });
        if (!result.ok) throw new Error('Sign-out failed');
        window.location.reload();
    } catch {
        status.textContent = 'Sign-out failed. Please try again.';
        logout.disabled = false;
    }
});

showAccounts().catch(() => {
    status.textContent = 'Deriv accounts are temporarily unavailable. Please try again.';
});
