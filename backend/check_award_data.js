const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', database:'student_management'})
  .then(c => c.query("SELECT * FROM 评优申报详情").then(([rows]) => console.log(rows)).finally(() => c.end()));
