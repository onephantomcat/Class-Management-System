@echo off
chcp 65001 >nul
echo =========================================
echo       正在启动高校班级事务管理系统...
echo =========================================
echo.

echo [1/2] 正在启动后端服务 (NestJS)...
start "Backend Service" cmd /k "cd backend && npm run start:dev"

echo [2/2] 正在启动前端服务 (Vue3)...
start "Frontend Service" cmd /k "cd frontend && npm run dev"

echo.
echo 系统服务已在后台终端唤起！
echo 请等待约 5-10 秒让服务完全启动...
echo 随后请在浏览器中访问: http://localhost:5173
echo.
pause
