import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080' });

// ── Employees ──────────────────────────────────────────
export const getEmployees = () => API.get('/employees');
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const getEmployeeByCode = (code) => API.get(`/employees/code/${code}`);
export const getAttendancePct = (id, month, year) => API.get(`/employees/${id}/attendance-percentage?month=${month}&year=${year}`);
export const createEmployee = (data) => API.post('/employees', data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
export const searchEmployees = (keyword) => API.get(`/employees/search?keyword=${keyword}`);
export const getEmployeesByDept = (deptId) => API.get(`/employees/department/${deptId}`);

// ── Departments ────────────────────────────────────────
export const getDepartments = () => API.get('/departments');
export const createDepartment = (data) => API.post('/departments', data);
export const deleteDepartment = (id) => API.delete(`/departments/${id}`);

// ── Attendance ─────────────────────────────────────────
export const markAttendance = (data) => API.post('/attendance', data);
export const getTodayAttendance = () => API.get('/attendance/today');
export const getAttendanceByEmployee = (id) => API.get(`/attendance/employee/${id}`);
export const getMonthlySummary = (id, month, year) => API.get(`/attendance/employee/${id}/summary?month=${month}&year=${year}`);

// ── Leave ──────────────────────────────────────────────
export const applyLeave = (data) => API.post('/leaves', data);
export const getAllLeaves = () => API.get('/leaves');
export const getPendingLeaves = () => API.get('/leaves/pending');
export const getLeavesByEmployee = (id) => API.get(`/leaves/employee/${id}`);
export const reviewLeave = (id, data) => API.put(`/leaves/${id}/review`, data);

// ── Payroll ────────────────────────────────────────────
export const getSalaryBreakdown = (basicSalary, bonus = 0) => API.get(`/payroll/breakdown?basicSalary=${basicSalary}&bonus=${bonus}`);
export const getPaySlipsByEmployee = (id) => API.get(`/payroll/employee/${id}`);
export const getPaySlipsByMonth = (month, year) => API.get(`/payroll/month?month=${month}&year=${year}`);
export const generatePaySlip = (id, data) => API.post(`/payroll/employee/${id}/generate`, data);
export const runMonthlyPayroll = (data) => API.post('/payroll/run', data);

// ── Performance ────────────────────────────────────────
export const getPerformanceByEmployee = (id) => API.get(`/performance/employee/${id}`);
export const getAllPerformance = () => API.get('/performance');
export const addReview = (data) => API.post('/performance', data);

// ── Announcements ──────────────────────────────────────
export const getAnnouncements = () => API.get('/announcements');
export const createAnnouncement = (data) => API.post('/announcements', data);
export const archiveAnnouncement = (id) => API.put(`/announcements/${id}/archive`);

// ── Dashboard ──────────────────────────────────────────
export const getDashboardSummary = () => API.get('/dashboard/summary');
export const getPayrollTrend = () => API.get('/dashboard/payroll-trend');