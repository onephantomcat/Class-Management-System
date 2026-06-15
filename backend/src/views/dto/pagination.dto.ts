export class PaginationQueryDto {
  /**
   * 当前页码，默认 1
   */
  page?: number = 1;

  /**
   * 每页条数，默认 10
   */
  pageSize?: number = 10;

  /**
   * 搜索关键字
   */
  keyword?: string;

  /**
   * 学工号（用于精确过滤当前学生数据）
   */
  studentId?: string;
}

/**
 * 分页统一响应体
 */
export class PaginatedResponse<T> {
  total: number;
  list: T[];
  page: number;
  pageSize: number;

  constructor(total: number, list: T[], page: number, pageSize: number) {
    this.total = total;
    this.list = list;
    this.page = page;
    this.pageSize = pageSize;
  }
}
