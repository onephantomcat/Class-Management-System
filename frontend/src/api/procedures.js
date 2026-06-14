import request from '../utils/request';

// 1.
export function processApproval(data) {
  return request({ url: '/api/procedures/approvals/process', method: 'post', data });
}

// 2.
export function publishTask(data) {
  return request({ url: '/api/procedures/tasks/publish', method: 'post', data });
}

// 3. (With OUT Parameter)
export function createIncome(data) {
  return request({ url: '/api/procedures/class-fees/income', method: 'post', data });
}

// 4.
export function approveExpense(data) {
  return request({ url: '/api/procedures/class-fees/expense-approval', method: 'post', data });
}

// 5.
export function getClassGpa(params) {
  return request({ url: '/api/procedures/academics/class-gpa', method: 'get', params });
}

// 6.
export function calculateGpa(data) {
  return request({ url: '/api/procedures/academics/calculate-gpa', method: 'post', data });
}

// 7.
export function getAttendanceRate(params) {
  return request({ url: '/api/procedures/discipline/attendance-rate', method: 'get', params });
}

// 8.
export function getPunishmentReport(params) {
  return request({ url: '/api/procedures/discipline/punishment-report', method: 'get', params });
}

// 9.
export function getAwardStats(params) {
  return request({ url: '/api/procedures/awards/stats', method: 'get', params });
}

// 10.
export function archiveActivity(data) {
  return request({ url: '/api/procedures/activities/archive', method: 'post', data });
}
