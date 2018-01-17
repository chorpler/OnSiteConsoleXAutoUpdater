import { Subscription                                                                    } from 'rxjs/Subscription'          ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, EventEmitter,      } from '@angular/core'              ;
import { ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy                      } from '@angular/core'              ;
import { IonicPage                                                                       } from 'ionic-angular'              ;
import { NavController                                                                   } from 'ionic-angular'              ;
import { ModalController                                                                 } from 'ionic-angular'              ;
import { Storage                                                                         } from '@ionic/storage'             ;
import { LoginPage                                                                       } from 'pages/login/login'          ;
import { OnSiteConsoleX                                                                  } from 'app/app.component'          ;
import { AuthService                                                                     } from 'providers/auth-service'     ;
import { ServerService                                                                   } from 'providers/server-service'   ;
import { DBService                                                                       } from 'providers/db-service'       ;
import { AlertService                                                                    } from 'providers/alert-service'    ;
import { OSData                                                                          } from 'providers/data-service'     ;
import { DispatchService                                                                 } from 'providers/dispatch-service' ;
import { Log, Moment, moment, dec, Decimal, oo, _matchCLL, _matchSite                    } from 'config/config.functions'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/domain-classes'      ;
import { NotifyService                                                                   } from 'providers/notify-service'   ;
import { ElectronService                                                                 } from 'providers/electron-service' ;

@IonicPage({ name: 'OnSiteX Console' })
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit,OnDestroy {
  @ViewChild('LoginPage') loginPage:LoginPage;
  public title             : string          = "OnSiteX Console Home" ;
  public mainPanelTitle    : string          = "OnSiteX Information"  ;
  public mainPanelSubheader: string          = ""                     ;
  public dsSubscription    : Subscription                             ;
  private loginData        : any             ;
  private currentlyLoggedIn: boolean         = false                  ;
  private username         = "unknown"              ;
  public reportsdb         : any                    ;
  public schedulingdb      : any                    ;
  public employeesdb       : any                    ;
  public signalReceiver    : any                    ;
  public readify           : any                    ;
  public employees         : Array<Employee>    = []                  ;
  public techs             : Array<Employee>    = []                  ;
  public office            : Array<Employee>    = []                  ;
  public reports           : Array<Report>      = []                  ;
  public oldreports        : Array<Report>      = []                  ;
  public others            : Array<ReportOther> = []                  ;
  public sites             : Array<Jobsite>     = []                  ;
  public totalSites        : Array<Jobsite>     = []                  ;
  public clients           : Array<any>         = []                  ;
  // public mainPanelStyle    : any                = {'height': '90vh'}  ;
  public mainPanelStyle    : any                = ""                  ;
  public angle             : number             = 0                   ;
  // public animFrameRef      : number             = 0                   ;
  public animFrameRef      : any                                      ;
  // public get rotateStyle():any { return {transform: "rotate(" + this.angle + "deg)"}; } ;
  public rotateStyle       : any                                      ;
  public spinnerOn         : boolean            = false               ;
  public showHome          : boolean            = true                ;

  constructor(
    public application    : ApplicationRef    ,
    public changeDetector : ChangeDetectorRef ,
    public zone           : NgZone            ,
    public navCtrl        : NavController     ,
    public modalCtrl      : ModalController   ,
    public auth           : AuthService       ,
    public server         : ServerService     ,
    public db             : DBService         ,
    public storage        : Storage           ,
    public alert          : AlertService      ,
    public data           : OSData            ,
    public appComponent   : OnSiteConsoleX    ,
    public dispatch       : DispatchService   ,
    public notify         : NotifyService     ,
    public electron       : ElectronService   ,
  ) {
    window['consolehome'] = this;
    // this.AppBootPage = OnSiteConsoleX;
    window.document.title = "OnSiteX Console";
  }

  ngOnInit() {
    Log.l("HomePage: ngOnInit fired.");
    this.rotateStyle = { 'transform': 'rotate(0deg)' };
    this.data.appReady().then(res => {
      this.runWhenReady();
    })
    // this.go();
  }

  ngOnDestroy() {
    Log.l("HomePage: ngOnDestroy fired.");
    if(this.dsSubscription && !this.dsSubscription.closed) {
      this.dsSubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.dsSubscription = this.dispatch.datastoreUpdated().subscribe((data:{type:string, payload:any}) => {
      Log.l("Home.subscriptions: Got updated data payload!\n", data);
      let key = data.type;
      let payload = data.payload;
      if(key === 'reports' || key === 'reports_ver101100') {
        Log.l("Home.subscriptions: Updated data payload was for reports.")
        this.reports = payload;
      }
    });
    if(this.data.status.loggedIn) {
      this.currentlyLoggedIn = true;
      this.username = this.auth.getUser();
      this.copyServerInfo();
      this.updatePanelTitle();
    }
  }

  public copyServerInfo() {
    let employees = this.data.getData('employees');
    this.employees = employees.filter((a:Employee) => {
      return a.active && a.username !== 'Chorpler' && a.username !== 'mike';
    });


    this.techs = employees.filter((a:Employee) => {
      let c = a.userClass;
      let uc: string;
      if (Array.isArray(c)) {
        uc = c[0].toLowerCase();
      } else {
        uc = String(c).toLowerCase();
      }
      return a.active && a.username !== 'Chorpler' && a.username !== 'mike' && uc !== 'office' && uc !== 'manager';
    });

    this.office = employees.filter((a:Employee) => {
      let c = a.userClass;
      let uc:string;
      if(Array.isArray(c)) {
        uc = c[0].toLowerCase();
      } else {
        uc = String(c).toLowerCase();
      }
      return (uc === 'office' || uc === 'manager') && a.active && a.username !== 'Chorpler' && a.username !== 'mike';
    });

    this.reports = this.data.getData('reports');;
    // let reports = this.data.getData('reports');
    // this.reports = reports;
    // // this.reports = reports.slice(0);

    let others = this.data.getData('others');
    this.others = others;
    // this.others = others.slice(0);

    let sites = this.data.getData('sites');
    this.totalSites = sites;
    // this.totalSites = sites.slice(0);

    this.sites = sites.filter((a:Jobsite) => {
      return a.site_active;
    });
  }

  public updatePanelTitle() {
    let date = moment();
    let dateString = date.format("MMM DD, YYYY, HH:mm:ss");
    this.mainPanelSubheader = `(last updated ${dateString})`;
  }

  public go() {
    Log.l("Console: go() has been called.");
  }

  public testNotifications() {
    let MIN = 500, MAX = 7500;
    let live = this.data.random(MIN, MAX);
    let details:string = `Developers are always watching, for ${live}ms at least.`;
    Log.l(`HomePage.testNotifications(): generating a notification that should last ${live}ms...`);
    // let msg:Notice = {severity:'error', summary:'ERROR!', detail:details, life:live}
    this.notify.addError("ERROR!", details, live);
  }

  public presentLoginModal(event?:any) {
    this.appComponent.showLogin();
  }

  // public presentLoginModal() {
  //   let loginPage = this.modalCtrl.create('Login', {user: '', pass: ''}, { cssClass: 'login-modal'});
  //   loginPage.onDidDismiss(data => {
  //     Log.l("Got back:\n", data);
  //     this.loginData = data;
  //     this.onSubmit();
  //   })
  //   loginPage.present();
  // }

  public onSubmit() {
    Log.l("Login submitted:\n", this.loginData);
    if(this.loginData != null) {
      let u = this.loginData.user;
      let p = this.loginData.pass;
      this.username = u;
      this.server.loginToServer(u, p, '_session').then((res) => {
        if(res) {
          Log.l("Successfully logged in to server.");
          window.document.title = "OnSiteX Console"
          this.currentlyLoggedIn = true;
        } else {
          Log.l("Failed logging in to server.");
          this.currentlyLoggedIn = false;
        }
      }).catch((err) => {
        Log.l("Error logging in to server.");
        Log.e(err);
      });
    } else {
      Log.l("Login was dismissed or left empty.");
    }
  }

  // public logoutOfApp() {
  //   Log.l("logoutOfApp(): User clicked logout button.");
  //   this.auth.logout().then((res) => {
  //     Log.l("logoutOfApp(): Done logging out. Now canceling PouchDB/CouchDB syncs...");
  //     this.server.cancelAllSyncs();
  //     Log.l("logoutOfApp(): Done canceling PouchDB/CouchDB syncs.");
  //     this.currentlyLoggedIn = false;
  //   });
  // }

  public logoutOfApp(event?:any) {
    // this.appComponent.logout();
    this.appComponent.logoutClicked();
  }

  public async loadOldReports(event?:any) {
    Log.l("loadOldReports() clicked.");
    this.notify.addInfo("RETRIEVING", `Downloading old reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res = await this.server.getOldReports();
      this.oldreports = res;
      this.data.setData('oldreports', res);
      let len = res.length;
      this.notify.addSuccess("SUCCESS", `Loadeded ${len} old reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`loadOldReports(): Error loading reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading old reports: '${err.message}'`, 10000);
    }
  }

  public async viewReports(event?:any) {
    Log.l("viewReports(): Clicked.");
  }

  public async viewReportOthers(event?:any) {
    Log.l("viewReportOthers(): Clicked.");
  }

  public async loadReports(event?:any) {
    this.data.getReports().then(res => {
      this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
      this.application.tick();
    }).catch(err => {
      Log.l("openPage(): Error updating data!");
      Log.e(err);
      this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
    });

  }

  public showOptions(event?:any) {
    this.appComponent.showOptions();
  }

  public toggleSpinner() {

    if(!this.spinnerOn) {
      this.spinnerOn = true;
      let timer = setInterval(() => {
        if (!this.spinnerOn) {
          if (this.angle < 360) {
            this.angle += 10;
            this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
          } else {
            this.angle = 0;
            this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
            clearInterval(timer);
          }
        } else {
          this.angle = this.angle >= 360 ? 0 : this.angle + 10;
          this.rotateStyle = { 'transform': 'rotate(' + this.angle + 'deg)' };
          // this.spinSpinner(this.angle);
        }
      }, 200);
      this.animFrameRef = timer;
    } else {
      // let timer = setInterval(() => {
      //   if(!this.spinnerOn) {

      //     if(this.angle < 360) {
      //       this.angle += 10;
      //     } else {
      //       this.angle = 0;
      //       clearInterval(timer);
      //     }
      //   } else {
      //     this.angle = this.angle >= 360 ? 0 : this.angle + 10;
      //     // this.spinSpinner(this.angle);
      //   }
      // }, 50);
      // this.animFrameRef = timer;
      this.spinnerOn = false;
    }
  }

  public menuButtonClick(event?:any) {
    Log.l("menuButtonClick(): Event is:\n", event);
    if(event) {
      this.electron.buttonClick(event);
    }
  }
}

