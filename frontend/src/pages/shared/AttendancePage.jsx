import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { markAttendance, getAttendanceByEmployee, getTodayAttendance } from '../../services/api';
import { CalendarCheck, Clock, CheckCircle } from 'lucide-react';

export default function AttendancePage({ isAdmin = false }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    try {
      if (isAdmin) {
        const r = await getTodayAttendance(); setRecords(r.data);
      } else {
        const r = await getAttendanceByEmployee(user?.employeeId); setRecords(r.data);
        const today = new Date().toISOString().split('T')[0];
        setTodayRecord(r.data.find(a => a.attendanceDate === today));
      }
    } catch(e) {}
  };

  useEffect(() => { load(); }, [user]);

  const handleMark = async (status) => {
    setMarking(true);
    try {
      const now = new Date();
      await markAttendance({
        employee: { id: user?.employeeId },
        status,
        attendanceDate: now.toISOString().split('T')[0],
        checkIn: now.toTimeString().split(' ')[0].substring(0,5),
      });
      load();
    } catch(e) { alert(e.response?.data || 'Error'); }
    setMarking(false);
  };

  const statusColors = { PRESENT: 'badge-green', ABSENT: 'badge-red', HALF_DAY: 'badge-orange', LATE: 'badge-purple', ON_LEAVE: 'badge-blue' };

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">{isAdmin ? 'HR Management' : 'My Workspace'}</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Attendance</h1>
      </div>

      {/* Employee: Mark today */}
      {!isAdmin && (
        <div className="stat-card mb-6 animate-fade-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title mb-1">Mark Today's Attendance</h3>
              <p className="text-xs font-mono text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {todayRecord ? (
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-accent-3" />
                <div>
                  <p className="text-sm font-body font-medium text-bright">Already marked</p>
                  <span className={statusColors[todayRecord.status]}>{todayRecord.status}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {['PRESENT','LATE','HALF_DAY'].map(s => (
                  <button key={s} disabled={marking} onClick={() => handleMark(s)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-body font-medium border transition-all duration-300 ${
                      s==='PRESENT'?'bg-accent-3/10 border-accent-3/30 text-accent-3 hover:bg-accent-3/20':
                      s==='LATE'?'bg-accent-2/10 border-accent-2/30 text-purple-400 hover:bg-accent-2/20':
                      'bg-accent-warm/10 border-accent-warm/30 text-accent-warm hover:bg-accent-warm/20'}`}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="stat-card animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">{isAdmin ? "Today's Attendance" : 'My Attendance History'}</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-border">
            <Clock size={13} className="text-muted" />
            <span className="text-xs font-mono text-dim">{records.length} records</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {(isAdmin ? ['Employee','Date','Check In','Check Out','Status'] : ['Date','Check In','Check Out','Status','Remarks']).map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-mono text-muted uppercase tracking-widest px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-muted font-body">No records found</td></tr>
              ) : records.map(a => (
                <tr key={a.id} className="table-row">
                  {isAdmin && <td className="py-3 px-3 font-body font-medium text-sm text-bright">{a.employee?.firstName} {a.employee?.lastName}</td>}
                  <td className="py-3 px-3 font-mono text-xs text-dim">{a.attendanceDate}</td>
                  <td className="py-3 px-3 font-mono text-xs text-dim">{a.checkIn || '—'}</td>
                  <td className="py-3 px-3 font-mono text-xs text-dim">{a.checkOut || '—'}</td>
                  <td className="py-3 px-3"><span className={statusColors[a.status] || 'badge-blue'}>{a.status}</span></td>
                  {!isAdmin && <td className="py-3 px-3 text-xs font-body text-muted">{a.remarks || '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
