
import * as electron          from 'electron'                   ;
const {BrowserWindow} = require('electron').remote;
import * as windowStateKeeper from 'electron-window-state'      ;
import * as pdfWindow         from 'electron-pdf-window'        ;
import * as fs from 'fs';
import * as path from 'path';
import searchInPage, {InPageSearch} from 'electron-in-page-search';
import { autoUpdater         } from 'electron-updater'           ;
import { Subscription        } from 'rxjs/Subscription'          ;
import { Subject             } from 'rxjs/Subject'               ;
import { Observable          } from 'rxjs/Observable'            ;
import { Log, moment, Moment } from 'config/config.functions'    ;
import { Injectable          } from '@angular/core'              ;
import { EventEmitter        } from '@angular/core'              ;
import { OSData              } from './data-service'             ;
import { NotifyService       } from './notify-service'           ;
import { DispatchService     } from './dispatch-service'         ;

export type Menu = Electron.Menu;
export type MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
export type MenuItem = Electron.MenuItem;
export type WebContents = Electron.WebContents;

@Injectable()
export class ElectronService {
  public static searchActive:boolean = false;
  public get searchActive():boolean { return ElectronService.searchActive; };
  public set searchActive(val:boolean) { ElectronService.searchActive = val; };
  // public searchEvent = new EventEmitter<any>();
  public searchListeners:number = 0;
  public searchSubject:Subject<any>;
  public searchEvent:Observable<any>;
  public currentZoom: number = 0;
  // public menu:electron.Menu;
  public menu:any;
  public app:any;
  public win:any;
  public windowState:any;
  constructor(public data:OSData, public notify:NotifyService, public dispatch:DispatchService) {
    window['onsiteelectronservice'] = this;
    window['oselectron'] = electron;
    window['electronautoupdate'] = autoUpdater;
    // window['path'] = path;
    // window['fs'] = fs;
    // window['osPDFWindow'] = PDFWindow;
    // window['osSearchInPage'] = electronSearch;
    this.app = { openPage: (pageName?:string) => {this.notify.addError("ERROR", `Error loading page '${pageName}'.`, 5000);}};
    this.searchSubject = new Subject<any>();
    this.searchEvent = this.searchSubject.asObservable();
  }

  public setApp(component:any) {
    Log.l("setApp(): Now setting app to:\n", component);
    this.app = component;
  }

  public zoomIn() {
    electron.webFrame.setZoomLevel(++this.currentZoom);
  }

  public zoomOut() {
    electron.webFrame.setZoomLevel(--this.currentZoom);
  }

  public createMenuFromIonicMenu(ionicMenu:any[]) {
    let template:any[] = [];
    let thisApp = this.app;
    let dev = this.data.status.role === 'dev';
    let Menu = electron.Menu;
    let MenuItem = electron.MenuItem;
    let i = 0;
    for(let item of ionicMenu) {
      i++;
      let label = item.title;
      let page = item.page;
      let role = item.role;
      if(role === 'dev' && !dev) {
        continue;
      } else {
        if(item.submenu.length) {
          let submenu = [];
          for(let subitem of item.submenu) {
            let sublabel = subitem.title;
            let subpage  = subitem.page;
            let subMenuItem = {label: sublabel, click() { thisApp.openPage(subitem); }};
            submenu.push(subMenuItem);
          }
          let menuItem = {label: label, submenu: submenu};
          template.push(menuItem);
        } else {
          if(i === 1) {
            let menuItem = {label: label, accelerator: 'F5', click() { thisApp.openPage(item); }};
            template.push(menuItem);
          } else {
            let menuItem = {label: label, click() { thisApp.openPage(item); }};
            template.push(menuItem);
          }
        }
      }
    }
    Log.l("createMenuFromIonicMenu(): Final template is:\n", template);
    return template;
  }

  public createMenus() {
    // let template1:MenuItem = {
    let thisApp = this.app;
    let pages = this.app.pages;
    let template:MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          { label: "Options", accelerator: "Ctrl+O", click: () => { this.showAppOptions('global'); }},
          { label: "Advanced Options", accelerator: "Ctrl+Shift+O", click: () => { this.showAppOptions('advanced'); }},
          { type: 'separator' },
          { label: "Restart App", accelerator: 'F5', click: () => { this.relaunchApp(); } },
          { role: 'quit' },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {role: 'copy'},
          {role: 'paste'},
          {role: 'pasteandmatchstyle'},
          {role: 'selectall'}
        ]
      },
      {
        label: 'View',
        accelerator: 'Alt+V',
        submenu: [
          { label: 'Developer Tools', accelerator: 'F12', click: () => { this.showDeveloperTools(); }},
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'App',
        accelerator: 'Alt+A',
        submenu: [
          { label: "Reauthenticate", click: () => { this.reauthenticate(); } },
        ]
      },
    ];
    if(this.app && this.app.pages && this.app.pages.length) {
      let screenMenu = this.createMenuFromIonicMenu(this.app.pages);
      // let item = {label: 'Screens', submenu: screenMenu, accelerator: 'CmdOrCtrl+Shift+S' };
      let item = {label: 'Screens', submenu: screenMenu, accelerator: 'Ctrl+Alt+S' };
      template.push(item);
      // template = [...template, ...screenMenu];
    }
    let help = {
      label: 'Help',
      submenu: [
        {label: 'About OnSiteX Console...', click: () => { this.notify.addInfo("VERSION", `OnSiteX Console ${this.getVersion()}`, 5000); } },
      ]
    };
    template.push(help);
    if(process.platform === 'darwin') {
      template.unshift({
        label: electron.app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }
    Log.l("createMenu(): Resulting template is:\n", template);
    this.menu = electron.remote.Menu.buildFromTemplate(template);
    Log.l("createMenu(): Resulting menu is:\n", this.menu);
    electron.remote.Menu.setApplicationMenu(this.menu);
    // electron.Menu.setApplicationMenu(this.menu);

  }

  public buttonClick(event?:any) {
    Log.l("buttonClick(): Event is:\n", event);
    if(event) {
      let menu:any = electron.remote.Menu.getApplicationMenu();
      let idx = menu.getCommandIdAt(0);
      let command = menu.commandsMap[idx];
      command.click(event, electron.remote.BrowserWindow.getFocusedWindow(), electron.remote.webContents.getFocusedWebContents());
    }
  }

  public reauthenticate() {
    return this.app.reauthenticate();
  }

  public getVersion() {
    let version = electron.remote.app.getVersion();
    return version;
  }

  public relaunchApp() {
    let app = electron.remote.app;
    app.relaunch();
    app.exit(0);
  }

  public showDeveloperTools() {
    let wc = electron.remote.getCurrentWebContents();
    if(wc.isDevToolsOpened() && !wc.isDevToolsFocused()) {
      wc.devToolsWebContents.focus();
    } else {
      wc.openDevTools();
    }
  }

  public toggleDeveloperTools() {
    let wc = electron.remote.getCurrentWebContents();
    wc.toggleDevTools();
  }

  public showAppOptions(value:string) {
    this.dispatch.showGlobalOptions(value);
  }

  public registerWindowStateKeeper() {
    let app = electron.remote.app;
    if(app.isReady()) {
      this.setWindowStateKeeperValues();
    } else {
      app.on('ready', () => {
        this.setWindowStateKeeperValues();
      });
    }
  }

  public setWindowStateKeeperValues() {
    let app = electron.remote.app;
    let wsk = windowStateKeeper;
    let mainWindowState = wsk({
      defaultWidth: 1600,
      defaultHeight: 900
    });

    this.windowState = mainWindowState;

    let win = new electron.remote.BrowserWindow({
      x: this.windowState.x,
      y: this.windowState.y,
      width: this.windowState.width,
      height: this.windowState.height,
    });

    this.win = win;

    this.windowState.manage(this.win);
  }

  public showPrintPreview(evt?:any) {
    let win = electron.remote.getCurrentWindow();
    let tempDir = electron.remote.app.getPath('temp');
    let marginType = typeof evt === 'number' ? evt : 1;
    let now = moment();
    let name = `printpreview_${now.format('x')}.pdf`;
    let outfile = path.join(tempDir, name);
    win.webContents.printToPDF({marginsType: marginType, printBackground: true}, (error, data) => {
      if(error) {
        Log.l("showPrintPreview(): Error!");
        Log.e(error);
        // throw error;
      } else {
        window['onsitePDFdata'] = data;
        fs.writeFile(outfile, data, (err) => {
          if(err) {
            Log.l("showPrintPreview(): Error saving PDF!");
            Log.e(err);
          } else {
            Log.l(`showPrintPreview(): PDF saved successfully as '${outfile}'`);
          }
        })
      }
    });
    // let pdfWin = new electron.remote.BrowserWindow({width: 1024, height: 768, parent: win});
    let pdfWin = new BrowserWindow({width: 1024, height: 768, parent: win});
    // let pdfWin = new PDFWindow({width: 1024, height: 768, parent: win});
    // pdfWindow.addSupport(pdfWin);
    // pdfWin.loadURL(outfile);
  }

  public pageSearch(customSearch?:{css: string, html: string}, openDevTools?:boolean) {
    let page = electron.remote.getCurrentWebContents();
    let css = path.join(__dirname, 'default-style.css');
    let html = path.join(__dirname, 'search-window.html');
    if(customSearch) {
      css = customSearch.css;
      html = customSearch.html;
    }
    let options:any = {
      customCssPath: css,
      customSearchWindowHtmlPath: html,
    }
    if(openDevTools) {
      options.openDevToolsOfSearchWindow = true
    }
    Log.l(`pageSearch(): starting plugin with CSS path '${css}' and html path '${html}'`)
    let search = searchInPage(page, options);
    search.openSearchWindow();
    return search;
    // let win = electron.remote.getCurrentWindow();
    // let currentWebContents:WebContents = electron.remote.getCurrentWebContents();
    // let currentWebContents:WebContents = win.webContents;
    // let currentWebContents:WebContents = electron.remote.getCurrentWebContents();
    // let search = searchInPage(currentWebContents);
    // let search = electronSearch.searchInPage(currentWebContents);

    // let search:InPageSearch;
    // let sip:any = searchInPage;
    // let wc:WebContents = electron.remote.getCurrentWebContents();
    // search = sip(wc);
    // search.openSearchWindow();

    // let ipc = electron.ipcRenderer;
    // let searcher = new ElectronSearchText({
    //   target: 'ion-content'
    // });
    // ipc.on('toggleSearch', () => {
    //   searcher.emit('toggle');
    // })
  }

  public listenForSearch() {
    let page = electron.remote.getCurrentWebContents();
    if(this.searchListeners === 0) {
      this.searchListeners++;
      page.on('found-in-page', (event:any, result:any) => {
        Log.l("found-in-page event fired, event is:\n", result);
        if(!result) {
          return;
        }
        if(!result.finalUpdate) {
          return;
        }
        this.searchSubject.next(result);
      });
    }
  }

  public stopListeningForSearch() {
    let page = electron.remote.getCurrentWebContents();
    page.removeAllListeners('found-in-page');
  }

  public searchText(text:string, seqSearch?:number) {
    let page = electron.remote.getCurrentWebContents();
    // if(this.searchActive) {
    //   page.findInPage(text, {findNext: true});
    // } else {
      this.searchActive = true;
      page.findInPage(text);
    // }
  }

  public searchNext(text:string) {
    let page = electron.remote.getCurrentWebContents();
    page.findInPage(text, {findNext:true});
  }

  public stopSearch() {
    let page = electron.remote.getCurrentWebContents();
    page.stopFindInPage('clearSelection');
    this.stopListeningForSearch();
    this.searchListeners = 0;
    this.searchActive = false;
  }

  public printPreview() {
  }

  public saveDialog() {
    let dialog = electron.remote.dialog;

  }

}
