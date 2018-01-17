import { Component, NgZone, OnInit, OnDestroy, ViewChild, ElementRef,                            } from '@angular/core'                                    ;
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ViewController } from 'ionic-angular'                                    ;
import { ServerService                                                                           } from '../../providers/server-service'                   ;
import { DBService                                                                               } from '../../providers/db-service'                       ;
import { AuthService                                                                             } from '../../providers/auth-service'                     ;
import { AlertService                                                                            } from '../../providers/alert-service'                    ;
import { Preferences                                                                             } from '../../providers/preferences'                      ;
import { OSData                                                                                  } from '../../providers/data-service'                     ;
import { Log, Moment, moment, isMoment, oo                                                       } from '../../config/config.functions'                    ;
import { Jobsite, Employee, Schedule, ScheduleBeta                                               } from '../../domain/domain-classes'                      ;
import { PDFService                                                                              } from '../../providers/pdf-service'                      ;
import { OptionsComponent                                                                        } from '../../components/options/options'                 ;
import { OptionsGenericComponent                                                                 } from '../../components/options-generic/options-generic' ;
import { sprintf                                                                                 } from 'sprintf-js'                                       ;
import { Subscription                                                                            } from 'rxjs/Subscription'                                ;
import { Command, KeyCommandService                                                              } from '../../providers/key-command-service'              ;
import { Dialog                                                                                  } from 'primeng/primeng'                                  ;
import { OnSiteConsoleX                                                                          } from '../../app/app.component'                          ;
import { NotifyService                                                                           } from '../../providers/notify-service'                   ;

export const colors = {
  // These are background colors used for Halliburton and other clients in Scheduling and whatnot
  bg: {
    HB: "#d9e1f2",
    KN: "#e2efda",
    BE: "#f8cbad",
    SE: "#ffffff",
    date: "#004080",
  },
  // Foreground colors for clients, used in Scheduling summary and whatnot
  fg: {
    HB: "#203764",
    KN: "#c65911",
    BE: "#375623",
    SE: "#cc0099",
    date: "#e6e6e6",
  },
  get date() { return {color: colors.fg.date, fillColor: colors.bg.date};},
};

export const _dedupe = (array, property?) => {
  let prop = "fullName";
  if (property) {
    prop = property;
  }
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

const _siteSort = (a:Jobsite, b:Jobsite) => {
  return a.sort_number > b.sort_number ? 1 : a.sort_number < b.sort_number ? -1 : 0;
}

const _techSort = (a:Employee, b:Employee) => {
  return (a.lastName < b.lastName) ? -1 : (a.lastName > b.lastName) ? 1 : (a.firstName < b.firstName) ? -1 : (a.firstName > b.firstName) ? 1 : (a.middleName < b.middleName) ? -1 : (a.middleName > b.middleName) ? 1 : (a.suffix < b.suffix) ? -1 : (a.suffix > b.suffix) ? 1 : 0;
}

const _techFilter = (a:Employee) => {
  let u = a['username'];
  return u !== 'Chorpler' && u !== 'mike' && a.active;
}

@IonicPage({ name: 'Scheduling Beta' })
@Component({
  selector: 'page-scheduling-beta',
  templateUrl: 'scheduling-beta.html'
})
export class SchedulingBetaPage implements OnInit,OnDestroy {
  @ViewChild('optionsTarget') optionsTarget: ElementRef;
  @ViewChild('optionsDialog') optionsDialog: Dialog;
  @ViewChild('optionsComponent') optionsComponent: OptionsGenericComponent;

  public static PREFS    : any             = new Preferences()                  ;
  public get prefs()     : any {return SchedulingBetaPage.PREFS;}               ;
  public optionsVisible  : boolean         = false                              ;
  public videoVisible    : boolean         = false                              ;
  public keySubscription : Subscription                                         ;
  public optionsType     : string          = 'scheduling'                       ;
  public icons           : string[]                                             ;
  public buttonLocation  : number          = 1                                  ;
  public updated         : boolean         = false                              ;
  public items           : Array<{ title: string, note: string, icon: string }> ;
  public title           : string          = "Scheduling Beta"                  ;
  public stats           : any             = null                               ;
  public techs           : Array<Employee> = []                                 ;
  public allTechs        : Array<Employee> = []                                 ;
  public clients         : Array<any>                                           ;
  public sites           : Array<Jobsite>  = []                                 ;
  public shiftTypes      : Array<any>      = []                                 ;
  public shiftHeaders    : Array<string>   = []                                 ;
  public slots           : Array<any>                                           ;
  public tmpSlots        : Array<any>      = []                                 ;
  public slotIndex       : number          = 0                                  ;
  public slotHTMLIndex   : number          = 0                                  ;
  public shiftCount      : number          = 0                                  ;
  public siteCount       : number          = 0                                  ;
  public techCount       : number          = 0                                  ;
  public dragOngoing     : boolean         = false                              ;
  public currentSchedule : any                                                  ;
  public doc             : any                                                  ;
  public scheduleReady   : boolean         = false                              ;
  public start           : Moment          = null                               ;
  public end             : Moment          = null                               ;
  public dateStart       : Date                                                 ;
  public dateEnd         : Date                                                 ;
  public strDateEnd      : string                                               ;
  public oldStartDate    : Moment                                               ;
  public minDate         : any                                                  ;
  public invalidDates    : Array<any>      = []                                 ;
  public moment          : any             = moment                             ;
  public schedules       : Array<Schedule> = []                                 ;
  public schedule        : Schedule                                             ;
  public schedulesbeta   : Array<ScheduleBeta> = []                             ;
  public schedulebeta    : ScheduleBeta                                         ;
  public shiftKeyOn      : boolean         = false                              ;
  public sd              : any                                                  ;
  public employeeViewVisible:boolean       = false                              ;
  public mode            : string          = "Add"                              ;
  public employee        : Employee                                             ;
  public editEmployees   : Employee[]      = []                                 ;
  constructor(
    public navCtrl      : NavController     ,
    public navParams    : NavParams         ,
    public zone         : NgZone            ,
    public db           : DBService         ,
    public server       : ServerService     ,
    public auth         : AuthService       ,
    public alert        : AlertService      ,
    public modalCtrl    : ModalController   ,
    public data         : OSData            ,
    public pdf          : PDFService        ,
    public popCtrl      : PopoverController ,
    public keyService   : KeyCommandService ,
    public notify       : NotifyService     ,
    public appComponent : OnSiteConsoleX    ,
  ) {
      this.doc                          = {}                          ;
      window['schedulingbeta']          = this                        ;
      window['onsitedebug']             = window['onsitedebug'] || {} ;
      window['onsitedebug']['ScheduleBeta'] = ScheduleBeta            ;
      window['_dedupe'] = _dedupe;
  }

  public ngOnInit() {
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  public ngOnDestroy() {
    Log.l("SchedulingPage: ngOnDestroy() fired.");
    if (this.keySubscription && this.keySubscription.unsubscribe) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    // this.hotkeys.add(new Hotkey(['meta+o', 'alt+o'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("SchedulingBeta: got hotkey:\n", event, combo);
    //   this.showOptions();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    this.keySubscription = this.keyService.commands.subscribe((command: Command) => {
      switch (command.name) {
        case "SchedulingPage.printSchedule": this.printSchedule(command.ev); break;
        case "SchedulingPage.showOptions": this.showOptions(); break;
        case "SchedulingPage.newSchedule": this.newSchedule(); break;
        case "SchedulingPage.persistSchedule": this.persistSchedule(command.ev); break;
        case "SchedulingPage.openSchedule": this.openSchedule(); break;
      }
    });

    let user = this.data.getUser();
    let name = user.getUsername();
    this.schedules = this.data.getSchedulesAsBetas().filter((a:ScheduleBeta) => {
      return a.creator === name;
    }).sort((a:ScheduleBeta,b:ScheduleBeta) => {
      let startA = a.start.format("YYYY-MM-DD");
      let startB = b.start.format("YYYY-MM-DD");
      return startA > startB ? -1 : startA < startB ? 1 : 0;
    });

    this.sites = this.data.getData('sites')
    // .filter((a:Jobsite) => {
    //   return a.site_active;
    // })
    .sort((a: Jobsite, b: Jobsite) => {
      let an = a.sort_number;
      let bn = b.sort_number;
      return an < bn ? -1 : an > bn ? 1 : 0;
    });
    let techs = this.data.getData('employees');
    this.allTechs = techs.slice(0).sort(_techSort);
    this.techs = techs.filter(_techFilter);
    this.shiftTypes = this.data.getConfigData('rotations');
    this.shiftHeaders = this.data.getConfigData('rotations');
    // this.clients = this.data.getConfigData('clients');
    this.clients = _dedupe(this.sites.map((a:Jobsite) => a.client));

    if(this.navParams.get('schedule') !== undefined) { this.schedule = this.navParams.get('schedule');} else { this.schedule = this.schedules[0]; }
    Log.l("Scheduling: Setting this.schedule to:\n", this.schedule);

    let startDate = this.data.getScheduleStartDate().startOf('day');
    let endDate = moment(startDate).add(6, 'days');
    this.schedulebeta = this.schedulebeta || new ScheduleBeta('week', this.schedule.getCreator(), startDate, endDate);
    this.schedulebeta.schedule = this.schedule.getSchedule();
    this.convertOldSchedule(this.schedule);

    this.start = this.schedulebeta.getStartDate();
    this.end   = this.schedulebeta.getEndDate();
    this.dateStart  = moment(this.start).toDate();
    this.dateEnd    = moment(this.end).toDate();
    this.strDateEnd = moment(this.dateEnd).format("DD MMM YYYY");
    this.oldStartDate = moment(this.start);

    this.minDate = moment().startOf('day').toDate();

    let spinnerID = this.alert.showSpinner('Retrieving scheduling data...');

    this.shiftCount  = this.shiftTypes.length;
    this.siteCount   = this.sites.length;
    this.techCount   = this.techs.length;
    this.sd = new Map();

    // this.tmpSlots    = [];
    this.dragOngoing = false;

    let schedule:ScheduleBeta = this.schedulebeta;
    if (schedule && schedule.schedule) {
      let tempSchedule = Object.assign({}, schedule);
      Log.l("Scheduling: got Schedule!\n", tempSchedule);
      this.doc = schedule;
      schedule.createSchedulingObject(this.sites, this.techs);
      // Log.l("Scheduling: about to removeUsedTechs()");
      // this.removeUsedTechs();
      Log.l("Scheduling: about to getScheduleStats()");
      this.getScheduleStats();
      // this.schedule = schedule;
      let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
      this.title = `Scheduling Beta (${name})`;
      Log.l("Scheduling: schedule is ready.");
      this.convertOldSchedule(this.schedule);
      this.scheduleReady = true;
      this.alert.hideSpinner(spinnerID);
    } else {
      this.alert.hideSpinner(spinnerID);
      this.scheduleReady = false;
      this.alert.showAlert("PROBLEM", "Could not read schedule.  Please load a new schedule.");
    }
  }

  public openSchedule(id?:string) {
    if(id) {
      this.presentScheduleListModal();
    } else {
      this.presentScheduleListModal();
    }
  }

  public presentScheduleListModal() {
    let listModal = this.modalCtrl.create('Schedule List', { mode: 'beta' }, {cssClass: 'schedule-list-modal'});
    listModal.onDidDismiss(data => {
      Log.l("presentScheduleListModal(): Back from schedule list modal. Data:\n", data);
      if(data) {
        this.schedulebeta = data.schedule;
        // this.shiftsData = this.schedule.schedule;
        this.techs = this.allTechs.filter(_techFilter).sort(_techSort);
        this.schedulebeta.setTechs(this.techs.slice(0));
        this.schedulebeta.createSchedulingObject(this.sites, this.techs);
        this.removeUsedTechs();
        this.start = moment(data.schedule.start);
        this.end   = moment(data.schedule.end);
        this.dateStart = moment(this.start).toDate();
        this.dateEnd    = moment(this.end).toDate();
        this.strDateEnd = moment(this.end).format("DD MMM YYYY");
        this.oldStartDate = moment(this.start);
        let name = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
        this.title = `Scheduling Beta (${name})`;
        this.getScheduleStats();
      } else {

      }
    });
    listModal.present();
  }

  public saveScheduleCustom() {
    let name;
    this.alert.showPrompt("Custom Save", "Enter a custom name for the schedule").then(res => {
      name = res;
      if(name) {
        this.alert.showSpinner(`Saving as ${res}...`);
        let schedule:Schedule = new Schedule();
        // schedule.setSchedule(this.shiftsData);
        schedule.start = moment(this.start);
        schedule.startXL = moment(this.start).toExcel(true);
        schedule.end = moment(this.end);
        schedule.endXL = moment(this.end).toExcel(true);
        let doc = schedule.serialize();
        this.saveScheduleToDatabase(doc, true).then(res => {
          Log.l("saveScheduleCustom(): Successfully saved schedule.");
          this.alert.hideSpinner();
          this.updated = false;
        }).catch(err => {
          Log.l("saveScheduleCustom(): Error saving schedule.");
          Log.e(err);
          this.alert.hideSpinner();
          this.alert.showAlert('ERROR', `Error while saving schedule as ${name}:<br>\n<br>\n` + err.message);
        });
      }
    }).catch(err => {
      Log.l("saveScheduleCustom(): Error getting schedule name.");
      Log.e(err);
    })
  }

  // public persistSchedule(startDate?:any, endDate?:any) {
  //   Log.l("Persisting schedule to CouchDB server...");
  //   this.alert.showSpinner('Saving...');
  //   let doc:any = {}, key = "current";
  //   if (typeof startDate === 'string') {
  //     // key = startDate + "_" + endDate;
  //     key = startDate;
  //   } else if (isMoment(startDate)) {
  //     // key = startDate.format("YYYY-MM-DD") + "_" + endDate.format("YYYY-MM-DD");
  //     key = startDate.format("YYYY-MM-DD");
  //   }
  //   // doc['_id'] = this.doc['_id'] || key;
  //   let user = this.data.getUser();
  //   let name = user.getUsername();
  //   if(name !== 'grumpy' && name !== 'Chorpler') {
  //     doc['_id'] = `${key}_${name}`;
  //   } else {
  //     doc['_id'] = key;
  //   }
  //   if (this.doc['_rev']) {
  //     doc['_rev'] = this.doc['_rev'];
  //   }
  //   doc.start   = moment(this.start).format("YYYY-MM-DD");
  //   doc.startXL = moment(this.start).toExcel(true);
  //   doc.end     = moment(this.end).format("YYYY-MM-DD");
  //   doc.endXL   = moment(this.end).toExcel(true);
  //   doc.creator = name;
  //   doc.type    = 'week';
  //   this.saveScheduleToDatabase(doc, true).then(res => {
  //     Log.l("persistSchedule(): Successfully saved schedule.");
  //     this.alert.hideSpinner();
  //     this.updated = false;
  //   }).catch(err => {
  //     Log.l("persistSchedule(): Error saving schedule.");
  //     Log.e(err);
  //     this.alert.hideSpinner();
  //     this.alert.showAlert('ERROR', 'Error while saving schedule:<br>\n<br>\n' + err);
  //   });
  // }

  // public saveVisibleSchedule(schedule:Schedule) {
  //   // let scheduleDoc =
  // }

  // public saveScheduleToDatabase(doc:any, overwrite?:boolean) {
  //   return new Promise((resolve, reject) => {
  //     let newdoc = this.schedule.serialize();
  //     // let schedule = this.schedule.getSchedule();
  //     // for (let i in schedule) {
  //     //   let siteData = schedule[i];
  //     //   // newdoc[i] = {};
  //     //   for (let j in siteData) {
  //     //     let rotationData:Array<Employee> = siteData[j];
  //     //     let tempData = [];
  //     //     for (let tech of rotationData) {
  //     //       tempData.push(tech.getTechID());
  //     //     }
  //     //     schedule[i][j] = tempData;
  //     //   }
  //     // }
  //     // doc.schedule = schedule;
  //     Log.l("saveScheduleToDatabase(): Schedule to be persisted:\n", newdoc);
  //     // doc['schedule'] = this.shiftsData;
  //     // doc['schedule'] =
  //     // if(overwrite) {
  //       this.server.saveSchedule(newdoc, true).then((res) => {
  //         Log.l("saveScheduleToDatabase(): Shift data persisted.\n", res);
  //         resolve(true);
  //       }).catch((err) => {
  //         Log.l("saveScheduleToDatabase(): Error persisting shift data!");
  //         Log.e(err);
  //         reject(err);
  //       });
  //     // } else {
  //     //   this.server.saveSchedule(doc).then((res) => {
  //     //     Log.l("Shift data persisted.\n", res);
  //     //     resolve(true);
  //     //   //   return this.server.getSchedule();
  //     //   // }).then((doc) => {
  //     //   //   if (doc && doc['schedule']) {
  //     //   //     Log.l("Shift data retrieved, mostly for new _rev value.");
  //     //   //     this.doc = doc;
  //     //   //     resolve(doc);
  //     //   //   }
  //     //   }).catch((err) => {
  //     //     Log.l("Error persisting shift data!");
  //     //     Log.e(err);
  //     //     reject(err);
  //     //   });
  //     // }

  //   });
  // }

  public persistSchedule(startDate?: any, endDate?: any) {
    Log.l("Persisting schedule to CouchDB server...");
    let spinnerID = this.alert.showSpinner('Saving...');
    let doc: any = {}, key = "current";
    if (typeof startDate === 'string') {
      // key = startDate + "_" + endDate;
      key = startDate;
    } else if (isMoment(startDate)) {
      // key = startDate.format("YYYY-MM-DD") + "_" + endDate.format("YYYY-MM-DD");
      key = startDate.format("YYYY-MM-DD");
    }
    // doc['_id'] = this.doc['_id'] || key;
    let user = this.data.getUser();
    let name = user.getUsername();
    if (name !== 'grumpy' && name !== 'Chorpler') {
      doc._id = `${key}_${name}`;
    } else {
      doc._id = key;
    }
    if (this.doc['_rev']) {
      doc['_rev'] = this.doc['_rev'];
    }
    doc.start = moment(this.start).format("YYYY-MM-DD");
    doc.startXL = moment(this.start).toExcel(true);
    doc.end = moment(this.end).format("YYYY-MM-DD");
    doc.endXL = moment(this.end).toExcel(true);
    doc.creator = name;
    doc.type = 'week';
    this.saveScheduleToDatabase(doc, true).then(res => {
      Log.l("persistSchedule(): Successfully saved schedule.");
      this.alert.hideSpinner(spinnerID);
      this.updated = false;
    }).catch(err => {
      Log.l("persistSchedule(): Error saving schedule.");
      Log.e(err);
      this.alert.hideSpinner(spinnerID);
      this.notify.addError('ERROR', `Error while saving schedule: '${err.message}'`, 10000);
      // this.alert.showAlert('ERROR', 'Error while saving schedule:<br>\n<br>\n' + err);
    });
  }

  public saveVisibleSchedule(schedule: Schedule) {
    // let scheduleDoc =
  }

  public saveScheduleToDatabase(doc:any, overwrite?: boolean) {
    return new Promise((resolve, reject) => {
      let newdoc = this.schedulebeta.serialize();
      Log.l("saveScheduleToDatabase(): Schedule to be persisted:\n", newdoc);
      // doc['schedule'] = this.shiftsData;
      // doc['schedule'] =
      // if(overwrite) {
      this.server.saveScheduleBeta(this.schedulebeta).then((res) => {
        Log.l("saveScheduleToDatabase(): Shift data persisted.\n", res);
        resolve(true);
      }).catch((err) => {
        Log.l("saveScheduleToDatabase(): Error persisting shift data!");
        Log.e(err);
        reject(err);
      });
      // } else {
      //   this.server.saveSchedule(doc).then((res) => {
      //     Log.l("Shift data persisted.\n", res);
      //     resolve(true);
      //   //   return this.server.getSchedule();
      //   // }).then((doc) => {
      //   //   if (doc && doc['schedule']) {
      //   //     Log.l("Shift data retrieved, mostly for new _rev value.");
      //   //     this.doc = doc;
      //   //     resolve(doc);
      //   //   }
      //   }).catch((err) => {
      //     Log.l("Error persisting shift data!");
      //     Log.e(err);
      //     reject(err);
      //   });
      // }

    });
  }

  public incrementSchedule(scheduleObject?:any) {
    // let schedule = scheduleObject ? scheduleObject : this.shiftsData;
    let schedule = scheduleObject ? scheduleObject : this.schedule.getSchedule();
    for (let site in schedule) {
      Log.l("Rotating for site '%s':\n", site, schedule[site]);
      let tmpArr                   = schedule[site]["FIRST WEEK"];
      schedule[site]["FIRST WEEK"] = schedule[site]["DAYS OFF"];
      schedule[site]["DAYS OFF"]   = schedule[site]["FINAL WEEK"];
      schedule[site]["FINAL WEEK"] = tmpArr;
    }
    // this.persistSchedule();
    return schedule;
  }

  public removeUsedTechs() {
    // if (this.shiftsData && Object.keys(this.shiftsData)) {
    // if (this.shiftsData && Object.keys(this.shiftsData)) {
    //   for (let site in this.shiftsData) {
    //     for (let shift in this.shiftsData[site]) {
    //       for (let idx in this.shiftsData[site][shift]) {
    //         let name = this.shiftsData[site][shift][idx];
    //         let i = this.techs.findIndex((a:Employee) => {
    //           return a.getTechName() === name;
    //         });

    let schedule = this.schedule.getSchedule();
    if (schedule && Object.keys(schedule)) {
      for (let site in schedule) {
        for (let shift in schedule[site]) {
          for (let idx in schedule[site][shift]) {
            let name = schedule[site][shift][idx];
            let i = this.techs.findIndex((a:Employee) => {
              return a.getTechName() === name;
            });
            // let tmpTech = new Employee();
            // tmpTech.readFromDoc(tech);
            // let techIndex = -1;
            // let i = 0;
            // let techName = tmpTech.toString().toUpperCase();
            // for(let tech2 of this.techs) {
            //   let tech2Name = tech2.toString().toUpperCase();
            //   if(tech2Name === techName) {
            //     techIndex = i;
            //     break;
            //   }
            //   i++;
            // }

            // if (techIndex > -1) {
            //   this.techs.splice(techIndex, 1);
            // }
            let tech;
            if(i > -1) {
              tech = this.techs.splice(i, 1)[0];
              // this.shiftsData[site][shift][idx] = tech;
              schedule[site][shift][idx] = tech;
            } else {
              Log.w(`removeUsedTechs(): Tech '${name}' not found in list!`);
            }
          }
        }
      }
    } else {
      Log.w("removeUsedTechs(): shiftsData is null or has no keys. Can't remove techs.");
    }
  }

  public keys(obj:any) {
    // Log.l("keys(): Now attempting to return Object.keys() for:\n", obj);
    return Object.keys(obj);
  }

  public updateDate() {
    Log.l("updateDate(): No longer used.");
    this.alert.showAlert("WARNING", "You shouldn't be able to see this; changing the date here is no longer supported. Just create a new schedule.");
  }

  public convertOldSchedule(s1:Schedule) {
    let list:Array<any> = [];
    let list2:any = {};
    let sites = this.data.getData('sites').slice(0);
    let schedule;
    if(s1 && s1 instanceof Schedule) {
      schedule = s1.getSchedule();
    } else if(this.schedule && this.schedule.getSchedule() instanceof Schedule) {
      schedule = this.schedule.getSchedule();
    } else {
      Log.w("convertOldSchedule(): Not provided with old-school schedule to convert.");
      return null;
    }
    let beta:ScheduleBeta = this.schedulebeta || new ScheduleBeta();
    // let list:ScheduleBeta = beta.scheduleList || {};
    for(let key1 in schedule) {
      let siteData = schedule[key1];
      let site:Jobsite = sites.find((a:Jobsite) => a.schedule_name.toUpperCase() === key1.toUpperCase());
      for(let key2 in siteData) {
        let rotationData = siteData[key2];
        for(let tech of rotationData) {
          if(tech instanceof Employee) {
            let t:Employee = tech;
            let techName = tech.getUsername();
            let rotation = key2;
            let shift = t.shift || "AM";
            let entry = {
              site: site.site_number,
              rotation: rotation,
              shift: shift
            };
            let entry2 = {
              tech: techName,
              site: site.site_number,
              rotation: rotation,
              shift: shift
            };
            list2[techName] = entry;
            // list[techName] = entry;
            list.push(entry2);
          } else if(typeof tech === 'string') {
            let techName = tech;
            let rotation = key2;
            let shift = "AM";
            let entry = {
              site: site.site_number,
              rotation: rotation,
              shift: shift
            }
            let entry2 = {
              tech: techName,
              site: site.site_number,
              rotation: rotation,
              shift: shift
            }
            // list[tech] = entry;
            list2[techName] = entry;
            list.push(entry2);
            let employee:Employee = this.allTechs.find((a:Employee) => {
              return a.username === tech;
            });
            let i = rotationData.indexOf(tech);
            if(i > -1 && employee) {
              // siteData[key2] = employee;
              rotationData[i] = employee;
            } else {
              Log.w(`convertOldSchedule(): Error converting user '${tech}' to Employee object, or username index was -1!\n`, rotationData);
            }
          } else {
            Log.w(`convertOldSchedule(): Tech was neither an Employee or a string:\n`, tech);
          }
        }
      }
    }
    beta.scheduleList = list;
    beta.scheduleDoc = list2;
    beta.schedule = schedule;
    Log.l("convertOldSchedule(): Output is:\n", list);
    Log.l(beta);
    this.schedulebeta = beta;
    for(let tech of this.schedulebeta.unassigned) {
      this.schedulebeta.addUnassignedTech(tech);
    }
    return list;
  }

  public incrementShift(tech:Employee) {
    // let i = this.schedulebeta.scheduleList.indexOf();
    let name = tech.getUsername();
    let beta = this.schedulebeta || new ScheduleBeta();
    let list = beta.scheduleList;
    let doc = beta.scheduleDoc;
    let entry = doc[name] || {};
    let listEntry = list.find((a) => {
      return a.tech === name;
    });
    let scheduleEntry = listEntry || {tech: name, site: 1, rotation: "UNASSIGNED", shift: "AM"};
    // let entry = scheduleEntry;
    if(listEntry) {
      if(listEntry.shift === 'AM') {
        listEntry.shift = 'PM';
      } else {
        listEntry.shift = 'AM';
      }
    }
    if(entry && Object.keys(entry).length > 0) {
      if(entry.shift === 'AM') {
        entry.shift = 'PM';
      } else {
        entry.shift = 'AM';
      }
    } else {
      let newEntry = {
        tech: name,
        site: 1,
        rotation: "UNASSIGNED",
        shift: "AM"
      };
      entry = newEntry;
      Log.l(`incrementShift('${name}'): Unable to find entry for tech '${name}'! Setting entry to default:\n`, entry);
      doc[name] = entry;
    }
    tech.shift = entry.shift;
    Log.l(`incrementShift('${name}'): List is now:\n`, doc);
    return list;
  }

  public updateEndDate() {
    Log.l("updateEndDate(): End date is now '%s'", moment(this.end).format("YYYY-MM-DD"));
    this.schedule.setEndDate(moment(this.end));

  }

  public newSchedule() {
    let popover = this.popCtrl.create('Schedule New', {}, {cssClass: 'scheduling-new-popover'});
    popover.onDidDismiss(data => {
      Log.l("newSchedule(): Popover dismissed.");
      if(data) {
        Log.l("Data is:\n", data);
        let start = moment(data.date).startOf('day');
        let end = moment(start).add(6,'days');
        let startDate = start.toDate();
        let endDate = end.toDate();
        let user = this.data.getUser();
        let name = user.getUsername();
        let schedule = new Schedule('week', name, start, end);
        // let scheduleDoc = oo.clone(this.shiftsData);
        let scheduleDoc = oo.clone(this.schedule.getSchedule());
        let scheduleObject;
        if(data.action === 'increment') {
          scheduleObject = this.incrementSchedule(scheduleDoc);
        } else if(data.action === 'clear') {
          let sites = this.sites;
          scheduleObject = schedule.createEmptySchedule(sites);
          let techs = this.allTechs.slice(0);
          this.techs = techs.filter(_techFilter).sort(_techSort);
          this.prefs.getConsolePrefs().scheduling.showAllSites = true;
        } else {
          scheduleObject = scheduleDoc;
        }
        schedule.setSchedule(scheduleObject);
        // this.shiftsData = scheduleObject;
        // this.schedule.setSchedule(scheduleObject);
        this.schedule = schedule;
        this.removeUsedTechs();
        this.start = moment(start);
        this.end = moment(end);
        this.dateStart = startDate;
        this.dateEnd = endDate;
        this.strDateEnd = end.format("DD MMM YYYY");
        this.schedule._id = start.format("YYYY-MM-DD");
        this.schedule.techs = this.allTechs.slice(0);
        this.schedule.unassigned = this.techs.slice(0);
        // this.schedule = schedule;
        let scheduleName = this.schedule ? this.schedule.getScheduleTitle() : 'unknown';
        this.title = `Scheduling Beta (${scheduleName})`;
        this.getScheduleStats();
      } else {
        Log.l("newSchedule(): No data returned, user must not want a new schedule after all.");
      }
    });
    popover.present();
  }

  public clearCurrentSchedule() {
    Log.l("clearCurrentSchedule(): Verifying...");
    let popover = this.popCtrl.create('Show Popover', {}, {cssClass: 'video-popover'});
    popover.present();
  }

  public getScheduleStartDate(date?:any) {
    // Schedule starts on day 3 (Wednesday)
    let scheduleStartsOnDay = 3;
    let day = date ? moment(date) : moment();

    if (day.isoWeekday() <= scheduleStartsOnDay) { return day.isoWeekday(scheduleStartsOnDay); }
    else { return day.add(1, 'weeks').isoWeekday(scheduleStartsOnDay); }
  }

  public getScheduleStats() {
    let stats = { CLIENTS: {}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {}, TECHS: {'total': 0, 'working': 0, 'off': 0}, ROTATIONS: {}};
    // let dat = this.shiftsData;
    let tempBeta = new ScheduleBeta();
    // let dat = this.schedulebeta.scheduleList || tempBeta.scheduleList;
    // let schedule = this.schedulebeta.schedule || tempBeta.schedule;
    let dat = this.schedulebeta.scheduleList;
    let schedule = this.schedulebeta.schedule;
    for(let rotation of this.shiftTypes) {
      stats.ROTATIONS[rotation.name] = {total: 0};
      let total = stats.ROTATIONS[rotation.name].total;
      let techs = dat.filter((a:any) => {
        return a.rotation === rotation.name;
      });
      // total += techs.length;
      stats.ROTATIONS[rotation.name].total += techs.length;
      // for(let i in dat) {
      //   let keys = Object.keys(dat[i]);
      //   for(let rotationName of keys) {
      //     if(rotation.name.toUpperCase() === rotationName.toUpperCase()) {
      //       stats.ROTATIONS[rotation.name].total += dat[i][rotationName].length;
      //     }
      //   }
      // }
    }
    for(let client of this.clients) {
      // if(client.name !== 'SE') {
        stats.CLIENTS[client.name] = {'total': 0, 'working': 0, 'off': 0};
      // }
    }
    let techStats = stats.TECHS;
    for(let site of this.sites) {
      // if(site.locID.name !== 'OFFICE') {
        // Log.l("getScheduleStats(): Now processing site:\n", site);
        let sitename = site.schedule_name;
        stats.SITES[sitename] = {'total': 0, 'working': 0, 'off': 0};
      // if(site.client.name !== 'SE') {
        let sitestats = stats.SITES[sitename];
        let clientStats = stats.CLIENTS[site.client.name];
        let shifts = schedule[sitename];
        for(let shiftname in shifts) {
          let shift = shifts[shiftname];
          let sub = shift.length;
          if(shiftname === 'FIRST WEEK' || shiftname === 'CONTN WEEK' || shiftname === 'FINAL WEEK') {
            clientStats.working += sub;
            sitestats.working   += sub;
            techStats.working   += site.locID.name === 'OFFICE' ? 0 : sub;
          } else if(shiftname === 'DAYS OFF') {
            clientStats.off += sub;
            sitestats.off   += sub;
            techStats.off   += site.locID.name === 'OFFICE' ? 0 : sub;
          } else if(shiftname === 'VACATION') {
            stats.VACATION  += sub;
            clientStats.off += sub;
            sitestats.off   += sub;
            techStats.off   += site.locID.name === 'OFFICE' ? 0 : sub;
          }
          sitestats.total   = sitestats.working   + sitestats.off;
          techStats.total   = techStats.working   + techStats.off + stats.VACATION  + this.schedulebeta.unassigned.length;
          clientStats.total = clientStats.working + clientStats.off;
          if(site.locID.name !== 'OFFICE') {
          } else {
            // techStats.total = 0;
          }
        }
    }
    stats.SITES['UNASSIGNED'].total = this.schedulebeta.unassigned.length;
    this.stats = stats;
    Log.l("getScheduleStats(): Overall statistics are: ", stats);
    return stats;
  }

  // public addTech(user: any) {
  //   Log.l("addTech(): called...");
  //   let modal = this.modalCtrl.create('Add Employee', { mode: 'Add', from: 'scheduling'}, { cssClass: 'edit-employee-modal' });
  //   modal.onDidDismiss(data => {
  //     Log.l("editTech(): Edit Employee modal was dismissed.");
  //     if (data) {
  //       Log.l("editTech(): Edit Employee modal returned data:\n", data);
  //       let tech = data.employee;
  //       this.techs.push(tech);
  //       this.techs = this.techs.sort(_techSort);
  //     }
  //   });
  //   modal.present();
  // }

  // public editTech(tech:Employee) {
  //   Log.l("editTech(): Editing tech:\n", tech);
  //   let modal = this.modalCtrl.create('Add Employee', {mode: 'Edit', employee: tech, from:'scheduling'}, {cssClass: 'edit-employee-modal'});
  //   modal.onDidDismiss(data => {
  //     Log.l("editTech(): Edit Employee modal was dismissed.");
  //     if(data) {
  //       Log.l("editTech(): Edit Employee modal returned data:\n", data);
  //       let oldtech = data.employee;
  //       if(data.deleted) {
  //         let i = this.techs.indexOf(oldtech);
  //         if(i > -1) {
  //           Log.l("Tech was deleted, saving as window.tmptech just in case.");
  //           let tmp1 = this.techs.splice(i, 1)[0];
  //           window['tmptech'] = tmp1;
  //         } else {
  //           // let dat = this.shiftsData;
  //           let dat = this.schedule.getSchedule();
  //           let shft = null;
  //           outerloop: for(let sitename of Object.keys(dat)) {
  //             let site = dat[sitename];
  //             for(let shiftname of Object.keys(site)) {
  //               let shift = site[shiftname];
  //               for(let tech of shift) {
  //                 if(oldtech === tech) {
  //                   shft = shift;
  //                   break outerloop;
  //                 }
  //               }
  //             }
  //           }
  //           let j = shft.indexOf(tech);
  //           if(j > -1) {
  //             Log.l("Tech '%s' found and deleted, saving to window.tmptech just in case.", tech.toString());
  //             let tmp1 = shft.splice(j, 1)[0];
  //             window['tmptech'] = tmp1;
  //           } else {
  //             Log.e("Error: deleted tech not found in unassigned or in site shift slots!");
  //           }
  //         }
  //       }
  //     }
  //   });
  //   modal.present();
  // }

  public addTech(event?: any) {
    Log.l("addTech(): called...");
    let tech = new Employee();
    this.mode = "add";
    this.editEmployees = [tech];
    this.employee = tech;
    this.employeeViewVisible = true;
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Add', from: 'scheduling'}, { cssClass: 'edit-employee-modal' });
    // modal.onDidDismiss(data => {
    //   Log.l("editTech(): Edit Employee modal was dismissed.");
    //   if (data) {
    //     Log.l("editTech(): Edit Employee modal returned data:\n", data);
    //     let tech = data.employee;
    //     this.techs.push(tech);
    //     this.techs = this.techs.sort(_techSort);
    //   }
    // });
    // modal.present();
  }

  public editTech(tech: Employee, evt?:any) {
    Log.l("editTech(): Editing tech:\n", tech);
    if(evt && evt.shiftKey) {
      this.incrementShift(tech);
    } else {
      this.mode = "edit";
      this.employee = tech;
      this.editEmployees = [tech];
      this.employeeViewVisible = true;
    }
    // let modal = this.modalCtrl.create('Add Employee', {mode: 'Edit', employee: tech, from:'scheduling'}, {cssClass: 'edit-employee-modal'});
    // modal.onDidDismiss(data => {
    //   Log.l("editTech(): Edit Employee modal was dismissed.");
    //   if(data) {
    //     Log.l("editTech(): Edit Employee modal returned data:\n", data);
    //     let oldtech = data.employee;
    //     if(data.deleted) {
    //       let i = this.techs.indexOf(oldtech);
    //       if(i > -1) {
    //         Log.l("Tech was deleted, saving as window.tmptech just in case.");
    //         let tmp1 = this.techs.splice(i, 1)[0];
    //         window['tmptech'] = tmp1;
    //       } else {
    //         // let dat = this.shiftsData;
    //         let dat = this.schedule.getSchedule();
    //         let shft = null;
    //         outerloop: for(let sitename of Object.keys(dat)) {
    //           let site = dat[sitename];
    //           for(let shiftname of Object.keys(site)) {
    //             let shift = site[shiftname];
    //             for(let tech of shift) {
    //               if(oldtech === tech) {
    //                 shft = shift;
    //                 break outerloop;
    //               }
    //             }
    //           }
    //         }
    //         let j = shft.indexOf(tech);
    //         if(j > -1) {
    //           Log.l("Tech '%s' found and deleted, saving to window.tmptech just in case.", tech.toString());
    //           let tmp1 = shft.splice(j, 1)[0];
    //           window['tmptech'] = tmp1;
    //         } else {
    //           Log.e("Error: deleted tech not found in unassigned or in site shift slots!");
    //         }
    //       }
    //     }
    //   }
    // });
    // modal.present();
  }

  public employeeUpdated(event?: any) {
    Log.l("employeeUpdated(): Event is:\n", event);
    this.employeeViewVisible = false;
    let tech = event.employee;
    let type = event.type;
    let name = tech.username;
    if (type === 'delete') {
      let oldtech = tech;
      let i = this.schedulebeta.unassigned.indexOf(oldtech);
      if (i > -1) {
        Log.l("Tech was deleted, saving as window.tmptech just in case.");
        let tmp1 = this.schedulebeta.unassigned.splice(i, 1)[0];
        window['tmptech'] = tmp1;
        this.schedulebeta.removeTech(tech);
        this.notify.addSuccess("SUCCESS", "Tech deleted successfully.", 3000);
      } else {
        // let dat = this.shiftsData;
        let dat = this.schedule.getSchedule();
        let shft = null;
        outerloop: for (let sitename of Object.keys(dat)) {
          let site = dat[sitename];
          for (let shiftname of Object.keys(site)) {
            let shift = site[shiftname];
            for (let tech of shift) {
              if (oldtech === tech) {
                shft = shift;
                break outerloop;
              }
            }
          }
        }
        let j = shft.indexOf(tech);
        if (j > -1) {
          Log.l("Tech '%s' found and deleted, saving to window.tmptech just in case.", tech.toString());
          let tmp1 = shft.splice(j, 1)[0];
          this.schedulebeta.removeTech(tech);
          window['tmptech'] = tmp1;
          this.notify.addSuccess("SUCCESS", "Tech deleted successfully.", 3000);
        } else {
          Log.e("Error: deleted tech not found in unassigned or in site shift slots!");
          this.notify.addWarn("WARNING", "Deleted tech was not found in unassigned list or in any slot of this schedule!", 6000);
        }
      }
    } else if (type === 'add') {
      this.techs.push(tech);
      this.techs = this.techs.sort(_techSort);
      this.notify.addSuccess("SUCCESS", "New tech added to unassigned list.", 3000);
    }
  }

  public employeeCanceled(event?: any) {
    Log.l("employeeCanceled(): Event is:\n", event);
    this.employeeViewVisible = false;
  }

  public employeeDeleted(event?:any) {
    Log.l("employeeDeleted(): Event is:\n", event);
    this.employeeViewVisible = false;
  }

  public getShiftSymbol(tech:Employee) {
    let shift = tech.shift;
    if(shift === 'AM') {
      return "☀";
    } else {
      return "☽";
    }
  }

  public modelChanged(event:any) {
    Log.l("modelChanged(): Event was: ", event);
  }

  public techDragged(event:any) {
    Log.l("techDragged(): Tech successfully dragged. Updating count. Event: ", event);
    // this.countTechTotals();
  }

  public techDropped(event:any) {
    Log.l("techDropped(): Tech successfully dropped. Updating count. Event: ", event);
    let tech:Employee = event;
    let js = null, shft = null;
    // this.countTechTotals();
    this.updated = true;
    let unassignedSite = this.sites.find((a:Jobsite) => {
      return a.client.name === 'XX';
    });
    let user = this.data.getUser();
    let name = user.getUsername();
    if (this.data.status.persistTechChanges || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike') {
      let i = this.schedulebeta.unassigned.indexOf(tech);
      if(i > -1) {
        Log.l("techDropped(): Tech %s found in unassigned pool.", tech.toString());
        // this.schedule.addUnassignedTech(tech);
        this.updateTechSettings(tech, unassignedSite, { name: 'UNASSIGNED', fullName: 'Unassigned' });
        let entry:any = {site: 1, rotation: "UNASSIGNED", shift: "AM" };
        this.schedulebeta.addUnassignedTech(tech);
      } else {
        // this.schedulebeta.removeUnassignedTech(tech);
        // this.schedulebeta.addTech(tech);
        outerloop: for(let site of this.sites) {
          for(let shift of this.shiftTypes) {
            // let slot = this.shiftsData[site.schedule_name][shift.name];
            let schedule = this.schedulebeta.schedule;
            let slot = schedule[site.schedule_name][shift.name];
            let j = slot.indexOf(tech);
            if(j > -1) {
              Log.l("techDropped(): Tech %s found in %s.%s", tech.toString(), site.getSiteName(), shift.name);
              js = site;
              shft = shift;
              break outerloop;
            }
          }
        }
        // Log.l("techDropped(): Updating tech client, location, locID, loc2nd, shift, shiftLength, and shiftStartTime...");
        Log.l("techDropped(): Updating tech client, location, locID, shift, shiftLength, and shiftStartTime...");
        let entry: any = { site: js.site_number, rotation: shft.name, shift: tech.shift };
        this.schedulebeta.add(tech, entry);
        this.updateTechSettings(tech, js, shft);
      }
    }
    this.getScheduleStats();
  }

  public techDroppedInto(event:any) {
    Log.l("techDroppedInto(): Tech dropped into container successfully, event is: ", event)
    let slot = event[0];
    let tech = event[1];
    this.updated = true;
    // this.countTechTotals();
    let unassignedSite = this.sites.find((a:Jobsite) => {
      return a.client.name === 'XX';
    });
    // this.getScheduleStats();
    let user = this.data.getUser();
    let name = user.getUsername();
    let techName = tech.getUsername();
    if (this.data.status.persistTechChanges || name === 'grumpy' || name === 'Chorpler' || name === 'Hachero' || name === 'mike') {
      if(slot === this.schedulebeta.unassigned) {
        Log.l("techDroppedInto(): Tech %s dropped into unassigned pool.", tech.toString());
        // this.schedule.addUnassignedTech(tech);
        // let record = this.schedulebeta.scheduleDoc[techName];
        // record.site = unassignedSite.site_number;
        // record.rotation = "UNASSIGNED";
        // record.shift = "AM";
        this.schedulebeta.addUnassignedTech(tech);
        this.updateTechSettings(tech, unassignedSite, {name:'UNASSIGNED', fullName: 'Unassigned'});
      } else {
        // Log.l("techDroppedInto(): Drop slot was not unassigned, looking for slot...");
        let js = null;
        let shft = null;
        let schedule = this.schedule.getSchedule();
        this.schedulebeta.removeUnassignedTech(tech);
        this.schedulebeta.addTech(tech);
        outerloop:
        for(let site of this.sites) {
          for(let shift of this.shiftTypes) {
            // let sSlot = this.shiftsData[site.schedule_name][shift.name];
            let sSlot = schedule[site.schedule_name][shift.name];
            // Log.l("techDroppedInto(): Now looking at site.shift: %s.%s", site.schedule_name, shift.name);
            if(slot === sSlot) {
              Log.l("techDroppedInto(): Tech was dropped into jobsite '%s' for '%s'.", site.schedule_name, shift.name, tech);
              js = site;
              shft = shift;
              break outerloop;
            }
          }
        }
        // Log.l("techDroppedInto(): Updating tech client, location, locID, loc2nd, shift, shiftLength, and shiftStartTime...");
        Log.l("techDroppedInto(): Updating tech client, location, locID, shift, shiftLength, and shiftStartTime...");
        let entry:any = { site: js.site_number, rotation: shft.name, shift: tech.shift };
        this.schedulebeta.add(tech, entry);
        this.updateTechSettings(tech, js, shft);
      }
    }
    this.getScheduleStats();
  }

  public updateTechSettings(tech:Employee, site:Jobsite, shiftType:any) {
    Log.l("updateTechSettings(): Now updating tech '%s' in shift type, jobsite: ", tech, shiftType, site);
    let type = shiftType.name;
    let doc;
    if(!shiftType || type === 'UNASSIGNED') {
      tech.rotation = "UNASSIGNED";
      doc = Object.assign({}, tech);
      if (!doc['_id']) {
        doc['_id'] = `org.couchdb.user:${tech.avatarName}`;
      }
      tech.client      = ""   ;
      tech.location    = ""   ;
      tech.locID       = ""   ;
      // tech.loc2nd      = ""   ;
      tech.shift       = "AM" ;
      tech.shiftLength = 0    ;

    } else {
      tech.client      = site.client.fullName.toUpperCase()                              ;
      tech.location    = site.location.fullName.toUpperCase()                            ;
      tech.locID       = site.locID.name.toUpperCase()                                   ;
      // let loc2         = site.loc2nd && site.loc2nd.name ? site.loc2nd.name.toUpperCase(): "NA" ;
      // tech.loc2nd      = loc2                                                            ;
      let ampm         = tech.shift                                                      ;
      let hours        = site.hoursList[type][ampm][0]                                   ;
      let rotation     = type                                                            ;
      tech.shiftLength = hours                                                           ;
      tech.rotation    = rotation                                                        ;

      doc = Object.assign({}, tech);

      if(!doc['_id']) {
        doc['_id'] = `org.couchdb.user:${tech.avatarName}`;
      }
    }
    this.server.updateEmployee(doc).then(res => {
      Log.l("updateTechSettings(): Successfully saved employee: ", res, tech);
    }).catch(err => {
      Log.l("updateTechSettings(): Error saving tech settings for tech:\n", tech);
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving technician's new location. Please try again.");
    });
  }

  public editSite(site:Jobsite) {
    // this.alert.showAlert("SORRY", "Clicking here was going to allow you to edit the job site, but this feature is not implemented yet. Actually, it's only being implemented while Mike isn't watching. He said it was a stupid idea and I was stupid for thinking of it. And trust me, you don't want to mess with that guy. I saw him try to chop up a cat with a gate. <span class='alert-icons'>😨😿</span>");
    let modal = this.modalCtrl.create('Add Work Site', { mode: 'Edit', source: 'scheduling', jobsite: site }, {cssClass: 'site-edit-modal'});
    modal.onDidDismiss(data => {
      Log.l("editSite(): Modal dismissed.");
      if(data) {
        Log.l("editSite(): Data:\n", data);
      }
    });
    modal.present();
  }

  public createCSV() {
    Log.l("createCSV(): Now starting process of exporting tech schedule....");
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let out = [];
    for(let site of this.sites) {
      let siteData = dat[site.schedule_name];
      for(let rotation in site.getShiftRotations()) {
        let shiftData = siteData[rotation];
      }
    }
  }

  public createPDF() {
    // let dd = {content: ["This is a quick test."]};
    let dd = this.generateDesignDocument();
    Log.l("createPDF(): Now attempting to create PDF from design document: ", dd);
    this.pdf.createPDF(dd);
    Log.l("createPDF(): Now attempting to show PDF...");
    this.pdf.openPDF();
  }

  public generateDesignDocument() {
    let dd = {content: [], styles: {}, defaultStyle: {}};
    let defaultMargin = [0,0,0,0];
    let headerMargin = [120,0,0,0];
    let defaultHeight = 10;
    let smallHeight = 10;
    let headerFontSize = 14;
    let dateFontSize = 12;
    let sitesDataFontSize = 10;
    let colWidths = ['*', 25, '*', 25, '*', 25, '*', 25];
    let defaultStyle = {alignment: 'left', margin: defaultMargin, color: 'black', fontSize: 14, bold:true};
    let styles = {
      LABEL:       { bold: true, alignment: 'right', margin: [0,0,5,0], color: 'black', fontSize: sitesDataFontSize },
      DATA :       { bold: true, alignment: 'left', margin:  [0,0,0,0], color: 'black', fontSize: sitesDataFontSize },
      DATEHDR:     { bold: true, alignment: 'left', margin:  [0,10,0,10], color: 'black', fontSize: headerFontSize },
      TECHHDR:     { bold: true, alignment: 'right', margin: [0,0,5,0], color: 'black', fontSize: sitesDataFontSize },
      TECHDATA:    { bold: true, alignment: 'right', margin: [0,0,0,0], color: 'black', fontSize: sitesDataFontSize },
      DATE:        { bold: true, alignment: 'center', fontSize: dateFontSize, color: colors.fg.date, fillColor: colors.bg.date },
      DATEDIVIDER: { bold: true, alignment: 'center', fontSize: dateFontSize, color: 'black' },
      DIVIDER:     { bold: true, margin: [0, 5, 0, 5]},
    };
    for(let client of this.clients) {
      styles[client.name]           = { bold: true, color: colors.fg[client.name], fontSize: sitesDataFontSize };
      styles[client.name + 'CELL']  = { bold: true, color: 'black', fillColor: colors.bg[client.name], margin: headerMargin, alignment: 'left', fontSize: headerFontSize};
      styles[client.name + 'HDR']   = { bold: true, color: colors.fg[client.name], margin: [0,0,10,0], alignment: 'right', fontSize: sitesDataFontSize};
      styles[client.name + 'DATA']  = { bold: true, color: colors.fg[client.name], margin: [0,0,0,0], alignment: 'right', fontSize: sitesDataFontSize};
    }
    let getRowHeight = function(i) {
      // let style = node.table.body[i][0].style;
      Log.l("getRowHeight(): params are: ", i);
      return 14;
      // if(style.indexOf('HDR') > -1) {
      //   return 14;
      // } else {
      //   return 14;
      // }
    };
    // dd['styles'] = styles;
    dd.styles = styles;
    dd.defaultStyle = defaultStyle;
    let table = [
      [{style: 'DATEHDR'     , colSpan: 8        , text: 'this.start.format("DD MMM YYYY")' + ' through ' + this.end.format("DD MMM YYYY") }, {}, {}, {}, {}, {}, {}, {}] ,
    ];

    // Reminder of what this.stats looks like:
    // let stats = { CLIENTS: {${client.name}: {total:0, working:0, off:0}}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {${site.schedule_name}: {total:0,working:0,off:0}}, TECHS: { 'total': 0, 'working': 0, 'off': 0 } };
    let grid = [];
    let row = [{}];
    for(let client of this.clients) {
      if(client.name==='SE') {
        continue;
      }
      let name = client.fullName;
      let stat = this.stats.CLIENTS[client.name];
      let headCell   = [{style: client.name + 'CELL', colSpan: 2, text: name.toUpperCase() }, {}];
      let totalRow   = [{style: 'LABEL', bold: true, text: 'Total'   }, {style: 'DATA', text: stat.total  }];
      let workingRow = [{style: 'LABEL', bold: true, text: 'Working' }, {style: 'DATA', text: stat.working}];
      let daysOffRow = [{style: 'LABEL', bold: true, text: 'Days Off'}, {style: 'DATA', text: stat.off    }];
      table = [...table, headCell, totalRow, workingRow, daysOffRow];
    }
    table.push([{text: '', colSpan: 2, style: 'DIVIDER'}, {}]);
    for(let site of this.sites) {
      if(site.client.name==='SE') {
        continue;
      }
      let name = site.schedule_name;
      let cli  = site.client.name;
      let stat = this.stats.SITES[name];
      let totalRow = [{style: cli + 'HDR', text: name}, {style: cli + 'DATA', text: stat.total}];
      table = [...table, totalRow];
    }
    let techTotalRow      = [ { style: 'TECHHDR', bold: true, text: 'Total Techs'      } , { style: 'TECHDATA', text: this.stats.TECHS.total   } ] ;
    let techWorkingRow    = [ { style: 'TECHHDR', bold: true, text: 'Techs Working'    } , { style: 'TECHDATA', text: this.stats.TECHS.working } ] ;
    let techDaysOffRow    = [ { style: 'TECHHDR', bold: true, text: 'Techs Days Off'   } , { style: 'TECHDATA', text: this.stats.TECHS.off     } ] ;
    let sesaTotalRow      = [ { style: 'SEHDR'  , bold: true, text: 'SESA HQ'          } , { style: 'SEDATA'  , text: this.stats.SESA.total    } ] ;
    let techUnassignedRow = [ { style: 'TECHHDR', bold: true, text: 'Techs Unassigned' } , { style: 'TECHDATA', text: this.techs.length        } ] ;
    table = [...table, techTotalRow, techWorkingRow, techDaysOffRow, sesaTotalRow, techUnassignedRow];
    // let table1 = {style: 'scheduleTable', table: {widths: colWidths, height: function(i) { return 14;}, body: table}};
    let table1 = {style: 'scheduleTable', table: {widths: colWidths, body: table}, layout: 'noBorders'};
    dd.content.push(table1);
    window['onsitedesigndocument'] = dd;
    Log.l("generateDesignDocument(): Returning:\n", dd);
    return dd;
  }

  public showOptions() {
  //   let params = { cssClass: 'popover-options-show', showBackdrop: true, enableBackdropDismiss: true };
  //   this.alert.showPopoverWithData('Show Options', { }, params).then(res => {
  //     Log.l("showOptions(): User returned options:\n", res);
  //   }).catch(err => {
  //     Log.l("showoptions(): Error showing options popover!");
  //     Log.e(err);
  //   });
    this.optionsVisible = true;
  }

  public mikePayrollData() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Schedule Summary', {data: data, csv: csv});
  }

  public createExportData() {
    // let dat = this.shiftsData;
    let dat = this.schedule.getSchedule();
    let overall = [];
    let i = 0, j = 0;
    let header = [
      "ScheduleID",
      "RotSeq",
      "TechRotation",
      "TechShift",
      "JobSiteOnSchedule",
      "Client",
      "TechLocation",
      "TechLocID",
      "TechOnSchedule"
    ];

    let start_date = moment(this.start).startOf('day');
    for(let i = 0; i < 7; i++) {
      let schedule_date = moment(start_date).add(i, 'day');
      header.push(schedule_date.format("MMM DD"));
    }
    for(let tech of this.allTechs) {
      let shift = null, js = null;
      // let row = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
      let row = [];
      let shiftTime = tech.shift;
      let unassigned = true;
      loop01: for (let site of this.sites) {
        let siteData = dat[site.schedule_name];
        let idx = 0;
        // if(idx % 5 === 0) { Log.l("Comparing tech '%s' and slot '%s'", tech.getFullName(), site.schedule_name);}
        for (let siteShift of this.shiftTypes) {
          let slotData = siteData[siteShift.name];
          for (let scheduledTech of slotData) {
            // if(idx++ % 10 === 0) { Log.l("Comparing tech '%s' and slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);}
            // if(scheduledTech.lastName[0].toUpperCase() === tech.lastName[0].toUpperCase()) {
              // Log.l("Comparing tech '%s' and tech '%s' in slot '%s.%s'", tech.getFullName(), scheduledTech.getFullName(), site.schedule_name, siteShift.name);
            if (tech.avatarName === scheduledTech.avatarName) {
              Log.l("Found tech '%s' in slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);
              js = site;
              shift = siteShift;
              unassigned = false;
              break loop01;
            } else {
              // Log.l("No match.")
            }
            // }
          }
        }
      }
      // loop02:
      // for(let site of this.sites) {
      //   if (tech.client.toUpperCase() === site.client.name.toUpperCase() || tech.client === site.client.fullName.toUpperCase()) {
      //     Log.l("Found jobsite match with tech '%s' at jobsite '%s'", tech.getFullName(), site.getShortID());
      //     js = site;
      //     unassigned = false;
      //     break loop02;
      //   }
      // }
      if(!unassigned) {
        Log.l("Tech not unassigned!");
        row.push(js.getShortID());
        row.push(this.getRotSeq(shift.name));
        row.push(shift.name);
        row.push(this.getTechShift(shiftTime));
        row.push(js.schedule_name);
        row.push(js.client.name);
        row.push(js.location.name);
        row.push(js.locID.name);
        row.push(tech.getFullName());
        let list = js.getHoursList(shift.name, shiftTime);
        for(let i = 0; i < 7; i++) {
          row.push(list[i]);
        }
      } else {
        Log.l("Tech unassigned! ☹");
        row.push("");
        row.push('X');
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push("");
        row.push(tech.getFullName());
        // let list = js.getHoursList(shift.name, shiftTime);
        for(let i = 0; i < 7; i++) {
          row.push("");
        }
      }
      overall.push(row);
    }
    return {header: header, rows: overall};
  }

  public getRotSeq(shift:string) {
    if(shift.toUpperCase().trim() === 'FIRST WEEK') {
      return 'A';
    } else if(shift.toUpperCase().trim() === 'CONTN WEEK') {
      return 'B';
    } else if(shift.toUpperCase().trim() === 'FINAL WEEK') {
      return 'C';
    } else if(shift.toUpperCase().trim() === 'DAYS OFF') {
      return 'D';
    } else if(shift.toUpperCase().trim() === 'VACATION') {
      return 'V';
    } else {
      return 'X';
    }
  }

  public getTechShift(shiftTime:string) {
    if(shiftTime.toUpperCase().trim() === 'AM') {
      return '☼';
    } else {
      return '☽';
    }
  }

  public cancel() {
    Log.l("Modal canceled.");
  }

  public toCSV(header:Array<any>, table:Array<Array<any>>) {
    let html = "";
    let i = 0, j = 0;
    for(let hdr of header) {
      if(j++ === 0) {
        html += hdr;
      } else {
        html += "\t" + hdr;
      }
    }
    html += "\n";
    for(let row of table) {
      j = 0;
      for(let cell of row) {
        if(j++ === 0) {
          html += cell;
        } else {
          html += "\t" + cell;
        }
      }
      html += "\n";
    }
    return html;
  }

  public setButtonLocation(value:number) {
    this.buttonLocation = value;
  }

  public printSchedule(evt?: any) {
    let schedule = this.schedule;
    let stats = this.stats;
    let event = evt ? evt : undefined;
    // if(event && event.shiftKey) {
    //   Log.l("printSchedule(): called with event:\n", event);
    //   this.navCtrl.push("Schedule Print Beta", {schedule:schedule, stats:stats});
    // } else {
    //   Log.l("printSchedule(): no event parameter used.");
    //   this.navCtrl.push("Schedule Print", {schedule:schedule});
    // }
    this.navCtrl.push("Schedule Print Beta", { schedule: schedule, stats: stats });
  }


  public optionsClosed(event?: any) {
    this.optionsVisible = false;
    Log.l("optionsClosed(): Event is:\n", event);
  }

  public optionsSaved(event?: any) {
    this.optionsVisible = false;
    Log.l("optionsSaved(): Event is:\n", event);
    let prefs = this.prefs.getPrefs();
    this.appComponent.savePreferences(prefs).then(res => {
      this.notify.addSuccess("SUCCESS", "Preferences saved.", 3000);
      this.getScheduleStats();
    }).catch(err => {
      Log.l("optionsSaved(): Error saving options!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving preferences: '${err.message}'`, 10000);
    })
  }

  public videoEnded(event?: any) {
    Log.l("videoEnded(): Event is:\n", event);
    this.videoVisible = false;
  }



}