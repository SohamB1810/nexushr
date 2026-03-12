import { useState, useEffect } from 'react';
import { getAllLeaves, reviewLeave } from '../../services/api';
import { CheckCircle, XCircle, Filter } from 'lucide-react';

// Backend can return dates as "2026-03-02" strings OR [2026,3,2] arrays
// This normalises both into a JS Date (local time, no UTC offset)
const parseDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) {
    // [year, month, day]  — month is 1-based from Java
    return new Date(d[0], d[1] - 1, d[2]);
  }
  // "2026-03-02"
  const [y, m, day] = String(d).split('-').map(Number);
  return new Date(y, m - 1, day);
};

const countDays = (start, end) => {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e || e < s) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const formatDate = (d) => {
  if (!d) return '—';
  const dt = parseDate(d);
  if (!dt) return '—';
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const load = () => getAllLeaves().then(r => setLeaves(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleReview = async (id, status) => {
    try {
      await reviewLeave(id, { status, reviewedBy: 'HR Admin', remarks: `${status} by HR` });
      load();
    } catch(e) { alert(e.response?.data || 'Error'); }
  };

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);
  const counts = {
    ALL: leaves.length,
    PENDING:  leaves.filter(l => l.status === 'PENDING').length,
    APPROVED: leaves.filter(l => l.status === 'APPROVED').length,
    REJECTED: leaves.filter(l => l.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">HR Management</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Leave Requests</h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 animate-fade-up delay-100">
        {[['ALL','All Requests','badge-blue'],['PENDING','Pending','badge-orange'],['APPROVED','Approved','badge-green'],['REJECTED','Rejected','badge-red']].map(([v, l, cls]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-300 border ${filter === v ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border text-dim hover:border-accent/20 hover:text-bright'}`}>
            {l}
            <span className={`${cls} text-xs`}>{counts[v]}</span>
          </button>
        ))}
      </div>

      {/* Leave cards */}
      <div className="space-y-3 animate-fade-up delay-200">
        {filtered.length === 0 ? (
          <div className="stat-card text-center py-16">
            <Filter size={32} className="text-muted mx-auto mb-3" />
            <p className="text-dim font-body">No leave requests found</p>
          </div>
        ) : filtered.map(l => {
          const days = countDays(l.startDate, l.endDate);
          return (
            <div key={l.id} className="stat-card flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
                {l.employee?.firstName?.[0]}{l.employee?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-body font-semibold text-bright">{l.employee?.firstName} {l.employee?.lastName}</p>
                  <span className={l.status === 'PENDING' ? 'badge-orange' : l.status === 'APPROVED' ? 'badge-green' : 'badge-red'}>{l.status}</span>
                  <span className="badge-purple">{l.leaveType}</span>
                  {/* Day count badge — always visible */}
                  <span className="badge-blue font-mono">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-muted flex-wrap">
                  <span>📅 {formatDate(l.startDate)} → {formatDate(l.endDate)}</span>
                  <span>Applied: {formatDate(l.appliedOn)}</span>
                  {l.reason && <span className="text-dim truncate max-w-xs">"{l.reason}"</span>}
                </div>
              </div>
              {l.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleReview(l.id, 'APPROVED')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-3/10 border border-accent-3/20 text-accent-3 text-sm font-body font-medium hover:bg-accent-3/20 transition-all">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => handleReview(l.id, 'REJECTED')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body font-medium hover:bg-red-500/20 transition-all">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
              {l.status !== 'PENDING' && (
                <div className="text-right text-xs font-mono text-muted flex-shrink-0">
                  <p>By: {l.reviewedBy || '—'}</p>
                  <p className="text-dim">{l.reviewRemarks}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
