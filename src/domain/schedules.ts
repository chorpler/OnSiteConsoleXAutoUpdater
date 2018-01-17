/**
 * Name: Schedules domain class
 * Vers: 1.0.1
 * Date: 2017-08-14
 * Auth: David Sargeant
 */

import { sprintf                                           } from 'sprintf-js'                 ;
import { Log, moment, Moment, isMoment, oo                 } from '../config/config.functions' ;
import { Jobsite, Employee, Shift, Schedule, PayrollPeriod } from './domain-classes'           ;

export class Schedules {
  public schedules:Array<Schedule> = [];
  public sites:Array<Jobsite> = [];
  constructor() {
    window['Schedules'] = Schedules;
  }

  public addSchedule(schedule:Schedule) {
    this.schedules.push(schedule);
    return this.schedules;
  }

  public getSchedules() {
    return this.schedules;
  }

  public setSchedules(schedules:Array<Schedule>) {
    this.schedules = schedules;
    return this.schedules;
  }

  public getSites() {

  }

  public getScheduleStartDate(date:Moment|Date) {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day = moment(date);
    if (day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
    else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  }


  public getSiteForTechAndDate(tech:Employee, scheduleDate:Moment|Date) {
    // let date = moment(scheduleDate);
    let date = this.getScheduleStartDate(scheduleDate);
    let schedules = this.schedules;
    let username = tech.getUsername();
    let foundSiteName = "";
    let schedule = schedules.find(a => {
      return a['start'].isSame(date, 'day');
    });
    outerloop: for(let siteName in schedule.schedule) {
      for(let rotation in schedule.schedule[siteName]) {
        let techs = schedule.schedule[siteName][rotation];
        let i = techs.indexOf(username);
        if(i > -1) {
          foundSiteName = siteName;
          break outerloop;
        }
      }
    }
    let site = this.sites.find(a => {
      return a.getScheduleName() === foundSiteName;
    });
    return site;
  }

  public clone() {
    let output = [];
    for(let schedule of this.schedules) {
      output.push(schedule);
    }
    let newSchedules = new Schedules();
    newSchedules.setSchedules(output);
    return newSchedules;
  }
}
