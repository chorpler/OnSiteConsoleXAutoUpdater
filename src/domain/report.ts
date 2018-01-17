/**
 * Name: Report domain class
 * Vers: 6.4.2
 * Date: 2017-11-14
 * Auth: David Sargeant
 * Logs: 6.4.2 2017-11-14: Fixed it so Excel dates in string format will also read in
 * Logs: 6.4.1 2017-11-12: Added ability to read report_date from rprtDate as an Excel date integer
 * Logs: 6.3.1: Added split_count and split_from
 */

import { sprintf                                 } from 'sprintf-js'                 ;
import { Log, isMoment, Moment, moment, oo       } from '../config/config.functions' ;
import { Employee, Shift, PayrollPeriod, Jobsite } from '../domain/domain-classes'   ;

export class Report {
  public _id              : string ;
  public _rev             : string ;
  public time_start       : Moment ;
  public time_end         : Moment ;
  public repair_hours     : number ;
  public unit_number      : string ;
  public work_order_number: string ;
  public notes            : string ;
  public report_date      : string ;
  public last_name        : string ;
  public first_name       : string ;
  public shift            : string ;
  public client           : string ;
  public location         : string ;
  public location_id      : string ;
  public site_number      : number ;
  // public location_2       : any ;
  public shift_time       : Moment ;
  public shift_length     : number ;
  public shift_start_time : Moment ;
  public technician       : string ;
  public timestamp        : number ;
  public username         : string ;
  public shift_serial     : string ;
  public payroll_period   : number ;
  public invoiced         : boolean;
  public invoiced_dates   : Array<Moment> = [];
  public change_log       : Array<any> = [];
  public split_count      : number ;
  public split_from       : string ;


  /**
   * Create a Report object. All parameters are optional, and can be populated later from a serialized object document from database.
   * @param {*} [start] Start time for report. Should be a moment.js object. (Optional)
   * @param {*} [end] End time for report. Should be a moment.js object; will be calculated automatically most times. (Optional)
   * @param {*} [hours] Repair hours for report. Should be a number or a moment.js duration object. (Optional)
   * @param {*} [unit] Unit number for report. String. (Optional)
   * @param {*} [wo] Work Order number for report. String. (Optional)
   * @param {*} [nts] Notes for report. String. (optional)
   * @param {*} [date] Date work was performed. Should be a moment.js object or an ISO8601 string. (Optional)
   * @param {*} [last] Technician's last name. String. (Optional)
   * @param {*} [first] Technician's first name. String. (Optional)
   * @param {*} [shift] Shift type for this report (AM/PM). String. (Optional)
   * @param {*} [client] Client work was performed for. String or client name object. (Optional)
   * @param {*} [loc] Location of work site. Usually a city name. String. (Optional)
   * @param {*} [locid] Location ID of work site. MNSHOP, PMPSHP, E-TECH, etc. String. (Optional)
   * @param {*} [loc2] Auxiliary Location of work site. North, South, or NA. String. (Optional)
   * @param {*} [shiftTime] Shift type for this report (AM/PM). String. (Optional)
   * @param {*} [shiftLength] Shift length (in hours) for shift this work was peformed during. Number. (Optional)
   * @param {*} [shiftStartTime] Start time for shift this work was performed during. Number. (Optional)
   * @param {*} [tech] Full name of technician (lastname, firstname). String. (Optional)
   * @param {*} [timestamp] Time stamp representing when report was created. Unix epoch time or Excel datetime format. Number. (Optional)
   * @param {*} [user] Username of technician. String. (Optional)
   * @param {*} [serial] Serial number for shift. Excel date, plus underscore, plus shift sequence number. String. (Optional)
   * @param {*} [payroll] Payroll period number for shift. Excel date of day payroll period started (Wednesday). Number. (Optional)
   *
   * @memberof Report
   */
  constructor(start?: any, end?: any, hours?: any, unit?: any, wo?: any, nts?: any, date?: any, last?: any, first?: any, shift?: any, client?: any, loc?: any, locid?: any, loc2?: any, shiftTime?: any, shiftLength?: any, shiftStartTime?: any, tech?: any, timestamp?: any, user?: any, serial?:any, payroll?:any) {
    if(arguments.length === 1) {
      let doc = arguments[0];
      this.site_number = 0;
      this.invoiced = false;
      this.invoiced_dates = [] ;
      this.readFromDoc(doc);
    } else {
      this._id               =                   null ;
      this._rev              =                   null ;
      this.time_start        = start          || null ;
      this.time_end          = end            || null ;
      this.repair_hours      = hours          || null ;
      this.unit_number       = unit           || null ;
      this.work_order_number = wo             || null ;
      this.notes             = nts            || null ;
      this.report_date       = date           || null ;
      this.last_name         = last           || null ;
      this.first_name        = first          || null ;
      this.shift             = shift          || null ;
      this.client            = client         || null ;
      this.location          = loc            || null ;
      this.location_id       = locid          || "MNSHOP" ;
      this.shift_serial      =                   null ;
      this.shift_time        = shiftTime      || null ;
      this.shift_length      = shiftLength    || null ;
      this.shift_start_time  = shiftStartTime || null ;
      this.technician        = tech           || null ;
      this.timestamp         = timestamp      || null ;
      this.username          = user           || null ;
      this.shift_serial      =                   null ;
      this.payroll_period    =                   null ;
      this.site_number       = 1                      ;
      this.invoiced          = false                  ;
      this.invoiced_dates    = []                     ;
      this.change_log        = []                     ;
      this.split_count       = 0                      ;
    }
  }

  public readFromDoc(doc: any) {
    let fields = [
      ["_id" , "_id"],
      ["_rev", "_rev"],
      ["repairHrs", "repair_hours"],
      ["uNum", "unit_number"],
      ["wONum", "work_order_number"],
      ["notes", "notes"],
      ["rprtDate", "report_date"],
      ["lastName", "last_name"],
      ["firstName", "first_name"],
      ["client", "client"],
      ["location", "location"],
      ["locID", "location_id"],
      ["shift", "shift_time"],
      ["shiftLength", "shift_length"],
      ["shiftStartTime", "shift_start_time"],
      ["shiftSerial", "shift_serial"],
      ["payrollPeriod", "payroll_period"],
      ["technician", "technician"],
      ["timeStamp", "timestamp"],
      ["username", "username"],
      ["site_number", "site_number"],
      ["invoiced", "invoiced"],
      ["invoiced_dates", "invoiced_dates"],
      ["change_log", "change_log"],
    ];
    // try {
      let len = fields.length;
      for (let i = 0; i < len; i++) {
        let docKey = fields[i][0];
        let thisKey = fields[i][1];
        this[thisKey] = doc[docKey];
        if(thisKey === 'report_date') {
          // this[thisKey] = moment(doc[docKey], "YYYY-MM-DD");
          if(typeof doc[docKey] === 'number') {
            this[thisKey] = moment.fromExcel(doc[docKey]).format("YYYY-MM-DD");
          } else if(typeof doc[docKey] === 'string') {
            let xl = Number(doc[docKey]);
            if(!isNaN(xl)) {
              this[thisKey] = moment.fromExcel(xl).format("YYYY-MM-DD")
            } else {
              this[thisKey] = doc[docKey];
            }
          }
        }
      }
      if(!this.technician) {
        this.technician = this.last_name + ", " + this.first_name;
      }

      let report_date = moment(this.report_date, "YYYY-MM-DD");

      let timestart = doc['timeStarts'];
      let timeend   = doc['timeEnds'];

      if(typeof timestart === 'string' && timestart.length === 5) {
        let startTime = timestart.slice(0, 5).split(":");
        let hour = Number(startTime[0]);
        let min = Number(startTime[1]);
        let ts = moment(report_date).startOf('day').hour(hour).minute(min);
        this.time_start = ts;
      } else if(typeof timestart === 'string') {
        this.time_start = moment(timestart);
      } else {
        let start = moment(timestart);
        this.time_start = start;
      }

      if(typeof timeend === 'string' && timeend.length === 5) {
        let endTime = doc['timeEnds'].slice(0, 5).split(":");
        let hour = Number(endTime[0]);
        let min = Number(endTime[1]);
        let te = moment(report_date).startOf('day').hour(hour).minute(min);
        // this.time_end = te.format("HH:mm");
        this.time_end = te;
      } else if(typeof timeend === 'string') {
        this.time_end = moment(timeend);
      } else {
        let end = moment(timeend);
        this.time_end = end;
      }

      let repair_hours = doc['repairHrs'] !== undefined ? doc['repairHrs'] : doc['repair_hours'] !== undefined ? doc['repair_hours'] : 0;
      let hr1 = Number(repair_hours);
      if(!isNaN(hr1)) {
        this.repair_hours = hr1;
      } else {
        let repairHours = doc['repairHrs'].slice(0, 5).split(":");
        let hrs = Number(repairHours[0]);
        let min = Number(repairHours[1]);
        let hours = hrs + min/60;
        this.repair_hours = hours;
      }
      let date = moment(this.report_date);
      if(doc['shiftSerial'] === undefined) {
        this.shift_serial = Shift.getShiftSerial(date);
      }
      if(doc['payrollPeriod'] === undefined) {
        this.payroll_period = PayrollPeriod.getPayrollSerial(date);
      }
    // } catch(err) {
      // Log.l("REPORT.readFromDoc(): Error reading document:\n", doc);
      // Log.e(err);
      // throw new Error(err);
    // }
  }

  public serialize():any {
    let fields = [
      ["_id", "_id"],
      ["_rev", "_rev"],
      ["repairHrs", "repair_hours"],
      ["uNum", "unit_number"],
      ["wONum", "work_order_number"],
      ["notes", "notes"],
      ["rprtDate", "report_date"],
      ["lastName", "last_name"],
      ["firstName", "first_name"],
      ["client", "client"],
      ["location", "location"],
      ["locID", "location_id"],
      ["shift", "shift_time"],
      ["shiftLength", "shift_length"],
      ["shiftStartTime", "shift_start_time"],
      ["shiftSerial", "shift_serial"],
      ["payrollPeriod", "payroll_period"],
      ["technician", "technician"],
      ["timeStamp", "timestamp"],
      ["username", "username"],
      ["timeStarts", "time_start"],
      ["timeEnds", "time_end"],
      ["change_log", "change_log"],
    ];
    let doc:any = {};
    // try {
    let len = fields.length;
    for(let keypair of fields) {
      let docKey = keypair[0];
      let thisKey = keypair[1];
      if(this[thisKey] !== undefined) {
        if(thisKey === 'report_date') {
        // this[thisKey] = moment(doc[docKey], "YYYY-MM-DD");
          doc[docKey] = this[thisKey];
        } else if(thisKey === 'time_start' || thisKey === 'time_end') {
          doc[docKey] = this[thisKey].format();
        } else {
          doc[docKey] = this[thisKey];
        }
      } else {
        doc[docKey] = "";
      }
    }
    return doc;
  }

  public getRepairHours():number {
    let val = Number(this.repair_hours) || 0;
    return val;
  }

  public getRepairHoursString() {
    let hours = this.getRepairHours();
    let h = Math.trunc(hours);
    let m = (hours - h) * 60;
    let out = sprintf("%02d:%02d", h, m);
    return out;
  }

  public setStartTime(time: any) {
    if (isMoment(time) || moment.isDate(time)) {
      this.time_start = moment(time);
      this.checkTimeCalculations(0);
    } else {
      Log.l("Report.setStartTime(): Needs a date/moment, was given this:\n", time);
    }
  }

  public setEndTime(time: any) {
    if (isMoment(time) || moment.isDate(time)) {
      this.time_end = moment(time);
      this.checkTimeCalculations(1);
    } else {
      Log.l("Report.setEndTime(): Needs a date/moment, was given this:\n", time);
    }
  }

  public setRepairHours(duration: any) {
    if (moment.isDuration(duration)) {
      this.repair_hours = duration.asHours();
      this.checkTimeCalculations(2);
    } else if (typeof duration === 'number') {
      this.repair_hours = duration;
      this.checkTimeCalculations(2);
    } else {
      Log.l("Report.setRepairHours(): Need a duration or number, was given this:\n", duration);
    }
  }

  public adjustEndTime() {
    let start = this.time_start;
    let time = this.repair_hours;
    let end = this.time_end;
    // Log.l("adjustEndTime(): Now adjusting end time of work report. time_start, repair_hours, and time_end are:\n", start, time, end);
    // if (typeof time !== 'number') {
    //   if (moment.isDuration(time)) {
    //     time = time.asHours();
    //   }
    // }
    if (start !== null && isMoment(start) && typeof time === 'number') {
      let newEnd = moment(start).add(time, 'hours');
      if (end.isSame(newEnd)) {
        Log.l("adjustEndTime(): No need, end time is already correct.");
      } else {
        Log.l("adjustEndTime(): Adjusting end time to:\n", newEnd);
        this.time_end = newEnd;
      }
    } else {
      Log.l("adjustEndTime(): Can't adjust end time, time_start is not a valid moment or repair_hours is not a number:\n", start, time);
    }
  }

  public checkTimeCalculations(mode: number) {
    let start = this.time_start;
    let end = this.time_end;
    let time = this.repair_hours;
    // let flag = false;
    if (isMoment(start) && isMoment(end) && start !== null && end !== null && typeof time === 'number') {
      let check = moment(start).add(time, 'hours');
      if (!check.isSame(end)) {
        Log.e("WO.checkTimeCalculations(): Start time plus repair hours does not equal end time!");
        Log.e("Start: %s\nEnd: %s\nHours: %s", start.format(), end.format(), time);
        this.adjustEndTime();
      }
    } else if (isMoment(start) && typeof time === 'number') {
      let end = moment(start).add(time, 'hours');
      this.time_end = end;
    } else if (isMoment(end) && typeof time === 'number') {
      let start = moment(end).subtract(time, 'hours');
      this.time_start = start;
    } else if (isMoment(start) && isMoment(end)) {
      let hours = moment(end).diff(start, 'hours', true);
      this.repair_hours = hours;
    } else {
      Log.w("Report.checkTimeCalculations(): Start or end times are not moments, or repair hours is not a number/duration!\nStart: %s\nEnd: %s\nHours: %s", start, end, time);
    }
  }

  public clone() {
    let newWO = new Report();
    let keys = Object.keys(this);
    for (let key of keys) {
      if (moment.isMoment(this[key])) {
        newWO[key] = moment(this[key]);
      } else if (typeof this[key] === 'object') {
        newWO[key] = Object.assign({}, this[key]);
      } else {
        newWO[key] = this[key];
      }
    }
    return newWO;
  }

  public genReportID(tech: Employee) {
    let now = moment();
    // let idDateTime = now.format("dddDDMMMYYYYHHmmss");
    let idDateTime = now.format("YYYY-MM-DD_HH-mm-ss_ZZ_ddd");
    let docID = tech.avatarName + '_' + idDateTime;
    Log.l("genReportID(): Generated ID:\n", docID);
    return docID;
  }

  public matchesSite(site:Jobsite) {
    if(this.site_number && this.site_number === site.site_number) {
      // Log.l("Report: matched report to site:\n", this);
      // Log.l(site);
      return true;
    } else {
      let siteCLI = site.client.name.toUpperCase();
      let siteLOC = site.location.name.toUpperCase();
      let siteLID = site.locID.name.toUpperCase();
      let siteCLI2 = site.client.fullName.toUpperCase();
      let siteLOC2 = site.location.fullName.toUpperCase();
      let siteLID2 = site.locID.fullName.toUpperCase();
      let cli = this.client      ? this.client.toUpperCase() :      "ZZ";
      let loc = this.location    ? this.location.toUpperCase() :    "Z";
      let lid = this.location_id ? this.location_id.toUpperCase() : "ZZZZZZ";
      if((cli === siteCLI || cli === siteCLI2) && (loc === siteLOC || loc === siteLOC2) && (lid === siteLID || lid === siteLID2)) {
        // Log.l("Report: matched report to site:\n", this);
        // Log.l(site);
        return true;
      } else {
        return false;
      }
    }
  }

  // public splitReportID(reportID?:string) {
  //   let id = reportID || this._id;
  //   let splits = id.split("_");
  //   let len = splits.length;
  //   let num = 0, strNum = "", newID = "";
  //   if(splits[len - 2] === "split") {
  //     // num = Number(splits[len - 1]);
  //     num = Number(this.split_count);
  //     if(!isNaN(num)) {
  //       num++;
  //       strNum = sprintf("%02d", num);
  //       splits.pop();
  //       // splits.pop();
  //       for(let chunk of splits) {
  //         newID += chunk + "_";
  //       }
  //       newID += strNum;
  //     }
  //   } else {
  //     num = Number(this.split_count);
  //     if(!isNaN(num)) {
  //       num++;
  //       strNum = sprintf("%02d", num);
  //     // newID = id + "_split_01";
  //   }
  //   return newID;
  //   // let match = /(.*)(?:_split_)?()/g;
  // }

  // public split() {
  //   let report = this;
  //   let reportDoc = report.serialize();
  //   let newReport = new Report();
  //   newReport.readFromDoc(reportDoc);
  //   report.split_count++;
  //   newReport.split_count++;
  //   newReport._rev = "";
  //   newReport._id = this.splitReportID(report._id);
  //   let start = moment(report.time_start);
  //   let hours = report.getRepairHours();
  //   let splitHours1 = hours / 2;
  //   let splitHours2 = hours / 2;
  //   let splitMinutes1 = hours * 30;
  //   let splitMinutes2 = hours * 30;
  //   let remainder = splitMinutes1 % 30;
  //   if(remainder !== 0) {
  //     splitMinutes1 += remainder;
  //     splitMinutes2 -= remainder;
  //   }
  //   splitHours1 = splitMinutes1 / 60;
  //   splitHours2 = splitMinutes2 / 60;
  //   // let newStart = moment(start).add(splitMinutes1, 'minutes');
  //   report.setRepairHours(splitHours1);
  //   let end = moment(report.time_end);
  //   newReport.setStartTime(end);
  //   newReport.setRepairHours(splitHours2);
  // }

}
