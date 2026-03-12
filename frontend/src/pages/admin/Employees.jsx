import { useState, useEffect } from 'react';
import { getEmployees, getDepartments, createEmployee, updateEmployee, deleteEmployee, searchEmployees, getAttendancePct, getPerformanceByEmployee } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Trash2, Edit, Users, X, CheckCircle, AlertCircle, Building2, BadgeCheck, Eye, TrendingUp, CalendarCheck, Star } from 'lucide-react';

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
      {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
      <span className="text-sm">{toast.msg}</span>
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-gray-900 border border-gray-700 rounded-2xl p-7 w-full mx-6 max-h-[90vh] overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`} style={{boxShadow:'0 25px 60px rgba(0,0,0,0.7)'}}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AttendanceRing({ pct }) {
  const r = 30, circumference = 2 * Math.PI * r;
  const filled = ((pct ?? 0) / 100) * circumference;
  const color = (pct ?? 0) >= 75 ? '#06d6a0' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center" style={{width:72,height:72}}>
      <svg width="72" height="72" style={{transform:'rotate(-90deg)'}}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute text-center">
        <p style={{color:'white',fontWeight:'bold',fontSize:13,lineHeight:1}}>{pct ?? 0}%</p>
      </div>
    </div>
  );
}

const EMPTY = {firstName:'',lastName:'',email:'',phone:'',basicSalary:'',designation:'',status:'ACTIVE',employmentType:'FULL_TIME',gender:'MALE',departmentId:''};
const now = new Date();
const CUR_MONTH = now.getMonth() + 1;
const CUR_YEAR = now.getFullYear();
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Employees() {
  const { addUserCredential } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);
  const [viewAtt, setViewAtt] = useState(null);
  const [viewPerf, setViewPerf] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const showToast = (type, msg) => { setToast({type,msg}); setTimeout(()=>setToast(null),4500); };

  const load = async () => {
    try { const r = await getEmployees(); setEmployees(r.data); } catch { showToast('error','Could not load employees'); }
    try { const r = await getDepartments(); setDepartments(r.data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleSearch = async (v) => {
    setSearch(v); setDeptFilter('ALL');
    if (v.length > 1) { try { const r = await searchEmployees(v); setEmployees(r.data); } catch {} }
    else if (v === '') load();
  };

  const displayed = deptFilter === 'ALL' ? employees : employees.filter(e => String(e.department?.id) === deptFilter);

  const openAdd = () => { setForm(EMPTY); setEditTarget(null); setModal('add'); };
  const openEdit = (emp) => {
    setEditTarget(emp);
    setForm({firstName:emp.firstName??'',lastName:emp.lastName??'',email:emp.email??'',phone:emp.phone??'',basicSalary:emp.basicSalary??'',designation:emp.designation??'',status:emp.status??'ACTIVE',employmentType:emp.employmentType??'FULL_TIME',gender:emp.gender??'MALE',departmentId:emp.department?.id??''});
    setModal('edit');
  };

  const openView = async (emp) => {
    setViewEmp(emp); setViewAtt(null); setViewPerf([]); setViewLoading(true); setModal('view');
    try { const r = await getAttendancePct(emp.id, CUR_MONTH, CUR_YEAR); setViewAtt(r.data); } catch {}
    try { const r = await getPerformanceByEmployee(emp.id); setViewPerf(r.data ?? []); } catch {}
    setViewLoading(false);
  };

  const closeModal = () => { setModal(null); setEditTarget(null); setForm(EMPTY); setViewEmp(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form, basicSalary:parseFloat(form.basicSalary)||0, hireDate:editTarget?.hireDate??new Date().toISOString().split('T')[0], department:form.departmentId?{id:parseInt(form.departmentId)}:null};
      if (modal === 'add') {
        const res = await createEmployee(payload);
        addUserCredential(form.email, 'emp123');
        showToast('success', `Added! ID: ${res.data?.employeeCode ?? '—'} · Password: emp123`);
      } else {
        await updateEmployee(editTarget.id, payload);
        showToast('success', `${form.firstName} updated.`);
      }
      await load(); closeModal();
    } catch (err) {
      showToast('error', err.response?.data?.message ?? err.message ?? 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return;
    try { await deleteEmployee(emp.id); showToast('success',`${emp.firstName} removed.`); await load(); }
    catch (err) { showToast('error', err.response?.data ?? 'Delete failed'); }
  };

  const F = (label, k, opts={}) => (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
      <input className="input-field" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} {...opts}/>
    </div>
  );

  const latestRating = viewPerf.length > 0 ? viewPerf[viewPerf.length-1]?.rating : null;
  const attPct = viewAtt?.attendancePercentage ?? 0;

  return (
    <div>
      <Toast toast={toast}/>

      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Management</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Employees</h1>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-white"><Plus size={16}/> Add Employee</button>
      </div>

      <div className="stat-card mb-4 animate-fade-up delay-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"/>
            <input value={search} onChange={e=>handleSearch(e.target.value)} className="input-field pl-11" placeholder="Search by name..."/>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl border border-border">
            <Users size={15} className="text-accent"/>
            <span className="font-mono text-sm text-dim">{displayed.length} / {employees.length}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap animate-fade-up delay-150">
        <button onClick={()=>setDeptFilter('ALL')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${deptFilter==='ALL'?'border-blue-500/30 bg-blue-500/10 text-blue-400':'border-gray-700 text-gray-400 hover:text-white'}`}>
          <Building2 size={13}/> All <span className="font-mono text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">{employees.length}</span>
        </button>
        {departments.map(d => {
          const count = employees.filter(e=>e.department?.id===d.id).length;
          const active = deptFilter===String(d.id);
          return (
            <button key={d.id} onClick={()=>{setDeptFilter(String(d.id));setSearch('');}} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${active?'border-purple-500/30 bg-purple-500/10 text-purple-400':'border-gray-700 text-gray-400 hover:text-white'}`}>
              {d.name} <span className="font-mono text-xs bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="stat-card animate-fade-up delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Employee','Emp ID','Department','Designation','Salary','Status','Actions'].map(h=>(
                  <th key={h} className="text-left pb-4 text-xs font-mono text-gray-500 uppercase tracking-widest px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length===0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-500">No employees found</td></tr>
              ) : displayed.map(emp=>(
                <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-white/2 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs font-mono text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck size={13} style={{color:'#4f8ef7',flexShrink:0}}/>
                      <span className="text-xs font-mono font-bold" style={{color:'#4f8ef7',letterSpacing:'0.05em'}}>
                        {emp.employeeCode || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    {emp.department ? <span className="badge-purple">{emp.department.name}</span> : <span className="text-xs text-gray-500">—</span>}
                  </td>
                  <td className="py-4 px-3 text-sm text-gray-400">{emp.designation||'—'}</td>
                  <td className="py-4 px-3 text-sm font-mono" style={{color:'#4f8ef7'}}>₹{emp.basicSalary?.toLocaleString()}</td>
                  <td className="py-4 px-3">
                    <span className={emp.status==='ACTIVE'?'badge-green':emp.status==='ON_LEAVE'?'badge-orange':'badge-red'}>{(emp.status||'ACTIVE').replace('_',' ')}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1">
                      <button onClick={()=>openView(emp)} title="View" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-500/10 hover:text-green-400 text-gray-500 transition-all"><Eye size={14}/></button>
                      <button onClick={()=>openEdit(emp)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 hover:text-blue-400 text-gray-500 transition-all"><Edit size={14}/></button>
                      <button onClick={()=>handleDelete(emp)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal open={modal==='view'} onClose={closeModal} title={`${viewEmp?.firstName||''} ${viewEmp?.lastName||''}`} wide>
        {viewEmp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{background:'rgba(79,142,247,0.08)',border:'1px solid rgba(79,142,247,0.2)'}}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#4f8ef7,#7c3aed)'}}>
                {viewEmp.firstName?.[0]}{viewEmp.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg text-white">{viewEmp.firstName} {viewEmp.lastName}</p>
                  <span className={viewEmp.status==='ACTIVE'?'badge-green':'badge-red'}>{viewEmp.status}</span>
                </div>
                <p className="text-sm text-gray-400">{viewEmp.designation||'—'} · {viewEmp.department?.name||'—'}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{viewEmp.email}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <BadgeCheck size={14} style={{color:'#4f8ef7'}}/>
                  <span className="font-mono font-bold tracking-widest" style={{color:'#4f8ef7'}}>{viewEmp.employeeCode||'—'}</span>
                </div>
                <p className="text-xs font-mono text-gray-500">Employee ID</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Attendance Ring */}
              <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck size={13} style={{color:'#06d6a0'}}/>
                  <p className="text-xs font-mono text-gray-400 uppercase">Attendance {MONTHS[CUR_MONTH-1]}</p>
                </div>
                {viewLoading ? (
                  <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"/></div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AttendanceRing pct={attPct}/>
                    <div>
                      <p className="text-xl font-bold text-white">{attPct}%</p>
                      <p className={`text-xs font-mono mt-1 ${attPct < 75 ? 'text-red-400' : 'text-green-400'}`}>
                        {attPct < 75 ? '⚠ Below 75%' : '✓ Good'}
                      </p>
                      {attPct < 75 && <p className="text-xs text-red-400/70 mt-0.5">5% deduction</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Salary */}
              <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={13} style={{color:'#4f8ef7'}}/>
                  <p className="text-xs font-mono text-gray-400 uppercase">Salary</p>
                </div>
                <p className="text-2xl font-bold text-white">₹{viewEmp.basicSalary?.toLocaleString()}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">Basic / month</p>
                <p className="text-xs font-mono mt-1" style={{color:'#4f8ef7'}}>{(viewEmp.employmentType||'').replace('_',' ')}</p>
              </div>

              {/* Performance */}
              <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={13} className="text-yellow-400"/>
                  <p className="text-xs font-mono text-gray-400 uppercase">Performance</p>
                </div>
                {viewLoading ? (
                  <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"/></div>
                ) : viewPerf.length===0 ? (
                  <p className="text-xs font-mono text-gray-500">No reviews yet</p>
                ) : (
                  <>
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s=>(
                        <Star key={s} size={16} className={s<=(latestRating||0)?'text-yellow-400':'text-gray-600'} fill={s<=(latestRating||0)?'#facc15':'none'}/>
                      ))}
                    </div>
                    <p className="text-xs font-mono text-gray-500">{viewPerf.length} review{viewPerf.length!==1?'s':''}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{viewPerf[viewPerf.length-1]?.comments||'—'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={modal==='add'||modal==='edit'} onClose={closeModal} title={modal==='add'?'Add New Employee':`Edit — ${editTarget?.firstName} ${editTarget?.lastName}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {F('First Name','firstName',{required:true})}
            {F('Last Name','lastName',{required:true})}
          </div>
          {F('Email','email',{type:'email',required:true})}
          <div className="grid grid-cols-2 gap-4">
            {F('Phone','phone')}
            {F('Basic Salary (₹)','basicSalary',{type:'number',required:true})}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {F('Designation','designation')}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Department</label>
              <select className="input-field" value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}>
                <option value="">No Department</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['employmentType','Type',['FULL_TIME','PART_TIME','CONTRACT']],['gender','Gender',['MALE','FEMALE','OTHER']],['status','Status',['ACTIVE','INACTIVE','ON_LEAVE','TERMINATED']]].map(([k,l,opts])=>(
              <div key={k}>
                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">{l}</label>
                <select className="input-field" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}>
                  {opts.map(o=><option key={o} value={o}>{o.replace('_',' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
          {modal==='add' && (
            <div className="px-4 py-3 rounded-xl" style={{background:'rgba(79,142,247,0.08)',border:'1px solid rgba(79,142,247,0.2)'}}>
              <p className="text-xs font-mono" style={{color:'#4f8ef7'}}>ℹ Employee ID auto-generated based on department (e.g. HR-XXXXXX) · Default password: emp123</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-white flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : modal==='add'?'Create Employee':'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
