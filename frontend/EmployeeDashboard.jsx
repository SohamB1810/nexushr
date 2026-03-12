import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployee, getLeavesByEmployee, getPaySlipsByEmployee, getMonthlySummary, getAttendancePct } from '../../services/api';
import { DollarSign, FileText, CalendarCheck, Star, TrendingUp, Clock, BadgeCheck, AlertTriangle } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function AttendanceRing({ pct }) {
  const r = 36, circ = 2 * Math.PI * r;
  const fill = ((pct ?? 0) / 100) * circ;
  const color = pct >= 75 ? '#06d6a0' : '#ef4444';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div className="absolute text-center">
        <p className="font-display font-bold text-lg text-bright leading-none">{pct ?? '—'}%</p>
        <p className="text-xs font-mono text-muted mt-0.5">attend.</p>
      </div>
    </div>
  );
}

function parseDate(d) {
  if (!d) return '—';
  if (Array.isArray(d)) return new Date(d[0], d[1]-1, d[2]).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [employee,   setEmployee]   = useState(null);
  const [leaves,     setLeaves]     = useState([]);
  const [payslips,   setPayslips]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attPct,     setAttPct]     = useState(null);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  useEffect(() => {
    const id = user?.employeeId;
    if (!id) return;
    getEmployee(id).then(r => setEmployee(r.data)).catch(() => {});
    getLeavesByEmployee(id).then(r => setLeaves(r.data)).catch(() => {});
    getPaySlipsByEmployee(id).then(r => setPayslips(r.data)).catch(() => {});
    getMonthlySummary(id, month, year).then(r => setAttendance(r.data)).catch(() => {});
    getAttendancePct(id, month, year).then(r => setAttPct(r.data.attendancePercentage)).catch(() => {});
  }, [user]);

  const latestPayslip  = payslips[0];
  const pendingLeaves  = leaves.filter(l => l.status === 'PENDING').length;
  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED').length;
  const belowThreshold = attPct !== null && attPct < 75;

  return (
    <div>
      {/* Welcome card */}
      <div className="mb-6 animate-fade-up">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(124,58,237,0.08))', border: '1px solid rgba(79,142,247,0.15)' }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', boxShadow: '0 0 30px rgba(79,142,247,0.3)' }}>
              {user?.avatar}
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Welcome back</p>
              <h1 className="font-display font-bold text-2xl text-bright">{user?.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-body text-dim">{employee?.designation || 'Employee'}</span>
                <span className="text-muted">·</span>
                <span className="text-sm font-mono text-accent">{user?.dept}</span>
              </div>
            </div>
            {/* Employee ID badge */}
            <div className="text-right flex-shrink-0 px-4 py-3 rounded-2xl" style={{ background: 'rgba(6,214,160,0.07)', border: '1px solid rgba(6,214,160,0.2)' }}>
              <p className="text-xs font-mono text-muted mb-1 flex items-center gap-1 justify-end"><BadgeCheck size={11}/> Employee ID</p>
              <p className="font-display font-bold text-xl text-bright tracking-widest">
                {employee?.employeeCode || '—'}
              </p>
              <p className="text-xs font-mono text-muted mt-1">Since {parseDate(employee?.hireDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance warning */}
      {belowThreshold && (
        <div className="mb-6 animate-fade-up flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0"/>
          <div>
            <p className="text-sm font-body font-semibold text-red-400">Attendance below 75% this month</p>
            <p className="text-xs font-mono text-muted mt-0.5">
              Your attendance is {attPct}% — a 5% salary deduction will be applied when payroll is run.
            </p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: CalendarCheck, label: 'Present This Month', value: attendance.PRESENT ?? '—', color: '#06d6a0', sub: `${attendance.ABSENT ?? 0} absent` },
          { icon: FileText,      label: 'Leave Requests',     value: leaves.length,              color: '#f97316', sub: `${pendingLeaves} pending`           },
          { icon: DollarSign,    label: 'Net Salary',         value: latestPayslip ? `₹${(latestPayslip.netSalary/1000).toFixed(1)}K` : '—', color: '#4f8ef7', sub: 'Last payslip' },
          { icon: Star,          label: 'Approved Leaves',    value: approvedLeaves,             color: '#7c3aed', sub: 'This year'                           },
        ].map(({ icon: Icon, label, value, color, sub }, i) => (
          <div key={label} className="stat-card animate-fade-up">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={18} style={{ color }}/>
            </div>
            <p className="font-display font-bold text-2xl text-bright mb-1">{value}</p>
            <p className="text-sm font-body text-dim">{label}</p>
            <p className="text-xs font-mono text-muted mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-6">

        {/* Attendance card */}
        <div className="stat-card animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">This Month's Attendance</h3>
            <span className="text-xs font-mono text-muted">{MONTHS[month-1]} {year}</span>
          </div>
          <div className="flex items-center gap-5 mb-4">
            <AttendanceRing pct={attPct}/>
            <div className="flex-1 space-y-2">
              {[
                ['Present',  attendance.PRESENT  ?? 0, '#06d6a0'],
                ['Absent',   attendance.ABSENT   ?? 0, '#ef4444'],
                ['Late',     attendance.LATE     ?? 0, '#f97316'],
                ['On Leave', attendance.ON_LEAVE ?? 0, '#7c3aed'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }}/>
                    <span className="text-xs font-body text-muted">{l}</span>
                  </div>
                  <span className="text-xs font-mono text-bright">{v} days</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`px-3 py-2 rounded-xl text-xs font-mono text-center ${
            belowThreshold
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-accent-3/10 border border-accent-3/20 text-accent-3'}`}>
            {attPct === null ? 'No attendance data yet'
              : belowThreshold ? `⚠ Below 75% — 5% deduction on next payslip`
              : `✓ Good standing — no deduction`}
          </div>
        </div>

        {/* Latest payslip */}
        <div className="stat-card animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Latest Pay Slip</h3>
            <TrendingUp size={16} className="text-accent-3"/>
          </div>
          {!latestPayslip ? (
            <p className="text-muted text-sm font-body text-center py-8">No payslips generated yet</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-xl bg-surface border border-border/50">
                <span className="text-xs font-mono text-muted">Period</span>
                <span className="text-sm font-body text-bright">{MONTHS[latestPayslip.month-1]} {latestPayslip.year}</span>
              </div>
              {[
                ['Basic Salary', latestPayslip.basicSalary,   'text-bright'  ],
                ['HRA (+)',      latestPayslip.hra,            'text-accent-3'],
                ['PF (-)',       latestPayslip.pfDeduction,    'text-red-400' ],
                ['Tax (-)',      latestPayslip.taxDeduction,   'text-red-400' ],
              ].map(([l, v, cls]) => (
                <div key={l} className="flex justify-between p-2.5 rounded-xl bg-surface border border-border/50">
                  <span className="text-xs font-body text-dim">{l}</span>
                  <span className={`text-xs font-mono ${cls}`}>₹{v?.toLocaleString()}</span>
                </div>
              ))}
              {latestPayslip.attendanceDeduction > 0 && (
                <div className="flex justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/20">
                  <span className="text-xs font-body text-red-400">Att. Deduction (5%)</span>
                  <span className="text-xs font-mono text-red-400">-₹{latestPayslip.attendanceDeduction?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-xl bg-accent/10 border border-accent/20">
                <span className="text-sm font-body font-medium text-bright">Net Salary</span>
                <span className="text-sm font-mono font-bold text-accent">₹{latestPayslip.netSalary?.toLocaleString()}</span>
              </div>
              {latestPayslip.attendanceNote && (
                <p className="text-xs font-mono text-muted px-1 pt-1">{latestPayslip.attendanceNote}</p>
              )}
            </div>
          )}
        </div>

        {/* Recent leaves */}
        <div className="stat-card animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Recent Leaves</h3>
            <Clock size={16} className="text-muted"/>
          </div>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-muted text-sm font-body text-center py-8">No leave requests yet</p>
            ) : leaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-body font-medium text-bright">{l.leaveType}</span>
                    <span className={l.status==='APPROVED'?'badge-green':l.status==='PENDING'?'badge-orange':'badge-red'}>{l.status}</span>
                  </div>
                  <p className="text-xs font-mono text-muted">{parseDate(l.startDate)} → {parseDate(l.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
