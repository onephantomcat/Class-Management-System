import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api', // url = base url + request url
  timeout: 5000 // 请求超时时间
});

// request 拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加Token等认证信息
    // const token = getToken();
    // if (token) { config.headers['Authorization'] = 'Bearer ' + token; }
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    // 如果后端的成功代码是 200，此处进行正常的数据透传
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '操作异常');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  error => {
    // 拦截全局异常（如：从后端 GlobalExceptionHandler 转发出的状态码）
    if (error.response) {
      const status = error.response.status;
      const resData = error.response.data;

      if (status === 400) {
        // 捕获到 400 Bad Request
        // 后端将 45000 数据库信号拦截成了标准的包含 {code, message, data} 的 JSON 并修改为 400
        // 精确拦截提取后端传递的数据库底层透传的 message 并做 Toast 弹窗
        ElMessage({
          message: resData.message || '业务操作被拒绝（违反系统业务约束）',
          type: 'warning',    // 业务约束通常判定为警告级别
          duration: 4000,
          showClose: true
        });
      } else if (status === 500) {
        // 500 Internal Server Error，常规错误处理
        ElMessage({
          message: resData.message || '服务器内部错误，请稍后重试或联系管理员',
          type: 'error',
          duration: 5000,
          showClose: true
        });
      } else {
        // HTTP 401, 403, 404 等其他协议级错误
        ElMessage({
          message: `请求失败 (HTTP 状态码: ${status})`,
          type: 'error',
          duration: 5000,
          showClose: true
        });
      }
    } else {
      // 请求超时或网络断开
      ElMessage({
        message: '网络异常或请求超时，请检查您的网络连接',
        type: 'error',
        duration: 5000,
        showClose: true
      });
    }
    
    return Promise.reject(error);
  }
);

export default service;
