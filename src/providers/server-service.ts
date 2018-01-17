import   * as blobUtil                                                            from 'blob-util'               ;
import { sprintf                                                                } from 'sprintf-js'              ;
import { Injectable                                                             } from '@angular/core'           ;
import { Log, moment, Moment, isMoment                                          } from 'config/config.functions' ;
import { PouchDBService                                                         } from './pouchdb-service'       ;
import { OSData                                                                 } from './data-service'          ;
import { AuthService                                                            } from './auth-service'          ;
import { AlertService                                                           } from './alert-service'         ;
import { StorageService                                                         } from './storage-service'       ;
import { Jobsite, Employee, Report, ReportOther, Shift, PayrollPeriod, Schedule } from 'domain/domain-classes'   ;
import { Message, DPS, ScheduleBeta, Invoice, PreAuth,                          } from 'domain/domain-classes'   ;
import { Preferences                                                            } from './preferences'           ;
import { DispatchService                                                        } from './dispatch-service'      ;

export const noDD = "_";
export const noDesign1 = { include_docs: true, startkey: noDD };
export const noDesign2 = { include_docs: true, endkey: noDD   };
export const liveNoDesign = { live: true, since: 'now', include_docs: true, startkey: noDD };

@Injectable()
export class ServerService {
  public static rdb           : Map<any,any> = new Map()                                     ;
  public static syncs         : Map<any,any> = new Map()                                     ;
  public rdb                  : any    = ServerService.rdb                                   ;
  public syncs                : any    = ServerService.syncs                                 ;
  public static StaticPouchDB : any    = PouchDBService.PouchInit()                          ;
  public static PREFS         : any    = new Preferences()                                   ;
  public static userInfo      : any    = {u: '', p: '' }                                     ;
  public static repopts       : any    = { live: false, retry: false }                       ;
  public static ajaxOpts      : any    = { headers: { Authorization: '' } }                  ;
  public static remoteDBInfo  : any    = {}                                                  ;
  public static hostNumber    : number = 0                                                   ;
  public prefs                : any    = ServerService.PREFS                                 ;
  public static syncOptions   : any   = {live: true, retry: true, continuous: true}          ;
  public static nonsyncOptions: any   = {live: false, retry: false, continuous: false}       ;
  public get syncOptions()    : any { return ServerService.syncOptions; }                    ;
  public get nonsyncOptions() : any { return ServerService.nonsyncOptions; }                 ;

  constructor(
    public auth     : AuthService     ,
    public alert    : AlertService    ,
    public storage  : StorageService  ,
    public dispatch : DispatchService ,
  ) {
    Log.l('Hello ServerService Provider');
    ServerService.StaticPouchDB = PouchDBService.getPouchDB();
    // ServerService.startupDatabases.forEach((db) => { Log.l(`ServerService(): now initializing startup database ${db}...`); });
  }

  public static getBaseURL() {
    let prefs    = ServerService.PREFS   ;
    let port     = prefs.SERVER.port     ;
    let protocol = prefs.SERVER.protocol ;
    let server   = prefs.SERVER.server   ;
    if(server.indexOf('sesa.us') !== -1) {
      let hostNumber = (ServerService.hostNumber++ % 16) + 1;
      server     = sprintf("db%02d.sesa.us", hostNumber);
    }
    if (port) {
      return `${protocol}://${server}:${port}`;
    } else {
      return `${protocol}://${server}`;
    }
  }

  public static getRemoteDatabaseURL(dbname?: string) {
    let url1 = ServerService.getBaseURL();
    let name = dbname || "_session";
    url1 = `${url1}/${name}`;
    return url1;
  }

  public static getInsecureLoginBaseURL(user: string, pass: string) {
    let prefs    = ServerService.PREFS   ;
    let port     = prefs.SERVER.port     ;
    let protocol = prefs.SERVER.protocol ;
    let server   = prefs.SERVER.server   ;
    if (port) { return `${protocol}://${user}:${pass}@${server}:${port}`; }
    else { return `${protocol}://${user}:${pass}@${server}`; }
  }

  public static getAuthHeaders(user: string, pass: string) {
    let authToken = 'Basic ' + window.btoa(user + ':' + pass);
    let ajaxOpts = { headers: { Authorization: authToken } };
    return ajaxOpts;
  }

  public getBaseURL() {
    return ServerService.getBaseURL();
  }

  public static addDB(dbname: string) {
    return PouchDBService.addDB(dbname);
  }

  public addDB(dbname:string) {
    return PouchDBService.addDB(dbname);
  }

  public async loginToDatabase(user: string, pass: string, dbname: string) {
    let adapter = this.prefs.getProtocol();
    let authToken = 'Basic ' + window.btoa(user + ':' + pass);
    let authOpts = { headers: { Authorization: authToken } };
    let ajaxOpts = { ajax: authOpts };
    let opts = { adapter: adapter, skip_setup: true, ajax: { withCredentials: true, headers: authOpts.headers, auth: { username: user, password: pass } } };

    return new Promise((resolve, reject) => {
      Log.l(`loginToDatabase(): About to login to database ${dbname} with options:\n`, opts);
      let rdb1 = this.addRDB(dbname);
      rdb1.login(user, pass, opts).then(res => {
        return rdb1.getSession();
      }).then((session) => {
        if (typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
          Log.l(`loginToDatabase(): Authentication failed for '${dbname}'!`);
          ServerService.userInfo = { u: '', p: '' };
          resolve(false);
        } else {
          Log.l(`loginToDatabase(): Authentication successful for '${dbname}'!`);
          ServerService.userInfo = { u: user, p: pass };
          resolve(true);
        }
      }).catch(err => {
        Log.l(`loginToDatabase(): Error logging in to '${dbname}'!`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public loginToServer(user: string, pass: string, dbname?: string) {
    return new Promise((resolve, reject) => {
      Log.l("loginToServer(): PouchDB initialized, ready to go.");
      let dbURL = dbname || '_session';
      let adapter = this.prefs.SERVER.protocol;
      let authToken = 'Basic ' + window.btoa(user + ':' + pass);
      let authOpts = { headers: { Authorization: authToken } };
      let ajaxOpts = { ajax: authOpts };
      let opts = { adapter: adapter, skip_setup: true, ajax: { withCredentials: true, headers: authOpts.headers, auth: { username: user, password: pass } } };
      let rdb1 = this.addRDB(dbURL);
      Log.l(`About to try login to '${dbURL}' as user '${user}' with pass '${pass}'...`)
      rdb1.login(user, pass, opts).then((res) => {
        return rdb1.getSession();
      }).then((session) => {
        if (typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
          Log.l(`loginToServer(): Authentication failed, session is:\n`, session);
          ServerService.userInfo = { u: '', p: '' };
          reject(new Error("Server login failed."));
        } else {
          Log.l(`loginToServer(): Authentication successful, DB '${dbURL}'.`);
          ServerService.userInfo = { u: user, p: pass };
          this.auth.setUser(user);
          this.auth.setPassword(pass);
          this.auth.saveCredentials().then((res) => {
            Log.l("loginToServer(): Saved credentials.");
            resolve(session);
          }).catch((err) => {
            Log.l("loginToServer(): Error attempting to set seamless auth or save credentials.");
            Log.e(err);
            reject(err);
          });
        }
      }).catch(err => {
        Log.l(`loginToServer(): Error logging in to '${dbURL}' and such.`);
        Log.e(err);
        this.alert.showAlert("ERROR", `Unable to log in to server database '${dbURL}' with this username and password. Internet connection problem?`);
        reject(err);
      });
    });
  }

  public getUserData(user) {
    let rdb1 = this.addRDB('_session');
    return rdb1.getUser(user);
  }

  public getUserAdminStatus() {
    Log.l("getUserAdminStatus(): Now checking user admin status...");
    let isAdmin = false;
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('_session');
      rdb1.getSession().then(res => {
        let session = res;
        Log.l("getUserAdminStatus(): Got session, now checking user status...\n", session);
        if(session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
          isAdmin = true;
          Log.l("getUserAdminStatus(): User is admin.");
          resolve(true);
        } else {
          Log.l("getUserAdminStatus(): User is not admin.");
          resolve(false);
        }
      }).catch(err => {
        Log.l("getUserAdminStatus(): Unable to get session, user not logged in.");
        resolve(false);
      });
    });
  }

  public updateEmployee(employee: any) {
    Log.l("updateEmployee(): Saving employee:\n", employee);
    return new Promise((resolve, reject) => {
      Log.l(`updateEmployee(): Starting...`);
      let rdb1 = ServerService.addRDB('sesa-employees');
      // rdb1.upsert(employee._id,)
      rdb1.get(employee._id).then((res) => {
        Log.l(`updateEmployee(): Found employee ${employee._id}.`);
        employee._rev = res._rev;
        return rdb1.put(employee);
      }).then((res) => {
        Log.l("updateEmployee(): Successfully saved employee.\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("updateEmployee(): Error updating employee info!");
        Log.e(err);
        if (err.status == 404) {
          Log.l(`updateEmployee(): Employee ${employee._id} was not found, saving new.`);
          delete employee._rev;
          rdb1.put(employee).then((res) => {
            Log.l(`updateEmployee(): Success saving new employee! Result:\n`, res);
            resolve(res);
          }).catch(err => {
            Log.l("updateEmployee(): Error saving new employee!");
            Log.e(err);
            reject(err);
          });
        } else {
          Log.l("updateEmployee(): Not a 404 error. Giving up.");
          Log.e(err);
          reject(err);
        }
      });
    });
  }

  public saveEmployee(employee: any) {
    Log.l("saveEmployee(): Saving employee:\n", employee);
    return new Promise((resolve, reject) => {
      Log.l(`saveEmployee(): Starting...`);
      let rdb1 = ServerService.addRDB('sesa-employees');
      // rdb1.get(employee._id).then((res) => {
      //   Log.l(`saveEmployee(): Found employee ${employee._id}.`);
      //   employee._rev = res._rev;
      //   return rdb1.put(employee);
      rdb1.upsert(employee.docID, (doc) => {
        let rev = doc._rev || null;
        doc = employee;
        // delete doc['_rev'];
        // delete doc['_id'];
        if (rev) { doc._rev = rev; }
        return doc;
      }).then((res) => {
        if(!res.ok && !res.updated) {
          Log.e('saveEmployee(): Error upserting user to sesa-employees!\n', res);
          reject(res);
        } else {
          Log.l("saveEmployee(): Successfully saved employee.\n", res);
          Log.l(`saveEmployee(): Now adding employee to _users database...`);
          this.saveUser(employee, 'sesa1234').then(res => {
            Log.l("saveEmployee(): Successfully saved employee.");
            resolve(res);
          }).catch(err => {
            Log.l("saveEmployee(): Error saving employee to _users!");
            Log.e(err);
            reject(err);
          });
        }
      }).catch((err) => {
        Log.l(`saveEmployee(): Error! Possibly just a not-existing-yet user?`);
        if (err.status === 404) {
          Log.l(`saveEmployee(): Employee ${employee.docID} was not found, saving new.`);
          delete employee._rev;
          rdb1.upsert(employee.docID, (doc) => {
            let rev = doc._rev || null;
            doc = employee;
            // delete doc['_rev'];
            // delete doc['_id'];
            if(rev) { doc._rev = rev; }
            return doc;
          }).then((res) => {
            if(!res.ok && !res.updated) {
              Log.e("saveEmployee(): Error saving employee via upsert:\n", res);
              reject(res);
            } else {
              Log.l(`saveEmployee(): Success saving new employee! Result:\n`, res);
              Log.l(`saveEmployee(): Now adding employee to _users database...`);
              this.saveUser(employee, 'sesa1234').then(res => {
                Log.l("saveEmployee(): Successfully saved employee: ", res);
                resolve(res);
              }).catch(err => {
                Log.l("saveEmployee(): Successfully saved employee.");
                Log.e(err);
                reject(err);
              });
            }
          }).catch((err) => {
            Log.l(`saveEmployee(): Error saving new employee!`);
            Log.e(err);
            reject(err);
          });
        } else {
          Log.e("saveEmployee(): Nope, it was not a 404 error. Sorry.");
          Log.e(err);
          reject(err);
        }
      });
    });
  }

  public saveUser(user:any, pass:string) {
    return new Promise((resolve, reject) => {
      let rdb1 = this.addRDB('_session');
      let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1 = window.atob(u), p2 = window.atob(p);
      let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      let opts = { ajax: ajaxOpts };
      rdb1.login(u1, p2, opts).then(res => {
        return rdb1.getSession();
      }).then((session) => {
        if (session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
          // User is admin
          let un = user.avatarName;
          rdb1.getUser(un, opts).then(res => {
            Log.l("saveUser(): Found user on server! Updating info...");
            let doc = Object.assign({}, user);
            doc['_rev'] = res['_rev'];
            doc['_id'] = res['_id'];
            if(doc['iterations']) { doc['iterations'] = Number(doc['iterations']); }
            delete doc['password'];
            Log.l("saveUser(): About to try to save user '%s' with doc: ", un);
            Log.l(doc);
            rdb1.putUser(un, {metadata: doc}).then(res => {
              Log.l("saveUser(): Saved user successfully!");
              resolve(res);
            }).catch(err => {
              Log.l("saveUser(): Could not putUser. Probably not admin or connection down.");
              Log.e(err);
              reject(err);
            });
          }).catch(err => {
            Log.l("saveUser(): Error getting user. Maybe a new user...");
            if(err.status === 404) {
              let doc = Object.assign({}, user);
              if(doc['iterations']) { doc['iterations'] = Number(doc['iterations']); }
              // doc['password'] = "sesa1234";
              doc['_id'] = `org.couchdb.user:${un}`;
              delete doc['_rev'];
              Log.l("saveUser(): About to try to save user '%s' with doc: ", un);
              Log.l(doc);
              rdb1.signup(un, 'sesa1234', {metadata: doc}).then(res => {
                Log.l("saveUser(): Saved user successfully: ", res);
                resolve(res);
              }).catch(err => {
                Log.l("saveUser(): Error creating new user!");
                Log.e(err);
                reject(err);
              });
            } else {
              Log.l("saveUser(): Not a missing user error. Can't create user.");
              Log.e(err);
              reject(err);
            }
          });
        } else {
          Log.e("saveUser(): Unable to save, user is not admin. Session was:\n", session);
          reject(session);
        }
      }).catch(err => {
        Log.l("saveUser(): Error trying to log in and save user.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public deleteDoc(db:any|string, doc:any) {
    let dbname = db;
    let rdb1;
    if(dbname instanceof PouchDBService.StaticPouchDB) {
      rdb1 = dbname;
    } else {
      rdb1 = this.addRDB(db);
    }
    return new Promise((resolve,reject) => {
      rdb1.upsert(doc._id, (doc) =>{
        doc._deleted = true;
        return doc;
      }).then(res => {
        if(!res.ok && !res.updated) {
          Log.l(`deleteDoc(): Could not delete doc ${doc._id}.`);
          Log.e(res);
          reject(res);
        } else {
          Log.l(`deleteDoc(): Successfully deleted doc ${doc._id}.`);
          resolve(res);
        }
      }).catch(err => {
        Log.l(`deleteDoc(): Could not delete doc ${doc._id}.`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public deleteUser(user:any) {
    return new Promise((resolve, reject) => {
      let rdb1 = this.addRDB('_session');
      let rdb2 = this.addRDB('sesa-employees');
      let rdb3 = this.addRDB('_users');
      let db2 = this.addDB('sesa-employees');
      let u = 'c2VzYWFkbWlu', p = 'bzc3TDNldDdwJGNBeTlMKzZKVmZ0YTRmRDQ=';
      let u1 = window.atob(u), p2 = window.atob(p);
      let authToken = 'Basic ' + window.btoa(u1 + ':' + p2);
      let ajaxOpts = { headers: { Authorization: authToken } };
      let opts = { ajax: ajaxOpts };
      let un = user.avatarName;
      rdb1.login(u1, p2, opts).then(res => {
        return rdb1.getSession();
      }).then((session) => {
        if (session.userCtx && session.userCtx.roles && session.userCtx.roles.length && session.userCtx.roles.indexOf('_admin') > -1) {
          // User is admin

          rdb2.get(user._id).then(res => {
            Log.l("deleteUser(): Retrieved user from sesa-employees database: ", res);
            Log.l("deleteUser(): Now deleting user from sesa-employees...");
            let doc1 = res;

            this.deleteDoc(rdb2, doc1).then(res => {
              Log.l("deleteUser(): Removed user from sesa-employees fine. Now trying to read from _users: ", res);
              rdb1.getUser(un).then(res => {
                Log.l("deleteUser(): Got user from _users database: ", res);
                Log.l("deleteUser(): now deleting user from _users database...");
                return this.deleteDoc(rdb3, res);
              }).then(res => {
                Log.l("deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res);
                resolve(res);
              }).catch(err => {
                Log.l("deleteUser(): Error getting or deleting user. Guess there's no need to finish up.");
                Log.e(err);
                resolve(false);
              });
            }).catch(err => {
              Log.l("deleteUser(): Error removing doc from sesa-employees.");
              Log.e(err);
              reject(err);
            });
          }).catch(err => {
            Log.l("deleteUser(): Unable to retrieve user from sesa-employees! Checking _users...");
            rdb2.getUser(un).then(res => {
              Log.l("deleteUser(): Got user from _users database: ", res);
              Log.l("deleteUser(): now deleting user from _users database...");
              return this.deleteDoc(rdb3, res);
            }).then(res => {
              Log.l("deleteUser(): User deleted from _users, and didn't exist in sesa-employees: ", res);
              resolve(res);
           }).catch(err => {
              Log.l("deleteUser(): Error getting or deleting user. Guess there's no need to finish up.");
              Log.e(err);
              resolve(false);
            });
          });
        } else {
          Log.e("deleteUser(): Unable to delete user, current user is not admin. Session was:\n", session);
          reject(session);
        }
      }).catch(err => {
        Log.l("deleteUser(): Error attempting to login and get session. Can't delete user.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public static addRDB(dbname: string) {
    let db1 = ServerService.rdb;
    // let url = ServerService.getRemoteDatabaseURL(dbname);
    // Log.l(`addRDB(): Now fetching remote DB '${dbname}' at '${url}' ...`);
    let rdb1 = null;
    if (db1.has(dbname)) {
      // Log.l(`Found DB '${dbname}' already exists, returning...`);
      rdb1 = db1.get(dbname);
      return rdb1;
    } else {
      // Log.l(`DB '${dbname}' does not already exist, storing and returning...`);
      let url = ServerService.getRemoteDatabaseURL(dbname);
      Log.l(`addRDB(): Now adding remote DB '${dbname}' at '${url}' ...`);
      rdb1 = ServerService.StaticPouchDB(url, ServerService.PREFS.ropts);
      db1.set(dbname, rdb1);
      return rdb1;
    }
  }

  public addRDBLogin(dbname:string, user:string, pass:string) {
    return new Promise((resolve,reject) => {

      ServerService.userInfo = { u: user, p: pass};
      let rdb1               = ServerService.addRDB(dbname);
      let authHdr            = ServerService.getAuthHeaders(user, pass);

      rdb1.login(user, pass, { ajax: authHdr })

      .then((res) => { return rdb1.getSession(); })
      .then((session) => {
        if (typeof session.info === 'undefined' || typeof session.info.authenticated !== 'string') {
          Log.l("addRDBLogin(): Authentication failed");
          ServerService.userInfo = { u: '', p: '' };
          reject(session);
        }
        // else { Log.l("addRDBLogin(): Login success!"); resolve(rdb1); }
      })
      .catch((err) => { Log.l("addRDBLogin(): Error trying to login."); Log.e(err); reject(err); });
    });
  }

  public addRDB(dbname:string) {
    return ServerService.addRDB(dbname);
  }

  public getRDBs() {
    return ServerService.getRDBs();
  }

  public static getRDBs() {
    return ServerService.rdb;
  }

  public static addSync(dbname:string, dbsync:any) {
    return PouchDBService.addSync(dbname, dbsync);
  }

  public addSync(dbname:string, dbsync:any) {
    return ServerService.addSync(dbname, dbsync);
  }

  public static getSync(dbname:string):any {
    return PouchDBService.getSync(dbname);
  }

  public getSync(dbname:string):any {
    return ServerService.getSync(dbname);
  }

  public static getAllSyncs() {
    let syncmap = PouchDBService.PDBSyncs;
    return syncmap;
  }

  public getAllSyncs() {
    return ServerService.getAllSyncs();
  }

  public static cancelSync(dbname:string) {
    return PouchDBService.cancelSync(dbname);
  }
  public static cancelAllSyncs() {
    return PouchDBService.cancelAllSyncs();
  }
  public static clearAllSyncs() {
    return PouchDBService.clearAllSyncs();
  }
  public cancelSync(dbname:string) {
    return ServerService.cancelSync(dbname);
  }
  public cancelAllSyncs() {
    return ServerService.cancelAllSyncs();
  }
  public clearAllSyncs() {
    return ServerService.clearAllSyncs();
  }


  public getScheduleJobsites() {
    Log.l("getScheduleJobsites(): Retrieving job sites...");
    return new Promise((resolve, reject) => {
      let rdb1 = ServerService.addRDB('sesa-jobsites');
      rdb1.allDocs(noDesign2).then((docs) => {
        Log.l("getScheduleJobsites(): Got allDocs for jobsites:\n", docs);
        let jsArray = [];
        for (let item of docs.rows) {
          if (item.doc && item.doc.client) {
            let js = new Jobsite();
            js.readFromDoc(item.doc);
            jsArray.push(js);
          }
        }
        Log.l("getScheduleJobsites(): Created jobsite array:\n", jsArray);
        resolve(jsArray);
      }).catch((err) => {
        Log.l("getScheduleJobsites(): Error getting allDocs from jobsites!");
        Log.e(err);
        resolve([]);
      })
    });
  }

  public getSchedule(date?:Moment|Date|string):Promise<Schedule> {
    Log.l("getSchedule(): Firing up...");
    let key:Moment|string = "current";
    if(date) {
      if (isMoment(date) || date instanceof Date) {
        key = moment(date).format("YYYY-MM-DD");
      } else {
        key = date;
      }
    }
    return new Promise((resolve,reject) => {
      let rdb1 = ServerService.addRDB('sesa-scheduling');
      rdb1.get(key).then((doc) => {
        if(doc) {
          let schedule = new Schedule();
          schedule.readFromDoc(doc);
          resolve(schedule);
        } else {
          resolve(null);
        }
      }).catch((err) => {
        Log.l("getSchedule(): Error retrieving schedule document!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public backupSchedule(scheduleDoc) {
    let id = scheduleDoc._id;
    Log.l(`backupSchedule(): Saving a backup copy of schedule '${id}'...`);
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('sesa-scheduling');
      this.storage.persistentSave("onsiteconsolex-schedule-latest", scheduleDoc).then(res => {
        return rdb1.get(id);
      }).then(res => {
        let oldDoc = res;
        let now = moment();
        let start = scheduleDoc.start || now;
        let dateObject = moment(start);
        let dateString = dateObject.format("YYYY-MM-DD");
        // let docID = id + "_backup_" + now.toExcel();

        // let docID = "backup_" + id + "_" + now.toExcel();
        let docID = "backup_" + id + "_" + now.format("YYYY-MM-DD-HH-mm-ss.SSSZ");
        oldDoc._id = docID;
        oldDoc.backup = true;
        delete oldDoc._rev;
        rdb1.upsert(oldDoc._id, (doc) => {
          if(doc && doc._rev) {
            let rev = doc._rev;
            doc = oldDoc;
            doc._rev = rev;
          } else {
            doc = oldDoc;
            delete doc._rev;
          }
          return doc;
        }).then(res => {
          if(!res.ok && !res.updated) {
            Log.l(`backupSchedule(): Schedule '${id}' found but error upserting backup '${docID}'.`);
            Log.e(res);
            resolve({message: `'${id}' found but error upserting ${docID}.`});
          } else {
            Log.l(`backupSchedule(): Successfully backed up schedule '${id}' as '${docID}'.`);
            resolve(res);
          }
        }).catch(err => {
          Log.l(`backupSchedule(): Error backing up '${id}' to '${docID}'.`);
          resolve({message: `'${id}' error being backed up to '${docID}'.`})
        });
      }).catch(err => {
        if(err.status === 404) {
          resolve({message: `Schedule '${id}' does not exist, no backup needed.`});
        } else {
          Log.l("backupSchedule(): Error getting backup schedule.");
          resolve({message: `Non-404 error getting schedule '${id}'`});
        }
      });
    });
  }

  public saveSchedule(scheduleDoc, overwrite?:boolean) {
    Log.l("saveSchedule(): Firing up...");
    let id = scheduleDoc._id;
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('sesa-scheduling');
      this.backupSchedule(scheduleDoc).then(res => {
        scheduleDoc._id = id;
        rdb1.upsert(scheduleDoc._id, (doc) => {
          if(doc && doc._rev) {
            let rev = doc._rev;
            doc = scheduleDoc;
            doc._rev = rev;
          } else {
            // doc.schedule = scheduleDoc.schedule;
            doc = scheduleDoc;
            delete doc._rev;
          }
          return doc;
        }).then(res => {
          if(!res.ok && !res.updated) {
            Log.l(`saveSchedule(): Upsert error saving schedule ${scheduleDoc._id}.\n`, res);
            reject(res);
          } else {
            Log.l(`saveSchedule(): Successfully saved schedule ${scheduleDoc._id}.\n`, res);
            resolve(res);
          }
        }).catch(err => {
          Log.l("saveSchedule(): Error while persisting!");
          Log.e(err);
          reject(err);
          });
        // } else {
        //   rdb1.upsert(scheduleDoc._id, (doc) => {
        //     if(doc && doc.schedule) {
        //       return null;
        //     } else {
        //       doc = scheduleDoc;
        //       delete doc['_rev'];
        //       return doc;
        //     }
        //   }).then((res) => {
        //     if(!res.ok && !res.updated) {
        //       Log.l("saveSchedule(): Could not save schedule, perhaps because overwrite mode was not turned on:\n",res);
        //       reject(res);
        //     } else {
        //       Log.l("saveSchedule(): Saved schedule successfully. Result was:\n",res);
        //       resolve(res);
        //     }
        //   }).catch((err) => {
        //     Log.l("saveSchedule(): Error while persisting!");
        //     Log.e(err);
        //     reject(err);
        //   });
        // }
      });
    });
  }

  public getScheduleForDates(startDate:string, endDate:string) {
    return new Promise((resolve, reject) => {
      let rdb1 = this.addRDB('sesa-scheduling');
      // let id = startDate + "_" + endDate;
      let id = startDate;
      let query = { selector: { _id: { $eq: id } } };
      // rdb1.createIndex({index: {fields: ["_id"]}}).then(res => {
        // Log.l("getScheduleForDates(): Successfully created index, now retrieving schedule for %s to %s...", startDate, endDate);
        // return rdb1.find(query);
      rdb1.find(query).then(res => {
        Log.l("getScheduleForDates(): Got back query:\n", res);
        if(res && res.docs && res.docs.length) {
          resolve(res);
        } else {
          let err = new Error("getScheduleForDates() returned but without any documents!");
          reject(err);
        }
      }).catch(err => {
        Log.l("getScheduleForDates(): Error getting schedule for %s to %s.", startDate, endDate);
        Log.e(err);
        reject(err);
        // resolve(false);
      });
    });
  }

  public getAllDocs(dbname:string, params?:any) {
    Log.l(`getAllDocs(): Getting all docs from '${dbname}'...`);
    let rdb1 = ServerService.addRDB(dbname);
    let options = params ? params : {include_docs:true};
    return new Promise((resolve,reject) => {
      return rdb1.allDocs(options).then((docs) => {
        let docArray = [];
        for(let item of docs.rows) {
          if(item.doc && item.id[0]!=='_') {
            docArray.push(item.doc);
          }
        }
        resolve(docArray);
      }).catch((err) => {
        Log.l(`getAllDocs(): Error getting allDocs for '${dbname}'!`);
        Log.e(err);
        resolve([]);
      })
    });
  }

  public getConfigData(type:string, key?:string) {
    let rdb1 = ServerService.addRDB('sesa-config');
    Log.l(`Getting config data of type '${type}'...`);
    return new Promise((resolve,reject) => {
      rdb1.get(type.toLowerCase()).then(doc => {
        if(key && doc[key] !== undefined) {
          resolve(doc[key]);
        } else {
          resolve(doc.list);
        }
      }).catch(err => {
        Log.l(`getConfigData(): Error getting config data '${type}'`);
        Log.e(err);
        reject(err);
      })
    })
  }

  public getTechnicians() {
    Log.l('getTechnicians(): Getting list of technicians...');
    // let options = {include_docs: true, start_key: '_\uffff'};
    let options = {include_docs: true};
    return new Promise((resolve,reject) => {
      this.getAllDocs('sesa-employees', options).then((docs:Array<any>) => {
        let docArray = [];
        Log.l("getTechnicians(): got docs:\n", docs);
        for (let doc of docs) {

          let c = doc.userClass;
          let d = doc.roles;
          let u = doc.username;
          let ln = doc.lastName;
          if(c && Array.isArray(c)) {
            c = c[0].toUpperCase();
          } else if(c) {
            c = c.toUpperCase();
          }
          d = Array.isArray(d) ? d[0].toUpperCase() : d ? d.toUpperCase() : "";
          if(ln !== 'Sargeant' && u !== 'mike' && (c === "M-TECH" || c === "E-TECH" || c === "P-TECH" || c === "TECHNICIAN" || c === 'OFFICE' || c === 'MANAGER' || d === 'MANAGER' || d === 'OFFICE')) {
            let employee = new Employee();
            employee.readFromDoc(doc);
            docArray.push(employee);
          }
        }
        resolve(docArray);
      }).catch(err => {
        Log.l("getTechnicians(): Error getting technicians!");  Log.e(err);
        resolve([]);
      });
    });
  }

  public getClients() {
    let rdb1 = ServerService.addRDB('sesa-config');
    Log.l("getClients(): Getting list of clients...");
    return new Promise((resolve,reject) => {
      rdb1.get('client').then((doc) => {
        Log.l("getClients(): Got client list:\n", doc);
        if(doc.clients) {
          resolve(doc.clients);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getClients(): Error getting client list."); Log.e(err);
        resolve([]);
      });
    });
  }

  public saveClient(newClient:any) {
    let rdb1 = ServerService.addRDB('sesa-config');
    Log.l("saveClients(): Saving new client list...");
    return new Promise((resolve,reject) => {
      rdb1.get('client').then((doc) => {
        Log.l("saveClients(): Got client list:\n", doc);
        doc.clients.push(newClient);
        doc.list.push(newClient.name);
        return rdb1.put(doc);
      })
      .then((res) => {
        Log.l("saveClients(): Saved updated client list.\n", res);
        resolve(res);
      })
      .catch((err) => { Log.l("saveClients(): Error saving updated client list."); Log.e(err); reject(err); });
    });
  }

  public getLocations() {
    Log.l("getLocations(): Getting list of locations...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('location').then((doc) => {
        Log.l("getLocations(): Got location list:\n", doc);
        if(doc.locations) {
          resolve(doc.locations);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getLocations(): Error getting location list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveLocation(newLocation:any) {
    Log.l("saveLocation(): Saving new location to list...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('location').then((doc) => {
        Log.l("saveLocation(): Got location list:\n", doc);
        doc.locations.push(newLocation);
        doc.list.push(newLocation.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("saveLocation(): Saved updated location list.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveLocation(): Error saving updated location list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getLocIDs() {
    Log.l("getLocIDs(): Getting list of locIDs...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('locid').then((doc) => {
        Log.l("getLocIDs(): Got locID list:\n", doc);
        if(doc.locids) {
          resolve(doc.locids);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getLocIDs(): Error getting locID list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveLocID(newLocation:any) {
    Log.l("saveLocID(): Saving new locID to list...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('locid').then((doc) => {
        Log.l("saveLocID(): Got location list:\n", doc);
        doc.locids.push(newLocation);
        doc.list.push(newLocation.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("saveLocID(): Saved updated location list.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveLocID(): Error saving updated location list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getLoc2nds() {
    Log.l("getLoc2nds(): Getting list of loc2nds...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('loc2nd').then((doc) => {
        Log.l("getLoc2nds(): Got loc2nd list:\n", doc);
        if (doc.loc2nds) {
          resolve(doc.loc2nds);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getLoc2nds(): Error getting loc2nd list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveLoc2nd(newLoc2nd:any) {
    Log.l("saveLoc2nd(): Saving new loc2nd to list...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('loc2nd').then((doc) => {
        Log.l("saveLoc2nd(): Got loc2nd list:\n", doc);
        doc.locids.push(newLoc2nd);
        doc.list.push(newLoc2nd.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("saveLoc2nd(): Saved updated loc2nd list.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveLoc2nd(): Error saving updated loc2nd list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getShiftRotations() {
    Log.l("getShiftRotations(): Getting list of loc2nds...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('rotation').then((doc) => {
        Log.l("getShiftRotations(): Got rotation list:\n", doc);
        if (doc.rotations) {
          resolve(doc.rotations);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getShiftRotations(): Error getting rotation list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public saveShiftRotation(newShiftRotation:any) {
    Log.l("saveShiftRotation(): Saving new rotation to list...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve,reject) => {
      rdb1.get('rotation').then((doc) => {
        Log.l("saveShiftRotation(): Got rotation list:\n", doc);
        doc.rotations.push(newShiftRotation);
        doc.list.push(newShiftRotation.name);
        return rdb1.put(doc);
      }).then((res) => {
        Log.l("saveShiftRotation(): Saved updated rotation list.\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveShiftRotation(): Error saving updated rotation list.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getTechShifts() {
    Log.l("getTechShifts(): Getting list of tech shifts...");
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.get('shift').then((doc) => {
        Log.l("getTechShifts(): Got tech shift list:\n", doc);
        if (doc.list) {
          resolve(doc.list);
        } else {
          resolve([]);
        }
      }).catch((err) => {
        Log.l("getTechShifts(): Error getting tech shift list.");
        Log.e(err);
        resolve([]);
      });
    });
  }

  public getAllConfigData() {
    Log.l("getAllConfigData(): Retrieving clients, locations, locIDs, loc2nd's, shiftRotations, and shiftTimes...");
    let rdb1 = this.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.allDocs({ keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shiftstarttime'], include_docs: true }).then((records) => {
        Log.l("getAllConfigData(): Retrieved documents:\n", records);
        let results = { clients: [], locations: [], locids: [], loc2nds: [], rotations: [], shifts: [], shiftlengths: [], shiftstarttimes: [] };
        for (let record of records.rows) {
          // let record = records[i];
          let doc = record.doc;
          // let type = record.id;
          let types = record.id + "s";
          if (doc) {
            Log.l("getAllConfigData(): Found doc, looking for type '%s'", types);
            Log.l(doc);
            if (doc[types]) {
              for (let result of doc[types]) {
                results[types].push(result);
              }
            } else {
              for (let result of doc.list) {
                results[types].push(result);
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
    let rdb1 = ServerService.addRDB('sesa-config');
    return new Promise((resolve, reject) => {
      rdb1.allDocs({keys: ['client', 'location', 'locid', 'loc2nd', 'rotation', 'shift', 'shiftlength', 'shifttype', 'shiftstarttime'], include_docs:true}).then((docs) => {
        let results = {client: [], location: [], locid: [], loc2nd: [], rotation: [], shift: [], shiftlength: [], shifttype: [], shiftstarttime: []};
        for(let type in docs.rows[0].doc) {
          let item = docs[type];
          if(item.doc) {
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

  public getEmployees():Promise<Array<any>> {
    Log.l("getEmployees(): Now retrieving employees...");
    return new Promise((resolve, reject) => {
      let rdb1 = ServerService.addRDB('sesa-employees');
      rdb1.allDocs({include_docs:true}).then((res) => {
        Log.l(`getEmployees(): Success! Result:\n`, res);
        let docArray = [];
        for(let item of res.rows) {
          if(item.doc && item.id[0] !== '_') {
            let doc = item.doc;
            let user = new Employee();
            user.readFromDoc(doc);
            docArray.push(user);
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

  public getJobsites():Promise<Array<any>> {
    Log.l("getJobsites(): Retrieving job sites...");

    return new Promise((resolve, reject) => {
      let rdb1 = ServerService.addRDB('sesa-jobsites');
      rdb1.allDocs({include_docs:true}).then((docs) => {
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

  public saveJobsite(jobsite:Jobsite) {
    Log.l("saveJobsite(): Saving job site...\n", jobsite);
    return new Promise((resolve,reject) => {
      let rdb1 = ServerService.addRDB('sesa-jobsites');
      // if(!jobsite._id) {
      //   if(typeof jobsite.loc2nd === 'string' && jobsite.loc2nd.length > 0) {
      //     jobsite._id = `${jobsite.client.name}_${jobsite.location.name}_${jobsite.loc2nd}_${jobsite.locID.name}`;
      //   } else {
      //     jobsite._id = `${jobsite.client.name}_${jobsite.location.name}_${jobsite.locID.name}`;
      //   }
      // }
      if(!jobsite._id) {
        if(jobsite instanceof Jobsite) {
          jobsite._id = jobsite.getSiteID();
        }
      }
      Log.l(`Now attempting to save jobsite '${jobsite._id}:\n`,jobsite);
      rdb1.get(jobsite._id).then((res) => {
        Log.l(`saveJobsite(): Retrieved jobsite '${jobsite._id}' successfully:\n`, res);
        jobsite._rev = res._rev;
        Log.l(`saveJobsite(): Now saving jobsite '${jobsite._id}'...`);
        return rdb1.put(jobsite);
      }).then((res) => {
        Log.l(`saveJobsite(): Successfully saved job site ${jobsite._id}.\n`, res);
        resolve(res);
      }).catch((err) => {
        if(err)
        Log.l("saveJobsite(): Error saving job site!");
        Log.e(err);
        if(err['status'] == 404) {
          Log.l(`saveJobsite(): Jobsite ${jobsite._id} was not found, saving new...`);
          rdb1.put(jobsite).then((res) => {
            Log.l(`saveJobsite(): Jobsite ${jobsite._id} was newly saved successfully!\n`, res);
            resolve(res);
          }).catch((err) => {
            Log.l(`saveJobsite(): Error saving new jobsite ${jobsite._id}!`);
            Log.l(err);
            reject(err);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  public getAllReports(startDate?:Moment|Date) {
    let rdb1 = this.addRDB(this.prefs.getDB().reports);
    return new Promise((resolve, reject) => {
      let options = {include_docs:true};
      // if(startDate) {
        // let date = moment(startDate);
        // options['startkey'] = date.format("YYYY-MM-DD");
      // }
      rdb1.allDocs(options).then(res => {
        Log.l("getAllReports(): Got documents:\n", res);
        let docArray = new Array<Report>();
        for(let row of res.rows) {
          if(row.id[0] !== "_" && row['doc'] !== undefined) {
            let doc = row['doc'];
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            docArray.push(tmpReport);
          }
        }
        Log.l("getAllReports(): Got reports:\n", docArray);
        resolve(docArray);
      }).catch(err => {
        Log.l("getAllReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getReports(dbname:string) {
    let rdb1 = this.addRDB(dbname);
    return new Promise((resolve, reject) => {
      rdb1.allDocs({ include_docs: true }).then(res => {
        Log.l("getAllReports(): Got documents:\n", res);
        let docArray = new Array<Report>();
        for (let row of res.rows) {
          if (row.id[0] !== "_" && row['doc'] !== undefined) {
            let doc = row['doc'];
            let tmpReport = new Report();
            tmpReport.readFromDoc(doc);
            docArray.push(tmpReport);
          }
        }
        Log.l("getAllReports(): Got reports:\n", docArray);
        resolve(docArray);
      }).catch(err => {
        Log.l("getAllReports(): Error getting all work reports!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getAllReportsPlusNew():Promise<Array<Report>> {
    let tmpReports = new Array<Report>();
    return new Promise((resolve,reject) => {
      this.getAllReports().then((res:Array<Report>) => {
        Log.l("getAllReportsPlusNew(): Got first batch of report documents:\n", res);
        for(let report of res) {
          tmpReports.push(report);
        }
        return this.getReports('reports_ver101100');
      }).then((res: Array<Report>) => {
        Log.l("getAllReportsPlusNew(): Got second batch of report documents:\n", res);
        for(let report of res) {
          tmpReports.push(report);
        }
        Log.l("getAllReportsPlusNew(): Returning final array of reports:\n", tmpReports);
        resolve(tmpReports);
      }).catch(err => {
        Log.l("getAllReportsPlusNew(): Error retrieving reports.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public getOtherReports():Promise<Array<ReportOther>> {
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('sesa-reports-other');
      rdb1.allDocs({include_docs:true}).then(res => {
        Log.l(`getOtherReports(): Successfully retrieved other reports:\n`, res);
        let others = new Array<ReportOther>();
        for(let row of res.rows) {
          if(row['id'][0] !== '_' && row['doc'] !== undefined) {
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

  public upsert(dbname:string, cDoc:any) {
    let rdb1 = ServerService.addRDB(dbname);
    rdb1.upsert(cDoc._id, (doc) => {
      return doc;
    }).then(function (res)  {

    }).catch(function (err) {

    });
  }

  public getDrugTest() {
    let rdb1 = ServerService.addRDB('drugtest');
    return new Promise((resolve,reject) => {
      rdb1.get('DrugTestData').then((res) => {
        Log.l(`getDrugTest(): Success! Result:\n`, res);
        resolve(res);
      }).catch((err) => {
        Log.l(`getDrugTest(): Error!`);
        Log.e(err);
        reject(err);
      });
    });
  }

  public getSounds() {
    return new Promise((resolve, reject) => {
      let rdb1 = this.addRDB('sesa-sounds');
      const str2blob = async function(str:string) {
        return blobUtil.base64StringToBlob(str);
      };
      const data2blob = async function(data:any, out:any) {
        // return new Promise((resolve, reject) => {
          try {
            // let out = {};
            let keys = Object.keys(data);
            for(let i of keys) {
              // out[i] = [];
              let dat = data[i];
              for(let doc of dat) {
                let blob = await str2blob(doc.asset);
                let blobURL = URL.createObjectURL(blob);
                out[i].push(blobURL);
              }
            }
            return out;
            // resolve(out);
          } catch(err) {
            Log.l("data2blob(): Error processing base64 data to Blob!");
            Log.e(err);
            throw new Error(err);
            // reject(err);
          }
        // });
      };
      Log.l("getSounds(): Now attempting to get sounds from server....");
      rdb1.allDocs({include_docs:true, attachments:true}).then(res => {
        Log.l("getSounds(): Successfully got sounds back from server:\n", res);
        let out = {};
        for(let row of res.rows) {
          let doc = row.doc;
          if(doc && doc._attachments) {
            out[row.id] = [];
            for(let key in doc._attachments) {
              let data = doc._attachments[key].data;
              out[row.id].push({'file': key, 'asset': data});
            }
          }
        }
        let output = {};
        let keys = Object.keys(out);
        for(let key of keys) {
          output[key] = [];
        }
        Log.l("getSounds(): Calling data2blob with out and finalout:\n",out,JSON.stringify(output));
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

  public saveJobsiteSortOrder(sites:Array<Jobsite>) {
    Log.l("saveJobsiteSortOrder(): Saving sort order for:\n", sites);
    let rdb1 = this.addRDB('sesa-jobsites');
    let updateSite = async function(site:Jobsite) {
      return rdb1.upsert(site._id, (doc) => {
        doc.sort_number = site.sort_number;
        return doc;
      }).catch(err => {
        Log.l("updateSite(): Unable to update sort_number for site: ", site);
      });
    };
    let saveSiteNumbers = async function(sites:Array<Jobsite>) {
      try {
        for(let site of sites) {
          let res = await updateSite(site);
          Log.l("saveSiteNumbers(): Result for site '%s' was:\n", site.getSiteID(), res);
        }
        return sites;
      } catch(err) {
        Log.l("saveSiteNumbers(): Error saving sites!");
        Log.e(err);
        throw err;
      }
    };
    return new Promise((resolve, reject) => {
      saveSiteNumbers(sites).then(res => {
        Log.l("saveJobsiteSortOrder(): Saved jobsite sort order, result:\n", res);
        resolve(res);
      }).catch(err => {
        Log.l("saveJobsiteSortOrder(): ERROR saving jobsite sort order!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getAllData():Promise<any> {
    return new Promise((resolve,reject) => {
      let data = { sites: [], employees: [], reports: [], others: [], periods: [], shifts: [], schedules: [] };
      this.getJobsites().then(res => {
        for(let doc of res) {
          let site = new Jobsite();
          site.readFromDoc(doc);
          data.sites.push(site);
        }
        return this.getEmployees();
      }).then((res:Array<Employee>) => {
        // for(let doc of res) {
        //   let user = new Employee();
        //   user.readFromDoc(doc);
        //   data.employees.push(user);
        // }
        data.employees = res;
        return this.getAllReportsPlusNew();
      }).then(res => {
        // for(let doc of res) {
        //   data.reports.push(doc);
        // }
        data.reports = res;
        return this.getOtherReports();
      }).then(res => {
        data.others = res;
        // Log.l("getAllData(): Success, final data to be returned is:\n", data);
        return this.getSchedules();
      }).then(res => {
        data.schedules = res;
        Log.l("getAllData(): Success, final data to be returned is:\n", data);
        resolve(data);
      }).catch(err => {
        Log.l("getAllData(): Error retrieving all data!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getSchedules(archives?:boolean):Promise<Array<Schedule>> {
    Log.l("getSchedules(): Firing up...");
    return new Promise((resolve, reject) => {
      let rdb1 = ServerService.addRDB('sesa-scheduling');
      rdb1.allDocs({include_docs: true}).then(res => {
        Log.l("getSchedules(): Got initial schedule results:\n", res);
        let schedules:Array<Schedule> = [];
        for(let row of res.rows) {
          let doc = row.doc;
          if(!archives && doc.archive) {
            continue;
          } else {
            if(doc && row.id[0] !== '_' && doc.schedule) {
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

  public getSchedulesAsBetas(archives?:boolean):Promise<Array<ScheduleBeta>> {
    Log.l("getSchedulesAsBetas(): Firing up...");
    return new Promise((resolve, reject) => {
      let rdb1 = ServerService.addRDB('sesa-scheduling-beta');
      rdb1.allDocs({include_docs: true}).then(res => {
        Log.l("getSchedulesAsBetas(): Got initial schedule results:\n", res);
        let schedules:Array<ScheduleBeta> = [];
        for(let row of res.rows) {
          let doc = row.doc;
          if(!archives && doc.archive) {
            continue;
          } else {
            if(doc && row.id[0] !== '_' && doc.schedule) {
              let schedule = new ScheduleBeta();
              schedule.readFromDoc(doc);
              schedules.push(schedule);
            }
          }
        }
        Log.l("getSchedulesAsBetas(): Final result array is:\n", schedules);
        resolve(schedules);
      }).catch((err) => {
        Log.l("getSchedulesAsBetas(): Error retrieving schedule list!");
        Log.e(err);
        resolve(null);
      });
    });
  }

  public saveScheduleBeta(value:ScheduleBeta) {
    Log.l("saveScheduleBeta(): Firing up to save ScheduleBeta:\n", value);
    return new Promise((resolve, reject) => {
      let rdb1 = this.addRDB('sesa-scheduling-beta');
      let scheduleToSave = value.serialize();
      rdb1.upsert(value._id, (doc) => {
        if(doc && doc._rev) {
          let rev = doc._rev;
          doc = scheduleToSave;
          doc._rev = rev;
        } else {
          doc = scheduleToSave;
          delete doc._rev;
        }
        return doc;
      }).then(res => {
        Log.l("saveScheduleBeta(): Final result is:\n", res);
        resolve(res);
      }).catch((err) => {
        Log.l("saveScheduleBeta(): Error saving ScheduleBeta!");
        Log.e(err);
        resolve(err);
      });
    });
  }

  public syncFromServer(dbname: string) {
    Log.l(`syncToServer(): About to attempt replication of remote->'${dbname}'`);
    let options = this.syncOptions;
    let ev1 = (a) => { Log.l(a.status); Log.l(a); };
    let db1 = this.addDB(dbname);
    let db2 = this.addRDB(dbname);
    let done = db1.replicate.from(db2, options)
      .on('change',   (info) => { Log.l(`syncFromServer():   change event fired for ${dbname}. Status:\n`, info); })
      .on('active',   (info) => { Log.l(`syncFromServer():   active event fired for ${dbname}. Status:\n`, info); })
      .on('paused',   (info) => { Log.l(`syncFromServer():   paused event fired for ${dbname}. Status:\n`, info); })
      .on('denied',   (info) => { Log.l(`syncFromServer():   denied event fired for ${dbname}. Status:\n`, info); })
      .on('complete', (info) => { Log.l(`syncFromServer(): complete event fired for ${dbname}. Status:\n`, info); })
      .on('error',    (err)  => {
        Log.l(`syncFromServer():    error event fired for ${dbname}. Status:\n`, err);
        if(err.status === 401)  {
          let user = this.auth.getUser();
          let pass = this.auth.getPass();
          if(user && pass) {
            this.loginToDatabase(this.auth.getUser(), this.auth.getPass(), dbname).then(res => {
              Log.l(`syncFromServer(): Successfully logged in to '${dbname}' after unauthorized errorr.`);
            }).catch(err => {
              Log.l(`syncFromServer(): Error logging in to '${dbname}' after unauthorized errorr.`);
            });
          }
        }
      }).on('cancel',   (info) => { Log.l(`syncFromServer():   cancel event fired for ${dbname}. Status:\n`, info); });
    Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
    Log.l(done);
    window["stat1"] = done;
    return done;
  }

  public liveSyncWithServer(dbname: string) {
    Log.l(`liveSyncWithServer(): About to set up live synchronization, remote=>'${dbname}'`);
    let options = this.syncOptions;
    let db1 = this.addDB(dbname);
    let db2 = this.addRDB(dbname);

    let done = db1.sync(db2, options)
      .on('change',   (info) => { Log.l(`liveSyncWithServer():   change event fired for ${dbname}. Status:\n`, info); })
      .on('active',   (info) => { Log.l(`liveSyncWithServer():   active event fired for ${dbname}. Status:\n`, info); })
      .on('paused',   (info) => { /* Log.l(`liveSyncWithServer():   paused event fired for ${dbname}. Status:\n`, info); */ })
      .on('denied',   (info) => { Log.l(`liveSyncWithServer():   denied event fired for ${dbname}. Status:\n`, info); })
      .on('complete', (info) => { Log.l(`liveSyncWithServer(): complete event fired for ${dbname}. Status:\n`, info); })
      .on('error', (err) => {
        Log.l(`liveSyncWithServer():    error event fired for ${dbname}. Status:\n`, err);
        if (err.status === 401 || err.status === 408) {
          let user = this.auth.getUser();
          let pass = this.auth.getPass();
          if (user && pass) {
            this.loginToDatabase(this.auth.getUser(), this.auth.getPass(), dbname).then(res => {
              Log.l(`liveSyncWithServer(): Successfully logged in to '${dbname}' after unauthorized errorr.`);
            }).catch(err => {
              Log.l(`liveSyncWithServer(): Error logging in to '${dbname}' after unauthorized errorr.`);
            });
          }
        }
      }).on('cancel', (info) => { Log.l(`liveSyncWithServer():   cancel event fired for ${dbname}. Status:\n`, info); });
    // Log.l(`liveSyncWithServer(): Ran replicate, now returning cancel object.`);
    // Log.l(done);
    // window["stat1"] = done;
    // return done;
    this.addSync(dbname, done);
    return done;
  }

  public nonLiveSyncWithServer(dbname: string) {
    Log.l(`nonLiveSyncWithServer(): About to replicate remote=>'${dbname}'`);
    // let options = this.syncOptions;
    let options = this.nonsyncOptions;
    let db1 = this.addDB(dbname);
    let db2 = this.addRDB(dbname);
    return new Promise((resolve,reject) => {
      db1.replicate.from(db2, options).then(res => {
        Log.l(`nonLiveSyncWithServer(): Successfully replicated '${dbname}' from remote to local. Now replicating local->remote ...`);
        return db1.replicate.to(db2, options);
      }).then(res => {
        Log.l(`nonLiveSyncWithServer(): Successfully replicated '${dbname}' from local to remote! Now implementing EABOD routine... done.`);
        resolve(res);
      }).catch(err => {
        Log.l(`nonLiveSyncWithServer(): Failed replication for '${dbname}', either remote->local or local->remote. Now FOADIAF..... done.`);
        Log.e(err);
        reject(err);
      })
    });
  }

  public getMessages():Promise<Array<Message>> {
    let rdb1 = this.addRDB('sesa-messages');
    let msgs = [];
    return new Promise((resolve,reject) => {
      rdb1.allDocs({include_docs:true}).then(res => {
        Log.l("getMessages(): Raw doc input list read from server is:\n", res);
        for(let row of res.rows) {
          if(row.doc && row.id[0] !== '_') {
            let doc = row.doc;
            let msg = new Message();
            msg.readFromDoc(doc);
            msgs.push(msg);
          }
        }
        Log.l("getMessages(): Final output is:\n", msgs);
        resolve(msgs);
      }).catch(err => {
        Log.l("getMessages(): Error getting messages!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public saveMessage(message:Message) {
    let rdb1 = this.addRDB('sesa-messages');
    if(!message._id) {
      message.generateMessageID();
    }
    return new Promise((resolve,reject) => {
      rdb1.upsert(message._id, (doc) => {
        if(doc) {
          let rev = doc._rev;
          doc = message;
          doc._rev = rev;
          return doc;
        } else {
          doc = message;
          delete doc._rev;
          return doc;
        }
      }).then(res => {
        if(!res.ok && !res.updated) {
          Log.l("saveMessage(): Error saving message!");
          Log.e(res);
          reject(res);
        } else {
          Log.l("saveMessage(): Message saved:\n", res);
          resolve(res);
        }
      }).catch(err => {
        Log.l("saveMessage(): Error saving message!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getComments():Promise<Array<Message>> {
    let rdb1 = this.addRDB('sesa-comments');
    return new Promise((resolve,reject) => {
      rdb1.allDocs({include_docs:true}).then(res => {
        Log.l("getComments(): Read from database:\n", res);
        let msgs = new Array<Message>();
        for(let row of res.rows) {
          if(row.doc && row.id[0] !== '_') {
            let doc = row.doc;
            let msg = new Message();
            msg.readFromDoc(doc);
            msgs.push(msg);
          }
        }
        Log.l("getComments(): Final list of comments is:\n", msgs);
        resolve(msgs);
      }).catch(err => {
        Log.l("getComments(): Error retrieving comments.");
        Log.e(err);
        reject(err);
      })
    });
  }

  public getDPSSettings():Promise<DPS> {
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('sesa-config');
      let id = "dps_config";
      rdb1.get(id).then(res => {
        Log.l("getDPSSettings(): Retrieved raw DPS settings:\n", res);
        let dps = new DPS();
        dps.deserialize(res);
        Log.l("getDPSSettings(): Successfully retrieved DPS settings:\n", dps);
        resolve(dps);
      }).catch(err => {
        Log.l("getDPSSettings(): Error getting DPS settings!");
        Log.e(err);
        reject(err);
      })
    });
  }

  public saveDPSSettings(dpsDoc:any) {
    return new Promise((resolve,reject) => {
      let rdb1 = this.addRDB('sesa-config');
      let id = "dps_config";
      rdb1.upsert(id, (doc) => {
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

  public saveInvoice(type:string, invoice: Invoice) {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let rdb1 = this.addRDB(db[dbname]);
      let ts = moment().format();
      // let user = username ? username : window['onsiteconsoleusername'] ? window['onsiteconsoleusername'] : "unknown_user";
      let inv:any = invoice.serialize();
      // nr.time_start = report.time_start.format();
      // nr.time_end = report.time_end.format();
      // let rpt:any = JSON.stringify(report);
      rdb1.upsert(inv._id, (doc) => {
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

  public async saveInvoices(type:string, invoices: Array<Invoice>) {
    try {
      let results = [];
      for (let invoice of invoices) {
        let saveResult = await this.saveInvoice(type, invoice);
        results.push(saveResult);
        // let update = {type:'save', id: invoice._id};
        this.dispatch.updateDBProgress('save', invoice._id);
      }
      Log.l("saveInvoices(): Results are:\n", results);
      return results;
    } catch(err) {
      Log.l(`saveInvoices(): Error saving invoices to server!`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public getInvoices(type:string, start: string, end: string):Promise<Array<Invoice>> {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let dbname = `invoices_${type.toLowerCase()}`;
      let rdb1 = this.addRDB(db[dbname]);
      rdb1.allDocs({ include_docs: true }).then(res => {
        Log.l(`getInvoices(): Successfully retrieved invoices, raw results are:\n`, res);
        let invoices: Array<Invoice> = [];
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc && row.doc.type && row.doc.type === type) {
            let doc = row.doc;
            if (doc.period_start >= start && moment(doc.period_start, "YYYY-MM-DD").add(6, 'day').format("YYYY-MM-DD") <= end) {
              let invoice: Invoice = Invoice.deserialize(doc);
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
      let rdb1 = this.addDB(db.preauths);
      // db1.allDocs({include_docs: true}).then(res => {
      // })
      let pdoc = preauth.serialize();
      rdb1.upsert(pdoc._id, (doc) => {
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
      let rdb1 = this.addDB(db.preauths);
      rdb1.allDocs({include_docs: true}).then(res => {
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

  public getOldReports(): Promise<Report[]> {
    return new Promise((resolve, reject) => {
      let db = this.prefs.getDB();
      let rdb1 = this.addRDB(db.reports_old01);
      Log.l(`Server.getOldReports(): retrieving all reports from '${db.reports_old01}'...`)
      rdb1.allDocs({ include_docs: true }).then(res => {
        Log.l("Server.getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
        let reports: Report[] = [];
        for (let row of res.rows) {
          if (row.id[0] !== '_' && row.doc) {
            let doc = row.doc;
            let rpt = new Report();
            rpt.readFromDoc(doc);
            reports.push(rpt);
          }
        }
        Log.l("Server.getOldReports(): Final array of old reports is:\n", reports);
        resolve(reports);
      }).catch(err => {
        Log.l("Server.getOldReports(): Error retrieving reports.");
        Log.e(err);
        reject(err);
      });
    });
  }

  // public async getOldReports(): Promise<Report[]> {
  //   try {
  //     let db   = this.prefs.getDB();
  //     let rdb1 = this.addDB(db.reports_old01);
  //     let res  = await rdb1.allDocs({ include_docs: true });
  //     Log.l("getOldReports(): Successfully retrieved old reports, raw list is:\n", res);
  //     let reports: Report[] = [];
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

  // public syncSquaredFromServer(dbname:string) {
  //   let options = {
  //     live: true,
  //     retry: true,
  //     continuous: true
  //   };

  //   Log.l(`syncFromServer(): About to attempt replication of remote->'${dbname}'`);
  //   let ev2 = (b) => { Log.l(b.status); Log.l(b); };
  //   let db1 = this.addRDB(dbname);
  //   let db2 = this.addDB(dbname);
  //   let done = db1.replicate.to(db2, this.prefs.SERVER.repopts)
  //     .on('change', info => { Log.l("syncFromServer(): change event fired. Status: ", info.status); Log.l(info); })
  //     .on('active', info => { Log.l("syncFromServer(): active event fired. Status: ", info.status); Log.l(info); })
  //     .on('paused', info => { Log.l("syncFromServer(): paused event fired. Status: ", info.status); Log.l(info); })
  //     .on('denied', info => { Log.l("syncFromServer(): denied event fired. Status: ", info.status); Log.l(info); })
  //     .on('complete', info => { Log.l("syncFromServer(): complete event fired. Status: ", info.status); Log.l(info); })
  //     .on('error', info => { Log.l("syncFromServer(): error event fired. Status: ", info.status); Log.l(info); })
  //     .on('cancel', info => { Log.l("syncFromServer(): cancel event fired. Status: ", info.status); Log.l(info); });
  //   Log.l(`syncFromServer(): Ran replicate, now returning cancel object.`);
  //   window["stat2"] = done;
  //   return done;

  // }
}
