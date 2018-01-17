/**
 * Name: Preferences provider (Console)
 * Vers: 56
 * Date: 2017-12-11
 * Auth: David Sargeant
 * Logs: 56 2017-12-11: Added kn, be, hb invoices databases
 * Logs: 55 2017-12-09: Added page size arrays
 * Logs: 54 2017-11-17: Added reports_old01 key
 * Logs: 53: Fixed preauths typo
 * Logs: 52: Added preauth database parameter
 * Logs: 51: Added customizable PouchDB adapter
 * Logs: 50: Added weekStartDay preference
 * Logs: 49: Added loadReports preference
 * Logs: 48: Updated PouchDB adapter back to idb
 * Logs: 47: Updated PouchDB adapter to worker
 * Logs: I forget
 */

import { Injectable } from '@angular/core'           ;
import { Log        } from 'config/config.functions' ;

export const version      = 56                  ;
export var adapter    = 'idb'            ;

export var server         = "pico.sesa.us"         ;
export var port           = 443                    ;
export var protocol       = "https"                ;
export var reports        = 'reports_ver101100'    ;
export var reportsOther   = 'sesa-reports-other'   ;
export var employees      = 'sesa-employees'       ;
export var config         = 'sesa-config'          ;
export var jobsites       = 'sesa-jobsites'        ;
export var scheduling     = 'sesa-scheduling'      ;
export var schedulingbeta = 'sesa-scheduling-beta' ;
export var invoices       = 'sesa-invoices'        ;
export var invoices_be    = 'sesa-invoices-be'     ;
export var invoices_hb    = 'sesa-invoices-hb'     ;
export var invoices_kn    = 'sesa-invoices-kn'     ;
export var technicians    = 'sesa-technicians'     ;
export var messages       = 'sesa-messages'        ;
export var comments       = 'sesa-comments'        ;
export var phoneInfo      = 'sesa-tech-phones'     ;
export var sounds         = 'sesa-sounds'          ;
export var login          = '_session'             ;
export var preauths       = 'sesa-preauths'        ;
export var worksites      = 'sesa-worksites'       ;
export var reports_old01  = 'sesa-reports-2017-09' ;
export var reports_old02  = 'sesa-reports-2017-11' ;

@Injectable()
export class Preferences {
  public static DB: any = {
    'reports'      : reports,
    'reports_other': reportsOther,
    'employees'    : employees,
    'config'       : config,
    'jobsites'     : jobsites,
    'scheduling'   : scheduling,
    'invoices'     : invoices,
    'invoices_be'  : invoices_be,
    'invoices_hb'  : invoices_hb,
    'invoices_kn'  : invoices_kn,
    'technicians'  : technicians,
    'messages'     : messages,
    'comments'     : comments,
    'phoneInfo'    : phoneInfo,
    'sounds'       : sounds,
    'login'        : login,
    'preauths'     : preauths,
    'worksites'    : worksites,
    'reports_old01': reports_old01,
  };
  public static CONSOLE: any = {
    global: {
      loadReports: false,
      weekStartDay: 3,
    },
    scheduling: {
      persistTechChanges: false,
      showAllSites: true,
      showOffice: false,
      allDatesAvailable: false,
      lastScheduleUsed: "",
    },
    payroll: {
      showColors: true,
      showShiftLength: true,
    },
    pages: {
      reports: 100,
      reports_other: 100,
      employees: 200,
      jobsites: 50,
    },
    pageSizes: {
      reports: [50,100,200,500,1000,2000],
      reports_other: [50,100,200,500,1000,2000],
      employees: [30,50,100,150,200,250,300,400,500],
      jobsites: [5,10,20,30,40,50,100],
    },
  };
  public static USER: any = {
    preferencesVersion: version,
    language: 'en',
    shifts: 7,
    payroll_periods: 2,
    audio: false,
    stayInReports: false,
    spinnerSpeed: 10,
    messageCheckInterval: 15,
  };
  public static DEVELOPER: any = {
    showDocID: false,
    showDocRev: false,
    showReportTimes: false,
    showReportSite: false,
  };
  public static SERVER: any = {
    localAdapter: adapter,
    server: server,
    port: port,
    protocol: protocol,
    opts: { auto_compaction: true, get adapter() { return Preferences.SERVER.protocol; }, set adapter(val:string) {Preferences.SERVER.protocol = val}, skipSetup: true },
    ropts: {
      get adapter() {return Preferences.SERVER.opts.adapter; },
      set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
      skipSetup: true
    },
    cropts: {
      get adapter() { return Preferences.SERVER.opts.adapter; },
      set adapter(value: string) { Preferences.SERVER.opts.adapter = value; },
    },
    repopts: { live: false, retry: false, continuous: false },
    ajaxOpts: { headers: { Authorization: '' } },
    remoteDBInfo: {},
    rdbServer: {
      get protocol() { return Preferences.SERVER.opts.adapter; },
      set protocol(value: string) { Preferences.SERVER.opts.adapter = value; },
      get server() { return Preferences.SERVER.server;},
      set server(value:string) { Preferences.SERVER.server = value;},
      get opts() { return Preferences.SERVER.ropts;},
      set opts(value:any) { Preferences.SERVER.ropts = value;},
    }
  };
  public get DB() { return Preferences.DB; };
  public set DB(value:any) { Preferences.DB = value;};
  public get SERVER() { return Preferences.SERVER;};
  public set SERVER(value:any) { Preferences.SERVER = value;};
  public get USER() { return Preferences.USER;};
  public set USER(value:any) { Preferences.USER = value;};
  public get DEVELOPER() { return Preferences.DEVELOPER;};
  public set DEVELOPER(value:any) { Preferences.DEVELOPER = value;};
  public get CONSOLE() { return Preferences.CONSOLE; };
  public set CONSOLE(value:any) { Preferences.CONSOLE = value; };
  constructor() {
    window["onsiteprefs"] = this;
  }

  public static getRemoteDBURL(dbtype:string) {
    let S = Preferences.SERVER;
    let D = Preferences.DB;
    let types = Object.keys(D);
    if (types.indexOf(dbtype) > -1) {
      let dbname = D[dbtype];
      let url = `${S.protocol}://${S.server}:${S.port}/${dbname}`;
      return url;
    } else {
      Log.w(`getRemoteDBURL(): Could not find database type '${dbtype}'!`);
      return null;
    }
  }

  public getRemoteDBURL(dbname:string) {
    return Preferences.getRemoteDBURL(dbname);
  }

  public static getConsole() {
    return Preferences.CONSOLE;
  }

  public getConsole() {
    return Preferences.getConsole();
  }

  public getPrefs() {
    return Preferences.getPrefs();
  }

  public getDB() {
    return Preferences.getDB();
  }

  public getServer() {
    return Preferences.getServer();
  }

  public getUserPrefs() {
    return Preferences.USER;
  }

  public setPrefs(value: any) {
    return Preferences.setPrefs(value);
  }

  public setDB(key: string, value: any) {
    return Preferences.setDB(key, value);
  }

  public setServer(key: string, value: any) {
    return Preferences.setServer(key, value);
  }

  public setUserPref(key: string, value: any) {
    return Preferences.setUserPref(key, value);
  }

  public setUserPrefs(value: any) {
    return Preferences.setUserPrefs(value);
  }

  public static getProtocol() {
    return Preferences.SERVER.protocol;
  }

  public getProtocol() {
    return Preferences.getProtocol();
  }

  public static getPrefs() {
    return { DB: Preferences.DB, SERVER: Preferences.SERVER, USER: Preferences.USER, DEVELOPER: Preferences.DEVELOPER, CONSOLE: Preferences.CONSOLE };
  }

  public static getDB() {
    return Preferences.DB;
  }

  public static getServer() {
    return Preferences.SERVER;
  }

  public static getUserPrefs() {
    return Preferences.USER;
  }

  public static getConsolePrefs() {
    return Preferences.CONSOLE;
  }

  public getConsolePrefs() {
    return Preferences.getConsolePrefs();
  }

  public static setPrefs(value: any) {
    for (let key of Object.keys(value)) {
      for (let key2 of Object.keys(value[key])) {
        if (Preferences[key] !== undefined && Preferences[key][key2] !== undefined) {
          Preferences[key][key2] = value[key][key2];
        }
      }
    }
    // Preferences.DB = value.DB;
    // Preferences.SERVER = value.SERVER;
    // Preferences.USER = value.USER;
    return Preferences;
  }

  public static setDB(key: string, value: any) {
    if (Preferences.DB[key] !== undefined) {
      Preferences.DB[key] = value;
    }
    return Preferences.DB;
  }

  public static setServer(key: string, value: any) {
    if (Preferences.SERVER[key] !== undefined) {
      Preferences.SERVER[key] = value;
    }
    return Preferences.SERVER;
  }

  public static setUserPref(key: string, value: any) {
    Preferences.USER[key] = value;
    return Preferences.USER;
  }

  public static setUserPrefs(value: any) {
    Preferences.USER = value;
    return Preferences.USER;
  }

  public static comparePrefs(newPrefs: any) {
    let prefs = Preferences.getPrefs();
    let version = prefs.USER.preferencesVersion;
    let newVersion = 0;
    if (newPrefs['USER'] !== undefined && newPrefs['USER']['preferencesVersion'] !== undefined) {
      newVersion = newPrefs.USER.preferencesVersion;
    }
    if (newVersion >= version) {
      Preferences.setPrefs(newPrefs);
    }
    let updatedPrefs = Preferences.getPrefs();
    return updatedPrefs;
  }

  public comparePrefs(newPrefs: any) {
    return Preferences.comparePrefs(newPrefs);
  }

  public getLanguage() {
    return this.USER.language;
  }

  public setLanguage(value:boolean) {
    this.USER.language = value;
    return this.USER.language;
  }

  public getPayrollPeriodCount() {
    return this.USER.payroll_periods;
  }

  public setPayrollPeriodCount(value:number) {
    this.USER.payroll_periods = value;
    return this.USER.payroll_periods;
  }

  public getMessageCheckInterval() {
    return this.USER.messageCheckInterval;
  }

  public setMessageCheckInterval(value:number) {
    let val = Number(value);
    this.USER.messageCheckInterval = val;
    return this.USER.messageCheckInterval;
  }

  public getStayInReports() {
    return this.DEVELOPER.stayInReports;
  }

  public setStayInReports(value:boolean) {
    this.USER.stayInReports = value;
    return this.DEVELOPER.stayInReports;
  }

  public getShowID() {
    return this.DEVELOPER.showDocID;
  }

  public getShowRev() {
    return this.DEVELOPER.showDocRev;
  }

  public getShowTimes() {
    return this.DEVELOPER.showReportTimes;
  }

  public setShowID(value:boolean) {
    this.DEVELOPER.showDocID = value;
    return this.DEVELOPER.showDocID;
  }

  public setShowRev(value:boolean) {
    this.DEVELOPER.showDocRev = value;
    return this.DEVELOPER.showDocRev;
  }

  public setShowTimes(value:boolean) {
    this.DEVELOPER.showReportTimes = value;
    return this.DEVELOPER.showReportTimes;
  }

  public getShowSite() {
    return this.DEVELOPER.showReportSite;
  }

  public setShowSite(value:boolean) {
    this.DEVELOPER.showReportSite = value;
    return this.DEVELOPER.showReportSite;
  }

  public reinitializePrefs() {
    Preferences.DB = {
      'reports'      : reports,
      'reports_other': reportsOther,
      'employees'    : employees,
      'config'       : config,
      'jobsites'     : jobsites,
      'scheduling'   : scheduling,
      'invoices'     : invoices,
      'invoices_be'  : invoices_be,
      'invoices_hb'  : invoices_hb,
      'invoices_kn'  : invoices_kn,
      'technicians'  : technicians,
      'messages'     : messages,
      'comments'     : comments,
      'phoneInfo'    : phoneInfo,
      'sounds'       : sounds,
      'login'        : login,
      'preauths'     : preauths,
      'worksites'    : worksites,
      'reports_old01': reports_old01,
    };
    Preferences.SERVER = {
      localAdapter: adapter,
      server: server,
      port: port,
      protocol: protocol,
      opts: { auto_compaction: true, get adapter() { return Preferences.SERVER.protocol; }, set adapter(val:string) {Preferences.SERVER.protocol = val}, skipSetup: true },
      ropts: {
        get adapter() {return Preferences.SERVER.opts.adapter; },
        set adapter(value:string) {Preferences.SERVER.opts.adapter = value;},
        skipSetup: true
      },
      cropts: {
        get adapter() { return Preferences.SERVER.opts.adapter; },
        set adapter(value: string) { Preferences.SERVER.opts.adapter = value; },
      },
      repopts: { live: false, retry: false, continuous: false },
      ajaxOpts: { headers: { Authorization: '' } },
      remoteDBInfo: {},
      rdbServer: {
        get protocol() { return Preferences.SERVER.opts.adapter; },
        set protocol(value: string) { Preferences.SERVER.opts.adapter = value; },
        get server() { return Preferences.SERVER.server;},
        set server(value:string) { Preferences.SERVER.server = value;},
        get opts() { return Preferences.SERVER.ropts;},
        set opts(value:any) { Preferences.SERVER.ropts = value;},
      }
    };
    Preferences.USER = {
      preferencesVersion: version,
      language: 'en',
      shifts: 7,
      payroll_periods: 2,
      audio: false,
      stayInReports: false,
      spinnerSpeed: 10,
      messageCheckInterval: 15,
    };
    Preferences.CONSOLE = {
      global: {
        loadReports: false,
        weekStartDay: 3,
      },
      scheduling: {
        persistTechChanges: false,
        showAllSites: true,
        showOffice: false,
        allDatesAvailable: false,
        lastScheduleUsed: "",
      },
      payroll: {
        showColors: true,
        showShiftLength: true,
      },
      pages: {
        reports: 500,
        reports_other: 500,
        employees: 150,
        jobsites: 50,
      },
      pageSizes: {
        reports: [50,100,200,500,1000,2000],
        reports_other: [50,100,200,500,1000,2000],
        employees: [30,50,100,150,200,250,300,400,500],
        jobsites: [5,10,20,30,40,50,100],
      },
    };
  }
}
