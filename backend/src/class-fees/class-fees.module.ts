import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassFeesService } from './class-fees.service';
import { ClassFeesController } from './class-fees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [ClassFeesController],
  providers: [ClassFeesService],
})
export class ClassFeesModule {}
