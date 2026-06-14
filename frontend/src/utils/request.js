import axios from 'axios';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '', // 由 vite proxy 代理到 /api
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 捕获由后端抛出的 HTTP 400 (底层触发器 45000 报错)
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error({
        message: error.response.data.message,
        duration: 5000,
        showClose: true
      });
    } else {
      ElMessage.error('网络异常或服务器无响应');
    }
    return Promise.reject(error);
  }
);

export default request;
