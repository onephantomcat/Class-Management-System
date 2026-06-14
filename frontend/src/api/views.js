import request from '../utils/request';

// 1. 用户与权限管理模块
export function getUserRoles(params) { return request({ url: '/api/views/user-roles', method: 'get', params }); }

// 2. 日常任务与审批管理模块
export function getPendingApprovals(params) { return request({ url: '/api/views/pending-approvals', method: 'get', params }); }

// 3. 班费收支管理模块
export function getClassFeeIncomes(params) { return request({ url: '/api/views/class-fee-incomes', method: 'get', params }); }
export function getClassFeeExpenses(params) { return request({ url: '/api/views/class-fee-expenses', method: 'get', params }); }
export function getPendingClassFees(params) { return request({ url: '/api/views/pending-class-fees', method: 'get', params }); }
export function getStudentPayments(params) { return request({ url: '/api/views/student-payments', method: 'get', params }); }

// 4. 学业管理模块
export function getStudentAcademics(params) { return request({ url: '/api/views/student-academics', method: 'get', params }); }
export function getClassGrades(params) { return request({ url: '/api/views/class-grades', method: 'get', params }); }

// 5. 纪律管理模块
export function getStudentDisciplines(params) { return request({ url: '/api/views/student-disciplines', method: 'get', params }); }
export function getClassAttendanceStats(params) { return request({ url: '/api/views/class-attendance-stats', method: 'get', params }); }

// 6. 综合评优与活动管理模块
export function getAwardApplications(params) { return request({ url: '/api/views/award-applications', method: 'get', params }); }
export function getActivityRegistrationStats(params) { return request({ url: '/api/views/activity-registration-stats', method: 'get', params }); }
