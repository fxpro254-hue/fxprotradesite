/**
 * Email Storage Debug Utility
 * Copy and paste this into your browser console to check email storage
 */

// Function to check email storage status
function checkEmailStorage() {
    console.log('=== Email Storage Debug ===');
    
    // Check for email
    const email = localStorage.getItem('userEmail');
    console.log('📧 userEmail:', email || '❌ Not stored');
    
    // Check for auth token
    const authToken = localStorage.getItem('authToken');
    console.log('🔑 authToken:', authToken ? '✅ Present (' + authToken.substring(0, 10) + '...)' : '❌ Not stored');
    
    // Check active login
    const activeLoginId = localStorage.getItem('active_loginid');
    console.log('👤 active_loginid:', activeLoginId || '❌ Not set');
    
    // Check all accounts
    const accountsList = localStorage.getItem('accountsList');
    if (accountsList) {
        try {
            const accounts = JSON.parse(accountsList);
            console.log('📋 All accounts:', Object.keys(accounts));
        } catch (e) {
            console.log('📋 accountsList:', accountsList);
        }
    } else {
        console.log('📋 accountsList: ❌ Not set');
    }
    
    // Show all localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log('🔍 All localStorage keys (' + allKeys.length + '):', allKeys);
    
    // Check if user is authenticated
    const isAuthenticated = !!(authToken && activeLoginId);
    console.log('\n🎯 Status:', isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED');
    
    if (!isAuthenticated) {
        console.log('\n💡 To see email stored:');
        console.log('   1. Go to Trading Hub page');
        console.log('   2. Enter your API token');
        console.log('   3. Click Authenticate');
        console.log('   4. Run checkEmailStorage() again');
    }
    
    return {
        email,
        authToken: authToken ? 'present' : 'missing',
        activeLoginId,
        isAuthenticated,
        allKeys
    };
}

// Make it available globally
window.checkEmailStorage = checkEmailStorage;

console.log('✅ Debug utility loaded! Type checkEmailStorage() to check email storage');
