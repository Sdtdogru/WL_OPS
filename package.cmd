@echo off
@REM .\mvnw.cmd clean package
.\mvnw.cmd -e clean verify -U -Ddebug.on=%1