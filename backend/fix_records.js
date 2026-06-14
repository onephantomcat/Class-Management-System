const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', database:'student_management'})
  .then(c => c.query("UPDATE 审批流程总表 SET 当前审批节点 = '班主任终审' WHERE 审批类型 = '评优申请' AND 当前审批节点 IS NULL")
  .then(() => console.log('Updated!'))
  .finally(() => c.end()));
