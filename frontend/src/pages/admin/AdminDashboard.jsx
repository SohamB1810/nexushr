import { useState, useEffect } from 'react';
import { getDashboardSummary, getPendingLeaves, getTodayAttendance, getPayrollTrend, getAttendancePct, getMonthlySummary } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Clock, DollarSign, TrendingUp, UserCheck, UserX, Bell, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function AttendanceRing({ pct }) {
  const r = 38, circumference = 2 * Math.PI * r;
  const filled = ((pct ?? 0) / 100) * circumference;
  const color = (pct ?? 0) >= 75 ? '#06d6a0' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{width:100,height:100}}>
      <svg width="100" height="100" style={{transform:'rotate(-90deg)'}}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
          style={{transition:'stroke-dasharray 1s ease'}}/>
      </svg>
      <div className="absolute text-center">
        <p style={{color:'white',fontWeight:'bold',fontSize:18,lineHeight:1}}>{pct ?? 0}%</p>
        <p style={{color:'#9ca3af',fontSize:10,marginTop:2}}>attend.</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <div className={`stat-card animate-fade-up delay-${delay} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:`${color}15`,border:`1px solid ${color}25`}}>
          <Icon size={20} style={{color}}/>
        </div>
        <TrendingUp size={14} style={{color:'#06d6a0',marginTop:4}}/>
      </div>
      <p className="font-display font-bold text-3xl text-bright mb-1">{value}</p>
      <p className="text-sm font-body text-dim">{label}</p>
      {sub && <p className="text-xs font-mono text-muted mt-1">{sub}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{background:`linear-gradient(90deg,${color}40,transparent)`}}/>
    </div>
  );
}

const CustomTooltip = ({active,payload,label}) => {
  if (active && payload?.length) return (
    <div className="glass rounded-xl px-4 py-3 border border-border shadow-xl">
      <p className="text-xs font-mono text-muted mb-1">{label}</p>
      <p className="font-display font-bold text-bright text-lg">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
    </div>
  );
  return null;
};

const parseDate = (d) => {
  if (!d) return '—';
  if (Array.isArray(d)) return new Date(d[0],d[1]-1,d[2]).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
  const [y,m,day] = String(d).split('-').map(Number);
  return new Date(y,m-1,day).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [todayAtt, setTodayAtt] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [payrollError, setPayrollError] = useState(false);
  const [myAttPct, setMyAttPct] = useState(null);
  const [myAttSummary, setMyAttSummary] = useState({});

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    getDashboardSummary().then(r=>setSummary(r.data)).catch(()=>{});
    getPendingLeaves().then(r=>setPendingLeaves(r.data)).catch(()=>{});
    getTodayAttendance().then(r=>setTodayAtt(r.data)).catch(()=>{});
    getPayrollTrend().then(r=>setPayrollData(r.data??[])).catch(()=>{setPayrollError(true);setPayrollData([]);});
    if (user?.employeeId) {
      getAttendancePct(user.employeeId, month, year)
        .then(r => setMyAttPct(r.data.attendancePercentage))
        .catch(()=>{});
      getMonthlySummary(user.employeeId, month, year)
        .then(r => setMyAttSummary(r.data))
        .catch(()=>{});
    }
  }, [user]);

  const stats = [
    {icon:Users,     label:'Total Employees', value:summary?.totalEmployees??'—',  sub:`${summary?.activeEmployees??0} active`,  color:'#4f8ef7', delay:100},
    {icon:Building2, label:'Departments',      value:summary?.totalDepartments??'—', sub:'Across divisions',                      color:'#7c3aed', delay:200},
    {icon:UserCheck, label:'Present Today',    value:summary?.presentTodayCount??'—',sub:`${summary?.absentTodayCount??0} absent`,color:'#06d6a0', delay:300},
    {icon:Clock,     label:'Pending Leaves',   value:summary?.pendingLeaveRequests??'—',sub:'Awaiting approval',                  color:'#f97316', delay:400},
    {icon:DollarSign,label:'Monthly Payroll',  value:summary?`₹${(summary.totalMonthlyPayroll/1000).toFixed(0)}K`:'—', sub:'Gross this month', color:'#4f8ef7', delay:500},
  ];

  const hasPayroll = payrollData.length > 0;
  const belowThreshold = myAttPct !== null && myAttPct < 75;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Overview</p>
          <h1 className="font-display font-bold text-3xl text-bright tracking-tight">HR Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-3 animate-pulse"/>
            <span className="text-xs font-mono text-dim">Live</span>
          </div>
          <button className="relative w-10 h-10 glass rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-dim"/>
            {pendingLeaves.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-xs flex items-center justify-center font-mono">{pendingLeaves.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map(s=><StatCard key={s.label} {...s}/>)}
      </div>



      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 stat-card animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Analytics</p>
              <h3 className="section-title">Payroll Trend</h3>
            </div>
            {hasPayroll ? <span className="badge-green">{payrollData.length} months</span> : <span className="badge-orange">No payslips yet</span>}
          </div>
          {payrollError ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <AlertCircle size={28} className="text-red-400"/>
              <p className="text-dim font-body text-sm">Could not load payroll data</p>
            </div>
          ) : !hasPayroll ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <DollarSign size={24} className="text-accent"/>
              <div className="text-center">
                <p className="text-dim font-body text-sm mb-1">No payroll data yet</p>
                <p className="text-muted font-mono text-xs">Go to <span className="text-accent">Payroll → Run Monthly Payroll</span></p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={payrollData} margin={{top:5,right:10,bottom:0,left:10}}>
                <defs>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="month" tick={{fill:'#4a5568',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#4a5568',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="amount" stroke="#4f8ef7" strokeWidth={2.5} fill="url(#payGrad)"
                  dot={{fill:'#4f8ef7',r:4,strokeWidth:2,stroke:'#1a1f35'}}
                  activeDot={{r:7,fill:'#4f8ef7',stroke:'#1a1f35',strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="stat-card animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Pending Leaves</h3>
            <span className="badge-orange">{pendingLeaves.length}</span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-56">
            {pendingLeaves.length===0 ? (
              <div className="text-center py-10"><p className="text-muted text-sm">No pending requests</p></div>
            ) : pendingLeaves.slice(0,6).map(l=>(
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#f97316,#ef4444)'}}>
                  {l.employee?.firstName?.[0]}{l.employee?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bright truncate">{l.employee?.firstName} {l.employee?.lastName}</p>
                  <p className="text-xs font-mono text-muted">{l.leaveType} · {parseDate(l.startDate)}</p>
                </div>
                <span className="badge-orange text-xs">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 stat-card animate-fade-up delay-400">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Today</p>
            <h3 className="section-title">Attendance Log</h3>
          </div>
          <span className="badge-blue">{new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}</span>
        </div>
        {todayAtt.length===0 ? (
          <div className="text-center py-10">
            <UserX size={32} className="text-muted mx-auto mb-3"/>
            <p className="text-dim font-body text-sm">No attendance marked yet today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Employee','Department','Status'].map(h=>(
                    <th key={h} className="text-left pb-3 text-xs font-mono text-muted uppercase tracking-widest px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayAtt.slice(0,8).map(a=>(
                  <tr key={a.id} className="table-row">
                    <td className="py-3 px-3 text-sm font-medium text-bright">{a.employee?.firstName} {a.employee?.lastName}</td>
                    <td className="py-3 px-3 text-xs font-mono text-dim">{a.employee?.department?.name||'—'}</td>
                    <td className="py-3 px-3">
                      <span className={a.status==='PRESENT'?'badge-green':a.status==='ABSENT'?'badge-red':'badge-orange'}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
