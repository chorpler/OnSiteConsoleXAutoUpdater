/**
 * Name: ReportOther domain class
 * Vers: 3.1.2
 * Date: 2017-11-04
 * Auth: David Sargeant
 * Logs: 3.1.2: Added site_number property and setSite() method
 */

import { sprintf                       } from 'sprintf-js'                 ;
import { Log, isMoment, moment, Moment } from '../config/config.functions' ;
import { Employee, Jobsite             } from './domain-classes'           ;

export const fields = [
  "type",
  "training_type",
  "travel_location",
  "time",
  "notes",
  "report_date",
  "last_name",
  "first_name",
  "client",
  "location",
  "location_id",
  // "location_2",
  "timestamp",
  "timestampM",
  "username",
  "shift_serial",
  "payroll_period",
  "site_number",
  "_id",
  "_rev",
];

export class ReportOther {
  public type             : string;
  public training_type    : string;
  public travel_location  : string;
  public time             : any;
  public notes            : any;
  public report_date      : any;
  public last_name        : any;
  public first_name       : any;
  public client           : any;
  public location         : any;
  public location_id      : any;
  // public location_2       : any;
  public timestamp        : any;
  public timestampM       : any;
  public username         : any;
  public shift_serial     : any;
  public payroll_period   : any;
  public site_number      : number;
  public _id              : any;
  public _rev             : any;

  constructor() {
    this.type              = ""                    ;
    this.training_type     = ""                    ;
    this.time              = ""                    ;
    this.notes             = ""                    ;
    this.report_date       = ""                    ;
    this.last_name         = ""                    ;
    this.first_name        = ""                    ;
    this.client            = ""                    ;
    this.location          = ""                    ;
    this.location_id       = ""                    ;
    // this.location_2        = ""                    ;
    this.shift_serial      = ""                    ;
    // this.timestamp         = ""                    ;
    // this.timestampM        = ""                    ;
    this.username          = ""                    ;
    this.shift_serial      = ""                    ;
    this.payroll_period    = ""                    ;
    this._id               = ""                    ;
    this._rev              = ""                    ;
    this.timestampM        = moment();
    this.timestamp         = this.timestampM.toExcel();
  }

  public readFromDoc(doc:any) {
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key  = fields[i];
      this[key] = doc[key];
    }
    this.report_date = moment(this.report_date, "YYYY-MM-DD")    ;
    this.timestampM  = moment(this.timestampM)     ;
    return this;
  }

  public genReportID(tech:Employee) {
    let now = moment();
    // let idDateTime = now.format("YYYYMMDDHHmmss_ddd");
    let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
  }

  public getTotalHours() {
    let hours:number|string = Number(this.time);
    if(!isNaN(hours)) {
      return hours;
    } else {
      if(this.time === "V" || this.time === "H") {
        hours = 8;
      } else if(this.time === "S" && this.location === "DUNCAN") {
        hours = "S";
      } else {
        // Log.w("ReportOther.getTotalHours(): Total hours for this ReportOther was not a number or a recognized code: '%s'", this.time);
        hours = 0;
      }
      return hours;
    }
  }

  public serialize(tech:Employee) {
    Log.l("ReportOther.serialize(): Now serializing report...");
    // let ts = moment(this.timestamp);
    // Log.l("WorkOrder.serialize(): timestamp moment is now:\n", ts);
    // let XLDate = moment([1900, 0, 1]);
    // let xlStamp = ts.diff(XLDate, 'days', true) + 2;
    // this.timestamp = xlStamp;
    let newReport = {};
    this._id = this._id || this.genReportID(tech);
    let len = fields.length;
    for(let i = 0; i < len; i++) {
      let key = fields[i];
      if(key === 'report_date') {
        let date = this[key];
        if(isMoment(date)) {
          newReport[key] = this[key].format("YYYY-MM-DD");
        } else if(typeof date === 'string') {
          newReport[key] = this[key];
        } else {
          Log.w("ReportOther.serialize() called with 'report_date' that isn't a Moment or a string:\n", this);
          newReport[key] = this[key];
        }
      } else if(key === 'technician') {
        newReport[key] = tech.getTechName();
      } else {
        if(this[key] !== undefined && this[key] !== null) {
          newReport[key] = this[key];
        } else if(tech[key] !== undefined && tech[key] !== null) {
          newReport[key] = tech[key];
        }
      }
      newReport['username'] = tech['avatarName'];
    }
    let hrs = Number(newReport['time']);
    if(!isNaN(hrs)) {
      newReport['time'] = hrs;
    }
    newReport['notes'] = newReport['type'] + "";
    return newReport;
  }

  public clone() {
    let newWO = new ReportOther();
    for(let key of fields) {
      if(isMoment(this[key])) {
        newWO[key] = moment(this[key]);
      } else if(typeof this[key] === 'object') {
        newWO[key] = Object.assign({}, this[key]);
      } else {
        newWO[key] = this[key];
      }
    }
    return newWO;
  }

  public setSite(site:Jobsite) {
    let cli = site.client;
    let loc = site.location;
    let lid = site.locID;
    let sno = site.site_number;
    this.site_number = sno;
    this.client = cli.fullName.toUpperCase();
    this.location = loc.fullName.toUpperCase();
    this.location_id = lid.name.toUpperCase();
  }

}
