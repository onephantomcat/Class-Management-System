const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'student_management'
  });

  const sql = `ALTER VIEW 班费支出明细 AS 
    select e.支出编号 AS 支出编号,
           e.申请日期 AS 申请日期,
           e.支出事由 AS 支出事由,
           e.支出金额 AS 支出金额,
           e.票据凭证 AS 票据凭证,
           e.审批状态 AS 审批状态,
           e.支付日期 AS 支付日期,
           e.公示状态 AS 公示状态,
           e.申请人学工号 AS 申请人学工号,
           e.初审人学工号 AS 初审人学工号,
           e.终审人学工号 AS 终审人学工号,
           a.姓名 AS 申请人姓名,
           b.姓名 AS 初审人姓名,
           c.姓名 AS 终审人姓名 
    from (((班费支出申请表 e 
           left join 用户账号与权限信息表 a on((e.申请人学工号 = a.学工号))) 
           left join 用户账号与权限信息表 b on((e.初审人学工号 = b.学工号))) 
           left join 用户账号与权限信息表 c on((e.终审人学工号 = c.学工号))) 
    where ((e.审批状态 IN ('已通过', '已报销')) and (e.支付日期 is not null)) 
    order by e.支付日期 desc`;

  await conn.query(sql);
  console.log('View Fixed!');
  await conn.end();
}

fix();
