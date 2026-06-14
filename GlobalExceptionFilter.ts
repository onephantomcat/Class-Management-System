import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局异常拦截器 (NestJS 架构)
 * 核心功能：作为纯粹的数据网关，精准捕获数据库层抛出的 SIGNAL SQLSTATE '45000' (或 ER_SIGNAL_EXCEPTION)，
 * 提取 MESSAGE_TEXT 并将其转换为 400 Bad Request 以及标准 JSON 响应。
 * 其余系统异常隐匿堆栈并返回 500。
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 默认 HTTP 状态码为 500
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部异常，请联系系统管理员';

    // 1. 尝试提取底层数据库抛出的异常
    // 在 Node.js/MySQL (如 mysql2 或 typeorm) 中，SQLState '45000' 通常表现为 sqlState 属性或 code 为 'ER_SIGNAL_EXCEPTION'
    if (
      exception.sqlState === '45000' || 
      exception.code === 'ER_SIGNAL_EXCEPTION' || 
      (exception.message && exception.message.includes('45000'))
    ) {
      status = HttpStatus.BAD_REQUEST; // 400 Bad Request
      
      // 2. 剥离系统堆栈，精准提取由触发器中 MESSAGE_TEXT 抛出的纯文本内容
      message = exception.sqlMessage || exception.message;
      
      // 3. 处理可能存在的驱动层前缀 (如 "ER_SIGNAL_EXCEPTION: ")
      if (message.includes('ER_SIGNAL_EXCEPTION: ')) {
        message = message.replace('ER_SIGNAL_EXCEPTION: ', '').trim();
      }
    } else if (exception instanceof HttpException) {
      // 如果是 NestJS 框架内置的已知 HTTP 异常
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = typeof res === 'string' ? res : (res.message || message);
    } else {
      // 4. 非 45000 且非已知 HTTP 异常：隐匿堆栈，仅在日志中记录关键信息
      this.logger.error(`System Internal Error Encountered. Path: ${request.url}, Message: ${exception.message}`);
    }

    // 5. 将纯文本内容封装到一个标准的 JSON 响应体中返回给前端
    response.status(status).json({
      code: status,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
