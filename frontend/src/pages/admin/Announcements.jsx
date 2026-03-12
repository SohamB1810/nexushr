import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, archiveAnnouncement } from '../../services/api';
import { Megaphone, Plus, Archive, X } from 'lucide-react';

export default function Announcements({ isAdmin = true }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetDepartment: 'ALL', postedBy: 'HR Admin' });

  const load = () => getAnnouncements().then(r => setAnnouncements(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAnnouncement(form); load(); setShowForm(false);
    setForm({ title: '', message: '', targetDepartment: 'ALL', postedBy: 'HR Admin' });
  };

  const handleArchive = async (id) => { await archiveAnnouncement(id); load(); };

  const deptColors = { ALL: 'badge-blue', Engineering: 'badge-purple', 'Human Resources': 'badge-green', Finance: 'badge-orange', Sales: 'badge-blue', Marketing: 'badge-red' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Communications</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Announcements</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-white">
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Announcement</>}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="stat-card mb-6 animate-fade-up border border-accent/20">
          <h3 className="section-title mb-5">Create Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Title</label>
              <input className="input-field" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Announcement title..." required />
            </div>
            <div>
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Message</label>
              <textarea className="input-field min-h-24 resize-none" value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder="Write your announcement..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Target Department</label>
                <select className="input-field" value={form.targetDepartment} onChange={e => setForm({...form,targetDepartment:e.target.value})}>
                  {['ALL','Engineering','Human Resources','Finance','Sales','Marketing'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Posted By</label>
                <input className="input-field" value={form.postedBy} onChange={e => setForm({...form,postedBy:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary text-white flex items-center gap-2"><Megaphone size={15} /> Publish</button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements list */}
      <div className="space-y-4 animate-fade-up delay-100">
        {announcements.length === 0 ? (
          <div className="stat-card text-center py-16">
            <Megaphone size={32} className="text-muted mx-auto mb-3" />
            <p className="text-dim font-body">No announcements yet</p>
          </div>
        ) : announcements.map((a, i) => (
          <div key={a.id} className="stat-card group" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', boxShadow: '0 0 20px rgba(79,142,247,0.2)' }}>
                  <Megaphone size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-semibold text-bright">{a.title}</h3>
                    <span className={deptColors[a.targetDepartment] || 'badge-blue'}>{a.targetDepartment}</span>
                  </div>
                  <p className="text-sm font-body text-dim leading-relaxed mb-3">{a.message}</p>
                  <div className="flex items-center gap-4 text-xs font-mono text-muted">
                    <span>By {a.postedBy}</span>
                    <span>·</span>
                    <span>{a.postedOn}</span>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => handleArchive(a.id)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted hover:text-dim hover:border-accent/30 transition-all text-xs font-mono">
                  <Archive size={13} /> Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
