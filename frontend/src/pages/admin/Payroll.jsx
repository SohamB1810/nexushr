import { useState } from 'react';
import { runMonthlyPayroll, getPaySlipsByMonth, getSalaryBreakdown } from '../../services/api';
import { DollarSign, Play, Calculator } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Payroll() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [basicSalary, setBasicSalary] = useState('');
  const [breakdown, setBreakdown] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const r = await runMonthlyPayroll({ month, year });
      setPayslips(r.data);
      alert(`✅ Payroll generated for ${r.data.length} employees!`);
    } catch(e) { alert(e.response?.data || 'Error running payroll'); }
    setLoading(false);
  };

  const handleFetch = async () => {
    const r = await getPaySlipsByMonth(month, year);
    setPayslips(r.data);
  };

  const handleBreakdown = async () => {
    if (!basicSalary) return;
    const r = await getSalaryBreakdown(basicSalary);
    setBreakdown(r.data);
  };

  const totalNet = payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Finance</p>
        <h1 className="font-display font-bold text-3xl text-bright tracking-tight">Payroll Management</h1>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Run payroll */}
        <div className="col-span-2 stat-card animate-fade-up delay-100">
          <h3 className="section-title mb-5">Run Monthly Payroll</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Month</label>
              <select className="input-field" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Year</label>
              <input type="number" className="input-field" value={year} onChange={e => setYear(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2 pt-6">
              <button onClick={handleRun} disabled={loading} className="btn-primary flex items-center gap-2 text-white whitespace-nowrap">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Play size={15} /> Run Payroll</>}
              </button>
              <button onClick={handleFetch} className="btn-ghost flex items-center gap-2 whitespace-nowrap">
                <DollarSign size={15} /> View Payslips
              </button>
            </div>
          </div>

          {payslips.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-body text-dim">{payslips.length} payslips for {MONTHS[month-1]} {year}</p>
                <span className="font-display font-bold text-accent">Total: ₹{totalNet.toLocaleString()}</span>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-panel">
                    <tr className="border-b border-border">
                      {['Employee','Basic','HRA','PF','Tax','Net Salary','Status'].map(h => (
                        <th key={h} className="text-left pb-3 text-xs font-mono text-muted uppercase tracking-widest px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map(p => (
                      <tr key={p.id} className="table-row text-sm">
                        <td className="py-3 px-2 font-body font-medium text-bright">{p.employee?.firstName} {p.employee?.lastName}</td>
                        <td className="py-3 px-2 font-mono text-dim">₹{p.basicSalary?.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono text-accent-3">+₹{p.hra?.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono text-red-400">-₹{p.pfDeduction?.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono text-red-400">-₹{p.taxDeduction?.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono font-bold text-accent">₹{p.netSalary?.toLocaleString()}</td>
                        <td className="py-3 px-2"><span className="badge-blue">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Salary calculator */}
        <div className="stat-card animate-fade-up delay-200">
          <div className="flex items-center gap-2 mb-5">
            <Calculator size={18} className="text-accent" />
            <h3 className="section-title">Salary Calculator</h3>
          </div>
          <div className="mb-4">
            <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Basic Salary (₹)</label>
            <input type="number" className="input-field" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} placeholder="e.g. 50000" />
          </div>
          <button onClick={handleBreakdown} className="btn-primary w-full text-white mb-5">Calculate</button>
          {breakdown && (
            <div className="space-y-2">
              {[
                ['Basic Salary', breakdown.basicSalary, 'text-bright', '+'],
                ['HRA (20%)', breakdown.hra, 'text-accent-3', '+'],
                ['Gross Salary', breakdown.grossSalary, 'text-accent', '='],
                ['PF (12%)', breakdown.pfDeduction, 'text-red-400', '-'],
                ['Tax (10%)', breakdown.taxDeduction, 'text-red-400', '-'],
                ['Net Salary', breakdown.netSalary, 'text-accent font-bold', '='],
              ].map(([label, val, cls, sign]) => (
                <div key={label} className={`flex items-center justify-between py-2 px-3 rounded-lg ${label === 'Net Salary' ? 'bg-accent/10 border border-accent/20' : 'bg-surface'}`}>
                  <span className="text-xs font-body text-dim">{label}</span>
                  <span className={`text-sm font-mono ${cls}`}>{sign}₹{val?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
