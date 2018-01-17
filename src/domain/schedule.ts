/**
 * Name: Schedule domain class
 * Vers: 3.1.4
 * Date: 2017-09-19
 * Auth: David Sargeant
 */

import { sprintf                           } from 'sprintf-js'                 ;
import { Log, moment, Moment, isMoment, oo } from '../config/config.functions' ;
import { Jobsite, Employee, Shift          } from './domain-classes'           ;

export class Schedule {
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
  public techs         : Array<Employee>      = []    ;
  public unassigned    : Array<Employee>      = []    ;
  public backup        : boolean              = false ;
  public _id           : string               = ""    ;
  public _rev          : string               = ""    ;

  constructor(type?:string,creator?:string,start?:Moment|Date,end?:Moment|Date) {
    // window['onsitedebug'] = window['onsitedebug'] || {};
    // window['onsitedebug']['Schedule'] = Schedule;
    let today        = moment().startOf('day')  ;
    this.type        = type                     || "week"                       ;
    this.creator     = creator                  || "grumpy"                     ;
    this.start       = moment(start)            || moment(today)                ;
    this.end         = moment(end)              || moment(today).add(6, 'days') ;
    this.startXL     = moment(start).toExcel(true);
    this.endXL       = moment(end).toExcel(true);
    this.schedule    =                          {                               } ;
    this.scheduleDoc =                          {                               } ;
    this.techs       = []                       ;
    this.unassigned  = []                       ;
    this.timestamp   = moment()                 ;
    this.timestampXL = this.timestamp.toExcel() ;
    this.backup      = false                    ;

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
    for(let key of keys) {
      if(key === 'techs' || key === 'unassigned') {
        let tmp = this[key].map((a:Employee) => a.username);
        doc[key] = tmp;
      } else if(key === 'start' || key ==='end') {
        doc[key] = this[key].format("YYYY-MM-DD");
      } else if(key === 'startXL') {
        doc[key] = this.start.toExcel(true);
      } else if(key === 'endXL') {
        doc[key] = this.end.toExcel(true);
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
    if(doc._id === undefined) {
      doc._id = this.getScheduleID();
    }
    doc.startXL = this.start.toExcel(true);
    doc.endXL = this.end.toExcel(true);
    return doc;
  }

  public deserialize(doc:any) {
    this.readFromDoc(doc);
  }

  public serialize() {
    return this.saveToDoc();
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
    if(creator === 'grumpy') {
      out = this._id ? this._id : `${date}`;
    }
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
    let i = ts.findIndex((a:Employee) => {
      return a.username === tech.username;
    });
    if(i > -1) {
      ts.splice(i,1);
    }
    return this.techs;
  }

  public addUnassignedTech(tech:Employee) {
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
    ua.push(tech);
    if(j === -1) {
      ts.push(tech);
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
        for(let tech of techList) {
          let name;
          if(tech instanceof Employee) {
            name = tech.getUsername();
          } else {
            name = tech;
          }
          let i = techs.findIndex((a:Employee) => {
            return a.username === name;
          });
          if(i > -1) {
            let tech = techs.splice(i, 1)[0];
            scheduleObject[siteName][siteRotation].push(tech);
          } else {
            Log.w(`createSchedulingObject(): Can't find tech '${name}' in tech array:\n`, techs);
          }
        }
      }
    }
    this.unassigned = techs.slice(0);
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
