echo Removing www and starting ionic serve...
cd ~/code/OnSiteConsoleX
rm -f package-lock.json
rm -rf www
cp -f moment.d.ts node_modules/moment/
cp -f pouchdb-authentication.utils.js node_modules/pouchdb-authentication/lib/utils.js
# osascript -e 'tell application "Terminal" to do script "sass --scss --no-cache --watch src\assets\css\printpage.scss:src\assets\css\printpage.css"'

if [ ! -e node_modules/angular-calendar ]; then
  # npm install --save monaco-editor promise-worker ngx-clipboard worker-pouch; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  # npm install --save mousetrap; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  # node sass-custom.js; npm install; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  npm install --save angular-calendar; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
else
  # node sass-custom.js; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
fi
