import { useState, useEffect } from 'react';
import { getDepartments, createDepartment, deleteDepartment, getEmployees } from '../../services/api';
import { Building2, Plus, Trash2, AlertCircle, CheckCircle, Users, ChevronDown, ChevronRight, Search } from 'lucide-react';

const deptColors = ['#4f8ef7','#7c3aed','#06d6a0','#f97316','#ef4444','#eab308','#ec4899','#14b8a6'];

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl animate-fade-up ${
      toast.type === 'success' ? 'bg-accent-3/10 border-accent-3/30 text-accent-3' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
      {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
      <span className="text-sm font-body">{toast.msg}</span>
    </div>
  );
}

export default function Departments() {
  const [departments,  setDepartments]  = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [name,         setName]         = useState('');
  const [loading,      setLoading]      = useState(false);
  const [expanded,     setExpanded]     = useState(null);   // dept id that's open
  const [search,       setSearch]       = useState('');
  const [toast,        setToast]        = useState(null);

  const showToast = (type, msg) => { setToast({type, msg}); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    try { const r = await getDepartments(); setDepartments(r.data); } catch { showToast('error','Failed to load departments — is backend running?'); }
    try { const r = await getEmployees();   setEmployees(r.data);   } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await createDepartment({ name: trimmed });
      setName('');
      await load();
      showToast('success', `"${trimmed}" created successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? err.message ?? 'Failed to create department';
      showToast('error', String(msg));
    }
    setLoading(false);
  };

  const handleDelete = async (id, deptName) => {
    if (!window.confirm(`Delete "${deptName}"?\nEmployees will be unassigned from this department.`)) return;
    try {
      await deleteDepartment(id);
      if (expanded === id) setExpanded(null);
      await load();
      showToast('success', `"${deptName}" deleted.`);
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? 'Delete failed';
      showToast('error', String(msg));
    }
  };

  // Get employees belonging to a department
  const deptEmployees = (deptId) => employees.filter(e => e.department?.id === deptId);

  // Filter departments by search
  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    deptEmployees(d.id).some(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <Toast toast={toast}/>

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Organization</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Departments</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up delay-100">
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
            <Building2 size={20} className="text-accent"/>
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-bright">{departments.length}</p>
            <p className="text-xs font-body text-muted">Total Departments</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Users size={20} style={{ color: '#7c3aed' }}/>
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-bright">{employees.length}</p>
            <p className="text-xs font-body text-muted">Total Employees</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.2)' }}>
            <Users size={20} style={{ color: '#06d6a0' }}/>
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-bright">
              {departments.length > 0 ? (employees.length / departments.length).toFixed(1) : '—'}
            </p>
            <p className="text-xs font-body text-muted">Avg per Department</p>
          </div>
        </div>
      </div>

      {/* Add + Search row */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-up delay-150">
        <div className="stat-card">
          <h3 className="section-title mb-4">Add New Department</h3>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              className="input-field flex-1"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. DevOps, Legal, Finance..."
              maxLength={100}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !name.trim()}
              className="btn-primary flex items-center gap-2 text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><Plus size={15}/> Add</>}
            </button>
          </form>
        </div>

        <div className="stat-card flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"/>
            <input
              className="input-field pl-11"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search departments or employees..."
            />
          </div>
        </div>
      </div>

      {/* Department accordion list */}
      {filtered.length === 0 ? (
        <div className="stat-card text-center py-16 animate-fade-up">
          <Building2 size={32} className="text-muted mx-auto mb-3"/>
          <p className="text-dim font-body">{departments.length === 0 ? 'No departments yet' : 'No results found'}</p>
          <p className="text-muted font-mono text-xs mt-1">{departments.length === 0 ? 'Add your first department above' : 'Try a different search'}</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up delay-200">
          {filtered.map((d, i) => {
            const color   = deptColors[departments.indexOf(d) % deptColors.length];
            const emps    = deptEmployees(d.id);
            const isOpen  = expanded === d.id;

            return (
              <div key={d.id} className="stat-card overflow-hidden transition-all duration-300">
                {/* Department header row */}
                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => setExpanded(isOpen ? null : d.id)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Building2 size={20} style={{ color }}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-bright">{d.name}</p>
                    <p className="text-xs font-mono text-muted">{emps.length} employee{emps.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Employee avatars preview */}
                  {emps.length > 0 && !isOpen && (
                    <div className="flex -space-x-2">
                      {emps.slice(0, 4).map(emp => (
                        <div key={emp.id}
                          title={`${emp.firstName} ${emp.lastName}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold text-white border-2 border-void flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                      ))}
                      {emps.length > 4 && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono text-muted bg-surface border-2 border-void">
                          +{emps.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={ev => { ev.stopPropagation(); handleDelete(d.id, d.name); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14}/>
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg text-muted transition-all">
                      {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </div>
                  </div>
                </div>

                {/* Expanded employee list */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {emps.length === 0 ? (
                      <div className="text-center py-6">
                        <Users size={24} className="text-muted mx-auto mb-2"/>
                        <p className="text-xs font-body text-muted">No employees in this department yet</p>
                        <p className="text-xs font-mono text-muted/60 mt-0.5">Assign employees from the Employees page</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emps.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface transition-colors">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-display font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-body font-medium text-bright">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs font-mono text-muted">{emp.designation || 'No designation'} · {emp.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={emp.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>
                                {emp.status}
                              </span>
                              <span className="badge-blue text-xs">
                                {(emp.employmentType || 'FULL_TIME').replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
