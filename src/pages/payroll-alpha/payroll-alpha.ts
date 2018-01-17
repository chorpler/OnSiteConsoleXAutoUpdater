import { sprintf                                                                 } from 'sprintf-js'                                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef,            } from '@angular/core'                              ;
import { ApplicationRef, ChangeDetectorRef, ChangeDetectionStrategy              } from '@angular/core'                              ;
import { IonicPage, NavController, NavParams, ModalController, ViewController    } from 'ionic-angular'                              ;
import { ServerService                                                           } from '../../providers/server-service'             ;
import { DBService                                                               } from '../../providers/db-service'                 ;
import { AuthService                                                             } from '../../providers/auth-service'               ;
import { AlertService                                                            } from '../../providers/alert-service'              ;
import { Log, Moment, moment, _matchCLL, _matchSite                              } from '../../config/config.functions'              ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, } from '../../domain/domain-classes'                ;
import { OSData                                                                  } from '../../providers/data-service'               ;
import { Preferences                                                             } from '../../providers/preferences'                ;
import { PDFService                                                              } from '../../providers/pdf-service'                ;
import { OptionsComponent                                                        } from '../../components/options/options'           ;
import { SelectItem, MenuItem                                                    } from 'primeng/primeng'                            ;
import { Command, KeyCommandService                                              } from '../../providers/key-command-service'        ;
import { Subscription                                                            } from 'rxjs/Subscription'                          ;
import { NotifyService                                                           } from '../../providers/notify-service'             ;
import { NotificationComponent                                                   } from '../../components/notification/notification' ;

@IonicPage({ name: 'Payroll Alpha' })
@Component({
  selector: 'page-payroll-alpha',
  templateUrl: 'payroll-alpha.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollAlphaPage implements OnInit,OnDestroy {
  @ViewChild('ionContent') content:ElementRef         ;
  public title    : string               = "Payroll"  ;
  public static PREFS:any = new Preferences()         ;
  public get prefs():any { return PayrollAlphaPage.PREFS;} ;
  public keySubscription:Subscription                 ;
  public employees: Array<Employee>      = []         ;
  public reports  : Array<Report>        = []         ;
  public others   : Array<ReportOther>   = []         ;
  public periods  : Array<PayrollPeriod> = []         ;
  public sites    : Array<Jobsite>       = []         ;
  public schedules: Array<Schedule>      = []         ;
  public schedule : Schedule                          ;
  public period   : PayrollPeriod                     ;
  public eReports : Map<Employee,Array<Report>>       ;
  public eOthers  : Map<Employee,Array<ReportOther>>  ;
  public eShifts  : Map<Employee,Array<Shift>>        ;
  public ePeriods : Map<Employee,Array<PayrollPeriod>>;
  public eSchedule: Map<Employee,Schedule>            ;
  public eReport  : Map<Employee,Report>              ;
  public eOther   : Map<Employee,ReportOther>         ;
  public eShift   : Map<Employee,Shift>               ;
  public ePeriod  : Map<Employee,PayrollPeriod>       ;
  public eSite    : Map<Employee,Jobsite>             ;
  public allData  : any = {employees: [], reports: [], others: [], periods: [], sites: [] };
  public eRot     : Map<Employee,string> = new Map()  ;
  public periodList: SelectItem[]        = []         ;
  public payrollGridData:Array<any>      = []         ;
  public loading  : any                               ;
  public moment   : any                  = moment     ;
  public sprintf  : any                  = sprintf    ;
  public dataReady: boolean              = false      ;
  constructor(
    public application   : ApplicationRef,
    public changeDetector: ChangeDetectorRef,
    public zone          : NgZone,
    public navCtrl       : NavController,
    public navParams     : NavParams,
    public data          : OSData,
    public db            : DBService,
    public server        : ServerService,
    public alert         : AlertService,
    public modalCtrl     : ModalController,
    public keyService    : KeyCommandService,
    public notify        : NotifyService,
  ) {
    window['onsitepayroll'] = this;
    // window['_sortReports'] = _sortReports;
  }

  ngOnInit() {
    Log.l("PayrollAlphaPage: ngOnInit() called");
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "PayrollAlphaPage.showOptions"      : this.showOptions(); break;
      }
    });
    this.data.appReady().then(res => {
      Log.l("PayrollAlphaPage: App is ready, now running...");
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("PayrollAlphaPage: ngOnDestroy() called");
    // this.changeDetector.detach();
    this.updateView('detach');
    this.keySubscription.unsubscribe();
  }

  public runWhenReady() {
    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    this.setupInterface();
    this.setupData();
  }

  public updateView(param?:string) {
    let action:string = param || 'update';
    let cd:any = this.changeDetector;
    let viewDead:boolean = cd.destroyed;
    if(!viewDead) {
      if(param === 'update') {
        this.changeDetector.detectChanges();
      } else if(param === 'detach') {
        this.changeDetector.detach();
      } else {
        this.changeDetector.detectChanges();
      }
    }
  }

  public setupInterface() {
    this.initializePayrollPeriodsMenu();
  }

  public setupData() {
    this.generatePayrollData().then(res => {
      Log.l("setupData(): Generated payroll data.");
      this.dataReady = true;
      this.updateView();
      // this.changeDetector.detectChanges();
    }).catch(err => {
      Log.l("generatePayrollData(): Error while generating payroll data!");
      Log.e(err);
      let errTxt = "Error while generating payroll data:<br>\n<br>\n" + err.message;
      this.notify.addMessage("ERROR", errTxt, 'error', -1);
    });
  }

  public initializePayrollPeriodsMenu() {
    let periods = this.data.createPayrollPeriods();
    let selectitems:SelectItem[] = [];
    for(let period of periods) {
      let name = period.getPeriodName("DD MMM");
      let item:SelectItem = { label: name, value: period };
      selectitems.push(item);
    }
    this.periods    = periods     ;
    this.period     = periods[0]  ;
    this.periodList = selectitems ;
  }

  public generatePayrollData() {
    return new Promise((resolve,reject) => {
      let _sortTechs = (a:Employee, b:Employee) => {
        let cliA = this.data.getFullClient(a.client);
        let cliB = this.data.getFullClient(b.client);
        let locA = this.data.getFullLocation(a.location);
        let locB = this.data.getFullLocation(b.location);
        let lidA = this.data.getFullLocID(a.locID);
        let lidB = this.data.getFullLocID(b.locID);
        let usrA = a.getTechName();
        let usrB = b.getTechName();
        !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
        !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
        !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
        !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
        !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
        !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
        cliA = cliA ? cliA : 0;
        cliB = cliB ? cliB : 0;
        locA = locA ? locA : 0;
        locB = locB ? locB : 0;
        lidA = lidA ? lidA : 0;
        lidB = lidB ? lidB : 0;
        let rotA = a.rotation;
        let rotB = b.rotation;
        let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
        let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
        return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
      }
      let _sortReports = (a:Report, b:Report) => {
        return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
      };

      window['_sortTechs']   = _sortTechs;
      window['_sortReports'] = _sortReports;
      this.allData.employees = this.data.employees.slice(0) ;
      this.allData.reports   = this.data.reports.slice(0)   ;
      this.allData.others    = this.data.others.slice(0)    ;
      this.allData.periods   = this.data.periods.slice(0)   ;
      this.allData.sites     = this.data.sites.slice(0)     ;
      // this.allData.schedules = this.data.schedules.clone()  ;
      this.allData.schedules = this.data.getSchedules().slice(0) ;

      this.employees = this.allData.employees.filter((obj, pos, arr) => {
        return obj['active'] === true && obj['client'] && obj['location'] && obj['locID'] && obj['roles'][0].toLowerCase() !== 'manager' && obj['userClass'][0].toLowerCase() !== 'manager';
      });

      this.employees = this.employees.sort(_sortTechs);
      this.reports   = this.allData.reports.sort(_sortReports);
      this.others    = this.allData.others.sort(_sortReports);
      this.sites     = this.allData.sites.slice(0);
      this.schedules = this.allData.schedules.sort((a: Schedule, b: Schedule) => {
        return a.startXL < b.startXL ? 1 : a.startXL > b.startXL ? -1 : 0;
      });
      this.schedule = this.schedules.filter((obj: Schedule) => {
        return obj.start.format("YYYY-MM-DD") === this.period.start_date.format("YYYY-MM-DD");
      })[0];
      this.eReports = new Map() ;
      this.eOthers  = new Map() ;
      this.eShifts  = new Map() ;
      this.ePeriods = new Map() ;
      this.eReport  = new Map() ;
      this.eOther   = new Map() ;
      this.eShift   = new Map() ;
      this.ePeriod  = new Map() ;

      this.updatePeriodPromise(this.period).then(res =>   {
        resolve(res);
      }).catch(err => {
        Log.l("generatePayrollData(): Error while generating payroll data!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public generatePayrollDatagrid() {
    let ep = this.ePeriod;
    for(let entry of ep) {
      let tech = entry[0];
      let period = entry[1];

    }
  }

  // public createTieredMenu() {
  //   let menu:MenuItem[] = [];
  //   for(let period of this.periods) {
  //     let label = period.start_date.format("MMM DD YYYY") + " — " + period.end_date.format("MMM DD YYYY");
  //     let value = period;
  //     let shifts = period.getPayrollShifts();
  //     let item:MenuItem = {'label': label, 'items': []};
  //     for(let shift of shifts) {
  //       let date = shift.getShiftDate();
  //       let strDate = date.format("MMM DD YYYY");
  //       let subitem:MenuItem = {'label': strDate, 'command': (event) => {
  //         this.chooseShift(shift, period);
  //       }};
  //       // let subitem:MenuItem = {'label': strDate, 'command': (event) => { this.chooseShift(event)}};
  //       item.items.push(subitem);
  //     }
  //     menu.push(item);
  //   }
  //   let toggler = {'label': "Toggle Detail Mode", 'command': (event) => {
  //     this.toggleDetailMode();
  //   }};
  //   menu.push(toggler);
  //   toggler = {'label': 'Toggle Calculation Mode', 'command': (event) => {
  //     this.toggleCalculationMode();
  //   }};
  //   menu.push(toggler);
  //   this.menuItems = menu;
  // }

  public updatePeriod(period:PayrollPeriod) {
    let text = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
    this.loading = this.alert.showSpinner(text);
    this.changePeriod(period).then(res => {
      return this.alert.hideSpinnerPromise();
    }).then(res => {
      Log.l("updatePeriod(): Successfully updated, now running change detection...");
      this.updateView();
      Log.l("updatePeriod(): Successfully updatd and ran change detection!");
    }).catch(err => {
      Log.l("updatePeriod(): Error while updating period!");
      Log.e(err);
      let errText = "Error while attempting to update payroll period:<br/>\n<br/>\n" + err.message;
      this.notify.addError("ERROR", errText, -1);
      // this.alert.showAlert("ERROR", "Error while attempting to update payroll period:<br/>\n<br/>\n" + err.message);
    });
  }

  public updatePeriodPromise(period:PayrollPeriod) {
    return new Promise((resolve,reject) => {
      let text = sprintf("Setting period to '%s' — '%s'...", period.start_date.format("DD MMM, YYYY"), period.end_date.format("DD MMM, YYYY"));
      this.loading = this.alert.showSpinner(text);
      this.changePeriod(period).then(res => {
        return this.alert.hideSpinnerPromise();
      }).then(res => {
        Log.l("updatePeriodPromise(): Successfully updated, now running change detection...");
        this.updateView();
        Log.l("updatePeriodPromise(): Successfully updated and ran change detection!");
        resolve("Success!");
      }).catch(err => {
        Log.l("updatePeriodPromise(): Error while updating period!");
        Log.e(err);
        reject(err);
        // this.alert.showAlert("ERROR", errText);
      });
    });
  }

  public changePeriod(period:PayrollPeriod) {
    return new Promise((resolve,reject) => {
      try {
        this.periodChanged(period);
        resolve("updatePeriodPromise(): Successfully updated period.");
      } catch(err) {
        Log.l("updatePeriodPromise(): Error while updating period!");
        Log.e(err);
        reject(err);
      }
    });
  }

  public periodChanged(period:PayrollPeriod) {
    let date  = moment(period.start_date);
    let start = moment(date).format("YYYY-MM-DD");
    let end   = moment(start).add(6, 'days').format("YYYY-MM-DD");
    let sites = this.sites;

    this.reports = this.allData.reports.filter((obj, pos, arr) => {
      let report_date = obj['report_date'];
      return report_date >= start && report_date <= end;
    });
    this.others = this.allData.others.filter((obj, pos, arr) => {
      let report_date = obj['report_date'].format("YYYY-MM-DD");
      return report_date >= start && report_date <= end;
    });

    let schedule = this.schedules.find(a => {
      let date = moment(period.start_date).format("YYYY-MM-DD");
      return a.start.format("YYYY-MM-DD") === date;
    });
    let pDate = moment(period.start_date);
    this.eRot = new Map();
    for(let tech of this.employees) {
      let rotation = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq   = this.data.getRotationSequence(rotation);
      this.eRot.set(tech, rotSeq);
    }
    this.schedule = schedule;
    // let a = schedule.schedule;
    // let techSite;
    // let siteNames = Object.keys(a);
    // for (let name of siteNames) {
    //   let rotations = Object.keys(a[name]);
    //   for (let rotation of rotations) {
    //     let techs = a[name][rotation];
    //     let techSite = techs.find(b => { return b.username === 'Aj'; });
    //   }
    // }
    // this.loading.setContent(text + "<br>\nReading employee reports...");
    for(let tech of this.employees) {
      // if(tech.client && tech.client.full)
      let date = moment(period.start_date);
      let techPeriod = this.data.createPeriodForTech(tech, date);
      let shifts = techPeriod.getPayrollShifts();
      for (let shift of shifts) {
        let shiftDate = shift.getShiftDate().format("YYYY-MM-DD");
        let reports = this.reports.filter((obj, pos, arr) => {
          return obj['report_date'] === shiftDate && obj['username'] === tech.username;
        });
        let others = this.others.filter((obj, pos, arr) => {
          let otherDate = obj['report_date'].format("YYYY-MM-DD");
          return otherDate === shiftDate && obj['username'] === tech.username;
        });
        shift.setShiftReports([]);
        shift.setOtherReports([]);
        for (let report of reports) {
          shift.addShiftReport(report);
        }
        for(let other of others) {
          shift.addOtherReport(other);
        }
      }
      this.ePeriod.set(tech, techPeriod);
      let techPeriodSummary = new Map();
      let standby  = 0;
      let training = 0;
      let travel   = 0;
      let holiday  = 0;
      let vacation = 0;
      let sick     = 0;
      for(let shift of shifts) {
        standby  += shift.getSpecialHours('Standby').hours  ;
        training += shift.getSpecialHours('Training').hours ;
        travel   += shift.getSpecialHours('Travel').hours   ;
        holiday  += shift.getSpecialHours('Holiday').hours  ;
        vacation += shift.getSpecialHours('Vacation').hours ;
        sick     += shift.getSpecialHours('Sick').hours     ;
      }
    }
  }

  public viewTechReports(period:PayrollPeriod, tech:Employee) {
    Log.l(`viewTechReports(): Now showing reports for '${tech.getUsername()}' for period '${period.getPayrollSerial()}'...`);
    let modal = this.modalCtrl.create('Shift Reports', {tech:tech, period:period}, {cssClass: 'shift-reports-modal'});
    modal.onDidDismiss(data => {
      Log.l("All Period Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    this.dataReady = false;
    modal.present();
  }

  public showTech(tech:Employee) {
    Log.l("showTech(): Now viewing tech:\n", tech);
    let modal = this.modalCtrl.create('Add Employee', { mode: 'Edit', employee: tech }, { cssClass: 'edit-employee-modal' });
    modal.onDidDismiss(data => {
      Log.l("Edit Employee modal: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    this.dataReady = false;
    modal.present();
  }

  public viewShift(shift:Shift, tech:Employee) {
    Log.l("viewShift(): Now viewing shift for tech:\n", shift);
    Log.l(tech);
    let modal = this.modalCtrl.create('Shift Reports', {tech:tech, shift:shift}, {cssClass: 'shift-reports-modal'});
    modal.onDidDismiss(data => {
      Log.l("Shift Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    this.dataReady = false;
    modal.present();
  }

  public showPeriodOtherReports(tech:Employee, period:PayrollPeriod) {
    Log.l("showPeriodOtherReports(): Now viewing period for tech:\n", period);
    Log.l(tech);
    let modal = this.modalCtrl.create('Period Reports', {tech:tech, period:period}, {cssClass: 'period-reports-modal'});
    modal.onDidDismiss(data => {
      Log.l("Period Reports: dismissed.");
      if(data) {
        Log.l("data is:\n", data);
      }
      this.dataReady = true;
      this.updateView();
    });
    this.dataReady = false;
    modal.present();
  }

  public exportForPayroll() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Export', { grid: data, csv: csv });
  }

  public exportForInvoicing() {
    let data = this.createInvoiceExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Export', { grid: data, csv: csv });
  }

  public createInvoiceExportData():any {
    let outer = [];
    let overall = [];
    let i = 0, j = 0;

    let header = [
      "#",
      "CLNT",
      "LOC",
      "LocID",
      "Tech",
      "Shift#",
      "WeekDay",
      "Day",
      "Month",
      "Year",
      "Hrs",
      "WO#",
      "Unit",
      "Notes",
      "(blank)",
      "Date",
      "Payroll#",
      "TS",
    ];
    let date = moment(this.period.start_date);
    for(let tech of this.employees) {
      let techPeriod = this.ePeriod.get(tech);
      let shifts = techPeriod.getPayrollShifts();
      let rotation = this.data.getTechRotationForDate(tech, date);
      let rotSeq   = this.data.getRotationSequence(rotation);
      // let row = [];
      // let cli = this.data.getFull('client', tech.client).name;
      // let loc = this.data.getFull('location', tech.location).name;
      // let lid = this.data.getFull('locID', tech.locID).name;
      let usr = tech.getFullName();
      for(let shift of shifts) {
        let reports = shift.getShiftReports();
        let psn = shift.getPayrollPeriod();
        // let ssn = shift.getShiftSerial();
        let ssn = shift.getShiftNumber();
        for(let report of reports) {
          let row = [];
          let cli = this.data.getFull('client', report.client).name;
          let loc = this.data.getFull('location', report.location).name;
          let lid = this.data.getFull('locID', report.location_id).name;
          // let cli = report.client;
          // let loc = report.location;
          // let lid = report.location_id;
          // row = [++i, cli, loc, lid, usr];
          row = [rotSeq, cli, loc, lid, usr];
          row.push(ssn);
          let date = moment(report.report_date, "YYYY-MM-DD");
          let xl   = date.toExcel();
          row.push(xl);
          row.push(xl);
          row.push(xl);
          row.push(xl);
          row.push(report.getRepairHours());
          row.push(report.work_order_number);
          row.push(report.unit_number);
          row.push(report.notes);
          row.push("   |   ");
          row.push(xl);
          row.push(psn);
          row.push(report.timestamp);
          outer.push(row);
        }
      }
    }
    let grid = outer.sort((a,b) => {
      let less = -1;
      let grtr = 1;
      return a[0] < b[0] ? less : a[0] > b[0] ? grtr : a[1] < b[1] ? less : a[1] > b[1] ? grtr : a[2] < b[2] ? less : a[2] > b[2] ? grtr : a[3] < b[3] ? less : a[3] > b[3] ? grtr : a[4] < b[4] ? less : a[4] > b[4] ? grtr : a[12] < b[12] ? less : a[12] > b[12] ? grtr : 0;
    });
    let output = { header: header, rows: grid };
    Log.l("createInvoiceExportData(): Final data is:\n", output);
    return output;
  }

  public createExportData() {
    let outer = [];
    let overall = [];
    let i = 0, j = 0;

    let header = [
      "#",
      "CLNT",
      "LOC",
      "LocID",
      "Tech",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "OWED($)",
      "OWED(Hrs)",
      "STBY",
      "TRNG",
      "TRVL",
      "NOTES",
      "HOLI",
      "VACN",
      "SICK",
    ];
    let pDate = moment(this.period.start_date);
    i = 5;
    for(let shift of this.period.getPayrollShifts()) {
      let momentDate = moment(shift.getShiftDate());
      let date = String(momentDate.toExcel(true));
      // let date = shift.getShiftDate().format("ddd DD");
      header[i++] = date;
    }
    for(let tech of this.employees) {
      let rotation = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq   = this.data.getRotationSequence(rotation);
      let techPeriod = this.ePeriod.get(tech);
      let shifts = techPeriod.getPayrollShifts();
      let row = [];
      let site:Jobsite = this.data.getTechLocationForDate(tech, pDate);
      // let cli = this.data.getFull('client', tech.client).name;
      // let loc = this.data.getFull('location', tech.location).name;
      // let lid = this.data.getFull('locID', tech.locID).name;
      let cli = site.client.name;
      let loc = site.location.name;
      let lid = site.locID.name;
      let usr = tech.getFullName();
      row = [rotSeq, cli, loc, lid, usr];
      for(let shift of shifts) {
        let code = shift.getShiftCode();
        if(rotSeq === 'D') {
          if(code === '0' || code === 0) {
            code = 'OFF';
          }
        } else if(rotSeq == 'X') {
          if(code === '0' || code === 0) {
            code = 'UA';
          }
        }
        row.push(code);
      }
      row.push("");
      row.push("");
      let periodTotal = techPeriod.getPayrollPeriodTotal();

      row.push(periodTotal.Standby);
      row.push(periodTotal.Training);
      row.push(periodTotal.Travel);
      row.push("");
      row.push(periodTotal.Holiday);
      row.push(periodTotal.Vacation);
      row.push(periodTotal.Sick);
      outer.push(row);
    }
    return { header: header, rows: outer };
  }

  public toCSV(header: Array<any>, table: Array<Array<any>>) {
    let html = "";
    let i = 0, j = 0;
    for (let hdr of header) {
      if (j++ === 0) {
        html += hdr;
      } else {
        html += "\t" + hdr;
      }
    }
    html += "\n";
    for (let row of table) {
      j = 0;
      for (let cell of row) {
        if (j++ === 0) {
          html += cell;
        } else {
          html += "\t" + cell;
        }
      }
      html += "\n";
    }
    return html;
  }

  public showOptions(event?:any) {
    let params = { cssClass: 'popover-options-show', showBackdrop: true, enableBackdropDismiss: true};
    this.alert.showPopoverWithData('Payroll Options', { }, params).then(res => {
      Log.l("showOptions(): User returned options:\n", res);
    }).catch(err => {
      Log.l("showoptions(): Error showing payroll options popover!");
      Log.e(err);
    });
  }

  public readReports(period:PayrollPeriod) {
    // return new Promise((resolve,reject) => {
    let date = moment(period.start_date);
    this.alert.showSpinner(`readReports(): Reading reports for week '${date.format("DD MMM YYYY")}'...`);
    // let reports = this.data.getData('reports');
    // if(!reports.length) {
      this.db.getAllReportsPlusNew(date).then(res => {
        Log.l("readReports(): Read in:\n", res);
        this.reports = res;
        this.data.setData('reports', res);
        this.updatePeriod(period);
        this.alert.hideSpinner();
        // resolve("readReports(): All done.");
      }).catch(err => {
        Log.l("readReports(): Error reading reports for PayrollPeriod.");
        Log.e(err);
        this.alert.hideSpinner();
        this.alert.showAlert("ERROR", "Error reading reports for payroll period:<br>\n<br>\n" + err.message).then(res => {
          // reject(err);
        });
      });
    // } else {
    //   // resolve("readReports(): Reports already done.");
    //   this.reports = reports;
    //   this.runWhenReady();
    //   this.alert.hideSpinner();
    // }
    // });
  }

}

