import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  
  // 1=班主任, 2=班长, 3=职能班委, 4=普通成员
  const roleCode = ref(parseInt(localStorage.getItem('roleCode') || '0'));
  
  // 如果是职能班委(3)，会有具体的岗位标识（如'学习委员', '纪律委员'等）
  const jobId = ref(localStorage.getItem('jobId') || '');
  const studentName = ref(localStorage.getItem('studentName') || '');
  const studentId = ref(localStorage.getItem('studentId') || '');

  function login(userData) {
    token.value = userData.token;
    roleCode.value = userData.roleCode;
    jobId.value = userData.jobId || '';
    studentName.value = userData.name || 'Test User';
    studentId.value = userData.studentId || '';
    
    localStorage.setItem('token', token.value);
    localStorage.setItem('roleCode', roleCode.value.toString());
    localStorage.setItem('jobId', jobId.value);
    localStorage.setItem('studentName', studentName.value);
    localStorage.setItem('studentId', studentId.value);
  }

  function logout() {
    token.value = '';
    roleCode.value = 0;
    jobId.value = '';
    studentName.value = '';
    studentId.value = '';
    localStorage.clear();
  }

  return { token, roleCode, jobId, studentName, studentId, login, logout };
});
