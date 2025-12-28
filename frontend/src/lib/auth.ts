export interface User {
  id: number;
  username: string;
  role: string;
  maxDevices: number;
  createdAt: string;
}

export function setAuth(token: string, user: User) {
  // Lưu vào cả localStorage và cookies cho middleware
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set cookies cho server-side middleware
  document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;
  document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=3600; SameSite=Lax`;
}

export function getAuth(): { token: string | null; user: User | null } {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Xóa cả cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function isAuthenticated(): boolean {
  const { token } = getAuth();
  return !!token;
}

export function isAdmin(): boolean {
  const { user } = getAuth();
  return user?.role === 'admin';
}

export function isUser(): boolean {
  const { user } = getAuth();
  return user?.role === 'user';
}
