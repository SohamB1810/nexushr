import { useState } from 'react';
import { getEmployeeByCode, getAttendancePct, getPaySlipsByEmployee } from '../../services/api';
import { Search, BadgeCheck, User, DollarSign, CalendarCheck, TrendingDown, AlertTriangle, Building2 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function AttendanceRing({ pct }) {
  const r = 40, circ = 2 * Math.PI * r;
  const fill = ((pct ?? 0) / 100) * circ;
  const color = pct >= 75 ? '#06d6a0' : '#ef4444';
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9"/>
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute text-center">
        <p className="font-display font-bold text-2xl text-bright leading-none">{pct ?? '—'}%</p>
        <p className="text-xs font-mono text-muted mt-1">attendance</p>
      </div>
    </div>
  );
}

function parseDate(d) {
  if (!d) return '—';
  if (Array.isArray(d)) return new Date(d[0], d[1]-1, d[2]).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

export default function EmployeeLookup() {
  const [code,     setCode]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [employee, setEmployee] = useState(null);
  const [attData,  setAttData]  = useState(null);
  const [payslips, setPayslips] = useState([]);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const handleSearch = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true); setError(''); setEmployee(null); setAttData(null); setPayslips([]);
    try {
      const empRes = await getEmployeeByCode(trimmed);
      const emp    = empRes.data;
      setEmployee(emp);
      // Fetch attendance % and payslips in parallel
      const [attRes, psRes] = await Promise.allSettled([
        getAttendancePct(emp.id, month, year),
        getPaySlipsByEmployee(emp.id),
      ]);
      if (attRes.status === 'fulfilled') setAttData(attRes.value.data);
      if (psRes.status === 'fulfilled')  setPayslips(psRes.value.data);
    } catch (e) {
      if (e.response?.status === 404) setError(`No employee found with ID "${trimmed}"`);
      else setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const latestPayslip  = payslips[0];
  const belowThreshold = attData && attData.attendancePercentage < 75;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">HR Tools</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Employee Lookup</h1>
        <p className="text-sm font-body text-muted mt-1">Search any employee by their unique 6-digit ID to view salary and attendance details</p>
      </div>

      {/* Search bar */}
      <div className="stat-card mb-6 animate-fade-up delay-100">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <BadgeCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent"/>
            <input
              className="input-field pl-11 font-mono tracking-widest text-bright uppercase"
              placeholder="Enter Employee ID — e.g. EMP-482931"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              maxLength={14}
            />
          </div>
          <button onClick={handleSearch} disabled={loading || !code.trim()}
            className="btn-primary flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <><Search size={15}/> Search</>}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm font-mono">
            <AlertTriangle size={14}/> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {employee && (
        <div className="space-y-6 animate-fade-up">

          {/* Employee profile card */}
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(79,142,247,0.15)' }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display font-bold text-2xl text-bright">{employee.firstName} {employee.lastName}</h2>
                  <span className={employee.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>{employee.status}</span>
                </div>
                <p className="text-sm font-body text-dim">{employee.designation || 'No designation'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-muted">
                    <Building2 size={11}/> {employee.department?.name || '—'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-muted">
                    <User size={11}/> {employee.email}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono text-muted mb-1">Employee ID</p>
                <p className="font-display font-bold text-xl text-bright tracking-widest">{employee.employeeCode}</p>
                <p className="text-xs font-mono text-muted mt-1">Joined {parseDate(employee.hireDate)}</p>
              </div>
            </div>
          </div>

          {/* Attendance warning */}
          {belowThreshold && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0"/>
              <div>
                <p className="text-sm font-body font-semibold text-red-400">Attendance below 75% this month</p>
                <p className="text-xs font-mono text-muted mt-0.5">
                  {attData.attendancePercentage}% attendance — 5% salary deduction will apply when payroll is run for {MONTHS[month-1]} {year}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">

            {/* Attendance this month */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">Attendance — {MONTHS[month-1]} {year}</h3>
                <CalendarCheck size={16} className="text-muted"/>
              </div>
              {!attData ? (
                <p className="text-muted text-sm font-body text-center py-6">No attendance data</p>
              ) : (
                <div className="flex items-center gap-6">
                  <AttendanceRing pct={attData.attendancePercentage}/>
                  <div className="flex-1 space-y-3">
                    <div className={`px-3 py-2 rounded-xl text-xs font-mono text-center ${
                      belowThreshold
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-accent-3/10 border border-accent-3/20 text-accent-3'}`}>
                      {belowThreshold ? '⚠ 5% deduction will apply' : '✓ No deduction'}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-muted">Working days</span>
                        <span className="font-mono text-bright">{attData.workingDays ?? '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-muted">Threshold</span>
                        <span className="font-mono text-bright">75%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-muted">Deduction</span>
                        <span className={`font-mono font-semibold ${belowThreshold ? 'text-red-400' : 'text-accent-3'}`}>
                          {belowThreshold ? '5% of net salary' : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Salary info */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">Salary Details</h3>
                <DollarSign size={16} className="text-accent"/>
              </div>

              {/* Basic info */}
              <div className="space-y-2 mb-4">
                {[
                  ['Basic Salary',     `₹${employee.basicSalary?.toLocaleString()}`,                   'text-bright'  ],
                  ['Employment Type',  employee.employmentType?.replace('_',' ') || '—',               'text-dim'     ],
                  ['Department',       employee.department?.name || '—',                               'text-accent'  ],
                ].map(([l, v, cls]) => (
                  <div key={l} className="flex justify-between p-3 rounded-xl bg-surface border border-border/50">
                    <span className="text-xs font-body text-muted">{l}</span>
                    <span className={`text-sm font-mono font-semibold ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Latest payslip */}
              {latestPayslip ? (
                <>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                    <TrendingDown size={11}/> Latest Payslip — {MONTHS[latestPayslip.month-1]} {latestPayslip.year}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      ['PF Deduction',  `-₹${latestPayslip.pfDeduction?.toLocaleString()}`,  'text-red-400'],
                      ['Tax Deduction', `-₹${latestPayslip.taxDeduction?.toLocaleString()}`, 'text-red-400'],
                    ].map(([l, v, cls]) => (
                      <div key={l} className="flex justify-between px-3 py-2 rounded-lg bg-surface border border-border/50">
                        <span className="text-xs font-body text-muted">{l}</span>
                        <span className={`text-xs font-mono ${cls}`}>{v}</span>
                      </div>
                    ))}
                    {latestPayslip.attendanceDeduction > 0 && (
                      <div className="flex justify-between px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15">
                        <span className="text-xs font-body text-red-400">Att. Deduction (5%)</span>
                        <span className="text-xs font-mono text-red-400 font-semibold">-₹{latestPayslip.attendanceDeduction?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-3 py-2.5 rounded-xl bg-accent/10 border border-accent/20">
                      <span className="text-sm font-body font-medium text-bright">Net Salary</span>
                      <span className="text-sm font-mono font-bold text-accent">₹{latestPayslip.netSalary?.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs font-mono text-muted text-center py-3">No payslips generated yet</p>
              )}
            </div>
          </div>

          {/* Payslip history */}
          {payslips.length > 0 && (
            <div className="stat-card">
              <h3 className="section-title mb-4">Payslip History</h3>
              <div className="grid grid-cols-3 gap-3">
                {payslips.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50">
                    <div>
                      <p className="text-sm font-display font-semibold text-bright">{MONTHS[p.month-1]} {p.year}</p>
                      <p className="text-xs font-mono text-muted mt-0.5">{p.attendancePercentage?.toFixed(1)}% attendance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-accent">₹{p.netSalary?.toLocaleString()}</p>
                      {p.attendanceDeduction > 0 && (
                        <p className="text-xs font-mono text-red-400 mt-0.5">-₹{p.attendanceDeduction?.toLocaleString()} deducted</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!employee && !loading && !error && (
        <div className="stat-card text-center py-20 animate-fade-up delay-200">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)' }}>
            <BadgeCheck size={28} className="text-accent"/>
          </div>
          <p className="text-dim font-body text-lg mb-1">Enter an Employee ID to get started</p>
          <p className="text-muted font-mono text-xs">Format: EMP-XXXXXX (visible on each employee's dashboard)</p>
        </div>
      )}
    </div>
  );
}
