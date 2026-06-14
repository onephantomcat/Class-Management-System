const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'student_management'});
  try {
    await conn.query('DROP PROCEDURE IF EXISTS sp_新增班费收入并生成缴费明细');
    await conn.query(`
CREATE PROCEDURE sp_新增班费收入并生成缴费明细(
    IN p_收入日期 DATE,
    IN p_收入金额 DECIMAL(10,2),
    IN p_收入类型 VARCHAR(50),
    IN p_缴费方式 VARCHAR(50),
    IN p_备注 TEXT,
    IN p_经手人学工号 VARCHAR(50),
    OUT p_生成的收入编号 VARCHAR(50)
)
BEGIN
    DECLARE v_收入编号 VARCHAR(50);
    DECLARE v_学工号 VARCHAR(50);
    DECLARE v_done INT DEFAULT 0;

    DECLARE student_cursor CURSOR FOR
        SELECT 学工号 FROM 用户账号与权限信息表 WHERE 角色编码 != '1';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    SET v_收入编号 = CONCAT('INCOME_', DATE_FORMAT(p_收入日期, '%Y%m%d'), '_', 
        LPAD((SELECT COUNT(*) + 1 FROM 班费收入记录表 WHERE 收入日期 = p_收入日期), 3, '0'));
    
    START TRANSACTION;
    INSERT INTO 班费收入记录表(收入编号, 收入日期, 收入金额, 收入类型, 缴费方式, 备注, 经手人学工号)
    VALUES(v_收入编号, p_收入日期, 0, p_收入类型, p_缴费方式, p_备注, p_经手人学工号);
    
    OPEN student_cursor;
    
    FETCH student_cursor INTO v_学工号;
    
    student_loop: LOOP
        IF v_done = 1 THEN
            LEAVE student_loop;
        END IF;
        
        INSERT INTO 学生缴费明细表(明细编号, 学工号, 收入编号, 应缴金额, 缴费状态)
        VALUES(
            CONCAT('PAY_', v_收入编号, '_', v_学工号),
            v_学工号,
            v_收入编号,
            p_收入金额,
            '未缴费'
        );
        FETCH student_cursor INTO v_学工号;
    END LOOP;
    
    CLOSE student_cursor;
    COMMIT;
    SET p_生成的收入编号 = v_收入编号;
END
    `);
    console.log('Procedure sp_新增班费收入并生成缴费明细 fixed!');
  } catch(e) {
    console.error('SQL Error:', e.message);
  } finally {
    conn.end();
  }
}
run();
