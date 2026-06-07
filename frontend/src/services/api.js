const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TOKEN_KEY = 'plandaya_token';
const USER_KEY  = 'plandaya_user';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken  = ()            => localStorage.getItem(TOKEN_KEY);
export const setToken  = (token)       => localStorage.setItem(TOKEN_KEY, token);
export const clearAuth = ()            => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };
export const getUser   = ()            => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
export const setUser   = (user)        => localStorage.setItem(USER_KEY, JSON.stringify(user));

// ─── Base fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, message: data.message || 'Request failed', data };
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  logout:   ()     => apiFetch('/auth/logout',   { method: 'POST' }),
  me:       ()     => apiFetch('/auth/me'),
};

// ─── Devices ──────────────────────────────────────────────────────────────────
export const devices = {
  list:   ()           => apiFetch('/devices'),
  create: (body)       => apiFetch('/devices',     { method: 'POST',   body: JSON.stringify(body) }),
  get:    (id)         => apiFetch(`/devices/${id}`),
  update: (id, body)   => apiFetch(`/devices/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: (id)         => apiFetch(`/devices/${id}`, { method: 'DELETE' }),
};

// ─── Schedules ────────────────────────────────────────────────────────────────
export const schedules = {
  list:   ()           => apiFetch('/schedules'),
  create: (body)       => apiFetch('/schedules',     { method: 'POST',   body: JSON.stringify(body) }),
  get:    (id)         => apiFetch(`/schedules/${id}`),
  update: (id, body)   => apiFetch(`/schedules/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: (id)         => apiFetch(`/schedules/${id}`, { method: 'DELETE' }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = {
  daily:      (params = {}) => apiFetch('/reports/daily?'      + new URLSearchParams(params)),
  weekly:     (params = {}) => apiFetch('/reports/weekly?'     + new URLSearchParams(params)),
  monthly:    (params = {}) => apiFetch('/reports/monthly?'    + new URLSearchParams(params)),
  topDevices: (params = {}) => apiFetch('/reports/top-devices?'+ new URLSearchParams(params)),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const admin = {
  dashboard:      () => apiFetch('/admin/dashboard'),
  users:          () => apiFetch('/admin/users'),
  logs:           () => apiFetch('/admin/logs'),
  securityEvents: () => apiFetch('/admin/security-events'),
};

export default { auth, devices, schedules, reports, admin };
