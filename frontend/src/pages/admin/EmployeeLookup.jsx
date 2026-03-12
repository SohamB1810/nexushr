import { useState } from 'react';
import { getEmployeeByCode, getAttendancePct, getPaySlipsByEmployee } from '../../services/api';
import { Search, User, BadgeCheck, DollarSign, CalendarCheck, AlertTriangle, CheckCircle, Building2 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function AttendanceRing({ pct }) {
  const r = 30, c = 2 * Math.PI * r;
  const fill = ((pct ?? 0) / 100) * c;
  const color = pct >= 75 ? '#06d6a0' : '#ef4444';
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}/>
      </svg>
      <div className="absolute text-center">
        <p className="font-display font-bold text-sm text-bright leading-none">{pct}%</p>
      </div>
    </div>
  );
}

export default function EmployeeLookup() {
  const [code,       setCode]       = useState('');
  const [employee,   setEmployee]   = useState(null);
  const [attPct,     setAttPct]     = useState(null);
  const [payslips,   setPayslips]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setEmployee(null);
    setAttPct(null);
    setPayslips([]);

    try {
      const res = await getEmployeeByCode(trimmed);
      const emp = res.data;
      setEmployee(emp);

      // Load attendance and payslips in parallel
      await Promise.allSettled([
        getAttendancePct(emp.id, month, year).then(r => setAttPct(r.data.attendancePercentage)),
        getPaySlipsByEmployee(emp.id).then(r => setPayslips(r.data)),
      ]);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No employee found with code "${trimmed}". Please check the ID and try again.`);
      } else {
        setError('Something went wrong. Make sure the backend is running.');
      }
    }
    setLoading(false);
  };

  const latestPayslip  = payslips[0];
  const belowThreshold = attPct !== null && attPct < 75;

  const parseDate = (d) => {
    if (!d) return '—';
    if (Array.isArray(d)) return new Date(d[0], d[1]-1, d[2]).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  };

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">HR Tools</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Employee Lookup</h1>
        <p className="text-sm font-body text-muted mt-1">Search any employee by their 6-digit Employee ID</p>
      </div>

      {/* Search box */}
      <div className="stat-card mb-6 animate-fade-up">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <BadgeCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"/>
            <input
              className="input-field pl-11 font-mono tracking-widest uppercase"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. EMP-482931"
              maxLength={11}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading || !code.trim()}
            className="btn-primary flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <><Search size={15}/> Search</>}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 animate-fade-up"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={16} className="text-red-400"/>
          <p className="text-sm font-body text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {employee && (
        <div className="space-y-5 animate-fade-up">

          {/* Profile card */}
          <div className="stat-card"
            style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.05))', border: '1px solid rgba(79,142,247,0.15)' }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', boxShadow: '0 0 24px rgba(79,142,247,0.3)' }}>
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display font-bold text-xl text-bright">{employee.firstName} {employee.lastName}</h2>
                  <span className={employee.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>{employee.status}</span>
                </div>
                <p className="text-sm font-body text-dim">{employee.designation || '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 size={12} className="text-muted"/>
                  <span className="text-xs font-mono text-accent">{employee.department?.name || '—'}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <BadgeCheck size={14} className="text-accent"/>
                  <p className="font-mono font-bold text-bright tracking-widest">{employee.employeeCode}</p>
                </div>
                <p className="text-xs font-mono text-muted">{employee.email}</p>
                <p className="text-xs font-mono text-muted">{employee.phone}</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-5">

            {/* Details */}
            <div className="stat-card">
              <h3 className="section-title mb-4 flex items-center gap-2"><User size={14}/> Personal Info</h3>
              <div className="space-y-3">
                {[
                  ['Gender',          employee.gender || '—'],
                  ['Employment Type', (employee.employmentType || '—').replace('_', ' ')],
                  ['Hire Date',       parseDate(employee.hireDate)],
                  ['Date of Birth',   parseDate(employee.dateOfBirth)],
                  ['Address',         employee.address || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-2">
                    <span className="text-xs font-mono text-muted flex-shrink-0">{l}</span>
                    <span className="text-xs font-body text-dim text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance this month */}
            <div className="stat-card">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <CalendarCheck size={14}/> Attendance — {MONTHS[month-1]} {year}
              </h3>
              <div className="flex items-center gap-4">
                {attPct !== null && <AttendanceRing pct={attPct}/>}
                <div className="flex-1">
                  {attPct !== null ? (
                    <div className={`px-3 py-2 rounded-xl text-xs font-mono text-center ${
                      belowThreshold
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-accent-3/10 border border-accent-3/20 text-accent-3'}`}>
                      {belowThreshold
                        ? '⚠ Below 75%\n5% deduction applies'
                        : '✓ Good standing\nNo deduction'}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-muted text-center">No attendance data</p>
                  )}
                </div>
              </div>
              {belowThreshold && (
                <div className="mt-3 flex items-start gap-2 text-xs font-body text-red-400">
                  <AlertTriangle size={12} className="flex-shrink-0 mt-0.5"/>
                  A 5% salary deduction will be applied when payroll is run for {MONTHS[month-1]}.
                </div>
              )}
              {attPct !== null && !belowThreshold && (
                <div className="mt-3 flex items-center gap-2 text-xs font-body text-accent-3">
                  <CheckCircle size={12}/>
                  Attendance is above the 75% threshold.
                </div>
              )}
            </div>

            {/* Salary info */}
            <div className="stat-card">
              <h3 className="section-title mb-4 flex items-center gap-2"><DollarSign size={14}/> Salary</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 rounded-xl bg-surface border border-border/50">
                  <span className="text-xs font-mono text-muted">Basic Salary</span>
                  <span className="text-sm font-mono font-bold text-bright">₹{employee.basicSalary?.toLocaleString()}</span>
                </div>
                {latestPayslip ? (
                  <>
                    <div className="flex justify-between p-3 rounded-xl bg-surface border border-border/50">
                      <span className="text-xs font-mono text-muted">Last Net Salary</span>
                      <span className="text-sm font-mono text-accent">₹{latestPayslip.netSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-surface border border-border/50">
                      <span className="text-xs font-mono text-muted">Last Payslip</span>
                      <span className="text-xs font-mono text-dim">{MONTHS[latestPayslip.month-1]} {latestPayslip.year}</span>
                    </div>
                    {latestPayslip.attendanceDeduction > 0 && (
                      <div className="flex justify-between p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                        <span className="text-xs font-mono text-red-400">Last Att. Deduction</span>
                        <span className="text-xs font-mono text-red-400">-₹{latestPayslip.attendanceDeduction?.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-mono text-muted text-center py-2">No payslips generated yet</p>
                )}
              </div>
              <p className="text-xs font-mono text-muted mt-3">{payslips.length} payslip{payslips.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!employee && !error && !loading && (
        <div className="stat-card text-center py-16 animate-fade-up">
          <BadgeCheck size={32} className="text-muted mx-auto mb-3"/>
          <p className="text-dim font-body">Enter an Employee ID to look up their profile</p>
          <p className="text-muted font-mono text-xs mt-1">Format: EMP-XXXXXX (visible on each employee's dashboard)</p>
        </div>
      )}
    </div>
  );
}
