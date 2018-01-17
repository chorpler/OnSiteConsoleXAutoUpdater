// import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                 ;
import { Subscription                                                                    } from 'rxjs/Subscription'          ;
import { sprintf                                                                         } from 'sprintf-js'                 ;
import { Component, OnInit, OnDestroy, Input, Output, NgZone, ViewChild, ElementRef      } from '@angular/core'              ;
import { ServerService                                                                   } from 'providers/server-service'   ;
import { DBService                                                                       } from 'providers/db-service'       ;
import { AuthService                                                                     } from 'providers/auth-service'     ;
import { AlertService                                                                    } from 'providers/alert-service'    ;
import { NumberService                                                                   } from 'providers/number-service'   ;
import { Log, Moment, moment, oo, _matchCLL, _matchSite                                  } from 'config/config.functions'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from 'domain/domain-classes'      ;
import { OSData                                                                          } from 'providers/data-service'     ;
import { PDFService                                                                      } from 'providers/pdf-service'      ;
import { OptionsComponent                                                                } from 'components/options/options' ;
import { DispatchService                                                                 } from 'providers/dispatch-service' ;

@Component({
  selector: 'invoice-hb',
  templateUrl: 'invoice-hb.html',
})
export class InvoiceHBComponent implements OnInit,OnDestroy {
  @ViewChild('printArea') printArea:ElementRef;
  @Input('invoice') invoice:Invoice;
  @Input('site') site:Jobsite;
  @Input('reports') reports:Array<Report> = [];
  @Input('period') period:PayrollPeriod;
  public title               : string = "Invoicing HB";
  public siteSubscription    : Subscription              ;
  public reportsSubscription : Subscription              ;
  public invoiceGrid         : Array<Array<any>> = [[]]  ;
  public summary             : Array<Array<any>> = [[]]  ;
  public invoiceNumber       : string            = ""    ;
  public invoiceDate         : Moment                    ;
  public invoiceAddress      : string            = ""    ;
  public POnumber            : string            = ""    ;
  public contractNumber      : string            = ""    ;
  public totalUnitsBilled    : number            = 0     ;
  public totalHours          : number            = 0     ;
  public totalTechs          : number            = 0     ;
  public subTotal            : number            = 0     ;
  public tax                 : number            = 0     ;
  public totalBilled         : number            = 0     ;
  public billedText          : string            = ""    ;
  public MAX_ROWS            : number            = 27    ;
  public dataReady           : boolean           = false ;

  constructor(
    public zone     : NgZone,
    public data     : OSData,
    public server   : ServerService,
    public alert    : AlertService,
    public numServ  : NumberService,
    public dispatch : DispatchService,
  ) {
    window["onsitehbinvoicecomponent"] = this;
  }

  ngOnInit() {
    Log.l('InvoiceHBComponent: ngOnInit() fired');
    // if(this.navParams.get('reports') !== undefined) { this.reports = this.navParams.get('reports'); }
    // if(this.navParams.get('period') !== undefined) { this.period = this.navParams.get('period'); }
    // if(this.navParams.get('site') !== undefined) { this.site = this.navParams.get('site'); }
    // if(this.navParams.get('invoice') !== undefined) { this.invoice = this.navParams.get('invoice'); } else { this.invoice = new Invoice(); }
    // let sites = this.data.getData('sites');
    // this.site = this.site || sites.find((a:Jobsite) => {
    //   return a.client.name === 'KN' && a.location.name === 'MHL' && a.locID.name === 'MNSHOP';
    // });
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("InvoiceHBComponent: ngOnDestroy() fired");
    if(this.siteSubscription && !this.siteSubscription.closed) {
      this.siteSubscription.unsubscribe();
    }
    if(this.reportsSubscription && !this.reportsSubscription.closed) {
      this.reportsSubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.installSubscribers();
    let reports = this.reports;
    // let invoice = {number: -1, date: moment(), customer: this.site, customerNumber: ""};
    // this.invoice.number = 0;
    // this.invoice = invoice;
    // reports = reports.sort((a,b) => {
    //   let out = 0;
    //   let uA = a['unit_number'] || 0;
    //   let uB = b['unit_number'] || 0;
    //   out = uA > uB ? 1 : uA < uB ? -1 : 0;
    //   return out;
    // });
    this.generateReportsData(reports);
    // this.testInvoice();
    // let grid = [];
    // let unitStats = {};
    // let rate = 70;
    // let i = 0, j = 0;
    // for(let report of reports) {
    //   let date = report.report_date;
    //   let tech = report.technician;
    //   let unit = report.unit_number;
    //   let hours = report.repair_hours;
    //   let total = hours * rate;
    //   let row = [date, tech, "", unit, hours, total];
    //   grid.push(row);
    //   let totalHours = unitStats[unit] || 0;
    //   totalHours += hours;
    //   unitStats[unit] = totalHours;
    //   i++;
    // }
    // let max_lines = 25;
    // let count = max_lines - grid.length;
    // for(let i = 0; i < count; i++) {
    //   grid.push(["", "", "", "", "", ""]);
    // }
    // this.invoiceGrid = grid;
    // let summary = [];
    // let units = Object.keys(unitStats);
    // for(let unit of units) {
    //   let hours = unitStats[unit];
    //   let total = hours * rate;
    //   this.totalUnitBilled += total;
    //   this.totalHours += hours;
    //   this.totalBilled += total;
    //   let row = [unit, hours, total, "", "", ""];
    //   summary.push(row);
    // }
    // let max_summary_lines = 10;
    // count = max_summary_lines - summary.length;
    // for(let i = 0; i < count; i++) {
    //   summary.push(["", "", "", "", ""]);
    // }
    // this.summary = summary;
    // this.billedText = this.numServ.toCurrency(this.totalBilled);
    this.dataReady = true;
  }

  public installSubscribers() {
    this.siteSubscription = this.dispatch.invoiceSiteUpdated().subscribe((siteObject: any) => {
      Log.l("InvoiceHBComponent: received site Observable update!\n", siteObject.site);
      let site:Jobsite = siteObject.site;
      // let period:PayrollPeriod = periodObject.period;
      // this.testInvoice();
      this.generateReportsData();
      // this.updatePeriod(period);
    });
    this.reportsSubscription = this.dispatch.invoiceReportsUpdated().subscribe((reportsObject: any) => {
      Log.l("InvoiceHBComponent: received reports Observable update!\n", reportsObject.reports);
      let reports:Array<Report> = reportsObject.reports;
      // let period:PayrollPeriod = periodObject.period;
      // this.testInvoice();
      this.generateReportsData(reports);
      // this.updatePeriod(period);
    });
  }

  public generateReportsData(rpts?:Array<Report>) {
    Log.l("HB Invoice Component: generating Reports grid for this site and payroll period...");
    let site:Jobsite = this.site;
    // let reports = this.reports.filter((a:Report) => {
    //   return a.matchesSite(site) && !a.invoiced;
    // });
    let reports = rpts || this.reports;
    let billing_rate = site.billing_rate;
    let now = moment();
    let totalHours = 0;
    let totalTechs = 0;
    let totalUnits = 0;
    let subTotal   = 0;
    let tempTechs:any = {};
    let tempUnits:any = {};
    let invoiceGrid = [];
    let i = 1;
    for(let report of reports) {
      let date = moment(report.report_date, "YYYY-MM-DD");
      let name = report.technician;
      let unit = report.unit_number;
      let wo   = report.work_order_number;
      let hours = report.repair_hours;
      let total = hours * billing_rate;
      // let row = [i++, date, name, unit, wo, hours, total];
      let row = [date, name, unit, wo, hours, total];
      invoiceGrid.push(row);
      totalHours += hours;
      tempTechs[name] = 1;
      tempUnits[unit] = 1;
      subTotal += total;
    }
    let keys = Object.keys(tempTechs);
    this.totalTechs = keys.length;
    keys = Object.keys(tempUnits);
    this.totalUnitsBilled = keys.length;
    this.totalHours = totalHours;
    this.tax = 0;
    this.totalBilled = subTotal + this.tax;
    this.invoiceNumber = "1";
    this.invoiceDate = moment(now);
    this.billedText = this.numServ.toCurrency(this.totalBilled);
    let max_rows = this.MAX_ROWS;
    let count = max_rows;
    for(let i = invoiceGrid.length+1; i <= count; i++) {
      // invoiceGrid.push([i, "", "", "", "", "", ""]);
      invoiceGrid.push(["", "", "", "", "", ""]);
    }
    this.invoiceGrid = invoiceGrid;
  }

  public testInvoice() {
    this.invoiceGrid = [];
    let min = 0;
    let max = this.MAX_ROWS;
    let umax = 99999999;
    let umin = 10000000;
    let wmax = 9999999999;
    let wmin = 100000000;
    let hmin = 1;
    let hmax = 30;
    let now = moment();
    let count = Math.trunc(Math.random()*(max - min)) + min;
    for(let i = 0; i < count; i++) {
      let date  = now;
      let name  = "Testerson, Test";
      let unit  = Math.trunc(Math.random()*(umax - umin)) + umin;
      let wo    = Math.trunc(Math.random()*(wmax - wmin)) + wmin;
      let hours = Math.trunc(Math.random()*(hmax-hmin)) + hmin;
      let mins  = Math.trunc(Math.random()*(4 - 0)) + 0;
      hours     = hours + mins / 4;
      let total = hours * 65;
      let row   = [date, name, unit, wo, hours, total];
      this.invoiceGrid.push(row);
    }
    let max_rows = this.MAX_ROWS;
    count = max_rows - this.invoiceGrid.length;
    for(let i = 0; i < count; i++) {
      this.invoiceGrid.push(["", "", "", "", "", ""]);
    }
    let totalHours = 0;
    let totalTechs = 0;
    let totalUnits = 0;
    let subTotal   = 0;
    let tempTechs:any = {};
    let tempUnits:any = {};
    for(let row of this.invoiceGrid) {
      let hours = Number(row[4]);
      let tech = row[1];
      let subtotal = Number(row[5]);
      let unit = row[2];
      if(!isNaN(hours)) {
        totalHours += hours;
      }
      if(!isNaN(subtotal)) {
        subTotal += subtotal;
      }
      if(tech !== "") {
        tempTechs[tech] = 1;
      }
      if(unit !== "") {
        tempUnits[unit] = 1;
      }
    }
    Log.l("tempTechs object is:\n", tempTechs);
    let keys = Object.keys(tempTechs);
    totalTechs = keys.length;
    keys = Object.keys(tempUnits);
    totalUnits = keys.length;

    this.invoiceNumber = "12345678";
    this.invoiceDate = moment(now);
    this.invoiceAddress = "1234 Test Street, Test TX 99999";
    this.contractNumber = "SomeNumber";
    this.totalHours = totalHours;
    this.totalTechs = totalTechs;
    this.totalUnitsBilled = totalUnits;
    this.subTotal = subTotal;
    this.tax      = 0;
    this.totalBilled = this.subTotal + this.tax;
    this.billedText = this.numServ.toCurrency(this.totalBilled);
  }
}
