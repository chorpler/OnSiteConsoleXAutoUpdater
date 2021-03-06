import { Component, ViewChild,                                                } from '@angular/core'                  ;
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular'                  ;
import { Jobsite, Employee, Schedule,                                         } from '../../domain/domain-classes'    ;
import { Log, moment, Moment, isMoment, oo                                    } from '../../config/config.functions'  ;
import { DBService                                                            } from '../../providers/db-service'     ;
import { ServerService                                                        } from '../../providers/server-service' ;
import { AlertService                                                         } from '../../providers/alert-service'  ;
import { OSData                                                               } from '../../providers/data-service'   ;
import { Preferences                                                          } from '../../providers/preferences'    ;
import { NotifyService                                                        } from '../../providers/notify-service' ;
import { Dropdown, SelectItem                                                 } from 'primeng/primeng'                ;
import { OnSiteConsoleX                                                       } from '../../app/app.component'        ;
import { CalendarMonthViewComponent                                           } from 'angular-calendar'               ;

@IonicPage({ name: 'Scheduling Beta Choose' })
@Component({
  selector: 'page-scheduling-beta-choose',
    templateUrl: 'scheduling-beta-choose.html',
})
export class SchedulingBetaChoosePage {
  @ViewChild('calendarComponent') calendarComponent:CalendarMonthViewComponent;
  public title       : string                          ="Schedule Choose"   ;
  public static PREFS: any                             =new Preferences()   ;
  public get prefs() { return SchedulingBetaChoosePage.PREFS ;                  } ;
  public scheduleOptions:any                                                ;
  public dateStart   : Date                                                 ;
  public schedules   : Array<Schedule>                 =[]                  ;
  public allSchedules: Array<Schedule>                 =[]                  ;
  public creator     : Employee                                             ;
  public creators    : Array<Employee>                 =[]                  ;
  public creatorList : SelectItem[]                    = []                 ;
  public calendarHeight:number                         = 500                ;
  public invalidDates: Array<Date>                     =[]                  ;
  public maxDate     : Date                                                 ;
  public minDate     : Date                                                 ;
  public events      : Array<any>                      =[]                  ;
  public dataReady   : boolean                         =false               ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public data:OSData, public db:DBService, public server:ServerService, public alert:AlertService, public notify:NotifyService, public appComponent:OnSiteConsoleX) {
    window['onsiteschedulechoosebeta'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ScheduleChoosePage');
    this.data.appReady().then(res => {
      this.runWhenReady();
    })
  }

  public runWhenReady() {
    this.createMenus();
    this.dataReady = true;
  }

  public createMenus() {
    let now = moment();
    this.dateStart = now.toDate();
    let schedules = this.data.getSchedules();
    let techs = this.data.getData('employees');
    let startDay = 3;
    if(this.prefs.CONSOLE.global.weekStartDay !== undefined) {
      startDay = this.prefs.CONSOLE.global.weekStartDay;
    }
    this.scheduleOptions = {
      // firstDay: startDay,
      weekStartsOn: startDay,
    };
    this.creators = [];
    let creators = {};
    for(let schedule of schedules) {
      creators[schedule.getCreator()] = true;
    }

    let creatorList:SelectItem[] = [];
    for(let creator of Object.keys(creators)) {
      let user = techs.find((a:Employee) => {
        return a.username === creator;
      });
      this.creators.push(user);
      let item:SelectItem = {label: user.getFullNameNormal(), value: user};
      creatorList.push(item);
    }

    let creator = this.creators[0];
    this.creatorList = creatorList;

    this.allSchedules = schedules.slice(0);
    this.selectCreator(creator);

  }

  public openSchedule(schedule:Schedule) {
    this.navCtrl.push('Scheduling Beta', {schedule: schedule});
  }

  public openScheduleByDate(dateStart:Date) {
    let date = moment(dateStart);
    let schedule = this.schedules.find((a:Schedule) => {
      return a['start'].isSame(date, 'day');
    });
    if(schedule) {
      Log.l("openScheduleByDate(): Found and opening schedule:\n", schedule);
      this.openSchedule(schedule);
    } else {
      this.alert.showAlert("ERROR", `Could not find schedule with start date '${date.format("DD MMM YYYY")}'. How peculiar...`);
    }
  }

  public makeEventsFromSchedules(schedules:Array<Schedule>) {
    let events = [];
    let i = 0;
    let color = "rgb(255,255,0)";
    for(let schedule of schedules) {
      if(schedule._id.indexOf("backup") > -1) {
        continue;
      } else {
        switch(i++) {
          case 0: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 1: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 2: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 3: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
          case 4: color = `rgba(${this.data.random(50,80)}, ${this.data.random(0,250)}, ${this.data.random(0,180)}, 0.7)` ; break;
        }
        let start   = moment(schedule.start);
        let end     = moment(schedule.end);
        let fakeEnd = moment(schedule.end).add(1, 'day');
        let eventColor = {
          primary: color,
          secondary: color
        };
        let titleString: string;
        if (`${start.format("MMM")}` === `${end.format("MMM")}`) {
          titleString = `${start.format("DD")} - ${end.format("DD MMM")}`
        } else {
          titleString = `${start.format("DD MMM")} - ${end.format("DD MMM")}`
        }
        let event = {
          title: titleString,
          start: start.toDate(),
          end: end.toDate(),
          allDay: true,
          // color: color,
          color: eventColor,
          scheduleRef: schedule
        }
        events.push(event);
      }
    }
    return events;
  }

  public selectCreator(creator:Employee) {
    Log.l("selectCreator(): Selected creator '%s'", creator.getFullNameNormal());
    this.creator = creator;
    let schedules = this.allSchedules;

    this.schedules = schedules.filter((a:Schedule) => {
      return a.creator === creator.username;
    }).sort((a: Schedule, b: Schedule) => {
      let dA = a.start;
      let dB = b.start;
      return dA.isAfter(dB) ? -1 : dA.isBefore(dB) ? 1 : 0;
    });

    this.minDate = this.schedules[this.schedules.length - 1].getStartDate().toDate();
    this.maxDate = this.schedules[0].getStartDate().toDate();
    this.events = this.makeEventsFromSchedules(this.schedules);
    this.invalidDates = this.updateDisabledDates();
  }

  public updateDisabledDates() {
    let start         = moment(this.minDate);
    let end           = moment(this.maxDate);
    let startXL       = start.toExcel(true);
    let endXL         = end.toExcel(true);
    let scheduleDates = [];
    for(let schedule of this.schedules) {
      scheduleDates.push(schedule.getStartDate().toExcel(true));
    }
    let invalidDates = [];
    for(let i = startXL; i <= endXL; i++) {
      let j = scheduleDates.indexOf(i);
      if(j === -1) {
        invalidDates.push(moment().fromExcel(i).toDate());
      }
    }
    return invalidDates;
  }

  public openScheduleEvent(event:any) {
    Log.l("openScheduleEvent(): Event is:\n", event);
    // let schedule:Schedule = event.calEvent.scheduleRef;
    let schedule:Schedule = event.scheduleRef;
    this.openSchedule(schedule);
  }

  public openDay(day:any) {
    Log.l("openDay(): Event is:\n", day);
    if(day.events && day.events.length) {
      let event = day.events[0];
      let schedule:Schedule = event.scheduleRef;
      // let schedule:Schedule = event.calEvent.scheduleRef;
      this.openSchedule(schedule);
    } else {
      this.notify.addError("ERROR", "No schedule for this day.", 3000);
    }
  }

  public showOptions(event?:any) {
    this.appComponent.showOptions(event);
  }

}
