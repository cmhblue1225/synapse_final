import { authApi } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/api';

export class AuthService {
  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens and user info
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens and user info
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authApi.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });

    localStorage.setItem('accessToken', response.accessToken);
    return response.accessToken;
  }

  // User profile
  async getCurrentUser(): Promise<User> {
    return await authApi.get<User>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return await authApi.put<User>('/auth/profile', userData);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authApi.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}

export const authService = new AuthService();