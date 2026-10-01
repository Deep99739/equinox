// Auth utility functions for consistent session management
import { logout } from '../api/authApi';

export const isAuthenticated = (): boolean => {
    return localStorage.getItem('signedIn') === 'true';
};

export const getUserEmail = (): string => {
    return localStorage.getItem('user_email') || '';
};

export const setAuth = (email: string): void => {
    localStorage.setItem('signedIn', 'true');
    localStorage.setItem('user_email', email);
};

export const clearAuth = (): void => {
    localStorage.removeItem('signedIn');
    localStorage.removeItem('user_email');
};

export const signOut = async (): Promise<void> => {
    try {
        await logout();
    } catch (error) {
        console.error('Sign-out failed', error);
        window.alert('Could not sign out. Please try again.');
        return;
    }
    clearAuth();
    window.location.href = '/';
};
