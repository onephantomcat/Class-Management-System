const mysql = require('mysql2/promise');
mysql.createConnection({host:'localhost', user:'root', database:'student_management'})
  .then(c => c.query("SHOW CREATE VIEW 班费收入明细").then(([rows]) => console.log(rows[0]['Create View'])).finally(() => c.end()));
