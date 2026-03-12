import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPerformanceByEmployee, getAllPerformance, addReview, getEmployees } from '../../services/api';
import { Star, Plus, X } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'} />
      ))}
    </div>
  );
}

const gradeColors = { EXCELLENT: 'badge-green', GOOD: 'badge-blue', AVERAGE: 'badge-orange', BELOW_AVERAGE: 'badge-red', POOR: 'badge-red' };

export default function PerformancePage({ isAdmin = false }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', rating: 3, feedback: '', reviewerName: 'HR Admin', reviewPeriod: 'Q1', year: new Date().getFullYear() });

  const load = () => {
    if (isAdmin) getAllPerformance().then(r => setReviews(r.data)).catch(() => {});
    else getPerformanceByEmployee(user?.employeeId).then(r => setReviews(r.data)).catch(() => {});
    if (isAdmin) getEmployees().then(r => setEmployees(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReview({ ...form, employee: { id: parseInt(form.employeeId) } });
    load(); setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">{isAdmin ? 'HR Management' : 'My Growth'}</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Performance Reviews</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-white">
            {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Add Review</>}
          </button>
        )}
      </div>

      {showForm && (
        <div className="stat-card mb-6 animate-fade-up border border-accent/20">
          <h3 className="section-title mb-5">Add Performance Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Employee</label>
                <select className="input-field" value={form.employeeId} onChange={e => setForm({...form,employeeId:e.target.value})} required>
                  <option value="">Select...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Rating (1-5)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={5} value={form.rating} onChange={e => setForm({...form,rating:parseInt(e.target.value)})} className="flex-1 accent-yellow-400" />
                  <StarRating rating={form.rating} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Period</label>
                <select className="input-field" value={form.reviewPeriod} onChange={e => setForm({...form,reviewPeriod:e.target.value})}>
                  {['Q1','Q2','Q3','Q4','ANNUAL'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Year</label>
                <input type="number" className="input-field" value={form.year} onChange={e => setForm({...form,year:parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Reviewer</label>
                <input className="input-field" value={form.reviewerName} onChange={e => setForm({...form,reviewerName:e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Feedback</label>
              <textarea className="input-field min-h-20 resize-none" value={form.feedback} onChange={e => setForm({...form,feedback:e.target.value})} placeholder="Performance feedback..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary text-white">Submit Review</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4 animate-fade-up delay-100">
        {reviews.length === 0 ? (
          <div className="stat-card text-center py-16">
            <Star size={32} className="text-muted mx-auto mb-3" />
            <p className="text-dim font-body">No performance reviews yet</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className="stat-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(249,115,22,0.15))', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <Star size={16} className="text-yellow-400" />
                </div>
                <div>
                  {isAdmin && <p className="font-display font-semibold text-bright mb-1">{r.employee?.firstName} {r.employee?.lastName}</p>}
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={r.rating} />
                    <span className={gradeColors[r.grade] || 'badge-blue'}>{r.grade}</span>
                    <span className="badge-purple">{r.reviewPeriod} {r.year}</span>
                  </div>
                  {r.feedback && <p className="text-sm font-body text-dim">{r.feedback}</p>}
                  <p className="text-xs font-mono text-muted mt-2">Reviewed by {r.reviewerName} · {r.reviewDate}</p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: r.rating>=4?'rgba(6,214,160,0.1)':r.rating>=3?'rgba(79,142,247,0.1)':'rgba(239,68,68,0.1)', border: `1px solid ${r.rating>=4?'rgba(6,214,160,0.2)':r.rating>=3?'rgba(79,142,247,0.2)':'rgba(239,68,68,0.2)'}` }}>
                <span className="font-display font-bold text-2xl" style={{ color: r.rating>=4?'#06d6a0':r.rating>=3?'#4f8ef7':'#ef4444' }}>{r.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
