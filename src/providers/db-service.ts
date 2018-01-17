import 'rxjs/add/operator/map'        ;
import * as blobUtil from 'blob-util' ;
import { sprintf                                                                } from 'sprintf-js'                 ;
import { Injectable                                                             } from '@angular/core'              ;
import { Log, moment, Moment, isMoment                                          } from '../config/config.functions' ;
import { PouchDBService                                                         } from './pouchdb-service'          ;
import { AuthService                                                            } from './auth-service'             ;
import { AlertService                                                           } from './alert-service'            ;
import { NotifyService                                                          } from './notify-service'           ;
import { Jobsite, Employee, Report, ReportOther, Shift, PayrollPeriod, Schedule } from '../domain/domain-classes'   ;
import { DPS, Invoice, PreAuth,                                                 } from '../domain/domain-classes'   ;
import { Preferences                                                            } from './preferences'              ;

@Injectable()
export class DBService {
  public static db            : any                                                ;
  public static serverdb      : any                                                ;
  u                           : any                                                ;
  p                           : any                                                ;
  remote                      : any                                                ;
  remoteDB                    : any                                                ;
  pdbOpts                     : any                                                ;
  public static StaticPouchDB : any = null                                         ;
  public static pdb           : any = new Map()                                    ;
  public static rdb           : any = new Map()                                    ;
  public static ldbs          : any                                                ;
  public static rdbs          : any                                                ;
  public static PREFS         : any = new Preferences()                            ;
  public static opts          : any = {auto_compaction: true}                      ;
  public static ropts         : any = {adapter: DBService.PREFS.SERVER.protocol, skipSetup: true} ;
  public static cropts        : any = {adapter: DBService.PREFS.SERVER.protocol}                  ;
  public static rdbServer     : any = {protocol: DBService.PREFS.SERVER.protocol, server: DBService.PREFS.SERVER.server, opts: {adapter: DBService.PREFS.SERVER.protocol, skipSetup: true}};
  public static repopts       : any = {live: false, retry: false}                  ;
  public static syncOptions   : any = {live: true, retry: true, continuous: true}  ;
  public loading              : any                                                ;
  public prefs                : any = DBService.PREFS                              ;
  public syncOptions          : any = DBService.syncOptions                        ;

  // constructor(public data:OSData, public alert:AlertService) {
  constructor(public alert:AlertService, public auth:AuthService, public notify:NotifyService) {
    Log.l('Hello DBService Provider');

    window["dbserv"] = this;
    window["sdb"] = DBService;

    Log.l("DBService: Initialized PouchDB!");
    DBService.StaticPouchDB = PouchDBService.getPouchDB();
    this.pdbOpts = { auto_compaction: true };

    this.addDB('reports');
  }

  /**
   * Returns a copy of the PouchDB method, which can be used as normal.
   * @type {PouchDB}
   */
  public getAdapter()           { return DBService.StaticPouchDB;                       }
  public static getThisDB()     { return DBService.db;                                  }
  public static getDBs()        { return DBService.pdb;                                 }
  public static getRDBs()       { return DBService.rdb;                                 }
  public static getServerInfo() { return DBService.PREFS.SERVER.protocol + "://" + DBService.PREFS.SERVER.server; }
  public static getAuthStatus() {                                                       }

  public static addDB(dbname: string) {
    return PouchDBService.addDB(dbname);
  }

  public static addRDB(dbname: string) {
    return PouchDBService.addRDB(dbname);
    // let db1 = DBService.rdb;
    // let url = DBService.rdbServer.protocol + "://" + DBService.rdbServer.server + "/" + dbname;
    // Log.l(`addRDB(): Now fetching remote DB ${dbname} at ${url} ...`);
    // if (db1.has(dbname)) {
    //   return db1.get(dbname);
    // } else {
    //   let rdb1 = DBService.StaticPouchDB(url, DBService.ropts);
    //   db1.set(dbname, rdb1);
    //   Log.l(`addRDB(): Added remote database ${url} to the list as ${dbname}.`);
    //   return db1.get(dbname);
    // }
  }

  public addDB(dbname:string) {
    return PouchDBService.addDB(dbname);
  }

  public addRDB(dbname:string) {
    return PouchDBService.addDB(dbname);
  }

  public syncFromServer(dbname: string) {
    Log.l(`syncToServer(): About to attempt replication of remote->'${dbname}'`);
    let options = this.syncOptions;
    let ev1 = (a) => { Log.l(a.status); Log.l(a); };
    let db1 = this.addDB(dbname);
    let db2 = this.addRDB(dbname);
    let done = db1.replicate.from(db2, options)
      .on('change', info => { Log.l("syncFromServer(): change event fired. Status: ", info.status); Log.l(info); })
      .on('active', info => { Log.l("syncFromServer(): active event fired. Status: ", info.status); Log.l(info); })
      .on('paused', info => { Log.l("syncFromServer(): paused event fired. Status: ", info.status); Log.l(info); })
      .on('denied', info => { Log.l("syncFromServer(): denied event fired. Status: ", info.status); Log.l(info); })
      .on('complete', info => { Log.l("syncFromServer(): complete event fired. Status: ", info.status); Log.l(info); })
      .on('error', info => { Log.l("syncFromServer(): error event fired. Status: ", info.status); Log.l(info); })
      .on('cancel', info => { Log.l("syncFromServer(): cancel event fired. Status: ", info.status); Log.l(info); });
    Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
    window["stat1"] = done;
    return done;
  }

  public getAllConfigData() {
    Log.l("getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes...");
    let db1 = this.addDB('sesa-config');
    return new Promise((resolve, reject) => {
      // rdb1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports'], include_docs: true }).then((records) => {
      db1.allDocs({ keys: ['client', 'location', 'locid', 'rotation', 'shift', 'shiftlength', 'shiftstarttime', 'other_reports'], include_docs: true }).then((records) => {
        Log.l("getAllConfigData(): Retrieved documents:\n", records);
        let results = { clients: [], locations: [], locids: [], loc2nds: [], rotations: [], shifts: [], shiftlengths: [], shiftstarttimes: [], report_types: [], training_types: [] };
        // let results = { client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shiftstarttime: [], report_types: [], training_types: [] };
        for (let record of records.rows) {
          let type = record.id;
          let types = record.id + "s";
          if(type === 'other_reports') {
            let doc                = record.doc         ;
            let report_types       = doc.report_types   ;
            let training_types     = doc.training_types ;
            results.report_types   = report_types       ;
            results.training_types = training_types     ;
          } else {
            Log.l(`getAllConfigData(): Now retrieving type '${type}'...`);
            let doc = record.doc;
            if (doc) {
              if(doc[types]) {
                for(let result of doc[types]) {
                  results[types].push(result);
                }
              } else {
                for(let result of doc.list) {
                  results[type].push(result);
                }
              }
            }
          }
        }
        Log.l("getAllConfigData(): Final config data retrieved is:\n", results);
        resolve(results);
      }).catch((err) => {
        Log.l("getAllConfig(): Error getting all config docs!");
        Log.e(err);
        // resolve([]);
        reject(err);
      });
    });
  }

  public getAllConfig() {
    Log.l("getAllConfig(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, shiftTimes, shiftLengths, shiftTypes, and shiftStartTimes...");
    let db1 = this.addDB('sesa-config');
    return new Promise((resolve, reject) => {
      db1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shifttype', 'shiftstarttime'], include_docs: true }).then((docs) => {
        let results = { client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shifttype: [], shiftstarttime: [] };
        for (let type in docs.rows[0].doc) {
          let item = docs[type];
          if (item.doc) {
            results[type].push(item.doc);
          }
        }
        resolve(results);
      }).catch((err) => {
        Log.l("getAllConfig(): Error getting all config docs!");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public getEmployees(): Promise<Array<any>> {
    Log.l("getEmployees(): Now retrieving employees...");
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-employees');
      db1.allDocs({ include_docs: true }).then((res) => {
        Log.l(`getEmployees(): Success! Result:\n`, res);
        let docArray = [];
        for (let item of res.rows) {
          if (item.doc && item.id[0] !== '_') {
            docArray.push(item.doc);
          }
        }
        resolve(docArray);
      }).catch((err) => {
        Log.l(`getEmployees(): Error!`);
        Log.e(err);
        resolve([]);
      });
    });
  }

  public getJobsites(): Promise<Array<any>> {
    Log.l("getJobsites(): Retrieving job sites...");

    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-jobsites');
      db1.allDocs({ include_docs: true }).then((docs) => {
        let docArray = [];
        Log.l("getJobsites(): Got allDocs for jobsites:\n", docs);
        for (let item of docs.rows) {
          if (item.doc && item.id[0] !== '_') {
            docArray.push(item.doc);
          }
        }
        Log.l("getJobsites(): Created docArray:\n", docArray);
        resolve(docArray);
      }).catch((err) => {
        Log.l("getJobsites(): Error getting allDocs from jobsites!");
        Log.e(err);
        resolve([]);
      })
    });
  }

  public getReports(dbname: string, startDate?:Moment|Date) {
    let db1 = this.addDB(dbname);
    let query: any = { selector: { rprtDate: { $gte: "1900-01-01" } }, limit: 1000000 };
    if(startDate) {
      let date = moment(startDate);
      query.selector.rprtDate.$gte = date.format("YYYY-MM-DD");
    }
    return new Promise((resolve, reject) => {
      // db1.allDocs({ include_docs: true }).then(res => {
      db1.createIndex(query).then(res => {
        return db1.find(query);
      }).then(res => {
        Log.l("getReports(): Got documents:\n", res);
        let docArray = new Array<Report>();
        for (let row of res.rows) {
          if (row.id[0] !== "_" && row['doc'] !== undefined) {
            let doc = row['doc'];
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            docArray.push(tmpReport);
          }
        }
        Log.l("getReports(): Got reports:\n", docArray);
        resolve(docArray);
      }).catch(err => {
        Log.l("getReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getWorkReports(spinnerID?:string):Promise<Array<Report>> {
    let db1 = this.addDB(this.prefs.getDB('reports').reports);
    let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("getWorkReports(): Fake loading text: %s", input)}, data: { set content(input:string) {Log.l("getWorkReports(): Fake loading text: %s", input);}, get content():string { return "Fake";}}};
    Log.l("getWorkReports(): this.loading is:\n", loading);
    return new Promise((resolve, reject) => {
      let options = {include_docs: true};
      db1.allDocs(options).then(res => {
      // db1.find(query).then(res => {
        // let count = res.docs.length;
        let count = res.rows.length;
        Log.l(`getWorkReports(): Got ${count} documents:\n`, res);
        let i = 0;
        let text = sprintf("Processing report %06d/%06d", i, count);
        Log.l(text);
        // if(this.loading) { this.loading.setContent(text);}
        // this.loading.setContent(text);
        loading.setContent(text);
        let reports = new Array<Report>();
        for (let row of res.rows) {
          if(row.id[0] === '_' || !row.doc) {
            i++;
            continue;
          }
          let doc = row.doc;
          // if (row.id[0] !== "_" && row['doc'] !== undefined) {
            // let doc = row['doc'];
            // if(((i++%50)===0) && this.loading) {
          // if(i % 500 === 0) {
          //   this.notify.addInfo("PROCESSING", "Processing report " + i + "...", 500);
          // }
          let tmpReport = new Report();
          tmpReport.readFromDoc(doc);
          reports.push(tmpReport);
          i++;
          // }
        }
        // Log.l("getAllReports(): Got reports:\n", docArray);
        let newCount = reports.length;
        Log.l(`getWorkReports(): Created array of ${newCount} reports.`);
        reports = reports.sort((a:Report,b:Report) => {
          let tsA = a.timestamp;
          let tsB = b.timestamp;
          return tsA > tsB ? -1 : tsA < tsB ? 1 : 0;
        });
        resolve(reports);
      }).catch(err => {
        Log.l("getWorkReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getAllReports(startDate?:Moment|Date, endDate?:Moment|Date) {
    let db1 = this.addDB(this.prefs.getDB('reports').reports);
    this.loading = this.loading || {setContent: (input:string) => {Log.l("getAllReports(): Fake loading text: %s", input)}};
    Log.l("getAllReports(): this.loading is:\n", this.loading);
    return new Promise((resolve, reject) => {
      let options = {include_docs: true};
      let query: any = { selector: { rprtDate: { $gte: "1900-01-01" } }, limit: 1000000 };
      if(startDate) {
        let date = moment(startDate);
        query.selector.rprtDate.$gte = date.format("YYYY-MM-DD");
      }
      if(endDate) {
        let sdate = moment(startDate).format("YYYY-MM-DD");
        let edate = moment(endDate).format("YYYY-MM-DD");
        query = {selector: {rprtDate: {$and: [{$gte: sdate}, {$lte: edate}]}}, limit: 1000000};
      }
      // db1.allDocs(options).then(res => {
      db1.find(query).then(res => {
        let count = res.docs.length;
        Log.l(`getAllReports(): Got ${count} documents:\n`, res);
        let i = 0;
        let text = sprintf("Processing report %06d/%06d", i, count);
        Log.l(text);
        // if(this.loading) { this.loading.setContent(text);}
        this.loading.setContent(text);
        let docArray = new Array<Report>();
        for (let doc of res.docs) {
          // if (row.id[0] !== "_" && row['doc'] !== undefined) {
            // let doc = row['doc'];
            // if(((i++%50)===0) && this.loading) {
            if(i % 50 === 0) {
              // let newText = sprintf("Processing report %06d/%06d", ++i, count);
              // this.loading.setContent(newText);
              Log.l("Processing report %d/%d ...", i, count);
              this.loading.setContent("Processing report " + i + " ...");
            }
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            docArray.push(tmpReport);
            i++;
          // }
        }
        // Log.l("getAllReports(): Got reports:\n", docArray);
        let newCount = docArray.length;
        Log.l(`getAllReports(): Created array of ${newCount} reports.`);
        resolve(docArray);
      }).catch(err => {
        Log.l("getAllReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getAllReportsPlusNew(startDate?:Moment|Date): Promise<Array<Report>> {
    let tmpReports = new Array<Report>();
    return new Promise((resolve, reject) => {
      this.getAllReports(startDate).then((res: Array<Report>) => {
        // Log.l("getAllReportsPlusNew(): Got report documents:\n", res);
        // tmpReports = res;
        // for (let report of res) {
        //   tmpReports.push(report);
        // }
      //   if(startDate) {
      //     return this.getReports('reports_ver101100', moment(startDate));
      //   } else {
      //     return this.getReports('reports_ver101100');
      //   }
      // }).then((res: Array<Report>) => {
      //   Log.l("getAllReportsPlusNew(): Got second batch of report documents:\n", res);
      //   for (let report of res) {
      //     tmpReports.push(report);
      //   }
        Log.l("getAllReportsPlusNew(): Returning final array of reports:\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("getAllReportsPlusNew(): Error retrieving reports.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public getOtherReports(): Promise<Array<ReportOther>> {
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-reports-other');
      db1.allDocs({ include_docs: true }).then(res => {
        Log.l(`getOtherReports(): Successfully retrieved other reports:\n`, res);
        let others = new Array<ReportOther>();
        for (let row of res.rows) {
          if (row['id'][0] !== '_' && row['doc'] !== undefined) {
            let doc = row['doc'];
            let other = new ReportOther();
            other.readFromDoc(doc);
            others.push(other);
          }
        }
        Log.l("getOtherReports(): Returning array of other reports:\n", others);
        resolve(others);
      }).catch(err => {
        Log.l(`getOtherReports(): Error retrieving other reports.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public getSchedules(archives?: boolean): Promise<Array<Schedule>> {
    Log.l("getSchedules(): Firing up...");
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-scheduling');
      db1.allDocs({ include_docs: true }).then(res => {
        Log.l("getSchedules(): Got initial schedule results:\n", res);
        let schedules: Array<Schedule> = [];
        for (let row of res.rows) {
          let doc = row.doc;
          if (!archives && doc.archive) {
            continue;
          } else {
            if (doc && row.id[0] !== '_' && doc.schedule) {
              let schedule = new Schedule();
              schedule.readFromDoc(doc);
              schedules.push(schedule);
            }
          }
        }
        Log.l("getSchedules(): Final result array is:\n", schedules);
        resolve(schedules);
      }).catch((err) => {
        Log.l("getSchedules(): Error retrieving schedule list!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public getAllData(getReports:boolean, spinnerID?:string): Promise<any> {
    // let loading = loadingController ? loadingController : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    let loadText = "Retrieving data from:<br>\n"
    return new Promise((resolve, reject) => {
      let reportDate = moment().subtract(2, 'weeks');
      let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
      loading.setContent(loadText + "sesa-jobsites...");
      this.getJobsites().then(res => {
        for (let doc of res) {
          let site = new Jobsite();
          site.readFromDoc(doc);
          data.sites.push(site);
        }
        loading.setContent(loadText + "sesa-employees...");
        return this.getEmployees();
      }).then(res => {
        for (let doc of res) {
          let user = new Employee();
          user.readFromDoc(doc);
          data.employees.push(user);
        }
        loading.setContent(loadText + "sesa-reports-other...");
        return this.getOtherReports();
      }).then((res:Array<ReportOther>) => {
        data.others = res.sort((a:ReportOther, b:ReportOther) => {
          let dA = a.report_date.format("YYYYMMDD");
          let dB = b.report_date.format("YYYYMMDD");
          let tA = a.timestamp;
          let tB = b.timestamp;
          let uA = a.username;
          let uB = b.username;
          return dA > dB ? -1 : dA < dB ? 1 : tA > tB ? -1 : tA < tB ? 1 : uA < uB ? -1 : uA > uB ? 1 : 0;
        });
        // Log.l("getAllData(): Success, final data to be returned is:\n", data);
        loading.setContent(loadText + "sesa-scheduling...");
        return this.getSchedules();
      }).then(res => {
        data.schedules = res;
        if(!getReports) {
          Log.l("getAllData(): Success, final data to be returned is:\n", data);
          resolve(data);
        } else {
          this.getReportsData(spinnerID).then(res => {
            Log.l("getAllData(): Success plus reports, final data to be returned is:\n", data);
            data.reports = res;
            resolve(data);
          }).catch(err => {
            throw new Error(err);
          });
        }
      }).catch(err => {
        Log.l("getAllData(): Error retrieving all data!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getReportsData(spinnerID?:string):Promise<Array<Report>> {
    let loading = spinnerID ? this.alert.getSpinner(spinnerID) : {setContent: (input:string) => {Log.l("Fake loading controller text: %s", input);}};
    let loadText = "Retrieving data from:<br>\n";
    loading.setContent(loadText + "reports_ver101100...");
    // return this.getAllReportsPlusNew(reportDate);
    // return this.getAllReportsPlusNew();
    return new Promise((resolve,reject) => {
      this.getWorkReports(spinnerID).then(res => {
        resolve(res);
      }).catch(err => {
        Log.l("getReportsData(): Error getting reports!");
        Log.e(err);
        reject(err);
      });
  });

  }

  public getSounds() {
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-sounds');
      const str2blob = async (str: string) => {
        return blobUtil.base64StringToBlob(str);
      };
      const data2blob = async (data: any, out: any) => {
        // return new Promise((resolve, reject) => {
        try {
          // let out = {};
          let keys = Object.keys(data);
          for (let i of keys) {
            // out[i] = [];
            let dat = data[i];
            for (let doc of dat) {
              let blob = await str2blob(doc.asset);
              let blobURL = URL.createObjectURL(blob);
              out[i].push(blobURL);
            }
          }
          return out;
          // resolve(out);
        } catch (err) {
          Log.l("data2blob(): Error processing base64 data to Blob!");
          Log.e(err);
          throw new Error(err);
          // reject(err);
        }
        // });
      };
      Log.l("getSounds(): Now attempting to get sounds from server....");
      db1.allDocs({ include_docs: true, attachments: true }).then(res => {
        Log.l("getSounds(): Successfully got sounds back from server:\n", res);
        let out = {};
        for (let row of res.rows) {
          let doc = row.doc;
          if (doc && doc._attachments) {
            out[row.id] = [];
            for (let key in doc._attachments) {
              let data = doc._attachments[key].data;
              out[row.id].push({ 'file': key, 'asset': data });
            }
          }
        }
        let output = {};
        let keys = Object.keys(out);
        for (let key of keys) {
          output[key] = [];
        }
        Log.l("getSounds(): Calling data2blob with out and finalout:\n", out, JSON.stringify(output));
        return data2blob(out, output);
      }).then(output => {

        Log.l("getSounds(): Final output will be:\n", output);
        resolve(output);
        // }).then(res => {
        //   Log.l("getSounds(): Success! Got sounds:\n", res);
        //   resolve(res);
      }).catch(err => {
        Log.l("getSounds(): Error getting sounds back from server!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveReport(report:Report, username?:string) {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let rdb1 = this.addDB(db.reports);
      let ts = moment().format();
      let user = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let nr:any = report.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      rdb1.upsert(nr._id, (doc) => {
        if(doc && doc._id) {
          let rev = doc._rev;
          nr._rev = rev;
          doc = nr;
          doc.change_log = doc.change_log || [];
          doc.change_log.push({
            change: "updated",
            user: user,
            timestamp: ts,
          });
        } else {
          doc = nr;
          doc.change_log = doc.change_log || [];
          doc.change_log.push({
            change: "created",
            user: user,
            timestamp: ts,
          });
        }
        return doc;
      }).then(res => {
        if(!res.ok && !res.updated) {
          Log.l(`saveReport(): Upsert error saving report ${report._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`saveReport(): Successfully saved report ${report._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveReport(): Error saving report ${report._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public deleteReport(report:Report) {
    let db = this.prefs.getDB();
    let rdb1 = this.addRDB(db.reports);
    return new Promise((resolve, reject) => {
      rdb1.upsert(report._id, (doc) => {
        doc._deleted = true;
        return doc;
      }).then(res => {
        if (!res.ok && !res.updated) {
          Log.l(`deleteReport(): Upsert error trying to delete doc ${report._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`deleteReport(): Successfully deleted doc ${report._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`deleteReport(): Could not delete doc ${report._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveOtherReport(other:ReportOther) {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.reports_other);
      db1.upsert(other._id, (doc) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          other._rev = rev;
          doc = other;
        } else {
          doc = other;
        }
        return doc;
      }).then(res => {
        if (!res.ok && !res.updated) {
          Log.l(`saveOtherReport(): Upsert error saving ReportOther ${other._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`saveOtherReport(): Successfully saved ReportOther ${other._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveOtherReport(): Error saving ReportOther ${other._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public deleteOtherReport(other:ReportOther) {
    let db = this.prefs.getDB();
    let db1 = this.addRDB(db.reports);
    return new Promise((resolve, reject) => {
      db1.upsert(other._id, (doc) => {
        doc._deleted = true;
        return doc;
      }).then(res => {
        if (!res.ok && !res.updated) {
          Log.l(`deleteOtherReport(): Upsert error trying to delete doc ${other._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`deleteOtherReport(): Successfully deleted doc ${other._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`deleteOtherReport(): Could not delete doc ${other._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveJobsite(jobsite:Jobsite) {
    Log.l("saveJobsite(): Saving job site...\n", jobsite);
    return new Promise((resolve,reject) => {
      let db1 = this.addDB('sesa-jobsites');
      if(!jobsite._id) {
        jobsite._id = jobsite.getSiteID();
      }
      Log.l(`saveJobsite(): Now attempting to save jobsite '${jobsite._id}:\n`,jobsite);
      db1.upsert(jobsite._id, (doc) => {
        if(doc._id && doc._rev) {
          jobsite._rev = doc._rev;
        } else {
          delete jobsite._rev;
        }
        return jobsite;
      }).then(res => {
        if(!res.ok && !res.updated) {
          Log.l(`saveJobsite(): Upsert error saving jobsite '${jobsite._id}!`);
          Log.e(res);
          reject(res);
        } else {
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveJobsite(): Error saving jobsite '${jobsite._id}!`);
        Log.e(err);
        reject(err);
      });
    //   db1.get(jobsite._id).then((res) => {
    //     Log.l(`saveJobsite(): Retrieved jobsite '${jobsite._id}' successfully:\n`, res);
    //     jobsite._rev = res._rev;
    //     Log.l(`saveJobsite(): Now saving jobsite '${jobsite._id}'...`);
    //     return db1.put(jobsite);
    //   }).then((res) => {
    //     Log.l(`saveJobsite(): Successfully saved job site ${jobsite._id}.\n`, res);
    //     resolve(res);
    //   }).catch((err) => {
    //     if(err) {
    //     Log.l("saveJobsite(): Error saving job site!");
    //     Log.e(err);
    //     if(err['status'] == 404) {
    //       Log.l(`saveJobsite(): Jobsite ${jobsite._id} was not found, saving new...`);
    //       db1.put(jobsite).then((res) => {
    //         Log.l(`saveJobsite(): Jobsite ${jobsite._id} was newly saved successfully!\n`, res);
    //         resolve(res);
    //       }).catch((err) => {
    //         Log.l(`saveJobsite(): Error saving new jobsite ${jobsite._id}!`);
    //         Log.l(err);
    //         reject(err);
    //       });
    //     } else {
    //       reject(err);
    //     }
    //   });
    // });
    });
  }

  public saveInvoice(type:string, invoice: Invoice) {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let db1 = this.addDB(db[dbname]);
      let ts = moment().format();
      // let user = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let inv:any = invoice.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      db1.upsert(inv._id, (doc) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          inv._rev = rev;
          doc = inv;
        } else {
          doc = inv;
        }
        return doc;
      }).then(res => {
        if (!res.ok && !res.updated) {
          Log.l(`saveInvoice(): Upsert error saving report ${inv._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`saveInvoice(): Successfully saved report ${inv._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`saveInvoice(): Error saving report ${inv._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async saveInvoices(type:string, invoices:Array<Invoice>) {
    let results = [];
    for(let invoice of invoices) {
      let saveResult = await this.saveInvoice(type, invoice);
      results.push(saveResult);
    }
    Log.l("saveInvoices(): Results are:\n", results);
    return results;
  }

  public getInvoices(type:string, start:string, end:string) {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let db1 = this.addDB(db[dbname]);
      db1.allDocs({include_docs: true}).then(res => {
        Log.l(`getInvoices(): Successfully retrieved invoices, raw results are:\n`, res);
        let invoices:Array<Invoice> = [];
        for(let row of res.rows) {
          if(row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            if(doc.period_start >= start && moment(doc.period_start, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let invoice:Invoice = Invoice.deserialize(doc);
              invoices.push(invoice);
            }
          }
        }
        Log.l(`getInvoices(): Final invoice array is:\n`, invoices);
        resolve(invoices);
      }).catch(err => {
        Log.l(`getInvoices(): Error getting invoices twixt '${start}' and '${end}'.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public savePreauth(preauth:PreAuth) {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.preauths);
      // db1.allDocs({include_docs: true}).then(res => {
      // })
      let pdoc = preauth.serialize();
      db1.upsert(pdoc._id, (doc) => {
        if (doc && doc._id) {
          let rev = doc._rev;
          pdoc._rev = rev;
          doc = pdoc;
        } else {
          delete pdoc._rev;
          doc = pdoc;
        }
        return doc;
      }).then(res => {
        if (!res.ok && !res.updated) {
          Log.l(`savePreauth(): Upsert error saving report ${pdoc._id}.\n`, res);
          reject(res);
        } else {
          Log.l(`savePreauth(): Successfully saved report ${pdoc._id}.\n`, res);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`savePreauth(): Error saving report ${pdoc._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public async savePreauths(preauths:Array<PreAuth>) {
    let results = [];
    for (let preauth of preauths) {
      let saveResult = await this.savePreauth(preauth);
      results.push(saveResult);
    }
    Log.l("savePreauths(): Results are:\n", results);
    return results;
  }

  public getPreauths(start:string, end:string):Promise<Array<PreAuth>> {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.preauths);
      db1.allDocs({include_docs: true}).then(res => {
        Log.l(`getPreauths(): Successfully retrieved preauths, raw results are:\n`, res);
        let preauths:Array<PreAuth> = [];
        for(let row of res.rows) {
          if(row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            if(doc.period_date >= start && moment(doc.period_date, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let preauth:PreAuth = PreAuth.deserialize(doc);
              preauths.push(preauth);
            }
          }
        }
        Log.l(`getPreauths(): Final invoice array is:\n`, preauths);
        resolve(preauths);
      }).catch(err => {
        Log.l(`getPreauths(): Error getting invoices twixt '${start}' and '${end}'.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public getDPSSettings() {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB('sesa-config');
      let id = "dps_config";
      db1.get(id).then(res => {
        let dps = new DPS();
        dps.deserialize(res);
        Log.l("getDPSSettings(): Successfully retrieved DPS settings:\n", dps);
        resolve(dps);
      }).catch(err => {
        Log.l("getDPSSettings(): Error getting DPS settings!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveDPSSettings(dpsDoc:any) {
    return new Promise((resolve,reject) => {
      let db1 = this.addDB('sesa-config');
      let id = "dps_config";
      db1.upsert(id, (doc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = dpsDoc;
          doc._id = id;
          doc._rev = rev;
        } else {
          doc = dpsDoc;
          doc._id = id;
        }
        Log.l("saveDPSSettings(): Now upserting doc:\n", doc);
        return doc;
      }).then(res => {
        if(!res.ok && !res.updated) {
          Log.l("saveDPSSettings(): Upsert error saving DPS settings!", res);
          reject(res);
        } else {
          resolve(res);
        }
      }).catch(err => {
        Log.l("saveDPSSettings(): Error saving DPS settings!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getTechPhones():Promise<Array<any>> {
    Log.l("getTechPhones(): Firing up...");
    return new Promise((resolve, reject) => {
      let db1 = this.addDB('sesa-tech-phones');
      db1.allDocs({ include_docs: true }).then(res => {
        Log.l("getTechPhones(): Got initial doc list:\n", res);
        let techPhones: Array<any> = [];
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            techPhones.push(doc);
          }
        }
        Log.l("getTechPhones(): Final result array is:\n", techPhones);
        resolve(techPhones);
      }).catch((err) => {
        Log.l("getTechPhones(): Error retrieving tech phones list!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public getOldReports():Promise<Report[]> {
    return new Promise((resolve,reject) => {
      let db = this.prefs.getDB();
      let db1 = this.addDB(db.reports_old01);
      Log.l(`DB.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
      db1.allDocs({include_docs:true}).then(res => {
        Log.l("getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
        let reports:Report[] = [];
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            let rpt = new Report();
            rpt.readFromDoc(doc);
            reports.push(rpt);
          }
        }
        Log.l("getOldReports(): Final array of old reports is:\n", reports);
        resolve(reports);
      }).catch(err => {
        Log.l("getOldReports(): Error retrieving reports.");
        Log.e(err);
        reject(err);
      });
    });
  }
  // public async getOldReports():Promise<Report[]> {
  //   try {
  //     let db = this.prefs.getDB();
  //     let db1 = this.addDB(db.reports_old01);
  //     Log.l(`DB.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
  //     let res = await db1.allDocs({include_docs:true});
  //     Log.l("getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
  //     let reports:Report[] = [];
  //     for (let row of res.rows) {
  //       if (row.id[0] !== '_' && row.doc) {
  //         let doc = row.doc;
  //         let rpt = new Report();
  //         rpt.readFromDoc(doc);
  //         reports.push(rpt);
  //       }
  //     }
  //     Log.l("getOldReports(): Final array of old reports is:\n", reports);
  //     return reports;
  //   } catch (err) {
  //     Log.l("getOldReports(): Error retrieving reports.");
  //     Log.e(err);
  //     throw new Error(err);
  //   }
  // }
}
