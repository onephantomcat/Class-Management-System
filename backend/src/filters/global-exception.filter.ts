import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // 如果是 MySQL 底层抛出的 SIGNAL 45000 自定义业务异常
    if (exception.code === 'ER_SIGNAL_EXCEPTION' || exception.sqlState === '45000') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: exception.sqlMessage || '数据库底层校验失败，请求被拒绝'
      });
    }

    // 默认的异常处理
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : '服务器内部错误';

    response.status(status).json({
      code: status,
      message: message
    });
  }
}
