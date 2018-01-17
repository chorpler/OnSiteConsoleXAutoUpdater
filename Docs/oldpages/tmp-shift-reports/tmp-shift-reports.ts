import { Subscription                         } from 'rxjs/Subscription'        ;
import { Component, ViewChild, ElementRef,    } from '@angular/core'            ;
import { IonicPage, NavController, NavParams  } from 'ionic-angular'            ;
import { Log, moment, Moment, oo              } from 'config/config.functions'  ;
import { Employee, Report, ReportOther, Shift } from 'domain/domain-classes'    ;
import { PayrollPeriod, Jobsite,              } from 'domain/domain-classes'    ;
import { OSData                               } from 'providers/data-service'   ;
import { DispatchService                      } from 'providers'                ;
import { SelectItem, MenuItem, TieredMenu,    } from 'primeng/primeng'          ;
import { Dropdown, MultiSelect,               } from 'primeng/primeng'          ;
import { NotifyService                        } from 'providers/notify-service' ;


@IonicPage({ name: "Tmp-Reports" })
@Component({
  selector: 'page-tmp-shift-reports',
  templateUrl: 'tmp-shift-reports.html',
})
export class TmpShiftReportsPage {
  public title: string = "Tech Shift Reports";
  public MAX_LINES: number = 15;
  public shiftreport: any;
  public shiftreports: Array<any> = [];
  public tech: Employee;
  public techs: Array<Employee> = [];
  public site: Jobsite;
  public sites: Array<Jobsite> = [];
  public period: PayrollPeriod;
  public periods: Array<PayrollPeriod> = [];
  public shift: Shift;
  public siteMenu: SelectItem[] = [];
  public shiftMenu: SelectItem[] = [];
  public techMenu: SelectItem[] = [];
  public selectedDate: Moment;
  public selectedSite: Jobsite;
  public selectedTech: Employee;
  public selectedTechs: Array<Employee> = [];
  public dataReady: boolean = false;
  public ePeriod: Map<Employee, PayrollPeriod> = new Map();

  constructor(
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
  ) {
    window['techshiftreports'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad TechShiftReportsPage');
    this.data.appReady().then(res => {
      setTimeout(() => {
        this.runWhenReady();
      }, 500);
    });
  }

  public runWhenReady() {
    this.sites = this.data.getData('sites');
    this.techs = this.data.getData('employees');
    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    this.generateDropdownMenus();
    this.ePeriod = this.data.createEmployeePeriodMap(this.period);
    this.generateSelectedReports();
    this.dataReady = true;
  }

  public generateDropdownMenus() {
    let menuShifts: SelectItem[] = [];
    let techs = this.techs.filter((a: Employee) => {
      return a.active && a.userClass[0].toUpperCase() !== 'OFFICE' && a.userClass[0].toUpperCase() !== 'MANAGER';
    });
    let sites = this.sites.filter((a: Jobsite) => {
      return a.site_active && a.site_number !== 1;
    })
    let periods = this.periods;
    for (let period of periods) {
      let shifts = period.getPayrollShifts();
      let count = shifts.length;
      for (let i = shifts.length - 1; i >= 0; i--) {
        let shift = shifts[i];
        let shiftDate = shift.getShiftDate();
        let dateString = shiftDate.format("DD MMM YYYY");
        let item: SelectItem = { 'label': dateString, 'value': shiftDate };
        menuShifts.push(item);
      }
    }
    let count = sites.length;
    let menuSites: SelectItem[] = [];
    for (let site of this.sites) {
      let name = site.getSiteSelectName();
      let item: SelectItem = { 'label': name, 'value': site };
      menuSites.push(item);
    }

    let menuTechs: SelectItem[] = [];
    for (let tech of techs) {
      let name = tech.getTechName();
      let item: SelectItem = { 'label': name, 'value': tech };
      menuTechs.push(item);
    }
    this.shiftMenu = menuShifts;
    this.siteMenu = menuSites;
    this.techMenu = menuTechs;

    this.selectedDate = menuShifts[0].value;
    this.tech = menuTechs[0].value;
    this.site = menuSites[1].value;
  }

  public generateShiftReport(date: Moment, tech: Employee, site: Jobsite): any {
    let shiftreport: any = {};
    let shift: Shift;
    let period = this.ePeriod.get(tech);
    if (period) {
      let shifts = period.getPayrollShifts();
      for (let periodShift of shifts) {
        let shiftDate = periodShift.getShiftDate();
        if (date.isSame(shiftDate, 'day')) {
          shift = periodShift;
          break;
        }
      }
    }
    if (!shift) {
      let errorText = `Can't generate shift report for '${tech.getUsername()}' on '${date.format("YYYY-MM-DD")}' for site '${site.getSiteName()}'`;
      this.notify.addError("ERROR", errorText, 10000);
    } else {
      let reports = shift.getShiftReports();
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
    }
  }

  public generateSelectedReports() {
    let date: Moment = this.selectedDate;
    let techs: Array<Employee> = this.selectedTechs;
    let site: Jobsite = this.site;
    for (let tech of techs) {
      let shiftreport = this.generateShiftReport(date, tech, site);
      this.shiftreports = this.shiftreports || [];
      if (shiftreport && shiftreport.grid && shiftreport.grid.length && shiftreport.grid[0][0] !== "") {
        this.shiftreports.push(shiftreport);
      } else {
        this.notify.addWarn("ALERT", "Could not generate shift report.", 3000);
      }
    }
    return this.shiftreports;
  }

  public clearReports() {
    this.shiftreports = [];
    this.notify.addSuccess("SUCCESS", "Shift Reports cleared.", 3000);
  }


  public updateShift(selectedDate: Moment) {
    Log.l("updateShift(): Shift set to '%s'", selectedDate.format("YYYY-MM-DD"));
    let date = moment(selectedDate);
    let strDate = date.format("YYYY-MM-DD");
    let selectedShift, selectedPeriod;
    outerloop: for (let period of this.periods) {
      let shifts = period.getPayrollShifts();
      for (let shift of shifts) {
        let shiftDate = shift.getShiftDate();
        let strShiftDate = shiftDate.format("YYYY-MM-DD");
        if (strShiftDate === strDate) {
          selectedShift = shift;
          selectedPeriod = period;
          break outerloop;
        }
      }
    }
    if (selectedShift) {
      if (selectedPeriod !== this.period) {
        this.period = selectedPeriod;
        Log.l("updateShift(): Also updating period...");
        this.ePeriod = this.data.createEmployeePeriodMap(selectedPeriod);
        this.notify.addInfo("PAYPERIOD CHANGED", `Payroll Period and Shift date changed to ${selectedDate.format("DD MMM YYYY")}`, 3000);
      } else {
        this.notify.addInfo("SHIFT CHANGED", `Shift date changed to ${selectedDate.format("DD MMM YYYY")}`, 3000);
      }
    } else {
      this.notify.addError("ERROR", `Could not find shift for date ${selectedDate.format("DD MMM YYYYY")}!`, 10000);
    }
  }

  public updateSite(site: Jobsite) {
    Log.l("updateSite(): Site set to:\n", site);
    let date = moment(this.selectedDate);
    let techs = this.techs.filter((a: Employee) => {
      let techSite = this.data.getTechLocationForDate(a, date);
      return techSite.site_number === site.site_number;
    });
    let menuTechs: SelectItem[] = [];
    for (let tech of techs) {
      let name = tech.getTechName();
      let item: SelectItem = { 'label': name, 'value': tech };
      menuTechs.push(item);
    }
    this.techMenu = menuTechs;
    if (menuTechs.length) {
      this.tech = this.techMenu[0].value;
    }
  }

  public updateTech(tech: Employee) {
    Log.l("updateTech(): Tech set to:\n", tech);
    let date = moment(this.selectedDate);
    let techSite = this.data.getTechLocationForDate(tech, date);
    let menuSite = this.siteMenu.find((a: SelectItem) => {
      return a.value.site_number === techSite.site_number;
    }).value;
    if (menuSite) {
      this.site = menuSite;
    }
    this.selectedTechs = [
      tech
    ];
  }

  public updateTechs(selTechs: Array<Employee>) {
    Log.l("updateTechs(): Techs set to:\n", selTechs);
    let date = moment(this.selectedDate);
    for (let tech of selTechs) {
      let techSite = this.data.getTechLocationForDate(tech, date);
      let menuSite = this.siteMenu.find((a: SelectItem) => {
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
