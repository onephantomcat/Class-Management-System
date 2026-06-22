const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
  await conn.query("INSERT IGNORE INTO 用户账号与权限信息表 (学工号, 姓名, 登录密码, 所属班级, 角色编码, 角色名称, 账号状态) VALUES ('S004', '钱财务', '123456', '计算机科学与技术2201班', 3, '财务委员', '正常')");
  await conn.query("INSERT IGNORE INTO 用户账号与权限信息表 (学工号, 姓名, 登录密码, 所属班级, 角色编码, 角色名称, 账号状态) VALUES ('S005', '孙文体', '123456', '计算机科学与技术2201班', 3, '文体委员', '正常')");
  console.log('Users inserted');
  process.exit(0);
}
run();
