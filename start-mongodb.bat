@echo off
echo Starting local MongoDB server on port 27017...
if not exist "backend\data\db" mkdir "backend\data\db"
"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "backend\data\db" --port 27017
pause
