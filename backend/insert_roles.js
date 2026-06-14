const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', database: 'student_management' });
  await conn.query("INSERT INTO 角色表 (角色编码, 角色名称) VALUES ('1', '班主任'), ('2', '班长/团支书'), ('3', '职能班委'), ('4', '普通成员');");
  console.log('Roles inserted');
  conn.end();
}
main();
