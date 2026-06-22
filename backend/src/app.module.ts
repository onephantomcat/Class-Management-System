import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FunctionsController } from './functions/functions.controller';
import { FunctionsService } from './functions/functions.service';

import { ProceduresController } from './procedures/procedures.controller';
import { ProceduresService } from './procedures/procedures.service';

import { TriggersController } from './triggers/triggers.controller';
import { TriggersService } from './triggers/triggers.service';

import { ViewsController } from './views/views.controller';
import { ViewsService } from './views/views.service';

import { 
  UserRolesView,
  PendingApprovalView,
  ClassFeeIncomeView,
  ClassFeeExpenseView,
  PendingClassFeeView,
  StudentPaymentView,
  StudentAcademicOverviewView,
  ClassGradesView,
  StudentDisciplineView,
  ClassAttendanceStatsView,
  AwardApplicationView,
  ActivityRegistrationStatsView,
  SystemLogView
} from './views/entities/views.entity';

import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { ClassFeesModule } from './class-fees/class-fees.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',       
      port: 3306,              
      username: 'root',        
      password: '',    
      database: 'student_management',    
      autoLoadEntities: true,
      synchronize: false,      
    }),
    UsersModule,
    TasksModule,
    ApprovalsModule,
    ClassFeesModule,
    CoursesModule,
    TypeOrmModule.forFeature([
      UserRolesView,
      PendingApprovalView,
      ClassFeeIncomeView,
      ClassFeeExpenseView,
      PendingClassFeeView,
      StudentPaymentView,
      StudentAcademicOverviewView,
      ClassGradesView,
      StudentDisciplineView,
      ClassAttendanceStatsView,
      AwardApplicationView,
      ActivityRegistrationStatsView,
      SystemLogView
    ])
  ],
  controllers: [
    FunctionsController,
    ProceduresController,
    TriggersController,
    ViewsController
  ],
  providers: [
    FunctionsService,
    ProceduresService,
    TriggersService,
    ViewsService
  ],
})
export class AppModule {}
