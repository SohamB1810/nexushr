import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, FileText,
  DollarSign, Star, Megaphone, LogOut, Zap, ChevronRight, Lock, BadgeCheck
} from 'lucide-react';

const adminNav = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/admin/employees',    icon: Users,           label: 'Employees'       },
  { to: '/admin/departments',  icon: Building2,       label: 'Departments'     },
  { to: '/admin/attendance',   icon: CalendarCheck,   label: 'Attendance'      },
  { to: '/admin/leaves',       icon: FileText,        label: 'Leave Mgmt'      },
  { to: '/admin/payroll',      icon: DollarSign,      label: 'Payroll'         },
  { to: '/admin/performance',  icon: Star,            label: 'Performance'     },
  { to: '/admin/announcements',icon: Megaphone,       label: 'Announcements'   },
  { to: '/admin/lookup',       icon: BadgeCheck,      label: 'Employee Lookup' },
  { to: '/admin/password',     icon: Lock,            label: 'Change Password' },
];

const employeeNav = [
  { to: '/employee',               icon: LayoutDashboard, label: 'My Dashboard',  end: true },
  { to: '/employee/attendance',    icon: CalendarCheck,   label: 'Attendance'    },
  { to: '/employee/leaves',        icon: FileText,        label: 'My Leaves'     },
  { to: '/employee/payslips',      icon: DollarSign,      label: 'Pay Slips'     },
  { to: '/employee/performance',   icon: Star,            label: 'Performance'   },
  { to: '/employee/announcements', icon: Megaphone,       label: 'Announcements' },
  { to: '/employee/password',      icon: Lock,            label: 'Change Password'},
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : employeeNav;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{ background: 'rgba(10,13,20,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', boxShadow: '0 0 20px rgba(79,142,247,0.3)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-bright text-lg tracking-tight">NexusHR</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-3 animate-pulse" />
              <span className="text-xs font-mono text-muted">{isAdmin ? 'Admin Panel' : 'Employee Portal'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-mono text-muted uppercase tracking-widest px-3 mb-3">
          {isAdmin ? 'Management' : 'My Workspace'}
        </p>
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-display font-bold text-white flex-shrink-0"
            style={{ background: isAdmin ? 'linear-gradient(135deg, #7c3aed, #4f8ef7)' : 'linear-gradient(135deg, #06d6a0, #4f8ef7)' }}>
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-medium text-bright truncate">{user?.name}</p>
            <p className="text-xs font-mono text-muted truncate">{user?.dept}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 text-sm font-body mt-1">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
