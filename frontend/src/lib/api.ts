import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.82.26.223:3001';
// const API_URL = 'https://khoahocgiare.top';


const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and fingerprint to requests
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (token && user) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Add fingerprint for regular users (generate every time)
    if (user.role !== 'admin') {
      try {
        const fingerprint = await fingerprintManager.generateFingerprint();
        config.headers['X-Device-Fingerprint'] = fingerprint;
      } catch (error) {
        console.error('Error generating fingerprint:', error);
      }
    }
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 for protected routes, not for login endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  createUser: async (userData: { username: string; password: string; role: string; maxDevices?: number; expiresAt?: string }) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },
  updateUserRole: async (userId: number, role: string) => {
    const response = await api.put(`/auth/users/${userId}/role`, { role });
    return response.data;
  },
  updateUserMaxDevices: async (userId: number, maxDevices: number) => {
    const response = await api.put(`/auth/users/${userId}/maxDevices`, { maxDevices });
    return response.data;
  },
  updateUserExpiresAt: async (userId: number, expiresAt: string | null) => {
    const response = await api.put(`/auth/users/${userId}/expiresAt`, { expiresAt });
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};

// Device API
export const deviceAPI = {
  check: async (deviceInfo: any, fingerprint?: string) => {
    const payload: any = { deviceInfo };
    if (fingerprint) {
      payload.fingerprint = fingerprint;
    }
    const response = await api.post('/devices/check', payload);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/devices');
    return response.data;
  },
  getByUser: async (userId: number) => {
    const response = await api.get(`/devices/user/${userId}`);
    return response.data;
  },
  delete: async (deviceId: number) => {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
  },
};

// Video API
export const videoAPI = {
  upload: async (data: { videoUrl: string; title?: string }) => {
    const response = await api.post('/videos', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/videos');
    return response.data;
  },
  getOne: async (videoId: number) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },
  update: async (videoId: number, data: { videoUrl: string; title?: string }) => {
    const response = await api.put(`/videos/${videoId}`, data);
    return response.data;
  },
  delete: async (videoId: number) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },
};

// Device info helper
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
}

// Import FingerprintJS
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Fingerprint management using FingerprintJS
export const fingerprintManager = {
  // Generate fingerprint using FingerprintJS
  async generateFingerprint(): Promise<string> {
    try {
      // Load the FingerprintJS agent
      const fp = await FingerprintJS.load();
      
      // Get the visitor identifier
      const result = await fp.get();
      
      // Use the visitorId as fingerprint
      return result.visitorId;
    } catch (error) {
      console.error('Error generating fingerprint:', error);
      // Fallback to simple hash if FingerprintJS fails
      return this.generateFallbackFingerprint();
    }
  },
  
  // Fallback fingerprint generation
  generateFallbackFingerprint(): string {
    const deviceInfo = getDeviceInfo();
    const fingerprintString = JSON.stringify(deviceInfo);
    return btoa(fingerprintString).substring(0, 32);
  },
  
  // Generate fingerprint mới mỗi lần gọi (không lưu localStorage)
  async getFreshFingerprint(): Promise<string> {
    return await this.generateFingerprint();
  }
};

export default api;
