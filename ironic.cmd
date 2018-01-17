@echo off
cls
echo Removing www directory...
rd /s/q www
del package-lock.json
xcopy moment.d.ts node_modules\moment /y
xcopy pouchdb-authentication.utils.js node_modules\pouchdb-authentication\lib\utils.js /y
xcopy electron-in-page-search\index.d.ts node_modules\electron-in-page-search /y
rem choice /t 5 /d Y
echo Checking if new plugins need instaling...
REM powershell -c (New-Object Media.SoundPlayer ".\ironic01.wav").PlaySync()
REM start sass --scss --no-cache --watch src\assets\css\printpage.scss:src\assets\css\printpage.css
if not exist node_modules\angular-calendar (
  echo Installing new plugins...
  npm install --save angular-calendar & ionic serve -p 8101 -r 35730
  REM node sass-custom.js & npm install & ionic serve -p 8101 -r 35730
  REM npm install --save promise-worker monaco-editor ngx-clipboard worker-pouch & ionic serve -p 8101 -r 35730
  REM npm install --save mousetrap & ionic serve -p 8101 -r 35730
) else (
  echo No plugins need installing.
  REM ionic serve -p 8101 -r 35730 --address 0.0.0.0
  REM node sass-custom.js & ionic serve -p 8101 -r 35730
  ionic serve -p 8101 -r 35730
)
