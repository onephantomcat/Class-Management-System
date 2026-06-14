import request from '../utils/request';

// 1.
export function getPendingApprovalCount(approverId) {
  return request({ url: `/api/functions/approvals/pending-count/${approverId}`, method: 'get' });
}

// 2.
export function getUserTaskSummary(userId) {
  return request({ url: `/api/functions/tasks/summary/${userId}`, method: 'get' });
}

// 3.
export function getStudentDebt(studentId) {
  return request({ url: `/api/functions/class-fees/debt/${studentId}`, method: 'get' });
}

// 4.
export function getIncomeDebtDetails(incomeId) {
  return request({ url: `/api/functions/class-fees/debt-details/${incomeId}`, method: 'get' });
}

// 5.
export function getGpaByScore(score) {
  return request({ url: `/api/functions/academics/gpa/${score}`, method: 'get' });
}

// 6.
export function hasFailed(studentId, semester) {
  return request({ url: `/api/functions/academics/has-failed/${studentId}/${semester}`, method: 'get' });
}

// 7.
export function getAttendanceRate(params) {
  return request({ url: '/api/functions/discipline/attendance-rate', method: 'get', params });
}

// 8. 专属指令路由
export function getClassAbnormalStudents(className, threshold) {
  return request({ url: `/api/discipline/abnormal/${className}`, method: 'get', params: { threshold } });
}

// 9.
export function getActivityRegistrationCount(activityId) {
  return request({ url: `/api/functions/activities/registration-count/${activityId}`, method: 'get' });
}

// 10.
export function getAwardWinnerCount(projectId) {
  return request({ url: `/api/functions/awards/winner-count/${projectId}`, method: 'get' });
}
