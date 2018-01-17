import 'rxjs/add/operator/map';
import PouchDB from 'pouchdb'                            ;
// import * as pdbMemory from 'pouchdb-adapter-memory'      ;
import * as workerPouch from 'worker-pouch'              ;
import * as PDBAuth from 'pouchdb-authentication'        ;
import * as pdbFind from 'pouchdb-find'                  ;
import * as pdbUpsert from 'pouchdb-upsert'              ;
import * as pdbAllDBs from 'pouchdb-all-dbs'             ;
import { Injectable  } from '@angular/core'              ;
import { Log         } from '../config/config.functions' ;
import { Preferences } from './preferences'              ;

@Injectable()
export class PouchDBService {
  public static StaticPouchDB : any;
  public static working       : boolean       = false                                        ;
  public static initialized   : boolean       = false                                        ;
  public static pdb           : Map<any,any>  = new Map()                                    ;
  public static rdb           : Map<any,any>  = new Map()                                    ;
  public static PDBSyncs      : Map<any,any>  = new Map()                                    ;
  public static PREFS         : any           = new Preferences()                            ;
  public get prefs(): any { return PouchDBService.PREFS; }                                   ;

  constructor() {
    Log.l('Hello PouchDBService Provider');
    window['onsitePouchDBService'] = PouchDBService;
    window['onsitepouchdbservice'] = this;
  }

  public static PouchInit() {
    if (!PouchDBService.initialized) {
      let pouchdb = PouchDB;
      PouchDB.plugin(pdbUpsert);
      PouchDB.plugin(PDBAuth);
      PouchDB.plugin(pdbFind);
      PouchDB.plugin(pdbAllDBs);
      // PouchDB.plugin(pdbMemory);
      // let adapter = PouchDBService.PREFS.CONSOLE.SERVER.localAdapter || 'idb';
      // if(adapter !== 'idb') {
        // PouchDB.adapter('worker', workerPouch);
      // }
      // PouchDB.adapter('worker', workerPouch);
      // PouchDB.adapter('mem', );
      window["pouchdbserv"] = this;
      window["StaticPouchDB"] = PouchDB;
      PouchDBService.StaticPouchDB = PouchDB;
      PouchDBService.initialized = true;
      return PouchDBService.StaticPouchDB;
    } else {
      return PouchDBService.StaticPouchDB;
    }
  }

  public static getAuthPouchDB() {
    return new Promise((resolve, reject) => {
      let pouchdb = PouchDB;
      PouchDB.plugin(pdbUpsert);
      PouchDB.plugin(pdbFind);
      PouchDB.plugin(PDBAuth);
      // pouchdb.plugin(PouchDBAuth);
      window["pouchdbserv"] = this;
      window["StaticPouchDB"] = PouchDB;
      PouchDBService.StaticPouchDB = PouchDB;
      resolve(PouchDBService.StaticPouchDB);
    });
  }

  public static getPouchDB() {
    return PouchDBService.StaticPouchDB;
  }

  public getPouchDB() {
    return PouchDBService.getPouchDB();
  }

  public addDB(dbname: string) {
    return PouchDBService.addDB(dbname);
  }

  public static addDB(dbname: string) {
    let dbmap = PouchDBService.pdb;
    if(dbmap.has(dbname)) {
      // Log.l(`addDB(): Not adding local database ${dbname} because it already exists.`);
      return dbmap.get(dbname);
    } else {
      // dbmap.set(dbname, PouchDBService.StaticPouchDB(dbname, {adapter: PouchDBService.PREFS.SERVER.localAdapter}));
      // let newPDB = new PouchDBService.StaticPouchDB(dbname);
      let newPDB = new PouchDBService.StaticPouchDB(dbname, {adapter: PouchDBService.PREFS.SERVER.localAdapter});
      newPDB._remote = false;
      dbmap.set(dbname, newPDB);
      // Log.l(`addDB(): Added local database ${dbname} to the list.`);
      // return dbmap.get(dbname);
      return newPDB;
    }
  }

  public addRDB(dbname: string) {
    return PouchDBService.addRDB(dbname);
  }

  public static addRDB(dbname: string) {
    let rdbmap = PouchDBService.rdb;
    let url = PouchDBService.PREFS.SERVER.rdbServer.protocol + "://" + PouchDBService.PREFS.SERVER.rdbServer.server + "/" + dbname;
    Log.l(`addRDB(): Now fetching remote DB ${dbname} at ${url} ...`);
    if(rdbmap.has(dbname)) {
      return rdbmap.get(dbname);
    } else {
      let rdb1 = PouchDBService.StaticPouchDB(url, PouchDBService.PREFS.SERVER.ropts);
      rdb1._remote = true;
      rdbmap.set(dbname, rdb1);
      // Log.l(`addRDB(): Added remote database ${url} to the list as ${dbname}.`);
      return rdbmap.get(dbname);
    }
  }

  public static getAllDB() {
    let dbmap = PouchDBService.pdb;
    return dbmap;
  }

  public static getAllRDB() {
    let dbmap = PouchDBService.rdb;
    return dbmap;
  }

  public static addSync(dbname:string, dbsync:any) {
    let syncmap = PouchDBService.PDBSyncs;
    if(syncmap.has(dbname)) {
      let syncevent = syncmap.get(dbname);
      syncevent.cancel();
    }
    syncmap.set(dbname, dbsync);
    return syncmap.get(dbname);
  }

  public static getSync(dbname:string):any {
    let syncmap = PouchDBService.PDBSyncs;
    let outVal = null;
    if(syncmap.has(dbname)) {
      outVal = syncmap.get(dbname);
    } else {
      Log.w(`getSync('${dbname}'): Entry not found in sync list!`);
    }
    return outVal;
  }

  public static getAllSyncs() {
    let syncmap = PouchDBService.PDBSyncs;
    return syncmap;
  }

  public static cancelSync(dbname:string) {
    let syncmap = PouchDBService.PDBSyncs;
    if(syncmap.has(dbname)) {
      let dbsync = syncmap.get(dbname);
      Log.l(`cancelSync('${dbname}'): Attempting to cancel sync via dbsync:\n`, dbsync);
      let output = dbsync.cancel();
      Log.l(`cancelSync('${dbname}'): Output of cancel event was:\n`, output);
      return output;
    } else {
      Log.w(`cancelSync('${dbname}'): Entry not found in sync list!`);
      return "ERROR_NO_SUCH_SYNC";
    }
  }

  public static cancelAllSyncs() {
    let syncmap = PouchDBService.PDBSyncs;
    let errCount = 0;
    for(let entry of syncmap) {
      let dbname:string = entry[0];
      // let dbsync:any    = entry[1];
      Log.l(`cancelAllSyncs(): Now attempting to cancel sync of '${dbname}'...`);
      let out = PouchDBService.cancelSync(dbname);
      if(out === "ERROR_NO_SUCH_SYNC") {
        errCount++;
      }
    }
    if(errCount === 0) {
      Log.l(`cancelAllSyncs(): All syncs evidently canceled. Clearing all sync events...`);
      syncmap.clear();
    } else {
      Log.w(`cancelAllSyncs(): Not all syncs canceled! Not clearing syncs! Error count: ${errCount}. Sync list:\n`, syncmap);
    }
  }

  public static clearAllSyncs() {
    let syncmap = PouchDBService.PDBSyncs;
    Log.l(`clearAllSyncs(): Clearing out all syncs from map:\n`, syncmap);
    syncmap.clear();
  }
}
