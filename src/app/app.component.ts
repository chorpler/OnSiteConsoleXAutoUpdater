import   * as JSON5                                                          from 'json5'                                ;
import   * as blobUtil                                                       from 'blob-util'                            ;
import { Subscription                                                      } from 'rxjs/Subscription'                    ;
import { Component, ViewChild, OnInit, OnDestroy, EventEmitter, ElementRef } from '@angular/core'                        ;
import { NgZone, Renderer, AfterViewInit, ApplicationRef,                  } from '@angular/core'                        ;
import { ComponentFactoryResolver, ViewContainerRef, ApplicationInitStatus } from '@angular/core'                        ;
import { Nav, Platform, MenuController, Events                             } from 'ionic-angular'                        ;
import { Employee, Shift, Report, ReportOther, Invoice, DPS, PreAuth,      } from 'domain/domain-classes'                ;
import { Jobsite, Address, Street, Location,                               } from 'domain/domain-classes'                ;
import { OSData                                                            } from 'providers/data-service'               ;
import { Preferences                                                       } from 'providers/preferences'                ;
import { AuthService                                                       } from 'providers/auth-service'               ;
import { Log, CONSOLE, moment, Moment, oo,                                 } from 'config/config.functions'              ;
import { StorageService                                                    } from 'providers/storage-service'            ;
import { PouchDBService                                                    } from 'providers/pouchdb-service'            ;
import { DBService                                                         } from 'providers/db-service'                 ;
import { ServerService                                                     } from 'providers/server-service'             ;
import { AlertService                                                      } from 'providers/alert-service'              ;
import { SmartAudio                                                        } from 'providers/smart-audio'                ;
import { NumberService                                                     } from 'providers/number-service'             ;
import { InvoiceService                                                    } from 'providers/invoice-service'            ;
import { DispatchService                                                   } from 'providers/dispatch-service'           ;
import { Command, KeyCommandService                                        } from 'providers/key-command-service'        ;
import { WebWorkerService                                                  } from 'angular2-web-worker'                  ;
import { Tooltip, OverlayPanel, Dialog,                                    } from 'primeng/primeng'                      ;
import { NotifyService                                                     } from 'providers/notify-service'             ;
import { NotificationComponent                                             } from 'components/notification/notification' ;
import { LoginComponent                                                    } from 'components/login/login'               ;
import { OptionsComponent                                                  } from 'components/options/options'           ;
import { SpinnerComponent                                                  } from 'components/spinner/spinner'           ;
import { SpinnerService                                                    } from 'providers/spinner-service'            ;
import { LoaderService                                                     } from 'providers/loader-service'             ;
import { ElectronService                                                   } from 'providers/electron-service'           ;

// !important: You want to give this variable(var googleLoaded = false;). This is used to run multiple chart in your jade.
export var googleLoaded = false;
// !important: Define which chart packages to preload.Because this package uses ChartWrappers you can use any chart type that Google supports, but if it // isn't loaded it will load it on demand.
export var googleChartsPackagesToLoad = ['corechart'];

@Component({
  templateUrl: 'app.html'
})
export class OnSiteConsoleX implements OnInit,OnDestroy {
  @ViewChild(Nav) nav: Nav;
  // @ViewChild('loginOverlay') loginOverlay:OverlayPanel;
  // @ViewChild('confirmDialog') confirmDialog:ConfirmDialog;
  // @ViewChild('spinnerTemplate') spinnerTemplate:Element
  @ViewChild('spinnerTemplate', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;
  @ViewChild('confirmTarget') confirmTarget:ElementRef;
  @ViewChild('loginDialog')     loginDialog:Dialog;
  // @ViewChild('loginOverlay') loginOverlay:Dialog;
  @ViewChild('loginComponent') loginComponent:LoginComponent;
  @ViewChild('notificationElement') notificationElement:NotificationComponent;
  // @ViewChild('notificationsElement') notificationsElement:NotificationsComponent;
  // @ViewChild('noticeElement') noticeElement:NoticeComponent;
  // @ViewChild('noticesElement') noticesElement:NoticesComponent;
  @ViewChild('loginTarget') loginTarget:ElementRef;

  public title              : string     = "OnSiteX Console Menu";
  public rootPage           : any                                ;
  public pages              : Array<any>                         ;
  public observe            : any                                ;
  public static PREFS       : any         = new Preferences()    ;
  public get prefs():any { return OnSiteConsoleX.PREFS }         ;
  public set prefs(value:any) { OnSiteConsoleX.PREFS = value }   ;
  public keySubscription    : Subscription                       ;
  public dsSubscription     : Subscription                       ;
  public optionsSub         : Subscription                       ;
  public optionsType        : string      = ""                   ;
  public currentlyLoggedIn  : boolean     = false                ;
  public u                  : string      = ""                   ;
  public p                  : string      = ""                   ;
  public static initializing: boolean     = false                ;
  public static initialized : boolean     = false                ;
  public static loading     : any                                ;
  public get loading():any { return OnSiteConsoleX.loading;}     ;
  public set loading(val:any) { OnSiteConsoleX.loading = val; }  ;
  public scheduleStartDate  : Date                               ;
  public invalidDates       : Array<Date> = []                   ;
  public minDate            : Date                               ;
  public maxDate            : Date                               ;
  public requireLogin       : boolean     = false                ;
  public optionsVisible     : boolean     = false                ;
  public tooltipDelay       : number      = 500                  ;
  public immutableNotify    : boolean     = true                 ;
  public showNotificationComp:boolean     = false                ;
  public showNotificationsComp:boolean     = true                ;
  public showNoticesComponent:boolean     = true                 ;
  public spinnerOn           :boolean     = false                ;
  public isDeveloper        : boolean     = false                ;
  public searchVisible      : boolean     = false                ;

  constructor(
    public app                : ApplicationRef           ,
    public platform           : Platform                 ,
    public zone               : NgZone                   ,
    public compFactoryResover : ComponentFactoryResolver ,
    public elementRef         : ElementRef               ,
    public renderer           : Renderer                 ,
    public menu               : MenuController           ,
    public events             : Events                   ,
    public audio              : SmartAudio               ,
    public auth               : AuthService              ,
    public data               : OSData                   ,
    public num                : NumberService            ,
    public storage            : StorageService           ,
    public db                 : DBService                ,
    public server             : ServerService            ,
    public alert              : AlertService             ,
    public woker              : WebWorkerService         ,
    public notify             : NotifyService            ,
    public keyService         : KeyCommandService        ,
    public dispatch           : DispatchService          ,
    public invoiceService     : InvoiceService           ,
    public spinnerService     : SpinnerService           ,
    public loader             : LoaderService            ,
    public electron           : ElectronService          ,
  ) {
    Log.l("OnSiteConsoleX: app.component.ts constructor() called!");
  }

  ngOnInit() {
    Log.l("OnSiteX Console: ngOnInit() called.");
    if (!OnSiteConsoleX.initializing && !OnSiteConsoleX.initialized) {
      OnSiteConsoleX.initializing = true;
      this.initializeApp();
    }
  }

  ngOnDestroy() {
    Log.l("OnSiteX Console: ngOnDestroy() called.");
    this.server.cancelAllSyncs();
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Log.l("OnSiteX Console: initializeApp() running. Now initializing PouchDB...");
      this.electron.setApp(this);
      this.initializeWindow();
      this.initializeSubscriptions();
      Log.l("initializeApp(): PouchDB initialized!");
      this.initializeMenu();
      this.loader.setRootViewContainerRef(this.viewContainerRef);
      this.electron.createMenus();
      // this.electron.registerWindowStateKeeper();
      this.initializeRestOfApp();
    });
  }

  public initializeWindow() {
    window['consoleapp'] = this;
    window['onsiteconsole'] = this;
    window['Log'] = Log;
    window['t1'] = CONSOLE.t1;
    window['c1'] = CONSOLE.c1;
    window['moment'] = moment;
    window['JSON5'] = JSON5;
    window['json5'] = JSON5;
    // window['jsonpath'] = JSONPath;
    window['blobUtil'] = blobUtil;
    window['PouchDB'] = PouchDBService.PouchInit();
    let domains = {'Employee': Employee, 'Shift': Shift, 'Report': Report, 'ReportOther': ReportOther, 'Jobsite': Jobsite, 'Address': Address, 'Street': Street, 'Geoloc': Location, 'PreAuth': PreAuth, 'Invoice': Invoice };
    window['consoleobjects'] = domains;
  }

  public initializeSubscriptions() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "OnSiteConsoleX.showOptions" : this.showOptions(); break;
        case "OnSiteConsoleX.showSearch" : this.showSearch(); break;
        case "OnSiteConsoleX.hideSearch" : this.hideSearch(); break;
      }
    });

    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:string, payload:any}) => {
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports') {
        this.data.setData('reports', payload);
      }
    });

    this.optionsSub = this.dispatch.optionsShown().subscribe((type) => {
      this.showOptions(type);
    });
  }

  public initializeMenu() {
    let subPayroll  = [
      {title        : 'Payroll'           , page: 'Payroll'               , tooltip: "Payroll"                             },
      {title        : 'DPS'               , page: 'DPS'                   , tooltip: "Daily Profit Sheets"                 },
    ];
    let subInvoices = [
      {title        : 'Tech Shift Reports', page: 'Tech Shift Reports'    , tooltip: "Technician Shift Reports"            },
      {title        : 'Pre-Authorization' , page: 'Preauth HB'            , tooltip: "Halliburton Pre-Authorization"       },
      {title        : 'Halliburton'       , page: 'Invoicing HB'          , tooltip: "Halliburton Invoicing"               },
      {title        : 'Keane'             , page: 'Invoicing Keane'       , tooltip: "Keane Invoicing"                     },
      {title        : 'Basic Energy'      , page: 'Invoicing Basic Energy', tooltip: "Basic Energy Invoicing"              },
    ];
    let subReports  = [
      {title        : 'Work Reports'      , page: 'Work Reports'          , tooltip: "Work Reports"                        },
      {title        : 'Other Reports'     , page: 'Other Reports'         , tooltip: "Other Reports (Travel/Training/etc.)"},
    ];
    let subConfig   = [
      {title        : 'Options'           , page: 'Options'               , tooltip: "OnSiteX Console Global Options"      },
      {title        : 'Advanced Options'  , page: 'Options'               , tooltip: "OnSiteX Console Advanced Options"    },
      {title        : 'Configuration'     , page: 'Config Values'         , tooltip: "OnSiteX Configuration"               },
      {title        : 'Save Preferences'  , page: 'Config Values'         , tooltip: "Save Preferences to local storage"   },
      {title        : 'Reauthenticate'    , page: 'Config Values'         , tooltip: "Log in to server again"              },
      {title        : 'Restart App'       , page: 'Config Values'         , tooltip: "Restart Console application"         },
      {title        : 'Logout'            , page: 'Logout'                , tooltip: "Logout of app"                       },
    ];
    let subBeta = [
      { title: 'Employees (old)'     , page: 'Employees'             , role: "dev", tooltip: "Employees Beta (monaco version)", icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Reports Alpha'       , page: 'Reports Alpha'         , role: "dev", tooltip: "Work Reports (datagrid version)", icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Payroll Alpha'       , page: 'Payroll Alpha'         , role: "dev", tooltip: "Payroll (datagrid version)"     , icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Schedule Choose Beta', page: 'Scheduling Beta Choose', role: "dev", tooltip: "Scheduling (beta version)"      , icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Scheduling Beta'     , page: 'Scheduling Beta'       , role: "dev", tooltip: "Scheduling (beta version)"      , icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Test Notifications'  , page: 'NotifyTest'            , role: "dev", tooltip: "Test notification system"       , icon: { name: "fa-commenting-o", type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Testing'             , page: 'testing'               , role: "dev", tooltip: "Test screen (for developers)"   , icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
      { title: 'Tmp Reports'         , page: 'Tmp-Reports'           , role: "dev", tooltip: "temp reports"                   , icon: { name: "fa-flask"       , type: "fontawesome", style: { 'color': 'red'}}},
    ];
    this.pages = [
      { title: 'Console Home'      , page: 'OnSiteX Console'     , role: "usr", tooltip: "Console Home Page"                  , showSubMenu: false , submenu: []          },
      { title: 'Schedule'          , page: 'Schedule Choose'     , role: "usr", tooltip: "Scheduling"                         , showSubMenu: false , submenu: []          },
      { title: 'Employees'         , page: 'Employees Beta'      , role: "usr", tooltip: "Employee list"                      , showSubMenu: false , submenu: []          } ,
      { title: 'Work Sites'        , page: 'Work Sites'          , role: "usr", tooltip: "Work Site list"                     , showSubMenu: false , submenu: []          } ,
      { title: 'Payroll'           , page: 'Payroll'             , role: "usr", tooltip: "Payroll reports"                    , showSubMenu: false , submenu: subPayroll  } ,
      { title: 'Invoices'          , page: 'Invoice'             , role: "usr", tooltip: "Invoicing"                          , showSubMenu: false , submenu: subInvoices } ,
      { title: 'Reports'           , page: 'Work Reports'        , role: "usr", tooltip: "Reports submitted by techs"         , showSubMenu: false , submenu: subReports  } ,
      { title: 'Messages'          , page: 'Messages'            , role: "usr", tooltip: "Messages for techs"                 , showSubMenu: false , submenu: []          } ,
      { title: 'Comments'          , page: 'Comments'            , role: "usr", tooltip: "Comments from techs"                , showSubMenu: false , submenu: []          } ,
      { title: 'Phones'            , page: 'Tech Phones'         , role: "usr", tooltip: "Tech phones and login history"      , showSubMenu: false , submenu: []          } ,
      { title: 'Geolocation'       , page: 'Geolocation'         , role: "usr", tooltip: "Tech locations"                     , showSubMenu: false , submenu: []          } ,
      { title: 'Configuration'     , page: 'Config Values'       , role: "usr", tooltip: "OnSiteX configuration data"         , showSubMenu: false , submenu: subConfig   } ,
      { title: 'Developer'         , page: 'Developer'           , role: "dev", tooltip: "Developer Testing"                  , showSubMenu: false , submenu: subBeta     , icon: { name: "fa-flask", type: "fontawesome", style: { 'color': 'red' } }} ,
      // { title: 'Reports Beta'      , page: 'Reports Beta'        , role: "dev", tooltip: "Work Reports (hypergrid version)"   , showSubMenu: false , submenu: [], icon: { name: "fa-flask", type: "fontawesome", color: "red", style: {'color': 'red'} } },
      // { title: 'Schedule Select'   , page: 'Schedule Select'     , role: "dev", tooltip: "Scheduling (old selection screen)"  , showSubMenu: false , submenu: [], icon: { name: "fa-flask", type: "fontawesome", color: "red", style: {'color': 'red'} } },
    ];
  }

  public initializeRestOfApp() {
    this.initializeData().then(res => {
      Log.l("initializeApp(): initializeData() succeeeded! Now hiding spinner and setting root page and whatnot.");
      // this.alert.hideSpinner(spinnerID);
      OnSiteConsoleX.initialized = true;
      OnSiteConsoleX.initializing = false;
      if (!this.rootPage) {
        this.data.setReady(true);
        this.dispatch.setAppReady(true);
        this.rootPage = 'OnSiteX Console';
      } else {
        Log.l("initializeApp(): Hey, this.rootPage was already defined:\n", res);
        this.data.setReady(true);
        this.dispatch.setAppReady(true);
        this.rootPage = this.rootPage || "OnSiteX Console";
      }
    }).catch(err => {
      Log.l("initializeApp(): initializeData() failed! Oh well!");
      // this.alert.hideSpinner(spinnerID);
      OnSiteConsoleX.initialized = true;
      OnSiteConsoleX.initializing = false;
      this.data.setReady(true);
      this.dispatch.setAppReady(true);
      this.showLogin();
      // if (!this.rootPage) {
      //   this.rootPage = 'OnSiteX Console';
      // }
    });
  }

  public toggleDeveloperMode(event?:any) {
    this.data.toggleDeveloperMode();
    this.electron.createMenus();
  }

  public authenticateUser() {
    return new Promise((resolve,reject) => {

    });
  }

  public initializeData() {
    return new Promise((resolve,reject) => {
      this.checkPreferences().then(res => {
        Log.l("initializeApp: Preferences checked successfully, now authenticating...");
        return this.authenticate();
      }).then(res => {
        Log.l("initializeApp: authenticated successfully.");
        this.spinnerService.setRootViewContainerRef(this.viewContainerRef);
        return this.syncData();
      }).then(res => {
        if(this.prefs.CONSOLE.global.loadReports) {
          this.notify.addInfo("REPORTS", "Retrieving work reports...", 3000);
          return new Promise((resolve2,reject2) => {
            setTimeout(() => {
              this.data.getReports().then(res => {
                Log.l("initializeApp: Successfully authenticated and logged in AND got reports.");
                this.audio.preloadSounds();
                resolve2(res);
              }).catch(err => {
                Log.l("initializeData(): Error getting work reports.");
                Log.e(err);
                reject2(err);
              });
            }, 500);
          });
        } else {
          Log.l("initializeApp: Successfully authenticated and logged in.");
          return this.audio.preloadSounds();
        }
      }).then(res => {
        Log.l("initializeApp(): Successfully preloaded sounds:\n", res);
        let isDev = this.data.checkDeveloperStatus();
        // if(isDev) {
        //   this.addDeveloperOptions();
        // }
        Log.l("initializeApp(): Done initializing!");
        resolve({status: true, message: "initializeData() ran successfuly."});
      }).catch(err => {
        Log.l("Console: unable to authenticate!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public async reauthenticate(evt?:any) {
    let spinnerID = '';
    try {
      let res:any;
      if(this.menu.isOpen()) {
        res = await this.menu.close();
      }
      spinnerID = this.alert.showSpinner("Reauthenticating to server...");
      res = await this.authenticate();
      Log.l("reauthenticate(): success!");
      this.alert.hideSpinner(spinnerID);
      this.notify.addSuccess("SUCCESS", `Successfully logged in to server`, 3000)
      return res;
    } catch(err) {
      Log.l(`reauthenticate(): Error during menu closing or reauthentication!`);
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      this.notify.addError("ERROR", `Error during reauthentication: ${err.message}`, 10000);
      // throw new Error(err);
    }
  }

  // public addDeveloperOptions() {
  //   this.pages.push({title: 'Scheduling Beta', page: 'Scheduling Beta', tooltip: "Scheduling (beta version)", showSubMenu: false, submenu: [], icon: {name: "fa-flask", type: "fontawesome", color: "red", style: "{'color': 'red'}"}});
  //   this.pages.push({title: 'Schedule Select', page: 'Schedule Select', tooltip: "Scheduling (old selection screen)", showSubMenu: false, submenu: [], icon: {name: "fa-flask", type: "fontawesome", color: "red", style: "{'color': 'red'}"}});
  //   this.pages.push({title: 'Testing'        , page: 'testing'        , tooltip: "Test screen (for developers)", showSubMenu: false, submenu: [], icon: {name: "fa-flask", type: "fontawesome", color: "red", style: "{'color': 'red'}"}});
  //   this.pages.push({title: 'Test Notifications', page: 'NotifyTest'  , tooltip: "Test notification system (for developers)", showSubMenu: false, submenu: [], icon: {name: "fa-commenting-o", type: "fontawesome", color: "red", style: "{'color': 'red'}"}});
  // }

  public openPage(page) {
    if(page.title === 'Reauthenticate') {
      this.menu.close().then(res => {
        let spinnerID = this.alert.showSpinner("Logging in to server...");
        this.authenticate().then(res => {
          Log.l("Reauthenticate: success!");
          this.alert.hideSpinner(spinnerID);
          this.notify.addSuccess("SUCCESS", `Successfully logged in to server`, 3000)
        }).catch(err => {
          Log.l("Reauthenticate: error during authentication.");
          this.alert.hideSpinner(spinnerID);
          this.notify.addError("ERROR", `Error during authentication: ${err.message}`, 10000);
        });
      });
    } else if(page.title === 'Advanced Options') {
      this.menu.close().then(res => {
        this.showOptions('advanced');
      }).catch(err => {
        // Log.l("openPage(): Error!");
        // Log.e(err);
        // this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
      });
    } else if(page.title === 'Options') {
      Log.l("openPage(): User wants to show options...");
      this.menu.close().then(res => {
        this.showOptions('global');
      }).catch(err => {
        // Log.l("openPage(): Error!");
        // Log.e(err);
        // this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
      });
    } else if(page.title === 'Update Data') {
      Log.l("openPage(): User wants to update data...");
      this.menu.close().then(res => {
        return this.data.getReports();
      }).then(res => {
        this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      }).catch(err => {
        Log.l("openPage(): Error updating data!");
        Log.e(err);
        this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
      });
    } else if(page.title === 'Restart App') {
      Log.l("openPage(): User clicked Restart.");
      window.location.reload();
    } else if(page.title === 'Logout') {
      Log.l("openPage(): User clicked logout.");
      this.logoutClicked();
    } else if(page.title === 'Save Preferences') {
      Log.l("openPage(): I'm actually just going to save Preferences!");
      this.savePreferences().then(res => {
        Log.l("openPage(): Preferences saved!");
        // let msg:Notice = {severity:'info', summary:'SUCCESS!', detail:'Saved Preferences!', life:3000};
        this.notify.addInfo("SUCCESS", "Preferences saved.", 3000);
        this.menu.close();
      });
    } else if(page.title === 'Test Notifications') {
      Log.l("openPage(): I'm actually just going to send a test notification!");
      this.testNotifications();
      this.menu.close();
    } else {
      if(page.submenu && page.submenu.length && !page.showSubMenu) {
        for(let eachPage of this.pages) {
          eachPage.showSubMenu = false;
        }
        page.showSubMenu = true;
      } else if(page.submenu && page.submenu.length && page.showSubMenu) {
        page.showSubMenu = false;
      } else {
        for(let eachPage of this.pages) {
          eachPage.showSubMenu = false;
        }
        this.menu.close().then(res => {
          // Reset the content nav to have just this page
          // we wouldn't want the back button to show in this scenario
          setTimeout(() => {
            this.nav.setRoot(page.page);
          }, 500)
        });
      }
    }
  }

  public async updateData(evt?:any) {
    let spinnerID = '';
    try {
      let res:any;
      if(this.menu.isOpen()) {
        res = await this.menu.close();
      }
      res = await this.data.getReports();
      let newReports:Array<Report> = res;
      this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      this.alert.hideSpinner(spinnerID);
      return res;
    } catch(err) {
      Log.l(`updateData(): Error getting updated data!`);
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
      throw new Error(err);
    }
    // this.menu.close().then(res => {
    //   return this.data.getReports();
    // }).then(res => {
    //   this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
    // }).catch(err => {
    //   Log.l("openPage(): Error updating data!");
    //   Log.e(err);
    //   this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
    // });
  }

  public logoutClicked() {
    // this.menu.close().then(res => {
      this.alert.showConfirmYesNo("CONFIRM", "Are you sure you want to log out?").then(res => {
        if(res) {
          Log.l("User clicked okay to log out.");
          // let msg: Notice = { severity: 'info', summary: 'LOGGED OUT', detail: `User logged out.`, life: 3000 };
          this.notify.addInfo("LOGGED OUT", "User logged out.", 3000);
          // this.logout();
          this.closeMenuAndLogout();
        } else {
          Log.l("User clicked not okay to log out.");
          // let msg: Notice = { severity: 'info', summary: 'OK', detail: `Logout canceled.`, life: 3000 };
          this.notify.addInfo("OK", "Logout canceled", 3000);
        }
      }).catch(err => {
        Log.l("logoutClicked(): Error processing logout.");
        Log.e(err);
      });
  }

  public closeMenuAndLogout() {
    this.menu.close().then(res => {
      this.logout();
    });
  }

  public logout() {
    return this.auth.logout().then(res => {
      return this.showLogin();
    }).then(res => {
      Log.l("Done showing login.");
      return {message: "Successfully logged out and back in."};
    }).catch(err => {
      Log.l("logoutClicked(): Error during logout.");
      Log.e(err);
      // let msg:Notice = { severity: 'error', summary: 'ERROR!', detail: `Error logging out: ${err.message}`, life: -1 };
      this.notify.addError("ERROR!", `Error logging out: ${err.message}`, 10000);
    });
  }

  public showLogin() {
    Log.l("showLogin(): Now showing...");
    this.requireLogin = true;
    // this.loginOverlay.show({}, this.loginTarget.nativeElement);
  }

  public receiveLoginAttempt(event:any) {
    Log.l("receiveLoginAttempt(): Received:\n", event);
    if(event === true) {
      // this.loginOverlay.hide();
      this.requireLogin = false;
      this.initializeRestOfApp();
    }
  }

  public testNotifications() {
    let MIN = 500, MAX = 7500;
    let live = this.data.random(MIN, MAX);
    let details:string = `Developers are always watching, for ${live}ms at least.`;
    Log.l(`AppComponent.testNotifications(): generating a notification that should last ${live}ms...`);
    // let msg:Notice = {severity:'error', summary:'ERROR!', detail:details, life:live}
    this.notify.addError("ERROR!", details, live);
  }

  public menuClosed() {
    for(let eachPage of this.pages) {
      eachPage.showSubMenu = false;
    }
    this.events.publish("menu:closed", '');
  }

  public syncData() {
    return this.setupAuthentication().then(res => {
      Log.l("syncData(): Authenticated and synchronization started. Now fetching actual data.");
      return this.data.fetchAllData();
    }).then(res => {
      Log.l("syncData(): All data fetched.");
      return res;
    }).catch(err => {
      Log.l("syncData(): Error with authentication or fetching data.");
      Log.e(err);
      throw new Error(err);
    });;
    // });
  }

  public async setupAuthentication() {
    let dblist = this.prefs.getDB();
    let dbs = Object.keys(this.prefs.getDB());
    try {
      // let promises = [];
      const promises = dbs.map(key => {
        if(key !== '_session' && key !== 'login') {
          let db = dblist[key];
          Log.l(`setupAuthentication(): Attempting to login to remote '${db}'...`);
          this.loading.setContent(`Logging in to database ${db}...`);
          return this.server.loginToDatabase(this.u, this.p, db);
          // Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
        }
      });
      // for(let key of dbs) {
      //   if(key !== '_session' && key !== 'login') {
      //     let db = dblist[key];
      //     Log.l(`CONSOLE: Attempting to login to remote '${db}'...`);
      //     this.loading.setContent(`Logging in to database ${db}...`);
      //     promises.push(this.server.loginToDatabase(this.u, this.p, db));
      //     Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
      //   }
      // }
      // const replicationPromises = dbs.map(key => {
      //   if(key !== '_session' && key !== 'login') {
      //     let db = dblist[key];
      //     Log.l(`CONSOLE: Attempting to replicate '${db}'...`);
      //     this.loading.setContent(`Replicating '${db}'...`);
      //     return this.server.nonLiveSyncWithServer(db);
      //     // Log.l(`CONSOLE: Successfully logged in and set up synchronization with remote '${db}'`);
      //   }
      // });
      await Promise.all(promises);
      // await Promise.all(replicationPromises);
      for(let key of dbs) {
        if(key !== 'session' && key !== 'login') {
          let db = dblist[key];
          Log.l(`setupAuthentication(): Attempting to sync with remote '${db}'...`);
          let res2 = this.server.liveSyncWithServer(db);
        }
      }
      this.data.status.loggedIn = true;
      window['onsiteconsoleusername'] = this.u;
      return {message:"Successfully logged in"};
    } catch(err) {
      Log.l(`setupAuthentication(): Error logging in to at least one database.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public authenticate() {
    return new Promise((resolve,reject) => {
      let spinnerText = "Logging in to databases on server...";
      this.auth.areCredentialsSaved().then((res) => {
        let spinnerID = this.alert.showSpinner(spinnerText);
        this.loading = this.alert.getSpinner(spinnerID);
        if (res) {
          Log.l("authenticate(): User credentials found.");
          let user1 = this.auth.getUser();
          let pass1 = this.auth.getPass();
          this.u = user1;
          this.p = pass1;
          this.server.loginToServer(this.u, this.p).then((res) => {
            Log.l(`authenticate(): successfully logged in to server as user '${user1}'.`);
            let user = user1;
            // Log.l("authenticate(): Now attempting to retrieve data from server...");
            // Log.l("authenticate(): Got all remote DBs, done!");
            // this.username = user1;
            this.currentlyLoggedIn = true;
            this.data.status.loggedIn = true;
            this.alert.hideSpinner(spinnerID);
            resolve("authenticate(): Logged in!");
          }).catch((err) => {
            Log.l("authenticate(): could not log in with provided credentials.");
            Log.e(err);
            this.currentlyLoggedIn = false;
            this.data.status.loggedIn = false;
            this.alert.hideSpinner(spinnerID);
            reject(err);
          });
        } else {
          Log.l("authenticate(): user credentials not found. Need to log in.");
          this.currentlyLoggedIn = false;
          this.data.status.loggedIn = false;
          this.alert.hideSpinner(spinnerID);
          reject(new Error("authenticate(): No credentials found."));
        }
      }).catch((err) => {
        Log.l("authenticate(): areCredentialsSaved crashed!");
        Log.e(err);
        this.currentlyLoggedIn = false;
        this.data.status.loggedIn = false;
        reject(err);
      });
    });
  }

  public checkPreferences() {
    return new Promise((resolve, reject) => {
      this.storage.persistentGet('PREFS').then((storedPrefs) => {
        let updatePrefs = storedPrefs;
        if (storedPrefs) {
          updatePrefs = this.prefs.comparePrefs(storedPrefs);
          this.prefs.setPrefs(updatePrefs);
        } else {
          updatePrefs = this.prefs.getPrefs();
        }
        Log.l("checkPreferences: Preferences at version %d, saving again.", this.prefs.USER.preferencesVersion);
        return this.savePreferences(updatePrefs);
      }).then(res => {
        Log.l("checkPreferences: Preferences saved successfully.");
        resolve(res);
      }).catch((err) => {
        Log.l("checkPreferences: Error while checking for stored preferences!");
        Log.e(err);
        // reject(err);
        resolve(err);
      });
    });
  }

  public savePreferences(updatedPrefs?:any) {
    return new Promise((resolve, reject) => {
      let prefs = updatedPrefs ? updatedPrefs : this.prefs.getPrefs();
      this.storage.persistentSet('PREFS', updatedPrefs).then((res) => {
        Log.l("savePreferences: Preferences stored:\n", this.prefs.getPrefs());
        resolve(res);
      }).catch(err => {
        Log.l("savePreferences: Error while trying to save preferences.");
        Log.e(err);
        // reject(err);
        resolve(err);
      });
    });
  }

  public showOptions(event?:any) {
    if(event) {
      if(event === 'global') {
        this.optionsType = 'global'
      } else if(event === 'advanced') {
        this.optionsType = 'advanced'
      }
    } else {
      this.optionsType = 'global';
    }
    this.optionsVisible = true;
  }

  public hideOptions() {
    this.optionsVisible = false;
  }

  public optionsClosed(event:any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public optionsSaved(event:any) {
    this.optionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
    let prefs = this.prefs.getPrefs();
    this.savePreferences(prefs).then(res => {
      this.dispatch.updatePrefs();
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    });
  }

  public showSearch() {
    this.electron.pageSearch({css: 'default-style.css', html: 'search-window.html'}, false);
    // this.searchVisible = true;
  }

  public hideSearch() {
    this.electron.stopListeningForSearch();
    this.searchVisible = false;
  }

  public toggleSearch() {
    if(this.searchVisible) {
      this.searchVisible = false;
      this.electron.stopListeningForSearch();
    } else {
      this.searchVisible = true;
      this.electron.listenForSearch();
    }
  }


}
