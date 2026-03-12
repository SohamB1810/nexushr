import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

import AdminDashboard   from './pages/admin/AdminDashboard';
import Employees        from './pages/admin/Employees';
import Departments      from './pages/admin/Departments';
import LeaveManagement  from './pages/admin/LeaveManagement';
import Payroll          from './pages/admin/Payroll';
import Announcements    from './pages/admin/Announcements';
import EmployeeLookup   from './pages/admin/EmployeeLookup';
import EmployeeLookup  from './pages/admin/EmployeeLookup';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyLeaves          from './pages/employee/MyLeaves';
import MyPayslips        from './pages/employee/MyPayslips';

import AttendancePage   from './pages/shared/AttendancePage';
import PerformancePage  from './pages/shared/PerformancePage';
import ChangePassword   from './pages/shared/ChangePassword';

// adminOnly=true  → only HR_ADMIN can enter, others → /employee
// adminOnly=false → only EMPLOYEE can enter, HR_ADMIN → /admin
// adminOnly=undefined → any logged-in user
function ProtectedRoute({ children, adminOnly }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly === true  && user.role !== 'HR_ADMIN') return <Navigate to="/employee" replace />;
  if (adminOnly === false && user.role === 'HR_ADMIN')  return <Navigate to="/admin"    replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'HR_ADMIN' ? '/admin' : '/employee'} /> : <Login />} />

      {/* ── Admin routes ───────────────────────── */}
      <Route path="/admin"               element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/employees"     element={<ProtectedRoute adminOnly><Layout><Employees /></Layout></ProtectedRoute>} />
      <Route path="/admin/departments"   element={<ProtectedRoute adminOnly><Layout><Departments /></Layout></ProtectedRoute>} />
      <Route path="/admin/attendance"    element={<ProtectedRoute adminOnly><Layout><AttendancePage isAdmin /></Layout></ProtectedRoute>} />
      <Route path="/admin/leaves"        element={<ProtectedRoute adminOnly><Layout><LeaveManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/payroll"       element={<ProtectedRoute adminOnly><Layout><Payroll /></Layout></ProtectedRoute>} />
      <Route path="/admin/performance"   element={<ProtectedRoute adminOnly><Layout><PerformancePage isAdmin /></Layout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><Layout><Announcements isAdmin /></Layout></ProtectedRoute>} />
      <Route path="/admin/lookup"        element={<ProtectedRoute adminOnly><Layout><EmployeeLookup /></Layout></ProtectedRoute>} />
      <Route path="/admin/password"      element={<ProtectedRoute adminOnly><Layout><ChangePassword /></Layout></ProtectedRoute>} />
      <Route path="/admin/lookup"        element={<ProtectedRoute adminOnly><Layout><EmployeeLookup /></Layout></ProtectedRoute>} />

      {/* ── Employee routes ────────────────────── */}
      <Route path="/employee"               element={<ProtectedRoute adminOnly={false}><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
      <Route path="/employee/attendance"    element={<ProtectedRoute adminOnly={false}><Layout><AttendancePage /></Layout></ProtectedRoute>} />
      <Route path="/employee/leaves"        element={<ProtectedRoute adminOnly={false}><Layout><MyLeaves /></Layout></ProtectedRoute>} />
      <Route path="/employee/payslips"      element={<ProtectedRoute adminOnly={false}><Layout><MyPayslips /></Layout></ProtectedRoute>} />
      <Route path="/employee/performance"   element={<ProtectedRoute adminOnly={false}><Layout><PerformancePage /></Layout></ProtectedRoute>} />
      <Route path="/employee/announcements" element={<ProtectedRoute adminOnly={false}><Layout><Announcements isAdmin={false} /></Layout></ProtectedRoute>} />
      <Route path="/employee/password"      element={<ProtectedRoute adminOnly={false}><Layout><ChangePassword /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
