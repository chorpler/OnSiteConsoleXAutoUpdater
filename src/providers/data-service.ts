import { sprintf                                                                           } from 'sprintf-js'              ;
import { Subscription                                                                      } from 'rxjs/Subscription'       ;
import { Injectable                                                                        } from '@angular/core'           ;
import { Log, moment, Moment, isMoment, dec, Decimal, _matchCLL, _matchSite                } from 'config/config.functions' ;
import { AlertService                                                                      } from './alert-service'         ;
import { StorageService                                                                    } from './storage-service'       ;
import { ServerService                                                                     } from './server-service'        ;
import { DBService                                                                         } from './db-service'            ;
import { AuthService                                                                       } from './auth-service'          ;
import { Preferences                                                                       } from './preferences'           ;
import { DispatchService                                                                   } from './dispatch-service'      ;
import { NotifyService                                                                     } from './notify-service'        ;
import { Employee, Jobsite, Report, ReportOther, Shift, PayrollPeriod, Schedule, Schedules } from 'domain/domain-classes'   ;
import { DPS, ScheduleBeta                                                                 } from 'domain/domain-classes'   ;
import { WebWorkerService                                                                  } from 'angular2-web-worker'     ;

export type DBDATA = {
  sites       ?: Jobsite[]       ,
  employees   ?: Employee[]      ,
  reports     ?: Report[]        ,
  others      ?: ReportOther[]   ,
  periods     ?: PayrollPeriod[] ,
  shifts      ?: Shift[]         ,
  schedules   ?: Schedules       ,
  oldreports  ?: Report[]        ,
}

@Injectable()
export class OSData {
  public static PREFS    : any                  = new Preferences();
  public static sbs      : Array<ScheduleBeta>  = []               ;
  public static report_types: Array<any>        = []               ;
  public static training_types: Array<any>      = []               ;
  public static ePeriod:Map<Employee,PayrollPeriod> = new Map()    ;
  public static config   : any                  = {
    clients        : [],
    locations      : [],
    locIDs         : [],
    rotations      : [],
    shifts         : [],
    shiftLengths   : [],
    shiftTypes     : [],
    shiftStartTimes: [],
    report_types   : [],
    training_types : [],
  };
  public static dbdata:DBDATA = {
    sites:     [],
    employees: [],
    reports:   [],
    others:    [],
    periods:   [],
    shifts:    [],
    schedules: null,
    oldreports:[],
  };
  public get dbdata():DBDATA { return OSData.dbdata; };
  public set dbdata(val:DBDATA) { OSData.dbdata = val;};
  public static get sites():Jobsite[] { return OSData.dbdata.sites; };
  public static get employees():Employee[] { return OSData.dbdata.employees; };
  public static get reports():Report[] { return OSData.dbdata.reports; };
  public static get others():ReportOther[] { return OSData.dbdata.others; };
  public static get periods():PayrollPeriod[] { return OSData.dbdata.periods; };
  public static get shifts():Shift[] { return OSData.dbdata.shifts; };
  public static get schedules():Schedules { return OSData.dbdata.schedules; };
  public static get oldreports():Report[] { return OSData.dbdata.oldreports;};
  public static set sites(value:Jobsite[]) { OSData.dbdata.sites = value; };
  public static set employees(value:Employee[]) { OSData.dbdata.employees = value; };
  public static set reports(value:Report[]) { OSData.dbdata.reports = value; };
  public static set others(value:ReportOther[]) { OSData.dbdata.others = value; };
  public static set periods(value:PayrollPeriod[]) { OSData.dbdata.periods = value; };
  public static set shifts(value:Shift[]) { OSData.dbdata.shifts = value; };
  public static set schedules(value:Schedules) { OSData.dbdata.schedules = value; };
  public static set oldreports(value:Report[]) { OSData.dbdata.oldreports = value; };
  public get sites():Jobsite[] { return OSData.dbdata.sites; };
  public get employees():Employee[] { return OSData.dbdata.employees; };
  public get reports():Report[] { return OSData.dbdata.reports; };
  public get others():ReportOther[] { return OSData.dbdata.others; };
  public get periods():PayrollPeriod[] { return OSData.dbdata.periods; };
  public get shifts():Shift[] { return OSData.dbdata.shifts; };
  public get schedules():Schedules { return OSData.dbdata.schedules; };
  public get oldreports():Report[] { return OSData.dbdata.oldreports;};
  public set sites(value:Jobsite[]) { OSData.dbdata.sites = value; };
  public set employees(value:Employee[]) { OSData.dbdata.employees = value; };
  public set reports(value:Report[]) { OSData.dbdata.reports = value; };
  public set others(value:ReportOther[]) { OSData.dbdata.others = value; };
  public set periods(value:PayrollPeriod[]) { OSData.dbdata.periods = value; };
  public set shifts(value:Shift[]) { OSData.dbdata.shifts = value; };
  public set schedules(value:Schedules) { OSData.dbdata.schedules = value; };
  public set oldreports(value:Report[]) { OSData.dbdata.oldreports = value; };

  public static status   : any                  = { role: "usr", ready: false, loading: false, loggedIn: false, persistTechChanges: false, showAllSites: true, showOffice: false, allDatesAvailable: false, ready2: false, showColors:true, showShiftLength:true } ;
  public static dps      : DPS                  = new DPS();
  public  static user         : Employee                                ;
  private static userInfo     : any                                     ;
  public readySub             : Subscription                            ;
  public pouchChanges         : any                  = {}               ;
  public  prefs               : any                  = OSData.PREFS     ;
  // public  get employees()     : Array<Employee>      { return OSData.employees ;};
  // public  get sites()         : Array<Jobsite>       { return OSData.sites     ;};
  // public  get reports()       : Array<Report>        { return OSData.reports   ;};
  // public  get others()        : Array<ReportOther>   { return OSData.others    ;};
  // public  get shifts()        : Array<Shift>         { return OSData.shifts    ;};
  // public  get periods()       : Array<PayrollPeriod> { return OSData.periods   ;};
  public  get sbs()           : Array<ScheduleBeta>  { return OSData.sbs       ;};
  public  get report_types()  : Array<any>           { return OSData.report_types;};
  public  get training_types(): Array<any>           { return OSData.training_types;};
  // public  get schedules()     : Schedules            { return OSData.schedules ;};
  public  get ePeriod()       : Map<Employee,PayrollPeriod> { return OSData.ePeriod ;};
  public  get config()        : any                  { return OSData.config    ;};
  // public  get dbdata()        : DBDATA                  { return OSData.dbdata    ;};
  public  get status()        : any                  { return OSData.status    ;};
  public  get dps()           : any                  { return OSData.dps       ;};
  public  get user()          : Employee             { return OSData.user      ;};
  // public set employees(value: Array<Employee>)       { OSData.employees = value ;};
  // public set sites(value: Array<Jobsite>)            { OSData.sites = value     ;};
  // public set reports(value: Array<Report>)           {  OSData.reports = value   ;};
  // public set others(value: Array<ReportOther>)       { OSData.others = value    ;};
  // public set shifts(value: Array<Shift>)             { OSData.shifts = value    ;};
  // public set periods(value: Array<PayrollPeriod>)    { OSData.periods = value   ;};
  public set sbs(value:Array<ScheduleBeta>)          { OSData.sbs = value       ;};
  public set report_types(value:Array<any>)          { OSData.report_types = value;};
  public set training_types(value:Array<any>)        { OSData.training_types = value;};
  // public set schedules(value: Schedules)             { OSData.schedules = value ;};
  public set ePeriod(value:Map<Employee,PayrollPeriod>) { OSData.ePeriod = value;};
  public set config(value: any)                      { OSData.config = value    ;};
  // public set dbdata(value:any)                       { OSData.dbdata = value    ;};
  public set status(value: any)                      { OSData.status = value    ;};
  public set dps(value:any) {Log.w("ERROR: dps can't be set directly.");};
  public set user(value:Employee)                { OSData.user = value      ;};
  public count           : number = 0                ;
  public isDeveloper     : boolean = false           ;
  constructor(
    public storage  : StorageService   ,
    public db       : DBService        ,
    public server   : ServerService    ,
    public alert    : AlertService     ,
    public auth     : AuthService      ,
    public worker   : WebWorkerService ,
    public dispatch : DispatchService  ,
    public notify   : NotifyService    ,
  ) {
    Log.l('Hello OSData Provider');
    window['onsitedata']        = this         ;
    window['onsiteDataService'] = OSData       ;
    window['_matchCLL']         = _matchCLL    ;
    window['_matchSite']        = _matchSite   ;
    this.readySub = this.dispatch.appReadyStatus().subscribe((status) => {
      Log.l("OSData: appReadyStatus() subscription got an observable value of: ", status);
      this.status.ready = status;
      if(this.readySub && this.readySub.unsubscribe) {
        this.readySub.unsubscribe();
      }
    });
    // window['_filterTechs']      = _filterTechs ;
  }

  public random(min?:number, max?:number, roundToNearest?:number) {
    let umin    = min || 0;
    let umax    = max || 10;
    let randInt = Math.trunc(Math.random()*(umax - umin)) + umin;
    let RTN = Number(roundToNearest);
    if (RTN !== undefined && RTN > 0 && RTN <= (max - min)) {
      randInt = Math.ceil(randInt / RTN) * RTN;
      if(randInt > max) {
        randInt = max;
      } else if(randInt < min) {
        randInt = min;
      }
    }
    return randInt;
  }

  public checkDeveloperStatus() {
    let username = (this.getUser() && this.getUser().getUsername()) ? this.getUser().getUsername() : "nobody";
    if (username === 'mike' || username === 'Hachero' || username === 'Chorpler') {
      this.isDeveloper = true;
      this.status.role = "dev";
      return true;
    } else {
      this.isDeveloper = false;
      this.status.role = "usr"
      return false;
    }
  }

  public toggleDeveloperMode() {
    let username = (this.getUser() && this.getUser().getUsername()) ? this.getUser().getUsername() : "nobody";
    if (username === 'mike' || username === 'Hachero' || username === 'Chorpler') {
      if(this.status.role==="dev") {
        // this.isDeveloper = false;
        this.status.role = "usr";
      } else {
        // this.isDeveloper = true;
        this.status.role = "dev";
      }
      Log.l("toggleDeveloperMode(): role is now '%s'", this.status.role);
    } else {
      Log.l("toggleDeveloperMode(): can't toggle developer mode, user is not developer.");
      this.notify.addWarning("UNAUTHORIZED", "You are not logged in as a developer.", 3000);
    }
  }

  public fetchAllData() {
    return new Promise((resolve,reject) => {
      if(this.status.ready || this.status.loading) {
        resolve(true);
      }
      this.status.loading = true;
      this.fetchData().then(res => {
        Log.l("DataService: done fetching data.");
        this.status.ready   = true;
        this.status.loading = false;
        resolve(true);
      }).catch(err => {
        Log.l("DataService: error fetching data.");
        Log.e(err);
        this.status.ready   = false;
        this.status.loading = false;
        // let err = new Error("Error fetching data from PouchDB.");
        // reject(false);
        reject(err);
      });
    });
  }

  public fetchData() {
    return new Promise((resolve,reject) => {
      if(this.status.ready) {
        resolve(true);
      }
      this.status.loading = true;
      this.status.ready   = false;
      // this.alert.clearSpinners();
      let spinnerID = this.alert.showSpinner("Retrieving data from local PouchDB...");;
      let loading = this.alert.getSpinner(spinnerID);
      this.server.getUserData(this.auth.getUser()).then(res => {
        this.user = new Employee();
        this.user.readFromDoc(res);

      // });
        return this.db.getAllData(false, spinnerID);
      }).then(res => {
        OSData.schedules = new Schedules();
        for(let key in res) {
          if(key !== 'schedules') {
            this.dbdata[key] = res[key];
          } else {
            OSData.schedules.setSchedules(res[key]);
          }
        }
        loading.setContent("Retrieving data from:<br>\nsesa-config");
        return this.db.getAllConfigData();
      }).then(res => {
        OSData.config.clients         = res['clients']         ;
        OSData.config.locations       = res['locations']       ;
        OSData.config.locIDs          = res['locids']          ;
        OSData.config.rotations       = res['rotations']       ;
        OSData.config.shifts          = res['shifts']          ;
        OSData.config.shiftLengths    = res['shiftlengths']    ;
        OSData.config.shiftTypes      = res['shifttypes']      ;
        OSData.config.shiftStartTimes = res['shiftstarttimes'] ;
        OSData.config.report_types    = res['report_types']    ;
        OSData.config.training_types  = res['training_types']  ;
        OSData.report_types           = res['report_types']    ;
        OSData.training_types         = res['training_types']  ;
        // return this.db.getDPSSettings();
        return this.server.getDPSSettings();
      }).then(res => {
        OSData.dps = res;
        this.alert.hideSpinner(spinnerID);
        Log.l("fetchData(): All data fetched.");
        this.status.ready   = true;
        this.status.loading = false;
        let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
        resolve(true);
      }).catch(err => {
        this.alert.hideSpinner(spinnerID);
        Log.l("fetchData(): Error fetching all data.");
        Log.e(err);
        this.alert.showAlert("ERROR", "Error retrieving data:<br>\n<br\n" + err);
        this.status.ready   = false;
        this.status.loading = false;
        reject(err);
      });
    });
  }

  public getReports() {
    return new Promise((resolve,reject) => {
      let spinnerID = this.alert.showSpinner("Retrieving work reports...");
      this.db.getReportsData(spinnerID).then(res => {
        this.alert.hideSpinner(spinnerID);
        this.dbdata.reports = res;
        this.dispatch.updateDatastore(this.prefs.DB.reports, this.dbdata.reports);
        let change = this.syncChanges(this.prefs.DB.reports);
        this.pouchChanges.reports_ver101100 = change;
        resolve(res);
      }).catch(err => {
        this.alert.hideSpinner(spinnerID);
        Log.l("getReports(): Error getting reports!");
        Log.e(err);
        reject(err);
      })
    });
  }

  public syncChanges(dbname:string) {
    // return new Promise((resolve,reject) => {
    if(dbname === this.prefs.DB.reports) {
      let reports = this.dbdata.reports;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.reports;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          if(idx > -1) {
            let report = reports[idx];
            reports.splice(idx, 1);
            this.notify.addInfo("DELETED REPORT", `Deleted Report '${report._id}'.`, 3000);
          }
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          if(doc._id[0] === '_') {
            return;
          }
          let idx = reports.findIndex((a:Report) => {
            return a._id === change.id;
          });
          let report = new Report();
          report.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            reports[idx] = report;
            this.notify.addInfo("EDITED REPORT", `Edited Report '${report._id}'.`, 3000);
          } else {
            reports.push(report);
            this.notify.addInfo("NEW REPORT", `New Report '${report._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('reports', this.dbdata.reports);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
      return changes;
    } else if(dbname === this.prefs.DB.reports_other) {
      let others = this.dbdata.others;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.reports;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          others.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = others.findIndex((a:ReportOther) => {
            return a._id === change.id;
          });
          let other = new ReportOther();
          other.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            others[idx] = other;
            this.notify.addInfo("EDITED REPORTOTHER", `Edited ReportOther '${other._id}' added.`, 3000);
          } else {
            others.push(other);
            this.notify.addInfo("NEW REPORTOTHER", `New ReportOther '${other._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('others', this.dbdata.others);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === this.prefs.DB.jobsites) {
      let sites = this.dbdata.sites;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let reports = this.dbdata.sites;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          sites.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = sites.findIndex((a:Jobsite) => {
            return a._id === change.id;
          });
          let site = new Jobsite();
          site.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            sites[idx] = site;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${site._id}' added.`, 3000);
          } else {
            sites.push(site);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${site._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('sites', this.dbdata.sites);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else if(dbname === this.prefs.DB.employees) {
      let sites = this.dbdata.sites;
      let db = this.db.addDB(dbname);
      let changes = db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        Log.l(`syncChanges('${dbname}'): change event detected!`);
        let employees = this.dbdata.employees;
        if (change.deleted) {
          // change.id holds the deleted id
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          employees.splice(idx, 1);
        } else { // updated/inserted
          // change.doc holds the new doc
          // onUpdatedOrInserted(change.doc);
          let doc = change.doc;
          let idx = employees.findIndex((a:Employee) => {
            return a._id === change.id;
          });
          let tech = new Employee();
          tech.readFromDoc(doc);
          if(idx > -1) {
            // report = reports[idx];
            employees[idx] = tech;
            this.notify.addInfo("EDITED JOBSITE", `Edited Jobsite '${tech._id}' added.`, 3000);
          } else {
            employees.push(tech);
            this.notify.addInfo("NEW JOBSITE", `New JOBSITE '${tech._id}' added.`, 3000);
          }
        }
        this.dispatch.updateDatastore('employees', this.dbdata.employees);
      }).on('error', (err) => {
        Log.l(`syncChanges('${dbname}'): change subscription received error!`);
        Log.e(err);
      });
    } else {
      Log.l(`syncChanges('${dbname}'): Can't sync to non-reports databases at the moment!`);
      return undefined;
    }
  }

  public ready() {
    return this.status.ready;
  }

  public setReady(value:boolean) {
    this.status.ready = value;
    return this.status.ready;
  }

  public async waitAndTest() {
    return new Promise((resolve) => {
      setTimeout(() => {
        Log.l("waitAndTest(): Count is at %d.", this.count);
        resolve(true);
      }, 1000);
    });
  }

  public async readyStatus() {
    try {
      if(this.status.ready) {
        this.count = 0;
        return true;
      } else if(this.status.loading || !this.getUser()) {
        Log.l("appReady(): Called while app already loading data.");
        // reject(false);
        while(this.count++ < 30 && !this.status.ready) {
          let res = await this.waitAndTest();
        }
        return this.status.ready;
          // let to = setTimeout(() => {
          //   Log.l("appReady(): Timeout number %d", this.count);
          //   return this.appReady();
          // }, 1000);
        // } else {
        //   Log.l("appReady(): Timeout ran out.");
        //   if(this.status.ready) {
        //     resolve(true);
        //   } else {
        //     reject(false);
        //   }
        // }
      } else if(this.getUser()) {
        Log.l("appReady(): Fetching data and resolving...");
        this.status.loading = true;
        this.fetchData().then(res => {
          return true;
        }).catch(err => {
          Log.l("appReady(): Error fetching data.");
          Log.e(err);
          // throw new Error("Error fetching data");
          return false;
        });
      } else {
        Log.l("appReady(): App is not ready. We need to wait. But fuck it.");
        return false;
      }
    } catch(err) {
      Log.l("readyStatus(): Error fetching data.");
      Log.e(err);
      return false;
    }
  }

  public appReady() {
    // let res = new Promise((res) => {return this.status.ready = res;});
    // return res;
    return new Promise((resolve,reject) => {
      this.readyStatus().then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
    // return new Promise((resolve,reject) => {
    //   if(this.status.ready) {
    //     this.count = 0;
    //     resolve(true);
    //   } else if(this.status.loading) {
    //     Log.l("appReady(): Called while app already loading data.");
    //     // reject(false);
    //     if(this.count++ < 20) {
    //       let to = setTimeout(() => {
    //         Log.l("appReady(): Timeout number %d", this.count);
    //         return this.appReady();
    //       }, 1000);
    //     } else {
    //       Log.l("appReady(): Timeout ran out.");
    //       if(this.status.ready) {
    //         resolve(true);
    //       } else {
    //         reject(false);
    //       }
    //     }
    //   } else {
    //     Log.l("appReady(): Fetching data and resolving...");
    //     this.fetchData().then(res => {
    //       resolve(res);
    //     }).catch(err => {
    //       Log.l("appReady(): Error fetching data.");
    //       Log.e(err);
    //       reject(err);
    //     });
    //   }
    // });
  }

  public isAppReady() {
    return this.ready();
  }

  public getAllData(type?:string) {
    this.db.getAllData(true).then(res => {
      this.dbdata.employees = [];
      this.dbdata.sites     = [];
      this.dbdata.reports   = [];
      this.dbdata.others    = [];
      for(let employee of res.employees) {
        this.dbdata.employees.push(employee);
      }
      for(let site of res.sites) {
        this.dbdata.sites.push(site);
      }
      for(let report of res.reports) {
        this.dbdata.reports.push(report);
      }
      for(let other of res.otherReports) {
        this.dbdata.others.push(other);
      }
    }).catch(err => {
      Log.l("getData(): Error retrieving all data.");
      Log.e(err);
    });
  }

  public getData(type:string) {
    return this.dbdata[type];
  }

  public setData(type:string, value:any) {
    this.dbdata[type] = value;
    return this.dbdata[type];
  }

  public getConfigData(type?:string) {
    if(type) {
      return OSData.config[type];
    } else {
      return OSData.config;
    }
  }

  public savePreferences() {
    return new Promise((resolve,reject) => {
      this.storage.persistentSet('PREFS', this.prefs.getPrefs()).then(res => {
        Log.l("savePreferences(): Preferences saved successfully.\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("savePreferences(): Error saving preferences!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getUser():Employee {
    return this.user;
  }

  public setUser(user:Employee) {
    this.user = user;
    return this.user;
  }

  public getTechLocationForDate(tech:Employee, dateInQuestion:Moment|Date) {
    let name           = tech.getUsername();
    let date           = moment(dateInQuestion);
    let sites          = this.getData('sites');
    let schedules      = this.getSchedules();
    // let scheduleStart  = this.getScheduleStartDate(date);
    let scheduleStart  = this.getPayrollPeriodStartDate(date);
    let strScheduleStart = scheduleStart.format("YYYY-MM-DD");
    let sched:Schedule = schedules.find((a:Schedule) => {
      return ((a._id === strScheduleStart) && a.creator === 'grumpy');
    });
    let unassigned_site = sites.find((a:Jobsite) => { return a.site_number === 1;});
    let schedule;
    if(sched && sched.schedule) {
      schedule = sched.schedule;
    } else {
      let errText = `getTechLocationForDate(): Could not find schedule for date '${strScheduleStart}'.`;
      Log.w(errText);
      this.notify.addWarning("SCHEDULE MISSING", errText, 10000);
      return unassigned_site;
    }
    let scheduleName;
    outerloop:
    for(let siteName in schedule) {
      let siteRotations = schedule[siteName];
      for(let rotation in siteRotations) {
        let techs = siteRotations[rotation];
        if(techs.indexOf(name) > -1) {
          scheduleName = siteName;
          break outerloop;
        }
      }
    }
    if(scheduleName) {
      let site = sites.find((a:Jobsite) => { return a.getScheduleName().toUpperCase() === scheduleName.toUpperCase()});
      if(site === undefined) {
        let tryAgain = this.getSiteForTech(tech);
        if(tryAgain.site_number !== 1) {
          site = tryAgain;
        } else {
          Log.w(`getTechLocationForDate(): Could not find location for tech '${name}' on date '${date.format("YYYY-MM-DD")}', even with user location data!`);
          site = unassigned_site;
        }
      }
      return site;
    } else {
      let site;
      let tryAgain = this.getSiteForTech(tech);
      if(tryAgain.site_number !== 1) {
        site = tryAgain;
      } else {
        Log.w(`getTechLocationForDate(): Could not find location for tech '${name}' on date '${date.format("YYYY-MM-DD")}'.`);
        site = unassigned_site;
      }
      return site;
    }
  }

  public getTechRotationForDate(tech:Employee, dateInQuestion:Moment|Date) {
    let name           = tech.getUsername();
    let date           = moment(dateInQuestion);
    let schedules      = this.getSchedules();
    // let scheduleStart  = this.getScheduleStartDate(date);
    let scheduleStart  = Schedule.getScheduleStartDateFor(date);
    let sched:Schedule = schedules.find(a => {
      return ((a._id === scheduleStart.format("YYYY-MM-DD")));
    });
    let schedule = sched.schedule;
    let techRotation = null;
    outerloop:
    for(let siteName in schedule) {
      let siteRotations = schedule[siteName];
      for(let rotation in siteRotations) {
        let techs = siteRotations[rotation];
        if(techs.indexOf(name) > -1) {
          techRotation = rotation;
          break outerloop;
        }
        // let i = techs.findIndex((a:Employee) => {
        //   return a.username === tech.username;
        // });
        // if(i > -1) {
        //   techRotation = rotation;
        //   break outerloop;
        // }
      }
    }
    if(techRotation) {
      return techRotation;
    } else {
      return "UNASSIGNED";
    }
  }

  public getRotationSequence(rotation:any) {
    let a = "";
    if(typeof rotation === 'string') {
      a = rotation;
    } else if(typeof rotation === 'object' && rotation.name !== undefined) {
      a = rotation.name;
    } else {
      a = JSON.stringify(rotation);
    }
    let out = a === 'FIRST WEEK' ? "A" : a === 'CONTN WEEK' ? "B" : a === 'FINAL WEEK' ? "C" : a === 'DAYS OFF' ? "D" : a === 'VACATION' ? "V" : "X";
    return out;
  }

  public getPayrollPeriodStartDate(date?: Moment|Date) {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day                 = date ? moment(date).startOf('day') : moment().startOf('day');
    if (day.isoWeekday() < scheduleStartsOnDay) { return moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
    else { return moment(day).isoWeekday(scheduleStartsOnDay); }
  }

  public getScheduleStartDate(date?: any) {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day                 = date ? moment(date) : moment();
    if (day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
    else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  }

  public createPayrollPeriods(count?:number):Array<PayrollPeriod> {
    let periods = new Array<PayrollPeriod>();
    let weeksBack:number = count ? count : 4;
    let now:Moment   = moment();
    let date:Moment  = now.startOf('week').subtract(weeksBack, 'weeks');
    let begin:Moment = now.startOf('day');
    let start:Moment = this.getScheduleStartDate(date);
    let end:Moment   = moment(start).add(6, 'days');
    let latest = this.getScheduleStartDate(begin);
    Log.l(`createPayrollPeriods(): Starting with ${latest.format("YYYY-MM-DD")}, counting back to ${start.format("YYYY-MM-DD")}`);
    while(latest.subtract(7, 'days').isSameOrAfter(start, 'day')) {
      let period = new PayrollPeriod(moment(latest), moment(latest).add(6, 'days'), moment(latest).toExcel(), []);
      period.getPayrollShifts();
      periods.push(period);
    }
    Log.l(`createPayrollPeriods(): Counting back '${weeksBack}' weeks, result is:\n`, periods);
    this.dbdata.periods = periods;
    return periods;
  }

  public createPeriodForTech(tech: Employee, start_date?:Moment): PayrollPeriod {
    let name = tech.getUsername();
    let date = start_date ? moment(start_date).startOf('day') : moment().startOf('day');
    // Log.l(`createPeriodForTech(): Creating payroll period for tech '${name}' and date '${date.format("YYYY-MM-DD")}'...`);
    let now = moment(date);
    // OSData.periods = [];
    // let payp = OSData.periods;
    // let payp = new Array<PayrollPeriod>();
    // let len = payp.length;
    // let tmp1 = payp;
    // OSData.periods = payp.splice(0, len);
    let sites = this.getData('sites');
    let site:Jobsite = this.getTechLocationForDate(tech, moment(date));
    let rotation = this.getTechRotationForDate(tech, moment(date));

    if (site instanceof Jobsite) {
      // let periodCount = count || 2;
      // for (let i = 0; i < periodCount; i++) {
      // Log.l(`createPeriodForTech(): Now creating period for tech '${tech}' at site '${site.getScheduleName()}'...`);
      // let date  = start_date ? moment(start_date) : moment();
      let start = PayrollPeriod.getPayrollPeriodDateForShiftDate(moment(date));
      let pp    = new PayrollPeriod();
      pp.setStartDate(start);
      pp.createConsolePayrollPeriodShiftsForTech(tech, site, rotation);
      return pp;
      // }
      // return OSData.periods;
    } else {
      Log.e("createPayrollPeriods(): Could not find tech at any jobsites!");
      Log.l(tech);
      Log.l(sites);
      return null;
    }
  }

  public getSiteForTech(tech:Employee):Jobsite {
    let cli = this.getFull('client', tech.client);
    let loc = this.getFull('location', tech.location);
    let lid = this.getFull('locID', tech.locID);
    let sites = this.getData('sites');
    let unassigned:Jobsite = sites.find((a:Jobsite) => {
      return a.site_number === 1;
    });
    let site:Jobsite = sites.find((a:Jobsite) => {
      return a.client.name.toUpperCase() === cli.name.toUpperCase() && a.location.name.toUpperCase() === loc.name.toUpperCase() && a.locID.name.toUpperCase() === lid.name.toUpperCase();
    });
    if(site) {
      return site;
    } else {
      return unassigned;
    }
  }

  public getFullName(type:string, value:any) {
    let out = this.getFull(type, value);
    if(out && typeof out === 'object' && out['fullName'] !== undefined) {
      return out['fullName'];
    } else {
      return out;
    }
  }

  public getFull(type:string, value:any):any {
    let result = null;
    let sites = this.getData('sites');
    if(type === 'client' || type === 'location' || type === 'locID') {
      let val;
      if(value && typeof value === 'object' && typeof value.fullName === 'string') {
        val = value.fullName.toUpperCase();
      } else if(value && typeof value === 'string') {
        val = value.toUpperCase();
      } else {
        return {name: "", fullName: ""};
      }
      // result = this.sites.find(obj => {
      //   let n  = obj[type]['fullName'].toUpperCase();
      //   let fn = obj[type]['name'].toUpperCase();
      //   return n === val || fn === val;
      // });
      result = sites.filter(obj => {
        let n  = obj[type]['fullName'].toUpperCase();
        let fn = obj[type]['name'].toUpperCase();
        return n === val || fn === val;
      }).map(a => a[type])[0];
      // result = result[type];
    } else {
      result = "";
      Log.w(`getFull(): Type '${type}' not valid for value:\n`, value);
    }
    return result;
  }

  public getFullClient(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('client', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getFullLocation(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('location', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getFullLocID(value:any):any {
    let out = {name: "", fullName: ""};
    if(value) {
      let val    = value.toUpperCase();
      let result = this.getFull('locID', value);
      if(result) {
        out = result;
      }
    }
    return out;
  }

  public getSchedules():Array<Schedule> {
    return this.schedules.getSchedules();
  }

  public getSchedulesAsBetas():Array<ScheduleBeta> {
    return this.sbs;
  }

  public generatePayrollData() {
    let eReports: Map<Employee, Array<Report>>        = new Map();
    let ePeriods: Map<Employee, Array<PayrollPeriod>> = new Map();
  }

  public createEmployeePeriodMap(pd:PayrollPeriod):Map<Employee,PayrollPeriod> {
    // let periods = this.periods ||  this.createPayrollPeriods();
    let period = pd;

    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.getFullClient(a.client);
      let cliB = this.getFullClient(b.client);
      let locA = this.getFullLocation(a.location);
      let locB = this.getFullLocation(b.location);
      let lidA = this.getFullLocID(a.locID);
      let lidB = this.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    let _sortReports = (a:Report, b:Report) => {
      return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
    };

    window['_sortTechs']   = _sortTechs;
    window['_sortReports'] = _sortReports;
    let allData = {employees: [], reports: [], others: [], periods: [], sites: [], schedules: []};
    allData.employees = this.dbdata.employees.slice(0) ;
    allData.reports   = this.dbdata.reports.slice(0)   ;
    allData.others    = this.dbdata.others.slice(0)    ;
    allData.periods   = this.dbdata.periods.slice(0)   ;
    allData.sites     = this.dbdata.sites.slice(0)     ;
    // this.allData.schedules = this.data.schedules.clone()  ;
    allData.schedules = this.getSchedules().slice(0) ;

    let employees = allData.employees.filter((a:Employee) => {
      let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
      return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    });

    // let period;

    // if(pd) {
    //   period = periods.find((a:PayrollPeriod) => {
    //     return a.start_date.format("YYYY-MM-DD") === pd.start_date.format("YYYY-MM-DD");
    //   });
    // } else {
    //   period = periods[0];
    // }

    employees     = employees.sort(_sortTechs);
    let reports   = allData.reports.sort(_sortReports);
    let others    = allData.others.sort(_sortReports);
    let sites     = allData.sites.slice(0);
    let sortedSchedules = allData.schedules.sort((a: Schedule, b: Schedule) => {
      return a.startXL < b.startXL ? 1 : a.startXL > b.startXL ? -1 : 0;
    });
    this.schedules.setSchedules(sortedSchedules);
    let pDate = moment(period.start_date).format("YYYY-MM-DD");

    let schedules = this.getSchedules();
    let schedule = schedules.find((obj: Schedule) => {
      return obj._id === pDate;
    });
    this.ePeriod = this.updatePeriod(period);
    return this.ePeriod;
    // this.dataReady = true;

  }



  public updatePeriod(period: PayrollPeriod) {
    // let text = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
    let ePeriod = new Map();

    // let eSummary = new Map();
    let date  = moment(period.start_date);
    let start = moment(date).format("YYYY-MM-DD");
    let end   = moment(start).add(6, 'days').format("YYYY-MM-DD");
    let sites = this.sites;

    let reports = this.getData('reports');
    let others  = this.getData('others');

    reports = reports.filter((obj, pos, arr) => {
      let    report_date   = obj['report_date'];
      return report_date  >= start && report_date <= end;
    });
    others = others.filter((obj, pos, arr) => {
      let    report_date   = obj['report_date'].format("YYYY-MM-DD");
      return report_date  >= start && report_date <= end;
    });

    // this.schedules.setSchedules(this.getData('schedules'));

    let schedules = this.getSchedules();

    let pDate = moment(period.start_date).format("YYYY-MM-DD");
    let schedule = schedules.find(a => {
      return a.start.format("YYYY-MM-DD") === pDate;
    });
    // this.schedule = schedule;
    // let a = schedule.schedule;
    // let techSite;
    // let siteNames = Object.keys(a);
    // for (let name of siteNames) {
    //   let rotations = Object.keys(a[name]);
    //   for (let rotation of rotations) {
    //     let techs = a[name][rotation];
    //     let techSite = techs.find(b => { return b.username === 'Aj'; });
    //   }
    // }
    // this.loading.setContent(text + "<br>\nReading employee reports...");
    let techs = this.employees.slice(0);
    techs = techs.filter((a:Employee) => {
      let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
      return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    });

    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.getFullClient(a.client);
      let cliB = this.getFullClient(b.client);
      let locA = this.getFullLocation(a.location);
      let locB = this.getFullLocation(b.location);
      let lidA = this.getFullLocID(a.locID);
      let lidB = this.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    techs = techs.sort(_sortTechs)
    for (let tech of techs) {
      // if(tech.client && tech.client.full)
      let date       = moment(period.start_date);
      let techPeriod = this.createPeriodForTech(tech, date);
      let shifts     = techPeriod.getPayrollShifts();
      for (let shift of shifts) {
        let shiftDate = shift.getShiftDate().format("YYYY-MM-DD");
        reports   = this.dbdata.reports.filter((obj, pos, arr) => {
          return obj['report_date'] === shiftDate && obj['username'] === tech.username;
        });
        let others = this.dbdata.others.filter((obj, pos, arr) => {
          let otherDate = obj['report_date'].format("YYYY-MM-DD");
          return otherDate === shiftDate && obj['username'] === tech.username;
        });
        shift.setShiftReports([]);
        shift.setOtherReports([]);
        for (let report of reports) {
          shift.addShiftReport(report);
        }
        for (let other of others) {
          shift.addOtherReport(other);
        }
      }
      ePeriod.set(tech, techPeriod);
      // let techPeriodSummary = new Map();
      // let standby           = 0;
      // let training          = 0;
      // let travel            = 0;
      // let holiday           = 0;
      // let vacation          = 0;
      // let sick              = 0;
      // for (let shift of shifts) {
      //   standby  += shift.getSpecialHours('Standby').hours;
      //   training += shift.getSpecialHours('Training').hours;
      //   travel   += shift.getSpecialHours('Travel').hours;
      //   holiday  += shift.getSpecialHours('Holiday').hours;
      //   vacation += shift.getSpecialHours('Vacation').hours;
      //   sick     += shift.getSpecialHours('Sick').hours;
      // }
      // techPeriodSummary.set('standby', standby);
      // techPeriodSummary.set('training', training);
      // techPeriodSummary.set('travel', travel);
      // techPeriodSummary.set('holiday', holiday);
      // techPeriodSummary.set('vacation', vacation);
      // techPeriodSummary.set('sick', sick);
      // eSummary.set(tech, techPeriodSummary);
    }
    return ePeriod;
  }

  public getEmployeeFromUsername(username:string) {
    let employees = this.employees;
    let employee  = employees.find(a => {
      return a['username'] === username;
    });
    return employee;
  }

  public convertTimeStringToHours(timestring:string|number):number {
    if(typeof timestring === 'number') {
      return timestring;
    } else {
      let timearray = timestring.split(":");
      let hs = timestring[0];
      let ms = timestring[1];
      let hours = Number(hs) + (Number(ms)/60);
      return hours;
    }
  }

  public decimalize(value:number):Decimal {
    return new dec(value);
  }

  public splitReportID(id:string) {
    let splits = id.split("_");
    let len = splits.length;
    let num = 0, strNum = "", newID = "";
    if(splits[len - 2] === "split") {
      num = Number(splits[len - 1]);
      if(!isNaN(num)) {
        num++;
        strNum = sprintf("%02d", num);
        splits.pop();
        // splits.pop();
        for(let chunk of splits) {
          newID += chunk + "_";
        }
        newID += strNum;
      }
    } else {
      newID = id + "_split_01";
    }
    return newID;
    // let match = /(.*)(?:_split_)?()/g;
  }

  public splitReport(rpt:Report):Report {
    let report = rpt;
    let newReport = new Report();
    newReport.readFromDoc(rpt.serialize());
    let id = report._id;
    let splits = id.split("_");
    let len = splits.length;
    let num = 0, strNum = "", newID = "";
    if(splits[len - 2] === "split") {
      num = Number(splits[len - 1]);
      if(!isNaN(num)) {
        num++;
        strNum = sprintf("%02d", num);
        splits.pop();
        // splits.pop();
        for(let chunk of splits) {
          newID += chunk + "_";
        }
        newID += strNum;
      }
    } else {
      newID = id + "_split_01";
    }
    newReport._id = newID;
    report.split_count++;
    newReport.split_count++;
    newReport.split_from = report._id;
    report.split_from = "";
    return newReport;
    // let match = /(.*)(?:_split_)?()/g;
  }

}
