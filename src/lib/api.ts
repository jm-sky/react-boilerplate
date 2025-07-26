import axios, { HttpStatusCode, AxiosInstance } from 'axios';
import {
  ApiResponse,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterRequest,
  OAuthCallbackRequest,
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (!this.authToken) {
          this.loadAuthFromStorage();
        }
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          // Don't redirect if this is a login/register request (expected 401)
          const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                               error.config?.url?.includes('/auth/register');

          if (!isAuthRequest) {
            this.clearAuth();
            window.location.href = '/login?reason=session-expired';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuth(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  loadAuthFromStorage() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authToken = token;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string, recaptchaToken?: string | null): Promise<ApiResponse<AuthResponse>> {
    const data: LoginCredentials = { email, password };
    if (recaptchaToken) {
      data.recaptcha_token = recaptchaToken;
    }
    const response = await this.client.post('/api/v1/auth/login', data);
    return response.data;
  }

  async register(email: string, password: string, name: string, recaptchaToken?: string | null): Promise<ApiResponse<AuthResponse>> {
    const data: RegisterRequest = { email, password, name };
    if (recaptchaToken) {
      data.recaptcha_token = recaptchaToken;
    }
    const response = await this.client.post('/api/v1/auth/register', data);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/v1/auth/reset-password', { token, password });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }

  // OAuth endpoints
  async getOAuthAuthUrl(provider: string): Promise<ApiResponse<{ auth_url: string; state: string }>> {
    const response = await this.client.post('/api/v1/auth/oauth/auth-url', { provider });
    return response.data;
  }

  async oauthCallback(provider: string, code: string, state: string, recaptchaToken?: string | null): Promise<ApiResponse<AuthResponse>> {
    const data: OAuthCallbackRequest = { code, state };
    if (recaptchaToken) {
      data.recaptcha_token = recaptchaToken;
    }
    const response = await this.client.post(`/api/v1/auth/oauth/${provider}/callback`, data);
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/api/v1/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/api/v1/user/profile', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
