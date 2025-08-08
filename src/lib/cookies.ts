// Cookie utilities for authentication
export const cookieUtils = {
  /**
   * Get cookie value by name
   */
  getCookie: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  /**
   * Set cookie with options
   */
  setCookie: (
    name: string,
    value: string,
    options: {
      days?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {},
  ): void => {
    const { days = 7, path = '/', domain, secure = true, sameSite = 'lax' } = options;

    let cookieString = `${name}=${value}; path=${path}`;

    if (days > 0) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += `; secure`;
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  },

  /**
   * Remove cookie by name
   */
  removeCookie: (name: string, path: string = '/', domain?: string): void => {
    let cookieString = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  },

  /**
   * Check if cookies are enabled
   */
  areCookiesEnabled: (): boolean => {
    try {
      document.cookie = 'test=1';
      const enabled = document.cookie.indexOf('test=1') !== -1;
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return enabled;
    } catch {
      return false;
    }
  },
};

// Auth specific cookie keys
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'crm_access_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER_ID: 'crm_user_id',
  REMEMBER_ME: 'crm_remember_me',
} as const;
