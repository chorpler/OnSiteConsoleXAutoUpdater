module.exports = {
    copyAssets: {
        src: ['{{SRC}}/assets/**/*'],
        dest: '{{WWW}}/assets'
    },
    copyAssetsAgain: {
        src: ['{{SRC}}/assets/**/*'],
        dest: '{{BUILD}}/assets'
    },
    copyKeyCodeServiceConfigFile: {
      src: ['{{SRC}}/config/keyconfig.json5'],
      dest: '{{WWW}}/assets/config'
    },
    copyIndexContent: {
        src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js'],
        dest: '{{WWW}}'
    },
    copyFonts: {
        src: ['{{ROOT}}/node_modules/ionicons/dist/fonts/**/*', '{{ROOT}}/node_modules/ionic-angular/fonts/**/*'],
        dest: '{{WWW}}/assets/fonts'
    },
    copyWebviewFiles: {
      src: ['{{SRC}}/lib/search-window.html', '{{SRC}}/lib/default-style.css'],
      dest: '{{WWW}}'
    },
    copyWebviewFilesAgain: {
      src: ['{{SRC}}/lib/search-window.html', '{{SRC}}/lib/default-style.css'],
      dest: '{{BUILD}}'
    },
    copyElectronIcons: {
      src: ['{{ROOT}}/electron/icon.icns', '{{ROOT}}/electron/icon.ico'],
      dest: '{{WWW}}'
    },
    copyElectronIconsAgain: {
      src: ['{{SRC}}/lib/search-window.html', '{{SRC}}/lib/default-style.css'],
      dest: '{{BUILD}}'
    },
    copyPolyfills: {
        src: ['{{ROOT}}/node_modules/ionic-angular/polyfills/polyfills.js'],
        dest: '{{BUILD}}'
    },
    copyFontawesomeFonts: {
        src: ['{{ROOT}}/node_modules/font-awesome/fonts/**/*'],
        dest: '{{WWW}}/assets/fonts'
    },
    copyFontawesomeCss: {
      src: ['{{SRC}}/assets/css/font-awesome.min.css'],
      dest: '{{WWW}}/assets/css'
    },
    copyPrimeNGCss: {
      src: ['{{ROOT}}/node_modules/primeng/resources/primeng.min.css', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.css'],
      dest: '{{WWW}}/assets/css'
    },
    copyPrimeNGThemeCss: {
      src: ['{{ROOT}}/node_modules/primeng/resources/themes/omega/theme.css'],
      dest: '{{WWW}}/assets/css'
    },
    copyAngularCalendarCss: {
      src: ['{{ROOT}}/node_modules/angular-calendar/css/angular-calendar.css'],
      dest: '{{WWW}}/assets/css'
    },
    copyPrimeNGThemeFonts: {
        src: ['{{ROOT}}/node_modules/primeng/resources/themes/omega/fonts/*'],
        dest: '{{WWW}}/assets/css/fonts'
    },
    copyAngularCalendarCss: {
      src: ['{{ROOT}}/node_modules/angular-calendar/css/angular-calendar.css'],
      dest: '{{WWW}}/assets/css'
    },
    copyFullCalendar: {
      src: ['{{ROOT}}/node_modules/jquery/dist/jquery.min.js', '{{ROOT}}/node_modules/moment/min/moment.min.js', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.js', '{{ROOT}}/node_modules/jquery/dist/jquery.js', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.js'],
      dest: '{{BUILD}}'
    },
    copyMonacoAssets: {
      src: ['{{SRC}}}/assets/monaco/**/*'],
      dest: '{{WWW}}/assets/monaco'
    },
    copyElectronZoneFix: {
      src: ['{{SRC}}/config/zonejs-electron-fix.js'],
      dest: '{{BUILD}}'
    },
    copyVersionHTML: {
      src: ['{{ROOT}}/autoupdate/version.html'],
      dest: '{{BUILD}}'
    },
    copyVersionHTML2: {
      src: ['{{ROOT}}/autoupdate/version.html'],
      dest: '{{WWW}}'
    },
}
