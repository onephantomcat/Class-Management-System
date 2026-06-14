import request from '../utils/request';

// 学业模块成绩录入
export function insertScore(data) {
  return request({ url: '/api/triggers/academics/scores', method: 'post', data });
}

// 供成绩录入页面侧边栏拉取个人总览用 (第二阶段构建好的视图查询)
export function getStudentAcademicsOverview(studentId) {
  return request({ url: '/api/views/student-academics', method: 'get', params: { keyword: studentId } });
}

// 用户模块注册
export function insertUser(data) {
  return request({ url: '/api/triggers/users', method: 'post', data });
}

// 任务模块状态更新
export function updateTaskStatus(taskId, status) {
  return request({ url: `/api/triggers/tasks/${taskId}/status`, method: 'put', data: { status } });
}

// 班费缴费
export function payClassFee(detailId) {
  return request({ url: `/api/triggers/class-fees/details/${detailId}/pay`, method: 'put' });
}

// 班费审批
export function auditExpense(expenseId, status, auditorId) {
  return request({ url: `/api/triggers/class-fees/expenses/${expenseId}/status`, method: 'put', data: { status, auditorId } });
}

// 纪律考勤录入
export function insertDisciplineRecord(data) {
  return request({ url: '/api/triggers/discipline/records', method: 'post', data });
}

// 获取纪律视图总览
export function getStudentDisciplinesOverview(studentId) {
  return request({ url: '/api/views/student-disciplines', method: 'get', params: { keyword: studentId } });
}

// 评优等级修改
export function updateAwardLevel(applicationId, level) {
  return request({ url: `/api/triggers/awards/applications/${applicationId}/level`, method: 'put', data: { level } });
}

// 活动报名
export function insertActivityRegistration(data) {
  return request({ url: '/api/triggers/activities/registrations', method: 'post', data });
}
