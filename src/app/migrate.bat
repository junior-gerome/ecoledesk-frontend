@echo off
echo Migration des imports en cours...

cd /d c:\Projects\Primary-School\frontend\src\app

REM Models vers Features - Attendance
powershell -Command "(Get-Content -Path '**\*.ts' -Recurse) -replace '@app/core/models/attendance/attendance.model', '@app/features/attendance/domain/models' | Set-Content -Path '**\*.ts'"

REM Models vers Features - Classes
powershell -Command "Get-ChildItem -Recurse -Filter *.ts | ForEach-Object { (Get-Content $_.FullName) -replace '@app/core/models/classes/class.interface', '@app/features/classes/domain/models' | Set-Content $_.FullName }"

echo Migration terminee!
pause
