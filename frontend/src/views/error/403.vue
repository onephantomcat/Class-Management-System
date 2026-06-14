<template>
  <div class="error-page">
    <el-result
      icon="warning"
      title="403 Forbidden"
      sub-title="抱歉，您的角色权限不足以访问该页面或执行此操作。"
    >
      <template #extra>
        <div class="reason">
          <p>可能的原因：</p>
          <ul>
            <li>您当前登录的身份是：<b>{{ roleLabel }}</b></li>
            <li>该页面仅允许管理员、班主任或特定的职能班委访问。</li>
            <li>系统底层的 RBAC 路由前置守卫 (beforeEach) 已成功将您的越权访问拦截。</li>
          </ul>
        </div>
        <el-button type="primary" @click="$router.push('/')">返回安全首页</el-button>
        <el-button @click="$router.push('/login')">重新选择身份登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const roleLabel = computed(() => {
  const roleCode = userStore.roleCode;
  if (roleCode === 1) return '班主任';
  if (roleCode === 2) return '班长';
  if (roleCode === 3) return `职能班委 (${userStore.jobId})`;
  if (roleCode === 4) return '普通成员';
  return '未登录访客';
});
</script>

<style scoped>
.error-page {
  height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
}
.reason {
  text-align: left;
  margin-bottom: 30px;
  background: #fdf6ec;
  padding: 15px 25px;
  border-radius: 4px;
  color: #e6a23c;
}
.reason p { font-weight: bold; margin-top: 0; }
.reason ul { padding-left: 20px; margin-bottom: 0; }
.reason li { margin-bottom: 5px; }
</style>
