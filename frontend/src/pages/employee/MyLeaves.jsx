import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applyLeave, getLeavesByEmployee } from '../../services/api';
import { Plus, X, FileText } from 'lucide-react';

export default function MyLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const load = () => getLeavesByEmployee(user?.employeeId).then(r => setLeaves(r.data)).catch(() => {});
  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.employeeId) {
      alert('Your employee profile could not be found. Please log out and log in again.');
      return;
    }
    setLoading(true);
    try {
      await applyLeave({ ...form, employee: { id: user.employeeId } });
      load(); setShowForm(false);
      setForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
    } catch(err) { alert(err.response?.data || 'Error applying leave'); }
    setLoading(false);
  };

  // Backend returns dates as [year,month,day] arrays OR "yyyy-mm-dd" strings
  const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
    const [y, m, day] = String(d).split('-').map(Number);
    return new Date(y, m - 1, day);
  };
  const days = (s, e) => {
    const start = parseDate(s); const end = parseDate(e);
    if (!start || !end || end < start) return 0;
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };
  const fmt = (d) => { const dt = parseDate(d); return dt ? dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'; };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">My Workspace</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Leave Requests</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-white">
          {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Apply Leave</>}
        </button>
      </div>

      {showForm && (
        <div className="stat-card mb-6 animate-fade-up border border-accent/20">
          <h3 className="section-title mb-5">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Leave Type</label>
              <select className="input-field" value={form.leaveType} onChange={e => setForm({...form,leaveType:e.target.value})}>
                {['CASUAL','SICK','EARNED','MATERNITY','UNPAID'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Start Date</label>
                <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form,startDate:e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">End Date</label>
                <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})} required />
              </div>
            </div>
            {form.startDate && form.endDate && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
                <span className="text-xs font-mono text-accent">Duration: {days(form.startDate,form.endDate)} day(s)</span>
              </div>
            )}
            <div>
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Reason</label>
              <textarea className="input-field min-h-20 resize-none" value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} placeholder="Brief reason for leave..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary text-white flex items-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 animate-fade-up delay-100">
        {leaves.length === 0 ? (
          <div className="stat-card text-center py-16">
            <FileText size={32} className="text-muted mx-auto mb-3" />
            <p className="text-dim font-body">No leave requests yet</p>
            <p className="text-muted font-mono text-xs mt-1">Click "Apply Leave" to submit your first request</p>
          </div>
        ) : leaves.map(l => (
          <div key={l.id} className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: l.status==='APPROVED'?'rgba(6,214,160,0.15)':l.status==='PENDING'?'rgba(249,115,22,0.15)':'rgba(239,68,68,0.15)', border: `1px solid ${l.status==='APPROVED'?'rgba(6,214,160,0.3)':l.status==='PENDING'?'rgba(249,115,22,0.3)':'rgba(239,68,68,0.3)'}` }}>
              <FileText size={16} style={{ color: l.status==='APPROVED'?'#06d6a0':l.status==='PENDING'?'#f97316':'#ef4444' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-body font-semibold text-bright">{l.leaveType} Leave</span>
                <span className={l.status==='APPROVED'?'badge-green':l.status==='PENDING'?'badge-orange':'badge-red'}>{l.status}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted">
                <span>📅 {fmt(l.startDate)} → {fmt(l.endDate)}</span>
                <span className="badge-blue">{days(l.startDate,l.endDate)} day(s)</span>
                {l.reason && <span className="text-dim">"{l.reason}"</span>}
              </div>
            </div>
            {l.reviewRemarks && (
              <div className="text-right text-xs font-mono text-muted">
                <p className="text-dim">{l.reviewRemarks}</p>
                <p>— {l.reviewedBy}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
