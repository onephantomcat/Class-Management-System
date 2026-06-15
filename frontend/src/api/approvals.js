import request from '@/utils/request';

export function createGradeModificationRequest(data) {
  return request({
    url: '/api/approvals/grade-modification',
    method: 'post',
    data
  });
}
