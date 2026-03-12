import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const CREDS_KEY  = 'hr_creds_v1';
const PROFILE_KEY = 'hr_user';

// Soham is the HR admin. Any employee in "Human Resources" department ALSO gets admin access.
const SEED_CREDS = [
  { email: 'soham@company.com', password: 'admin123', role: 'HR_ADMIN' },
  { email: 'rahul@company.com', password: 'emp123',   role: 'EMPLOYEE' },
];

function loadCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (!raw) { localStorage.setItem(CREDS_KEY, JSON.stringify(SEED_CREDS)); return [...SEED_CREDS]; }
    const saved = JSON.parse(raw);
    const merged = [...SEED_CREDS];
    saved.forEach(s => {
      const idx = merged.findIndex(d => d.email.toLowerCase() === s.email.toLowerCase());
      if (idx >= 0) merged[idx] = s; else merged.push(s);
    });
    return merged;
  } catch { return [...SEED_CREDS]; }
}

function saveCreds(creds) { localStorage.setItem(CREDS_KEY, JSON.stringify(creds)); }

// Employees in "Human Resources" department get HR_ADMIN role
function resolveRole(credRole, emp) {
  if (credRole === 'HR_ADMIN') return 'HR_ADMIN';
  if (emp?.department?.name?.toLowerCase().includes('human resource')) return 'HR_ADMIN';
  return 'EMPLOYEE';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
  });

  const login = async (email, password) => {
    const creds = loadCreds();
    const cred = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (!cred) return { success: false, error: 'Invalid email or password.' };

    let profile = {
      employeeId:  null,
      name:        email.split('@')[0],
      email:       email.toLowerCase(),
      role:        cred.role,
      avatar:      email[0].toUpperCase(),
      dept:        cred.role === 'HR_ADMIN' ? 'Human Resources' : 'General',
      designation: '',
    };

    try {
      const res = await axios.get('http://localhost:8080/employees');
      const emp = res.data.find(e => e.email?.toLowerCase() === email.toLowerCase());
      if (emp) {
        const resolvedRole = resolveRole(cred.role, emp);
        profile = {
          ...profile,
          employeeId:  emp.id,
          name:        `${emp.firstName} ${emp.lastName}`,
          avatar:      `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`,
          dept:        emp.department?.name ?? profile.dept,
          designation: emp.designation ?? '',
          role:        resolvedRole,
        };
      }
    } catch { /* backend offline — use basic profile */ }

    setUser(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return { success: true, role: profile.role };
  };

  const updatePassword = (email, currentPassword, newPassword) => {
    const creds = loadCreds();
    const idx = creds.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { success: false, error: 'Account not found.' };
    if (creds[idx].password !== currentPassword) return { success: false, error: 'Current password is incorrect.' };
    creds[idx] = { ...creds[idx], password: newPassword };
    saveCreds(creds);
    return { success: true };
  };

  const addUserCredential = (email, password = 'emp123') => {
    const creds = loadCreds();
    if (!creds.find(c => c.email.toLowerCase() === email.toLowerCase())) {
      creds.push({ email: email.toLowerCase(), password, role: 'EMPLOYEE' });
      saveCreds(creds);
    }
  };

  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get('http://localhost:8080/employees');
      const emp = res.data.find(e => e.email?.toLowerCase() === user.email.toLowerCase());
      if (emp) {
        const creds = loadCreds();
        const cred = creds.find(c => c.email.toLowerCase() === user.email.toLowerCase());
        const resolvedRole = resolveRole(cred?.role ?? 'EMPLOYEE', emp);
        const updated = {
          ...user, employeeId: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          avatar: `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`,
          dept: emp.department?.name ?? user.dept,
          designation: emp.designation ?? '',
          role: resolvedRole,
        };
        setUser(updated);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      }
    } catch {}
  };

  const logout = () => { setUser(null); localStorage.removeItem(PROFILE_KEY); };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, addUserCredential, updatePassword, isAdmin: user?.role === 'HR_ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
