import { Subscription                                         } from 'rxjs/Subscription'         ;
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, } from '@angular/core'             ;
import { IonicPage, NavController, NavParams                  } from 'ionic-angular'             ;
import { Log, moment, Moment, oo                              } from 'config/config.functions'   ;
import { Employee, Report, ReportOther, Shift                 } from 'domain/domain-classes'     ;
import { PayrollPeriod, Jobsite,                              } from 'domain/domain-classes'     ;
import { OSData                                               } from 'providers/data-service'    ;
import { DispatchService,                                     } from 'providers/dispatch-service';
import { Preferences,                                         } from 'providers/preferences'     ;
import { SelectItem, MenuItem, TieredMenu,                    } from 'primeng/primeng'           ;
import { Dropdown, MultiSelect,                               } from 'primeng/primeng'           ;
import { NotifyService                                        } from 'providers/notify-service'  ;
import { SpinnerService                                       } from 'providers/spinner-service' ;

@IonicPage({name: "Tech Shift Reports"})
@Component({
  selector: 'page-tech-shift-reports',
  templateUrl: 'tech-shift-reports.html',
})
export class TechShiftReportsPage implements OnInit,OnDestroy {
  public title:string = "Tech Shift Reports";
  // public MAX_LINES   :number          = 9 ;
  public static PREFS:any = new Preferences();
  public get prefs():any { return TechShiftReportsPage.PREFS; };
  public MAX_LINES   :number          = 15;
  public shiftreport :any;
  public shiftreports:Array<any>      = [];
  public tech        :Employee            ;
  public allEmployees:Array<Employee> = [];
  public techs       :Array<Employee> = [];
  public allReports  :Array<Report>   = [];
  public site        :Jobsite             ;
  public sites       :Array<Jobsite>  = [];
  public period      :PayrollPeriod       ;
  public periods     :PayrollPeriod[] = [];
  public shift       :Shift               ;
  public shifts      :Shift[]      = []   ;
  public siteMenu    :SelectItem[] = []   ;
  public shiftMenu   :SelectItem[] = []   ;
  public techMenu    :SelectItem[] = []   ;
  public colorMap    :Object              ;
  public selectedDate:string              ;
  public selectedDates:Array<string> = [] ;
  public selectedSite:Jobsite             ;
  public selectedTech:Employee            ;
  public selTechs    :Array<string> = []  ;
  public selectedTechs:Array<Employee> = [];
  public dataReady   :boolean      = false;
  public opacity     :number       = 1    ;
  public sub         :Subscription        ;
  public ePeriod     :Map<Employee,PayrollPeriod> = new Map();

  constructor(
    public navCtrl   : NavController    ,
    public navParams : NavParams        ,
    public data      : OSData           ,
    public notify    : NotifyService    ,
    public spinner   : SpinnerService   ,
    public dispatch  : DispatchService  ,
  ) {
    window['techshiftreports'] = this;
  }

  ngOnInit() {
    Log.l("TechShiftReportsPage: ngOnInit() fired!");
    if(this.data.isAppReady()) {
      this.runOnDelay();
    } else {
    }
  }

  ngOnDestroy() {
    Log.l("TechShiftReportsPage: ngOnDestroy() fired!");
    if(this.sub && !this.sub.closed) {
      this.sub.unsubscribe();
    }
  }

  public runOnDelay() {
    setTimeout(() => {
      this.runWhenReady();
    }, 500);
  }

  public runWhenReady() {
    Log.l("TechShiftReports: running when ready...");
    this.sites = this.data.getData('sites').filter((a:Jobsite) => {
      return a.site_active === true;
    });
    this.techs = this.data.getData('employees');
    this.allReports = this.data.getData('reports');
    this.allEmployees = this.techs;
    let weeks:number = this.prefs.USER.payroll_periods || 4;
    Log.l(`TechShiftReports.runWhenReady(): Creating payroll periods back '${weeks}' weeks...`);
    this.periods = this.data.createPayrollPeriods(weeks);
    this.period = this.periods[0];
    this.generateDropdownMenus();
    // this.ePeriod = this.data.createEmployeePeriodMap(this.period);
    // this.generateSelectedReports();
    this.updateSite(this.site);
    this.updateShift(this.selectedDate);
    this.dataReady = true;
  }

  public generateDropdownMenus() {
    let menuShifts:SelectItem[] = [];
    let techs:Employee[] = this.techs.filter((a:Employee) => {
      return a.active && a.userClass[0].toUpperCase() !== 'OFFICE' && a.userClass[0].toUpperCase() !== 'MANAGER';
    });
    let sites:Jobsite[] = this.sites.filter((a:Jobsite) => {
      return a.site_active && a.site_number !== 1;
    });
    let periods:PayrollPeriod[] = this.periods;
    let allShifts:Shift[] = [];
    for(let period of periods) {
      let shifts = period.getPayrollShifts();
      let count = shifts.length;
      let weekID = period.getPayrollSerial();
      // let style = {'background-color': this.getColor(weekID)};
      for(let i = shifts.length - 1; i >= 0; i--) {
        let shift = shifts[i];
        let shiftDate = shift.getShiftDate();
        let dateString = shiftDate.format("DD MMM YYYY");
        let item: SelectItem = { 'label': dateString, 'value': shiftDate.format("YYYY-MM-DD"), };
        // item['style'] = style;
        // let weekID = shift.getShiftWeekID();
        // item['payroll_period'] = weekID;
        menuShifts.push(item);
        allShifts.push(shift);
      }
      // for(let shift of shifts) {
      //   let shiftDate = shift.getShiftDate();
      //   let dateString = shiftDate.format("DD MMM YYYY");
      //   let item:SelectItem = { 'label': dateString, 'value': shiftDate };
      //   menuShifts.push(item);
      // }
    }
    this.shifts = allShifts;
    let count = sites.length;
    let menuSites: SelectItem[] = [];
    for(let site of this.sites) {
      if(site.site_number !== 1) {
        let name = site.getSiteSelectName();
        let item:SelectItem = { 'label': name, 'value': site };
        menuSites.push(item);
      }
    }

    let menuTechs:SelectItem[] = [];
    for(let tech of techs) {
      let name = tech.getTechName();
      let user = tech.getUsername();
      let item:SelectItem = { 'label': name, 'value': user };
      menuTechs.push(item);
    }
    this.shiftMenu = menuShifts;
    this.siteMenu  = menuSites;
    this.techMenu  = menuTechs;

    this.selectedDate = menuShifts[0].value;
    this.selTechs = [];
    // this.tech = menuTechs[0].value;
    this.site = menuSites[1].value;
  }

  public getColor(payroll_date:number):string {
    let colorMap:any = this.colorMap || {};
    if(colorMap[payroll_date]) {
      return colorMap[payroll_date];
    } else {
      colorMap[payroll_date] = this.getRandomColor();
      this.colorMap = colorMap;
      return colorMap[payroll_date];
    }
  }

  public getRandomColor(alpha?:number) {
    let R:number, G:number, B:number, A:number;
    R = this.data.random(180, 240, 20);
    G = this.data.random(180, 240, 20);
    B = this.data.random(180, 240, 20);
    // A = this.data.random(0, 255, 20);
    A = 1;
    if(alpha !== undefined) {
      let val = Number(alpha);
      A = val || 1;
    }
    return `rgba(${R}, ${G}, ${B}, ${A})`;
  }

  public generateShiftReport(date:Moment,tech:Employee,site:Jobsite):any {
    let shiftreport:any = {};
    let username = tech.getUsername();
    let day = date.format("YYYY-MM-DD");
    let reports = this.allReports.filter((a:Report) => {
      let uA = a.username;
      let dA = a.report_date;
      return uA === username && dA === day && a.matchesSite(site);
    }).sort((a:Report, b:Report) => {
      let sA = a.time_start.toExcel();
      let sB = b.time_start.toExcel();
      return sA > sB ? 1 : sA < sB ? -1 : 0;
    });
    let total = 0;
    shiftreport.date = date.format("MMM DD YYYY");
    shiftreport.site = site;
    shiftreport.tech = tech;
    shiftreport.grid = [];
    for (let report of reports) {
      let row = [
        report.unit_number,
        report.work_order_number,
        report.notes,
        report.time_start.format("HH:mm"),
        report.time_end.format("HH:mm"),
        report.repair_hours,
      ];
      total += report.repair_hours;
      shiftreport.grid.push(row);
    }
    shiftreport.total_hours = total;
    let lines = shiftreport.grid.length;
    let blank_lines = this.MAX_LINES - lines;
    for (let i = 0; i < blank_lines; i++) {
      let row = ["", "", "", "", "", ""];
      shiftreport.grid.push(row);
    }
    return shiftreport;

    // let shift:Shift;
    // let period = this.ePeriod.get(tech);
    // if(period) {
    //   let shifts = period.getPayrollShifts();
    //   for(let periodShift of shifts) {
    //     let shiftDate = periodShift.getShiftDate();
    //     if(date.isSame(shiftDate, 'day')) {
    //       shift = periodShift;
    //       break;
    //     }
    //   }
    // }
    // if(!shift) {
    //   let errorText = `Can't generate shift report for '${tech.getUsername()}' on '${date.format("YYYY-MM-DD")}' for site '${site.getSiteName()}'`;
    //   this.notify.addError("ERROR", errorText, 10000);
    // } else {
    //   let reports = shift.getShiftReports().sort((a:Report,b:Report) => {
    //     let sA = a.time_start.toExcel();
    //     let sB = b.time_start.toExcel();
    //     return sA > sB ? 1 : sA < sB ? -1 : 0;
    //   });
    //   let total = 0;
    //   shiftreport.date = date.format("MMM DD YYYY");
    //   shiftreport.site = site;
    //   shiftreport.tech = tech;
    //   shiftreport.grid = [];
    //   for(let report of reports) {
    //     let row = [
    //       report.unit_number,
    //       report.work_order_number,
    //       report.notes,
    //       report.time_start.format("HH:mm"),
    //       report.time_end.format("HH:mm"),
    //       report.repair_hours,
    //     ];
    //     total += report.repair_hours;
    //     shiftreport.grid.push(row);
    //   }
    //   shiftreport.total_hours = total;
    //   let lines = shiftreport.grid.length;
    //   let blank_lines = this.MAX_LINES - lines;
    //   for(let i = 0; i < blank_lines; i++) {
    //     let row = [ "", "", "", "", "", "" ];
    //     shiftreport.grid.push(row);
    //   }
    //   return shiftreport;
    // }
    // // for(let entry of this.ePeriod) {
    // //   let tech:Employee = entry[0];
    // //   let period:PayrollPeriod = entry[1];
    // //   for(let )
    // // }
  }

  // public generateSelectedReports(dateVal?:string, techsArray?:Array<Employee>, js?:Jobsite) {
  public generateSelectedReports(event?:any) {
    let dates:string[] = this.selectedDates || [];
    let techUsers:string[]  = this.selTechs || [];
    let site:Jobsite = this.site;
    let shifts:Shift[] = this.shifts.filter((a:Shift) => {
      let shift_date = a.getShiftDate().format("YYYY-MM-DD");
      return dates.indexOf(shift_date) > -1;
    }).sort((a:Shift,b:Shift) => {
      let dA = a.getShiftDate().toExcel();
      let dB = b.getShiftDate().toExcel();
      return dA > dB ? -1 : dA < dB ? 1 : 0;
    });
    let techs:Employee[] = this.allEmployees.filter((a:Employee) => {
      let username = a.getUsername();
      return techUsers.indexOf(username) > -1;
    }).sort((a:Employee,b:Employee) => {
      let nA = a.getFullName();
      let nB = b.getFullName();
      return nA > nB ? 1 : nA < nB ? -1 : 0;
    });
    // let date:Moment = moment(, "YYYY-MM-DD");
    // let techs:Array<Employee> = this.selectedTechs;
    // let site:Jobsite = this.site;
    Log.l("generateSelectedReports(): Now running with techs and shifts:\n", techs);
    Log.l(shifts);
    this.shiftreports = this.shiftreports || [];
    for(let tech of techs) {
      for(let shift of shifts) {
        let shiftDate = shift.getShiftDate();
        let shiftreport = this.generateShiftReport(shiftDate, tech, site);
        Log.l("shiftreport is:\n", shiftreport)
        if(shiftreport && shiftreport.grid && shiftreport.grid.length && shiftreport.grid[0][0] !== "") {
          this.shiftreports.push(shiftreport);
          // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
        } else {
          let errText = `Could not generate shift rpeort for '${tech.getTechName()}' on '${shiftDate.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
          this.notify.addWarn("ALERT", errText, 5000);
        }
      }
    }
    return this.shiftreports;
  }

  // public generateSelectedShiftReports(event?:any) {
  //   let selectedDates:Array<string> = this.selectedDates || [];
  //   let selTechs:Array<string> = this.selTechs || [];
  //   let site = this.site || this.siteMenu[0].value;
  //   let dates:Array<string> = this.selectedDates || [];
  //   for(let selectedDate of selectedDates) {
  //     let date:Moment = moment(selectedDate, "YYYY-MM-DD");
  //     // let techs:Array<Employee> = this.selectedTechs;
  //     // let site:Jobsite = this.site;
  //     for(let tech of techs) {
  //       let shiftreport = this.generateShiftReport(date, tech, site);
  //       this.shiftreports = this.shiftreports || [];
  //       if(shiftreport && shiftreport.grid && shiftreport.grid.length && shiftreport.grid[0][0] !== "") {
  //         this.shiftreports.push(shiftreport);
  //         // this.notify.addSuccess("SUCCESS", "Shift report generated successfully.", 3000);
  //       } else {
  //         let errText = `Could not generate shift rpeort for '${tech.getTechName()}' on '${date.format("YYYY-MM-DD")}' at '${site.getSiteSelectName()}'`;
  //         this.notify.addWarn("ALERT", errText, 5000);
  //       }
  //     }

  //   }
  //   return this.shiftreports;
  // }

  public clearReports(event?:any) {
    this.shiftreports = [];
    this.notify.addSuccess("SUCCESS", "Shift Reports cleared.", 3000);
  }

  public checkSelectedTechs(selTechs:Array<string>, event?:any) {
    let chosenTechs:Array<Employee>;
    chosenTechs = this.techs.filter((a:Employee) => {
      return selTechs.indexOf(a.username) !== -1;
    }).sort((a:Employee,b:Employee) => {
      let uA = a.getFullName();
      let uB = b.getFullName();
      return uA > uB ? 1 : uA < uB ? -1 : 0;
    });
    this.selectedTechs = chosenTechs;
    return chosenTechs;
  }

  public updateShifts(selDates:Array<string>, event?:any) {

  }

  public updateShift(selDate:string, event?:any) {
    let sDate = selDate || this.selectedDate;
    let selectedDate = moment(selDate, "YYYY-MM-DD");
    Log.l("updateShift(): Shift set to '%s'", selectedDate.format("YYYY-MM-DD"));
    this.selectedDates = [selDate];
    // let date = moment(selectedDate);
    // let strDate = date.format("YYYY-MM-DD");
    let selectedShift:Shift, selectedPeriod:PayrollPeriod;
    outerloop: for(let period of this.periods) {
      let shifts = period.getPayrollShifts();
      for(let shift of shifts) {
        let shiftDate = shift.getShiftDate();
        let strShiftDate = shiftDate.format("YYYY-MM-DD");
        if(strShiftDate === selDate) {
          selectedShift = shift;
          selectedPeriod = period;
          break outerloop;
        }
      }
    }
    let dateString  = selectedDate.format("DD MMM YYYY");
    if(selectedShift) {
      let selectedPeriodID = selectedPeriod.getPayrollSerial();
      let currentPeriodID  = this.period.getPayrollSerial();
      if (selectedPeriodID !== currentPeriodID) {
        // this.notify.addInfo("CHANGING PAY PERIOD...", `Payroll Period must change and be recalculated...`, 3000);
        this.period = selectedPeriod;
        Log.l("updateShift(): Also updating period...");
        this.spinner.showSpinner("Payroll Period changed, recalculating...");
        setTimeout(() => {
          this.ePeriod = this.data.createEmployeePeriodMap(selectedPeriod);
          this.spinner.hideSpinner();
          this.notify.addSuccess("PAYPERIOD CHANGED", `Payroll Period and Shift date changed to ${dateString}`, 3000);
        }, 750);
      } else {
        this.notify.addSuccess("SHIFT CHANGED", `Shift date changed to ${dateString}`, 3000);
      }
    } else {
      this.notify.addError("ERROR", `Could not find shift for date ${dateString}!`, 10000);
    }
  }

  public updateSite(site:Jobsite, event?:any) {
    Log.l("updateSite(): Site set to:\n", site);
    let date = moment(this.selectedDate);
    // let site = this.selectedSite;
    let techs = this.techs.filter((a:Employee) => {
      let techSite = this.data.getTechLocationForDate(a, date);
      return techSite.site_number === site.site_number;
    });
    this.selTechs = [];
    let menuTechs:SelectItem[] = [];
    for (let tech of techs) {
      let name = tech.getTechName();
      let user = tech.getUsername();
      let item:SelectItem = { 'label': name, 'value': user };
      menuTechs.push(item);
    }
    this.selectedTechs = techs;
    this.techMenu = menuTechs;
    if(menuTechs.length) {
      this.tech = this.techMenu[0].value;
    }
  }

  public updateTech(tech:Employee) {
    Log.l("updateTech(): Tech set to:\n", tech);
    let date = moment(this.selectedDate);
    let techSite = this.data.getTechLocationForDate(tech, date);
    let menuSite = this.siteMenu.find((a:SelectItem) => {
      return a.value.site_number === techSite.site_number;
    }).value;
    if(menuSite) {
      this.site = menuSite;
    }
    this.selectedTechs = [
      tech
    ];
  }

  public updateTechs(selTechs:Array<Employee>) {
    Log.l("updateTechs(): Techs set to:\n", selTechs);
    let date = moment(this.selectedDate);
    for(let tech of selTechs) {
      let techSite = this.data.getTechLocationForDate(tech, date);
      let menuSite = this.siteMenu.find((a:SelectItem) => {
        return a.value.site_number === techSite.site_number;
      }).value;
    }
    // if(menuSite) {
    //   this.site = menuSite;
    // }
  }

  public printReports() {
    window.print();
  }
}
