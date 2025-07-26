// Union types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Authentication endpoints
export interface LoginCredentials {
  email: string;
  password: string;
  recaptcha_token?: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  recaptcha_token?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  is_active: boolean;
  oauth_provider?: string;
  github_username?: string;
  google_email?: string;
  avatar_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  recaptcha_token?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
