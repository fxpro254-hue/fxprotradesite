// Determine API base URL based on environment
const getApiBaseUrl = () => {
    // Check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }
    // Production - use API subdomain or separate server
    // Option 1: Same domain with /api path
    // return `${window.location.origin}/api`;
    
    // Option 2: Separate API subdomain (update this URL to your API server)
    return 'https://api.binaryfx.site/api';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const handleGetCategories = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: String(error) };
    }
};

export const handleGetMessages = async (categoryId: string, limit = 50): Promise<ApiResponse<any[]>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${categoryId}?limit=${limit}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return { success: false, error: String(error) };
    }
};

export const handleCreateMessage = async (
    userId: string,
    categoryId: string,
    content: string,
    replyToId?: string,
    attachments?: { type: string; url: string }[]
): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                categoryId,
                content,
                replyToId,
                attachments,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating message:', error);
        return { success: false, error: String(error) };
    }
};

export const handleRegisterUser = async (
    loginId: string,
    fullName: string,
    avatar?: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                loginId,
                fullName,
                avatar,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error registering user:', error);
        return { success: false, error: String(error) };
    }
};

export const handleUpdateUserStatus = async (
    loginId: string,
    status: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${loginId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: String(error) };
    }
};

export const handleGetUserStats = async (loginId: string): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${loginId}/stats`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { success: false, error: String(error) };
    }
};

export const handleToggleReaction = async (
    messageId: string,
    emoji: string,
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messageId,
                emoji,
                userId,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error toggling reaction:', error);
        return { success: false, error: String(error) };
    }
};
