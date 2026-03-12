import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ChangePassword() {
  const { user, updatePassword } = useAuth();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const strength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#06d6a0'];
  const pw_strength = strength(form.newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) { showToast('error', 'New passwords do not match!'); return; }
    if (form.newPass.length < 6) { showToast('error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = updatePassword(user.email, form.current, form.newPass);
      if (result.success) {
        showToast('success', 'Password changed successfully!');
        setForm({ current: '', newPass: '', confirm: '' });
      } else {
        showToast('error', result.error || 'Current password is incorrect');
      }
    } catch {
      showToast('error', 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const Field = ({ id, label, value, onChange }) => (
    <div>
      <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show[id] ? 'text' : 'password'}
          className="input-field pr-12"
          value={value}
          onChange={onChange}
          required
        />
        <button type="button" onClick={() => toggle(id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dim transition-colors">
          {show[id] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl animate-fade-up ${
          toast.type === 'success' ? 'bg-accent-3/10 border-accent-3/30 text-accent-3' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-body">{toast.msg}</span>
        </div>
      )}

      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Account</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Change Password</h1>
      </div>

      <div className="max-w-lg animate-fade-up delay-100">
        {/* Profile card */}
        <div className="stat-card mb-6 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(79,142,247,0.12)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-display font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
            {user?.avatar}
          </div>
          <div>
            <p className="font-display font-semibold text-bright">{user?.name}</p>
            <p className="text-xs font-mono text-muted">{user?.email}</p>
            <p className="text-xs font-mono text-accent mt-0.5">{user?.role === 'HR_ADMIN' ? 'HR Admin' : 'Employee'} · {user?.dept}</p>
          </div>
          <ShieldCheck size={20} className="text-accent ml-auto" />
        </div>

        {/* Password form */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
              <Lock size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-bright">Update Password</h3>
              <p className="text-xs font-body text-muted">Choose a strong, unique password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field id="current" label="Current Password"
              value={form.current} onChange={e => setForm({...form, current: e.target.value})} />

            <div className="border-t border-border pt-5">
              <Field id="newPass" label="New Password"
                value={form.newPass} onChange={e => setForm({...form, newPass: e.target.value})} />

              {/* Strength bar */}
              {form.newPass && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pw_strength ? strengthColor[pw_strength] : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <p className="text-xs font-mono" style={{ color: strengthColor[pw_strength] }}>
                    {strengthLabel[pw_strength]}
                    {pw_strength < 3 && <span className="text-muted ml-2">— add uppercase, numbers or symbols</span>}
                  </p>
                </div>
              )}
            </div>

            <Field id="confirm" label="Confirm New Password"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />

            {/* Match indicator */}
            {form.confirm && (
              <div className={`flex items-center gap-2 text-xs font-mono ${form.newPass === form.confirm ? 'text-accent-3' : 'text-red-400'}`}>
                {form.newPass === form.confirm
                  ? <><CheckCircle size={13} /> Passwords match</>
                  : <><AlertCircle size={13} /> Passwords do not match</>}
              </div>
            )}

            {/* Tips */}
            <div className="p-4 rounded-xl bg-surface border border-border/50 space-y-1.5">
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Password Tips</p>
              {[
                ['At least 8 characters', form.newPass.length >= 8],
                ['Contains uppercase letter', /[A-Z]/.test(form.newPass)],
                ['Contains a number', /[0-9]/.test(form.newPass)],
                ['Contains a special character', /[^A-Za-z0-9]/.test(form.newPass)],
              ].map(([tip, met]) => (
                <div key={tip} className={`flex items-center gap-2 text-xs font-body ${met ? 'text-accent-3' : 'text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-accent-3' : 'bg-border'}`} />
                  {tip}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading || form.newPass !== form.confirm || !form.newPass}
              className="btn-primary w-full text-white flex items-center justify-center gap-2 h-12 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Lock size={16} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
