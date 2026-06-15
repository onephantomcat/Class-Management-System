import request from '@/utils/request';

export function getCourses(params) {
  return request({
    url: '/api/courses',
    method: 'get',
    params
  });
}

export function createCourse(data) {
  return request({
    url: '/api/courses',
    method: 'post',
    data
  });
}

export function updateCourse(id, data) {
  return request({
    url: `/api/courses/${id}`,
    method: 'put',
    data
  });
}

export function deleteCourse(id) {
  return request({
    url: `/api/courses/${id}`,
    method: 'delete'
  });
}
