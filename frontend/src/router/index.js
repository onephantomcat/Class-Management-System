import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';
import Layout from '@/layout/Layout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '系统登录' }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403 权限拒绝' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/views/award-details', // 默认所有人都能看到的首页
    children: [
      // ========================
      // 1. 公共查询与全景档案库 (角色 1,2,3,4 均可)
      // ========================
      {
        path: 'views/award-details',
        component: () => import('@/views/AwardApplicationView.vue'),
        meta: { roles: [1, 2, 3, 4], title: '评优申报公示' }
      },
      {
        path: 'views/expense-details',
        component: () => import('@/views/ClassFeeExpenseView.vue'),
        meta: { roles: [1, 2, 3, 4], title: '班费支出明细' }
      },
      {
        path: 'views/class-fee-incomes',
        component: () => import('@/views/ClassFeeIncomeView.vue'),
        meta: { roles: [1, 2, 3, 4], title: '班费收入明细' }
      },
      {
        path: 'views/student-payments',
        component: () => import('@/views/StudentPaymentView.vue'),
        meta: { roles: [1, 2, 3], requiredJob: '财务', title: '班级缴费大盘' }
      },
      {
        path: 'views/student-academics',
        component: () => import('@/views/StudentAcademicOverview.vue'),
        meta: { roles: [1, 2, 3, 4], title: '个人学业大盘' }
      },
      {
        path: 'views/student-disciplines',
        component: () => import('@/views/StudentDisciplineView.vue'),
        meta: { roles: [1, 2, 3, 4], title: '个人纪律档案' }
      },
      {
        path: 'views/class-attendance-stats',
        component: () => import('@/views/ClassAttendanceStatsView.vue'),
        meta: { roles: [1, 2, 3], requiredJob: '纪律', title: '班级考勤大盘' }
      },
      {
        path: 'views/class-schedule',
        component: () => import('@/views/ClassScheduleView.vue'),
        meta: { roles: [1, 2, 3, 4], title: '班级学期课表' }
      },
      {
        path: 'views/activity-registration-stats',
        component: () => import('@/views/ActivityRegistrationStatsView.vue'),
        meta: { roles: [1, 2, 3], title: '班级活动大盘' }
      },
      {
        path: 'views/class-grades',
        component: () => import('@/views/ClassGradesView.vue'),
        meta: { roles: [1, 2, 3], requiredJob: '学习', title: '班级成绩大盘' }
      },
      {
        path: 'views/pending-approvals',
        component: () => import('@/views/PendingApprovalView.vue'),
        meta: { roles: [1, 2], title: '全局待办审批' }
      },
      {
        path: 'views/user-roles',
        component: () => import('@/views/UserRolesView.vue'),
        meta: { roles: [1, 2], title: '角色权限清单' }
      },

      // ========================
      // 2. 专项工作台 (部分开放或根据特定职责开放)
      // ========================
      {
        path: 'tasks/center',
        component: () => import('@/views/tasks/TaskCenter.vue'),
        meta: { roles: [1, 2, 3, 4], title: '日常任务大厅' }
      },
      {
        path: 'approvals/center',
        component: () => import('@/views/approvals/ApprovalCenter.vue'),
        meta: { roles: [1, 2, 3, 4], title: '审批大厅' }
      },
      {
        path: 'class-fees/dashboard',
        component: () => import('@/views/class-fees/ClassFeeDashboard.vue'),
        meta: { roles: [1, 2, 3, 4], title: '班费账单中心' }
      },
      {
        path: 'triggers/score-entry',
        component: () => import('@/views/triggers/ScoreEntryView.vue'),
        // 核心：要求角色包含 1, 2, 或 3。如果为3，额外要求 jobId 包含 '学习'
        meta: { roles: [1, 2, 3], requiredJob: '学习', title: '成绩动态录入' }
      },
      {
        path: 'discipline-entry',
        name: 'DisciplineEntry',
        component: () => import('@/views/triggers/DisciplineEntryView.vue'),
        meta: { title: '考勤与违纪录入', roles: [1, 3] }
      },
      {
        path: 'awards-activities',
        name: 'AwardsAndActivities',
        component: () => import('@/views/triggers/AwardsAndActivitiesView.vue'),
        meta: { title: '评优与活动报名', roles: [1, 2, 3, 4] }
      },
      {
        path: 'triggers/discipline',
        component: () => import('@/views/triggers/DisciplineEntryView.vue'),
        meta: { roles: [1, 2, 3], requiredJob: '纪律', title: '考勤与纪律登记' }
      },

      // ========================
      // 3. 管理控制台 (仅角色 1, 2)
      // ========================
      {
        path: 'users/management',
        component: () => import('@/views/users/UserManagement.vue'),
        meta: { roles: [1, 2], title: '用户与权限管理' }
      },
      {
        path: 'functions/dashboard',
        component: () => import('@/views/functions/FunctionsDashboard.vue'),
        meta: { roles: [1, 2], title: '标量函数大盘' }
      },
      {
        path: 'triggers/dashboard',
        component: () => import('@/views/triggers/TriggersDashboard.vue'),
        meta: { roles: [1, 2], title: '全业务触发控制台' }
      },
      {
        path: 'views/system-logs',
        component: () => import('@/views/SystemLogsView.vue'),
        meta: { roles: [1, 2], title: '系统全局日志' }
      },
      {
        path: 'views/approval-flows',
        component: () => import('@/views/ApprovalFlowsView.vue'),
        meta: { roles: [1, 2], title: '全局审批流程大盘' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/403'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;
  
  if (to.meta.title) document.title = to.meta.title;

  // 1. 如果去登陆页，直接放行
  if (to.path === '/login') {
    return next();
  }

  // 2. 如果没登录且去的不是登陆页，打回登陆页
  if (!token) {
    return next('/login');
  }

  // 3. 提取目标路由的 RBAC 要求
  const requiredRoles = to.meta.roles;
  if (requiredRoles) {
    const userRole = userStore.roleCode;
    
    // a) 如果当前用户的角色完全不在允许的数组里 (比如 4 访问了只限 [1,2] 的路由)
    if (!requiredRoles.includes(userRole)) {
      return next('/403');
    }

    // b) 如果是角色 3 (职能班委)，额外做精细化岗位校验
    if (userRole === 3 && to.meta.requiredJob) {
      if (Array.isArray(to.meta.requiredJob)) {
        const hasJob = to.meta.requiredJob.some(job => userStore.jobId && userStore.jobId.includes(job));
        if (!hasJob) return next('/403');
      } else {
        if (!userStore.jobId || !userStore.jobId.includes(to.meta.requiredJob)) {
          return next('/403');
        }
      }
    }
  }

  // 4. 全部校验通过，放行
  next();
});

export default router;
