import { Subscription                                                 } from 'rxjs/Subscription'         ;
import { Log, Moment, moment, isMoment                                } from 'config/config.functions'   ;
import { _matchCLL, _matchSite, _matchReportSite,                     } from 'config/config.functions'   ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef  } from '@angular/core'             ;
import { IonicPage, NavController, NavParams                          } from 'ionic-angular'             ;
import { ModalController                                              } from 'ionic-angular'             ;
import { PayrollPeriod, Report, ReportOther, Shift, Jobsite, Employee } from 'domain/domain-classes'     ;
import { OSData                                                       } from 'providers/data-service'    ;
import { DBService                                                    } from 'providers/db-service'      ;
import { ServerService                                                } from 'providers/server-service'  ;
import { AlertService                                                 } from 'providers/alert-service'   ;
import { Preferences                                                  } from 'providers/preferences'     ;
import { NotifyService                                                } from 'providers/notify-service'  ;
import { SpinnerService                                               } from 'providers/spinner-service' ;
import { DataTable, Calendar,                                         } from 'primeng/primeng'           ;

@IonicPage({name: 'Work Reports'})
@Component({
  selector: 'page-reports',
  templateUrl: 'reports.html',
})
export class ReportsPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt:DataTable;
  @ViewChild('globalSearch') gSearch:ElementRef;
  @ViewChild('dateFrom') dateFrom:Calendar;
  @ViewChild('dateTo') dateTo:Calendar;
  public title         : string    = "Work Reports" ;
  public pageSizeOptions:number[]  = [50,100,200,500,1000,2000];
  public prefsSub      : Subscription               ;
  public report        : Report                     ;
  public tech          : Employee                   ;
  public techs         : Employee[]         = []    ;
  public site          : Jobsite                    ;
  public sites         : Jobsite[]          = []    ;
  public editReports   : Array<Report>      = []    ;
  public reports       : Array<Report>      = []    ;
  public others        : Array<ReportOther> = []    ;
  public allReports    : Array<Report>      = []    ;
  public allOthers     : Array<ReportOther> = []    ;
  public selectedReport: Report             = null  ;
  public reportViewVisible:boolean          = false ;
  public globalSearch  : string             = ""    ;
  public fromDate      : string             = ""    ;
  public toDate        : string             = ""    ;
  public cols          : Array<any>         = []    ;
  public styleColIndex : any                        ;
  public styleColEdit  : any                        ;
  public dataReady     : boolean            = false ;
  public static PREFS     : any           = new Preferences()                 ;
  public get prefs()      : any { return ReportsPage.PREFS; }               ;
  public get rowCount()   : number { return this.prefs.CONSOLE.pages.reports; };
  public set rowCount(val:number) { this.prefs.CONSOLE.pages.reports = val; };

  constructor(
              public navCtrl  : NavController,
              public navParams: NavParams,
              public db       : DBService,
              public server   : ServerService,
              public alert    : AlertService,
              public modalCtrl: ModalController,
              public data     : OSData,
              public notify   : NotifyService,
              public spinner  : SpinnerService,
  ) {
    window['onsitereports'] = this;
  }

  ngOnInit() {
    Log.l('ReportsPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("ReportsPage: ngOnDestroy() fired");
    if(this.prefsSub && !this.prefsSub.closed) {
      this.prefsSub.unsubscribe();
    }
  }

  public runWhenReady() {
    this.styleColEdit = {'max-width':'40px', 'width': '40px', 'padding': '0px'};
    this.styleColIndex = {'max-width':'50px', 'width': '50px'};
    let reports = this.data.getData('reports');
    this.sites = this.data.getData('sites');
    this.techs = this.data.getData('employees');

    this.initializeSubscriptions();
    this.updatePageSizes();

    if(reports.length) {
      Log.l("Reports: using existing work order data.");
      this.cols = this.getFields();
      this.allReports = reports;
      this.reports = this.allReports.slice(0);
      this.others = this.data.getData('others');
      this.dataReady = true;
    } else {
      this.getData().then(res => {
        this.cols = this.getFields();
        this.dataReady = true;
      });
    }
  }

  public initializeSubscriptions() {

  }

  public updatePageSizes() {
    let newPageSizes = this.prefs.CONSOLE.pageSizes.reports;
    let rowCount = Number(this.prefs.CONSOLE.pages.reports);
    if(newPageSizes.indexOf(rowCount) === -1) {
      newPageSizes.push(rowCount);
      this.pageSizeOptions = newPageSizes.slice(0).sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
      this.rowCount = rowCount;
    } else {
      this.pageSizeOptions = newPageSizes.slice(0);
      this.rowCount = rowCount;
    }
  }

  public getFields() {
    let fields = [];
    fields.push({ field: '_id'              , header: 'ID'          , filter: true, filterPlaceholder: "ID"} );
    fields.push({ field: 'report_date'      , header: 'Date'        , filter: true, filterPlaceholder: "Date"} );
    fields.push({ field: 'timestamp'        , header: "Timestamp"   , filter: true, filterPlaceholder: "Timestamp"} );
    fields.push({ field: 'last_name'        , header: 'Last Name'   , filter: true, filterPlaceholder: "Last Name"} );
    fields.push({ field: 'first_name'       , header: 'First Name'  , filter: true, filterPlaceholder: "First Name"} );
    fields.push({ field: 'time_start'       , header: 'Start'       , filter: true, filterPlaceholder: "Start"} );
    fields.push({ field: 'time_end'         , header: 'End'         , filter: true, filterPlaceholder: "End"} );
    fields.push({ field: 'repair_hours'     , header: 'Repair Hours', filter: true, filterPlaceholder: "Repair Hours"} );
    fields.push({ field: 'client'           , header: 'Client'      , filter: true, filterPlaceholder: "Client"} );
    fields.push({ field: 'location'         , header: 'Location'    , filter: true, filterPlaceholder: "Location"} );
    fields.push({ field: 'location_id'      , header: 'LocID'       , filter: true, filterPlaceholder: "LocID"} );
    fields.push({ field: 'unit_number'      , header: 'Unit #'      , filter: true, filterPlaceholder: "Unit #"} );
    fields.push({ field: 'work_order_number', header: 'Work Order #', filter: true, filterPlaceholder: "Work Order #"} );
    fields.push({ field: 'notes'            , header: 'Notes'       , filter: true, filterPlaceholder: "Notes"} );
    return fields;
  }

  // public getData() {
  //   return new Promise((resolve, reject) => {
  //     let spinnerID = this.alert.showSpinner("Retrieving reports...");
  //     this.db.getAllReportsPlusNew().then((res:Array<Report>) => {
  //       Log.l("getData(): Got reports:\n", res);
  //       this.allReports = res;
  //       this.data.setData('reports', res.slice(0));
  //       this.reports = this.allReports.slice(0);
  //       return this.db.getOtherReports();
  //     }).then(res => {
  //       this.others = res;
  //       this.alert.hideSpinner(spinnerID);
  //       resolve(res);
  //     }).catch(err => {
  //       Log.l("getData(): Error getting reports list!");
  //       Log.e(err);
  //       this.alert.hideSpinner(spinnerID);
  //       reject(err);
  //     });
  //   });
  // }

  public async getData() {
    try {
      let res:Array<Report> = await this.db.getAllReportsPlusNew();
      Log.l("getData(): Got reports:\n", res);
      this.allReports = res;
      this.data.setData('reports', res.slice(0));
      this.reports = this.allReports.slice(0);
      return this.reports;
    } catch (err) {
      Log.l(`getData(): Error downloading reports.`);
      Log.e(err);
      throw new Error(err);
    }
  }

  public async refreshData(event?:any) {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of work reports...", 3000);
      let res1 = await this.getData();
      this.notify.addSuccess("SUCCESS!", `Downloaded ${res1.length} reports.`, 3000);
      let res2 = await this.downloadOldReports();
      return this.reports;
    } catch(err) {
      Log.l(`refreshData(): Error downloading reports.`);
      Log.e(err);
      this.notify.addError("ERROR", `Error refreshing reports: '${err.message}'`, 10000);
    }
  }

  // public async downloadOldReports(event?:any) {
  //   try {
  //     this.notify.addInfo("RETRIEVING", "Starting download of old reports...", 3000);
  //     let res = await this.getOldReports();
  //     let len = res.length;
  //     this.notify.addSuccess("SUCCESS!", `Downloaded ${len} old reports.`, 3000);
  //   } catch(err) {
  //     Log.l(`downloadOldReports(): Error refreshing data!`);
  //     Log.e(err);
  //     this.notify.addError("ERROR", `Error downloading old reports: '${err.message}'`, 10000);
  //   }
  // }

  public async loadOldReports(event?: any) {
    Log.l("loadOldReports() clicked.");
    this.notify.addInfo("RETRIEVING", `Downloading old reports...`, 3000);
    try {
      // let res = await this.db.getOldReports();
      let res = await this.server.getOldReports();0
      let allReports = this.reports.concat(res);
      this.data.setData('oldreports', res);
      let len = res.length;
      this.notify.addSuccess("SUCCESS", `Loadeded ${len} old reports.`, 3000);
      return res;
    } catch (err) {
      Log.l(`loadOldReports(): Error loading reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error loading old reports: '${err.message}'`, 10000);
    }
  }

  public async downloadOldReports(event?:any) {
    try {
      this.notify.addInfo("RETRIEVING", "Starting download of old reports...", 3000);
      Log.l("downloadOldReports(): Retrieving old reports...");
      // let res:Report[] = await this.db.getOldReports();
      let res:Report[] = await this.server.getOldReports();
      Log.l("downloadOldReports(): Success!");

      this.data.setData('oldreports', res);
      for(let report of res) {
        this.reports.push(report);
      }
      let allReports = this.reports.sort((a:Report,b:Report) => {
        let dA = a.report_date;
        let dB = b.report_date;
        let lA = a.last_name;
        let lB = b.last_name;
        let fA = a.first_name;
        let fB = b.first_name;
        return dA > dB ? -1 : dA < dB ? -1 : lA > lB ? 1 : lA < lB ? -1 : fA > fB ? 1 : fA < fB ? -1 : 0;
      });
      this.reports = allReports;
      this.allReports = allReports;
      let len = res.length;
      Log.l(`downloadOldReports(): Done downloading ${len} old reports.`);;
      this.notify.addSuccess("SUCCESS!", `Downloaded ${len} old reports.`, 3000);
      return res;
    } catch(err) {
      Log.l(`downloadOldReports(): Error while getting old reports!`);
      Log.e(err);
      this.notify.addError("ERROR", `Error downloading old reports: '${err.message}'`, 10000);
    }
  }

  // public async getOldReports(event?:any) {
  //   try {
  //     Log.l("getOldReports(): Retrieving old reports...");
  //     let res:Report[] = await this.db.getOldReports();
  //     this.data.setData('oldreports', res);
  //     for(let report of res) {
  //       this.reports.push(report);
  //     }
  //     let allReports = this.reports.sort((a:Report,b:Report) => {
  //       let dA = a.report_date;
  //       let dB = b.report_date;
  //       let lA = a.last_name;
  //       let lB = b.last_name;
  //       let fA = a.first_name;
  //       let fB = b.first_name;
  //       return dA > dB ? -1 : dA < dB ? -1 : lA > lB ? 1 : lA < lB ? -1 : fA > fB ? 1 : fA < fB ? -1 : 0;
  //     });
  //     this.reports = allReports;
  //     this.allReports = allReports;
  //     let len = res.length;
  //     Log.l(`getOldReports(): Done downloading ${len} old reports.`);;
  //     return res;
  //   } catch(err) {
  //     Log.l(`getOldReports(): Error while getting old reports!`);
  //     Log.e(err);
  //     throw new Error(err);
  //   }
  // }

  public onRowSelect(event:any) {
    Log.l("onRowSelect(): Event passed is:\n", event);
    this.showReport(event.data);
  }

  public updateFromDate(event:any) {
    Log.l("updateFromDate(): Event passed is:\n", event);
    let fromDate = "1900-01-01";
    let toDate   = "9999-12-31";
    if(this.fromDate) {
      fromDate = moment(this.fromDate).format("YYYY-MM-DD");
    }
    if(this.toDate) {
      toDate = moment(this.toDate).format("YYYY-MM-DD");
    }

    Log.l(`updateFromDate(): Now filtering from ${fromDate} - ${toDate}...`);
    this.reports = this.allReports.filter(a => {
      return a.report_date >= fromDate && a.report_date <= toDate;
    });
    // this.reports = new Array<Report>();
    // for(let report of this.allReports) {
    //   if(report.report_date >= fromDate && report.report_date <= toDate) {
    //     this.reports.push(report);
    //   }
    // }
  }

  public updateToDate(event:any) {
    let fromDate = "1900-01-01";
    let toDate = "9999-12-31";
    if(this.fromDate) {
      fromDate = moment(this.fromDate).format("YYYY-MM-DD");
    }
    if(this.toDate) {
      toDate = moment(this.toDate).format("YYYY-MM-DD");
    }
    Log.l(`updateToDate(): Now filtering from ${fromDate} - ${toDate}...`);
    this.reports = this.allReports.filter((a:Report) => {
      return a.report_date >= fromDate && a.report_date <= toDate;
    });
    // this.reports = new Array<Report>();
    // Log.l(`updateToDate(): Now filtering from ${fromDate} - ${toDate}...`);
    // for (let report of this.allReports) {
    //   if(report.report_date >= fromDate && report.report_date <= toDate) {
    //     this.reports.push(report);
    //   }
    // }
  }

  public showReport(report:Report, event?:any) {
    let reportList = this.dt.hasFilter() ? this.dt.filteredValue : this.dt.value;
    let site = this.sites.find((a:Jobsite) => {
      return _matchReportSite(report, a);
    });
    if(!site) {
      this.notify.addWarn("SITE ERROR", "Could not determine what work site this report is for!", 6000);
      return;
    }
    let tech = this.techs.find((a:Employee) => {
      return _matchSite(a, site);
    });
    if(!tech) {
      this.notify.addWarn("TECH ERROR", "Could not determine what tech created this report!", 6000);
      return
    }
    // let data:any = {
    //   report: report,
    // }
    // if(reportList) {
    //   data.reports = reportList;
    // } else {
    //   data.reports = this.reports;
    // }
    // let showReportPage = this.modalCtrl.create("View Work Report", data);
    // showReportPage.onDidDismiss(data => { });
    // showReportPage.present();
    this.site        = site;
    this.tech        = tech;
    this.editReports = reportList;
    this.report      = report;
    this.reportViewVisible = true;
  }

  public exportWorkReportsForPayroll() {
    let data = this.createExportData();
    let csv = this.toCSV(data.header, data.rows);
    this.navCtrl.push('Payroll Work Reports', { data: data, csv: csv });
  }

  public createExportData() {
    let dat = this.reports;
    let overall = [];
    let i = 0, j = 0;
    //    ScheduleID	RotSeq	TechRotation	TechShift	JobSiteOnSchedule	Client	TechLocation	TechLocID	TechOnSchedule	Jun 28	Jun 29	Jun 30	Jul 01	Jul 02	Jul 03	Jul 04
    let header = [
      "Period",
      "Type",
      "Training",
      "Date",
      "Timestamp",
      "Last Name",
      "First Name",
      "Start Time",
      "End Time",
      "Hours",
      "Client",
      "Location",
      "LocID",
      "Unit",
      "Work Order",
      "Notes",
    ];

    // let now = moment();
    let now = moment("2017-10-17");
    // let start = this.data.getScheduleStartDate(now).subtract(7, 'days');
    // let end = moment(start).add(6, 'days');
    // let start = this.fromDate ? moment(this.fromDate) : moment("1900-01-01", "YYYY-MM-DD");
    // let end   = this.toDate ? moment(this.toDate) : moment("9999-12-31", "YYYY-MM-DD");
    let start = this.fromDate ? moment(this.fromDate) : now.isoWeekday() === 2 ? this.data.getScheduleStartDate(now) : this.data.getScheduleStartDate(moment(now).subtract(7, 'days'));
    let end   = this.toDate   ? moment(this.toDate)   : moment(start).add(6, 'days');
    let strStart = start.format("YYYY-MM-DD");
    let strEnd   = end.format("YYYY-MM-DD");
    let period = new PayrollPeriod(start, end);
    period.getPayrollShifts();
    Log.l(`createExportData(): start is '${strStart}', end is '${strEnd}', and period is:\n`, period);
    let reports = this.allReports.filter((a:Report) => {
      let date = a.report_date;
      return date >= strStart && date <= strEnd;
    }).sort((a:Report,b:Report) => {
      let dA=a.report_date, dB=b.report_date;
      let tA=a.time_start, tB=b.time_start;
      return dA > dB ? 1 : dA < dB ? -1 : tA > tB ? 1 : tA < tB ? -1 : 0;
    });
    Log.l("createExportData(): Reports for export is:\n", reports);

    let grid = [];
    // grid[0] = header;
    let keys = ['payroll_period', 'type', 'training_type', 'report_date', 'timestamp', 'last_name', 'first_name', 'time_start', 'time_end', 'repair_hours', 'client', 'location', 'location_id', 'unit_number', 'work_order_number', 'notes'];
    let others = this.others.filter((a:ReportOther) => {
      let date = a.report_date.format("YYYY-MM-DD");
      return date >= strStart && date <= strEnd;
    }).sort((a,b) => {
      let dA=a.report_date.format("YYYY-MM-DD"), dB=b.report_date.format("YYYY-MM-DD");
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    let allreports = [...reports, ...others];
    Log.l("createExportData(): showreports is now:\n", allreports);
    let showreports = allreports.filter((a:Report|ReportOther) => {
      // let date = obj['report_date'];
      // return date >= strStart && date <= strEnd;
      let lname = a.last_name, fname = a.first_name;
      return !((lname === 'Bates' && fname === 'Michael') || (lname === 'Sargeant' && fname === 'David') || (fname === 'Cecilio' && lname === 'Jauregui'));
    }).sort((a:Report|ReportOther, b:Report|ReportOther) => {
      let dA = a.report_date;
      let dB = b.report_date;
      dA = isMoment(dA) ? dA.format("YYYY-MM-DD") : dA;
      dB = isMoment(dB) ? dB.format("YYYY-MM-DD") : dB;
      return dA > dB ? 1 : dA < dB ? -1 : 0;
    });
    Log.l("createExportData(): showreports is now:\n", showreports);
    for(let report of showreports) {
      let row = [];
      for(let key of keys) {
        if(!report[key]) {
          if(key === 'type') {
            row.push("Work Report");
          } else if(key === 'training_type') {
            row.push("");
          } else {
            row.push("");
          }
        } else if(key === 'timestamp') {
          let ts = report[key], time;
          if(typeof ts === 'number') {
            time = moment.fromExcel(ts);
          } else {
            time = moment(ts);
          }
          row.push(time.toExcel());
          // let ts = moment(report[key]);

        } else if(key === 'report_date') {
          if(report instanceof Report) {
            row.push(report[key]);
          } else if(report instanceof ReportOther) {
            row.push(report[key].format("YYYY-MM-DD"));
          }
        } else {
          row.push(report[key]);
        }
      }
      grid.push(row);
    }

    // let html = this.toCSV(header, grid);

    // return html;
    let output = {header: header, rows: grid};
    Log.l("createExportData(): Output is:\n", output);
    return output;


    // let start_date = moment(this.start).startOf('day');
    // for (let i = 0; i < 7; i++) {
    //   let schedule_date = moment(start_date).add(i, 'day');
    //   header.push(schedule_date.format("MMM DD"));
    // }
    // for (let tech of this.allTechs) {
    //   let shift = null, js = null;
    //   // let row = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
    //   let row = [];
    //   let shiftTime = tech.shift;
    //   let unassigned = true;
    //   loop01: for (let site of this.sites) {
    //     let siteData = dat[site.schedule_name];
    //     let idx = 0;
    //     // if(idx % 5 === 0) { Log.l("Comparing tech '%s' and slot '%s'", tech.getFullName(), site.schedule_name);}
    //     for (let siteShift of this.shiftTypes) {
    //       let slotData = siteData[siteShift.name];
    //       for (let scheduledTech of slotData) {
    //         // if(idx++ % 10 === 0) { Log.l("Comparing tech '%s' and slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);}
    //         // if(scheduledTech.lastName[0].toUpperCase() === tech.lastName[0].toUpperCase()) {
    //         // Log.l("Comparing tech '%s' and tech '%s' in slot '%s.%s'", tech.getFullName(), scheduledTech.getFullName(), site.schedule_name, siteShift.name);
    //         if (tech.avatarName === scheduledTech.avatarName) {
    //           Log.l("Found tech '%s' in slot '%s.%s'", tech.getFullName(), site.schedule_name, siteShift.name);
    //           js = site;
    //           shift = siteShift;
    //           unassigned = false;
    //           break loop01;
    //         } else {
    //           // Log.l("No match.")
    //         }
    //         // }
    //       }
    //     }
    //   }
    //   // loop02:
    //   // for(let site of this.sites) {
    //   //   if (tech.client.toUpperCase() === site.client.name.toUpperCase() || tech.client === site.client.fullName.toUpperCase()) {
    //   //     Log.l("Found jobsite match with tech '%s' at jobsite '%s'", tech.getFullName(), site.getShortID());
    //   //     js = site;
    //   //     unassigned = false;
    //   //     break loop02;
    //   //   }
    //   // }
    //   if (!unassigned) {
    //     Log.l("Tech not unassigned!");
    //     row.push(js.getShortID());
    //     row.push(this.getRotSeq(shift.name));
    //     row.push(shift.name);
    //     row.push(this.getTechShift(shiftTime));
    //     row.push(js.schedule_name);
    //     row.push(js.client.name);
    //     row.push(js.location.name);
    //     row.push(js.locID.name);
    //     row.push(tech.getFullName());
    //     let list = js.getHoursList(shift.name, shiftTime);
    //     for (let i = 0; i < 7; i++) {
    //       row.push(list[i]);
    //     }
    //   } else {
    //     Log.l("Tech unassigned! ☹");
    //     row.push("");
    //     row.push('X');
    //     row.push("");
    //     row.push("");
    //     row.push("");
    //     row.push("");
    //     row.push("");
    //     row.push("");
    //     row.push(tech.getFullName());
    //     // let list = js.getHoursList(shift.name, shiftTime);
    //     for (let i = 0; i < 7; i++) {
    //       row.push("");
    //     }
    //   }
    //   overall.push(row);
    // }
    // return { header: header, rows: overall };
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

  public payrollReports() {
    // this.navCtrl.
  }

  public reportViewSave(event?:any) {
    Log.l("reportViewSave(): Event is:\n", event);
    this.reportViewVisible = false;
  }

  public reportViewCancel(event?:any) {
    Log.l("reportViewCancel(): Event is:\n", event);
    this.reportViewVisible = false;
  }
}
