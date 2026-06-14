import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 开启全局 CORS，方便前后端分离调试
  app.enableCors();
  
  // 注册第一阶段我们编写的核心拦截器：将底层的 SIGNAL 45000 转换为 HTTP 400
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
