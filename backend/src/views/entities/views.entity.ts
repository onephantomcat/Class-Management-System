import { ViewEntity, ViewColumn } from 'typeorm';

// ==========================================
// 1. 用户与权限管理模块
// ==========================================
@ViewEntity({ name: '用户与角色详细信息' })
export class UserRolesView {
  @ViewColumn({ name: '学工号' }) staffId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '角色名称' }) roleName: string;
  @ViewColumn({ name: '联系方式' }) contact: string;
  @ViewColumn({ name: '账号状态' }) status: string;
}

// ==========================================
// 2. 日常任务与审批管理模块
// ==========================================
@ViewEntity({ name: '待办审批事务' })
export class PendingApprovalView {
  @ViewColumn({ name: '审批编号' }) approvalId: string;
  @ViewColumn({ name: '审批类型' }) approvalType: string;
  @ViewColumn({ name: '申请人学工号' }) applicantId: string;
  @ViewColumn({ name: '申请人姓名' }) applicantName: string;
  @ViewColumn({ name: '申请内容' }) content: string;
  @ViewColumn({ name: '申请时间' }) applyTime: Date;
  @ViewColumn({ name: '当前审批节点' }) currentNode: string;
}

// ==========================================
// 3. 班费收支管理模块
// ==========================================
@ViewEntity({ name: '班费收入明细' })
export class ClassFeeIncomeView {
  @ViewColumn({ name: '收入编号' }) incomeId: string;
  @ViewColumn({ name: '收入日期' }) incomeDate: Date;
  @ViewColumn({ name: '收入金额' }) amount: number;
  @ViewColumn({ name: '收入类型' }) type: string;
  @ViewColumn({ name: '缴费方式' }) paymentMethod: string;
  @ViewColumn({ name: '备注' }) remark: string;
  @ViewColumn({ name: '经手人学工号' }) handlerId: string;
  @ViewColumn({ name: '经手人姓名' }) handlerName: string;
}

@ViewEntity({ name: '班费支出明细' })
export class ClassFeeExpenseView {
  @ViewColumn({ name: '支出编号' }) expenseId: string;
  @ViewColumn({ name: '申请日期' }) applyDate: Date;
  @ViewColumn({ name: '支出事由' }) reason: string;
  @ViewColumn({ name: '支出金额' }) amount: number;
  @ViewColumn({ name: '票据凭证' }) receipt: string;
  @ViewColumn({ name: '审批状态' }) status: string;
  @ViewColumn({ name: '支付日期' }) payDate: Date;
  @ViewColumn({ name: '公示状态' }) publicStatus: string;
  @ViewColumn({ name: '申请人学工号' }) applicantId: string;
  @ViewColumn({ name: '初审人学工号' }) firstReviewerId: string;
  @ViewColumn({ name: '终审人学工号' }) finalReviewerId: string;
  @ViewColumn({ name: '申请人姓名' }) applicantName: string;
  @ViewColumn({ name: '初审人姓名' }) firstReviewerName: string;
  @ViewColumn({ name: '终审人姓名' }) finalReviewerName: string;
}

@ViewEntity({ name: '待审批班费支出' })
export class PendingClassFeeView {
  @ViewColumn({ name: '支出编号' }) expenseId: string;
  @ViewColumn({ name: '申请日期' }) applyDate: Date;
  @ViewColumn({ name: '支出事由' }) reason: string;
  @ViewColumn({ name: '支出金额' }) amount: number;
  @ViewColumn({ name: '申请人姓名' }) applicantName: string;
  @ViewColumn({ name: '审批状态' }) status: string;
}

@ViewEntity({ name: '学生缴费情况明细' })
export class StudentPaymentView {
  @ViewColumn({ name: '学工号' }) studentId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '收入编号' }) incomeId: string;
  @ViewColumn({ name: '收入类型' }) type: string;
  @ViewColumn({ name: '缴费状态' }) status: string;
  @ViewColumn({ name: '缴费时间' }) payTime: Date;
  @ViewColumn({ name: '缴费金额' }) paidAmount: number;
  @ViewColumn({ name: '应缴金额' }) totalAmount: number;
  @ViewColumn({ name: '欠费金额' }) debtAmount: number;
}

// ==========================================
// 4. 学业管理模块
// ==========================================
@ViewEntity({ name: '学生个人学业总览' })
export class StudentAcademicOverviewView {
  @ViewColumn({ name: '学生学工号' }) studentId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '学期' }) semester: string;
  @ViewColumn({ name: '平均绩点' }) gpa: number;
  @ViewColumn({ name: '挂科科目数' }) failCount: number;
  @ViewColumn({ name: '挂科标记' }) failFlag: string;
  @ViewColumn({ name: '班级排名' }) classRank: number;
}

@ViewEntity({ name: '班级成绩与课表明细' })
export class ClassGradesView {
  @ViewColumn({ name: '成绩编号' }) gradeId: string;
  @ViewColumn({ name: '学生学工号' }) studentId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '课程编号' }) courseId: string;
  @ViewColumn({ name: '课程名称' }) courseName: string;
  @ViewColumn({ name: '任课教师' }) teacher: string;
  @ViewColumn({ name: '上课时间' }) classTime: string;
  @ViewColumn({ name: '上课地点' }) classLocation: string;
  @ViewColumn({ name: '平时成绩' }) normalScore: number;
  @ViewColumn({ name: '考试成绩' }) examScore: number;
  @ViewColumn({ name: '总评成绩' }) finalScore: number;
  @ViewColumn({ name: '绩点' }) credit: number;
  @ViewColumn({ name: '学期' }) semester: string;
  @ViewColumn({ name: '成绩状态' }) status: string;
}

// ==========================================
// 5. 纪律管理模块
// ==========================================
@ViewEntity({ name: '学生个人纪律档案' })
export class StudentDisciplineView {
  @ViewColumn({ name: '记录编号' }) recordId: string;
  @ViewColumn({ name: '学生学工号' }) studentId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '记录类型' }) type: string;
  @ViewColumn({ name: '考勤状态' }) attendanceStatus: string;
  @ViewColumn({ name: '处分类型' }) punishType: string;
  @ViewColumn({ name: '请假审批编号' }) leaveId: string;
  @ViewColumn({ name: '记录人学工号' }) recorderId: string;
  @ViewColumn({ name: '记录人姓名' }) recorderName: string;
  @ViewColumn({ name: '记录时间' }) recordTime: Date;
}

@ViewEntity({ name: '班级出勤率周统计' })
export class ClassAttendanceStatsView {
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '周次' }) week: string;
  @ViewColumn({ name: '正常出勤次数' }) normalCount: number;
  @ViewColumn({ name: '迟到次数' }) lateCount: number;
  @ViewColumn({ name: '早退次数' }) earlyCount: number;
  @ViewColumn({ name: '旷课次数' }) absentCount: number;
  @ViewColumn({ name: '请假次数' }) leaveCount: number;
  @ViewColumn({ name: '总考勤次数' }) totalCount: number;
}

// ==========================================
// 6. 综合评优与活动管理模块
// ==========================================
@ViewEntity({ name: '评优申报详情' })
export class AwardApplicationView {
  @ViewColumn({ name: '项目编号' }) projectId: string;
  @ViewColumn({ name: '项目名称' }) projectName: string;
  @ViewColumn({ name: '评选类别' }) category: string;
  @ViewColumn({ name: '申报编号' }) applyId: string;
  @ViewColumn({ name: '申请人学号' }) applicantId: string;
  @ViewColumn({ name: '姓名' }) name: string;
  @ViewColumn({ name: '所属班级' }) className: string;
  @ViewColumn({ name: '获奖等级' }) awardLevel: string;
  @ViewColumn({ name: '公示状态' }) publicStatus: string;
}

@ViewEntity({ name: '活动报名统计' })
export class ActivityRegistrationStatsView {
  @ViewColumn({ name: '活动编号' }) activityId: string;
  @ViewColumn({ name: '活动名称' }) activityName: string;
  @ViewColumn({ name: '人数限制' }) limitCount: number;
  @ViewColumn({ name: '实际报名人数' }) regCount: number;
  @ViewColumn({ name: '实际到场人数' }) attendCount: number;
}
