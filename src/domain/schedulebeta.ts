/**
 * Name: Schedule Beta domain class
 * Vers: 2.0.1
 * Date: 2017-12-03
 * Auth: David Sargeant
 * Logs: 2.0.1 2017-12-03: Added functionality and added _id and _rev to serialize output
 * Logs: 1.1.2 2017-09-07: Initial
 */

import { sprintf                           } from 'sprintf-js'                 ;
import { Log, moment, Moment, isMoment, oo } from '../config/config.functions' ;
import { Jobsite, Employee, Shift          } from './domain-classes'           ;

export class ScheduleBeta {
  // public sites         : Array<Jobsite>       = []    ;
  // public techs         : Array<Employee>      = []    ;
  // public shifts        : Array<Shift>         = []    ;
  public type          : string               = 'week';
  public creator       : string               = ""    ;
  public start         : Moment               = null  ;
  public end           : Moment               = null  ;
  public startXL       : number                       ;
  public endXL         : number                       ;
  public timestamp     : Moment                       ;
  public timestampXL   : number                       ;
  // public payroll_period: number                       ;
  // public stats         : any = null                   ;
  public schedule      : any = null                   ;
  public scheduleDoc   : any = null                   ;
  public scheduleList  : any[]                = []    ;
  public techs         : Array<Employee>      = []    ;
  public unassigned    : Array<Employee>      = []    ;
  public backup        : boolean              = false ;
  public _id           : string               = ""    ;
  public _rev          : string               = ""    ;

  constructor(type?:string,creator?:string,start?:Moment|Date,end?:Moment|Date) {
    // window['onsitedebug'] = window['onsitedebug'] || {};
    // window['onsitedebug']['Schedule'] = Schedule;
    let today     = moment().startOf('day') ;
    this.type     = type                    || "week"                       ;
    this.creator  = creator                 || "grumpy"                     ;
    this.start    = moment(start)           || moment(today)                ;
    this.end      = moment(end)             || moment(today).add(6, 'days') ;
    this.schedule = {};
    this.techs    = [];
    this.unassigned = [];
    this.timestamp = moment();
    this.timestampXL = this.timestamp.toExcel();
  }

  public readFromDoc(doc:any) {
    let keys = Object.keys(doc);
    for(let key of keys) {
      if(key === 'start' || key === 'end') {
        this[key] = moment(doc[key], "YYYY-MM-DD");
      } else if(key === 'timestamp') {
        this[key] = moment(doc[key]);
      } else if(key === 'schedule') {
        this[key] = doc[key];
        this.scheduleDoc = oo.clone(doc[key]);
      } else {
        this[key] = doc[key];
      }
    }
    if(keys.indexOf('creator') === -1) {
      this.creator = 'grumpy';
    }
  }

  public saveToDoc() {
    let doc:any = {};
    let keys = Object.keys(this);
    if(!this._id) {
      this.generateID();
    }
    this.startXL = this.start.toExcel(true);
    this.endXL  = this.end.toExcel(true);
    for(let key of keys) {
      if(key === 'techs' || key === 'unassigned') {
        let tmp = this[key].map((a:Employee) => a.username);
        doc[key] = tmp;
      } else if(key === 'start' || key ==='end') {
        doc[key] = this[key].format("YYYY-MM-DD");
      } else if(key === 'schedule') {
        let schDoc:any = {};
        for(let sitename in this.schedule) {
          schDoc[sitename] = {};
          for(let rotation in this.schedule[sitename]) {
            let shiftTechs = this.schedule[sitename][rotation];
            schDoc[sitename][rotation] = shiftTechs.map((a:Employee) => a.username);
          }
        }
        doc[key] = schDoc;
      } else if(key === 'timestamp') {
        doc[key] = this[key].format();
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public deserialize(doc:any) {
    this.readFromDoc(doc);
  }

  public serialize() {
    return this.saveToDoc();
  }

  public generateID() {
    let start = this.start;
    let week = start.format("YYYY-MM-DD");
    this._id = week;
    return this._id;
  }

  public generateScheduleArray() {
    let schedule = this.schedule;
    let sch = [];

  }

  public getType() {
    return this.type;
  }

  public setType(value:string) {
    if(value === 'week' || value === 'day') {
      this.type = value;
    } else {
      Log.e(`SCHEDULE.setType(): Error setting type '${value}', must be 'week' (default) or 'day'.`);
      return null;
    }
    return this.type;
  }

  public getCreator() {
    return this.creator;
  }

  public setCreator(value:string) {
    this.creator = value;
    return this.creator;
  }

  public getScheduleID() {
    let date = moment(this.start).format("YYYY-MM-DD");
    // let type = this.type;
    let creator = this.getCreator();
    let out = this._id ? this._id : `${date}_${creator}`;
    this._id = out;
    return out;
  }

  public getScheduleTitle() {
    return moment(this.start).format("DD MMM YYYY");
  }

  public getStartDate(str?:boolean) {
    return moment(this.start);
  }

  public setStartDate(day:Date|Moment|string) {
    let date;
    if(isMoment(day) || day instanceof Date) {
      date = moment(day);
    } else {
      date = moment(day, "YYYY-MM-DD");
    }
    this.start = date.startOf('day');
    this.startXL = date.toExcel(true);
    return moment(this.start);
  }

  public getEndDate() {
    return moment(this.end);
  }

  public setEndDate(day: Date | Moment | string) {
    let date;
    if (isMoment(day) || day instanceof Date) {
      date = moment(day);
    } else {
      date = moment(day, "YYYY-MM-DD");
    }
    this.end = date.startOf('day');
    this.endXL = date.toExcel(true);
    return moment(this.end);
  }

  public getStartXL() {
    return this.startXL;
  }

  public getEndXL() {
    return this.endXL;
  }

  public getSchedule() {
    return this.schedule;
  }

  public setSchedule(schedule:any) {
    for(let i1 in schedule) {
      let el1 = schedule[i1];
      for(let i2 in el1) {
        let el2 = el1[i2];
        let employees = [];
        let replace = false;
        for(let entry of el2) {
          if(entry instanceof Employee) {
            continue;
          } else {
            // Log.l("setSchedule(): Entry is")
            let employee = new Employee();
            employee.readFromDoc(entry);
            let i = el2.indexOf(entry);
            el2[i] = employee;
          }
        }
        // if(replace) {
        //   el2 = employees;
        // }
      }
    }
    this.schedule = schedule;
    return this.schedule;
  }

  public getScheduleDoc() {
    return this.scheduleDoc;
  }

  public setScheduleDoc(value:any) {
    this.scheduleDoc = value;
    return this.scheduleDoc;
  }

  public getTechs():Array<Employee> {
    return this.techs;
  }

  public setTechs(value:Array<Employee>) {
    // let techNames:Array<Employee> = [];
    // for(let tech of value) {
    //   if(tech instanceof Employee) {
    //     let name = tech.getUsername();
    //     techNames.push(name);
    //   } else if(typeof tech === 'string') {
    //     techNames.push(tech);
    //   }
    // }

    // this.techs = techNames;
    this.techs = value;
    return this.techs;
  }

  public getUnassigned():Array<Employee> {
    return this.unassigned;
  }

  public setUnassigned(value:Array<Employee>) {
    this.unassigned = value;
    return this.unassigned;
  }

  public addTech(tech:Employee) {
    let ts = this.techs;
    let i = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ts.splice(i,1);
    }
    ts.push(tech);
    return this.techs;
  }

  public removeTech(tech:Employee) {
    let ts = this.techs;
    let ua = this.unassigned;
    let i = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ts.splice(i,1);
    }
    let j = ua.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(j > -1) {
      ua.splice(i,1);
    }
    return this.techs;
  }

  public addUnassignedTech(tech:Employee) {
    let ua = this.unassigned;
    let ts = this.techs;
    let name = tech.username;
    let i = ua.findIndex((a:Employee) => {
      return a.username === name;
    });
    let j = ts.findIndex((a:Employee) => {
      return a.username === name;
    });
    // if(i > -1) {
    //   ua.splice(i,1);
    // }
    if(i === -1) {
      ua.push(tech);
    }
    if(j === -1) {
      ts.push(tech);
    }
    let doc = this.scheduleDoc;
    let record = doc[name] || {};
    record.site = 1;
    record.rotation = "UNASSIGNED";
    record.shift = "AM";
    doc[name] = record;
    let list = this.scheduleList;
    let entry = list.find((a:any) => {
      return a.tech === name;
    });
    if(entry) {
      entry.site = 1;
      entry.rotation = "UNASSIGNED";
      entry.shift = "AM";
    } else {
      let newEntry = {tech: name, site: 1, rotation: "UNASSIGNED", shift: "AM" };
      list.push(newEntry);
    }
    return this.unassigned;
  }

  public removeUnassignedTech(tech:Employee) {
    let ua = this.unassigned;
    let ts = this.techs;
    let i = ua.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    let j = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ua.splice(i,1);
    }
    return this.unassigned;
  }

  public createSchedulingObject(sites:Array<Jobsite>, techs:Array<Employee>) {
    let scheduleObject = {};
    this.unassigned = techs.slice(0);
    this.techs = techs.slice(0);
    let sch = this.schedule;
    let siteNames = Object.keys(sch);
    for(let site of sites) {
      let siteName = site.getScheduleName();
      scheduleObject[siteName] = {};
      for(let siteRotation of site.shiftRotations) {
        let rotation = siteRotation.name;
        scheduleObject[siteName][rotation] = [];
      }
    }
    for(let siteName of siteNames) {
      let siteObject = sch[siteName];
      scheduleObject[siteName] = scheduleObject[siteName] || {};
      let siteRotations = Object.keys(siteObject);
      for(let siteRotation of siteRotations) {
        let techList = siteObject[siteRotation];
        scheduleObject[siteName][siteRotation] = scheduleObject[siteName][siteRotation] || [];
        for(let techName of techList) {
          if(techName instanceof Employee) {
            let i = this.techs.findIndex((a:Employee) => {
              return a.username === techName.username;
            });
            if(i > -1) {
              let tech = this.techs[i];
              scheduleObject[siteName][siteRotation].push(tech);
              let j = this.unassigned.findIndex((a:Employee) => {
                return a.username === techName.username;
              });
              if(j > -1) {
                let tech = this.unassigned.splice(j, 1)[0];
              }
            } else {
              Log.w(`createSchedulingObject(): Can't find tech (even though it's an Employee object) '${techName.username}' in tech array:\n`, techs);
            }
          } else {
            let i = this.techs.findIndex((a:Employee) => {
              return a.username === techName || a.toString() === techName;
            });
            if(i > -1) {
              let tech = this.techs[i];
              scheduleObject[siteName][siteRotation].push(tech);
              let j = this.unassigned.findIndex((a: Employee) => {
                return a.username === techName || a.toString() === techName;
              });
              if (j > -1) {
                let tech = this.unassigned.splice(j, 1)[0];
              }
            } else {
              Log.w(`createSchedulingObject(): Can't find tech '${techName}' in tech array:\n`, techs);
            }
          }
        }
      }
    }
    this.schedule = scheduleObject;
    return scheduleObject;
  }

  public createEmptySchedule(sites:Array<Jobsite>) {
    let schedule = {};
    for(let site of sites) {
      let siteName = site.getScheduleName();
      schedule[siteName] = {};
      for (let rot of site.shiftRotations) {
        let rotation = rot.name;
        schedule[siteName][rotation] = [];
      }
    }
    this.schedule = schedule;
    return this.schedule;
  }

  public add(tech:Employee, entry:any) {
    let user;
    let doc = this.scheduleDoc || {};
    let list = this.scheduleList || [];
    if(tech) {
      // if(tech && tech instanceof Employee) {
        user = tech.getUsername();
      // } else if(tech && typeof tech === 'string') {
      //   user = tech;
      // }
      let i = this.techs.findIndex((a:Employee) => {
        return a.username === user;
      });
      if(i === -1) {
        this.techs.push(tech);
      }
      doc[user] = entry;
      let listItemIndex = list.findIndex((a:any) => {
        return a.tech === user;
      });
      let listEntry;
      if (listItemIndex > -1) {
        listEntry = list[listItemIndex];
      } else {
        listEntry = {tech: user, site: 1, rotation: "CONTN WEEK", shift: "AM" };
        list.push(listEntry);
      }

      let entryKeys = Object.keys(entry);
      for(let key of entryKeys) {
        listEntry[key] = entry[key];
      }
      this.scheduleList = list;
      this.scheduleDoc = doc;
      return listEntry;
    } else {
      Log.w("ScheduleBeta.add(): Must include tech and entry! Tech and entry are: ", tech);
      Log.w(entry);
      return null;
    }
  }

  public static getNextScheduleStartDateFor(forDate?:Moment|Date) {
    // let date = moment(forDate);
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day = forDate ? moment(forDate) : moment();

    if (day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
    else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  }

  public static getScheduleStartDateFor(forDate?:Moment|Date) {
    // let date = moment(forDate);
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day = forDate ? moment(forDate) : moment();
    if (day.isoWeekday() < scheduleStartsOnDay) { return moment(day).subtract(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
    else { return moment(day).isoWeekday(scheduleStartsOnDay); }
  }

  public toString() {
    return this.getScheduleID();
  }

}
