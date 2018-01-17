import { sprintf                                                                         } from 'sprintf-js'                 ;
import { Injectable                                                                      } from '@angular/core'              ;
import { URLSearchParams                                                                 } from '@angular/http'              ;
import { HttpClient, HttpHeaders, HttpParams                                             } from '@angular/common/http'       ;
import { Log, moment, Moment, isMoment, oo, dec, Decimal                                 } from 'config/config.functions' ;
import { OSData                                                                          } from './data-service'             ;
import { AuthService                                                                     } from './auth-service'             ;
import { AlertService                                                                    } from './alert-service'            ;
import { NumberService                                                                   } from './number-service'           ;
import { Preferences                                                                     } from './preferences'              ;
import { Jobsite, Employee, Report, ReportOther, Shift, PayrollPeriod, Schedule, Invoice } from 'domain/domain-classes'   ;
import { Address, Street,                                                                } from 'domain/domain-classes'   ;

// export const noDD = "_";
// export const noDesign1 = { include_docs: true, startkey: noDD };
// export const noDesign2 = { include_docs: true, endkey: noDD   };
// export const liveNoDesign = { live: true, since: 'now', include_docs: true, startkey: noDD };

export const MAX_LINES=25;

@Injectable()
export class InvoiceService {
  public static PREFS:Preferences = new Preferences();
  public get prefs():Preferences { return InvoiceService.PREFS; };
  public generatedInvoices:Array<Invoice> = [];
  public sites:Array<Jobsite> = [];
  public invoice:Invoice;
  public MAX_LINES:number = MAX_LINES;
  public keane_invoice_numbers:any;
  // constructor(public alert:AlertService, public data:OSData, public PREFS:Preferences, public prefs:Preferences) {
  constructor(public http:HttpClient, public auth:AuthService, public alert:AlertService, public data:OSData, public numServ:NumberService) {
    Log.l('Hello InvoiceService Provider');
    window['onsiteinvoiceservicestatic'] = InvoiceService;
    window['onsiteinvoiceservice'] = this;
    window['onsitehttpclient'] = this.http;
    window['onsitehttpheaders'] = HttpHeaders;
    window['onsitehttpparams'] = HttpParams;
    window['onsiteurlsearchparams'] = URLSearchParams;
    this.sites = this.data.getData('sites');
    // this.invoice = new Invoice();
  }

  public getNextInvoiceNumber(clientCode?:string, numberOfInvoiceNumbers?:number):Promise<Array<number>> {
    return new Promise((resolve,reject) => {
      let code = clientCode ? clientCode : "KN";
      let count = numberOfInvoiceNumbers ? numberOfInvoiceNumbers : 1;
      let http = this.http;
      let invoiceNumber = -1;
      let u = this.auth.getUser(), p = this.auth.getPass();
      let headerString = window.btoa(`${u}:${p}`);
      let authHdr = `Basic ${headerString}`;
      // let type = "application/json";
      let type = "application/x-www-form-urlencoded";
      // let headers = this.headers;
      let headers = new HttpHeaders().set("Authorization", authHdr).append('Content-Type', type);
      // .append("Content-Type", type)};
      let url = this.prefs.getRemoteDBURL('config');
      if(!url) {
        let err = new Error("getNextInvoiceNumber(): Could not find remote config database");
        reject(err);
      }
      // let params = new HttpParams().set('count', String(count));
      let reqbody = new URLSearchParams();
      let strCount = String(count);
      reqbody.set('count', strCount);
      let body = reqbody.toString();
      // let options = {headers: headers, params: params};
      let options = {headers: headers};

      if(code === 'KN' || code === 'Keane') {
        url += "/_design/ref/_update/counter/keane_invoice_numbers";
        http.post(url, body, options).toPromise().then((res:Array<number>) => {
          Log.l(`getNextInvoiceNumber(): Success! Got data:\n`, res);
          let invoices = res;
          // invoiceNumber = JSON.parse(res);
          // resolve(invoiceNumber);
          resolve(invoices);
        }).catch(err => {
          Log.l(`getNextInvoiceNumber(): Error retrieving next number from '${url}'`);
          Log.e(err);
          reject(err);
        });
      } else {
        let err = new Error(`getNextInvoiceNumber(): Unknown invoice type specified: '${clientCode}'`);
        reject(err);
      }
    });
  }

  public getCurrentInvoiceNumber(clientCode?:string):Promise<any> {
    return new Promise((resolve,reject) => {
      let code = clientCode ? clientCode : "KN";
      let http = this.http;
      let invoiceNumber = -1;
      let u = this.auth.getUser(), p = this.auth.getPass();
      let headerString = window.btoa(`${u}:${p}`);
      let authHdr = `Basic ${headerString}`;
      let type = "application/json";
      let url = this.prefs.getRemoteDBURL('config');
      if (!url) {
        let err = new Error("getCurrentInvoiceNumber(): Could not find remote config database");
        reject(err);
      }
      if (code === 'KN' || code === 'Keane') {
        url += "/keane_invoice_numbers";
        let getURL = url + "?include_docs=true";
        Log.l("getCurrentInvoiceNumber(): Getting from URL: '%s'", getURL);
        http.get(getURL, { headers: new HttpHeaders().set('Authorization', authHdr) }).toPromise().then((res:any) => {
          Log.l(`getCurrentInvoiceNumber(): Success! Got data:\n`, res);
          if(res && res.invoice) {
            resolve(res);
            // this.keane_invoice_numbers = res;
            // invoiceNumber = Number(res.invoice);
            // resolve(invoiceNumber);
          } else {
            let err = new Error("getCurrentInvoiceNumber(): Invoice number not found!");
            reject(err);
          }
        }).catch(err => {
          Log.l(`getCurrentInvoiceNumber(): Error retrieving next number from '${url}'`);
          Log.e(err);
          reject(err);
        });
      } else {
        let err = new Error(`getCurrentInvoiceNumber(): Unknown invoice type specified: '${clientCode}'`);
        reject(err);
      }
    });
  }

  public saveKeaneInvoiceNumber(invnum:number):Promise<number> {
    return new Promise((resolve,reject) => {
      let http = this.http;
      let invoiceNumber = invnum;
      let u = this.auth.getUser(), p = this.auth.getPass();
      let headerString = window.btoa(`${u}:${p}`);
      let authHdr = `Basic ${headerString}`;
      let type = "application/json";
      let url = this.prefs.getRemoteDBURL('config');
      if (!url) {
        let err = new Error("saveKeaneInvoiceNumber(): Could not find remote config database");
        reject(err);
      }
      url += "/keane_invoice_numbers";
      let hdr: HttpHeaders = new HttpHeaders().set('Authorization', authHdr).append("Content-Type", type);
      let headers = { headers: hdr };
      if(this.keane_invoice_numbers && this.keane_invoice_numbers._id) {
        // Log.l(`saveKeaneInvoiceNumber(): Keane invoice number document exists, just changing invoice and updating it...`, this.keane_invoice_numbers);
        let body:any = this.keane_invoice_numbers;
        body.invoice = invoiceNumber;
        // let getURL = url + "?_include_docs=true";
        Log.l(`saveKeaneInvoiceNumber(): Keane invoice number document exists, just changing invoice and putting it to '${url}':`, this.keane_invoice_numbers);
        this.putInvoiceNumberDoc(url, body, headers).then((invNum:number) => {
          resolve(invNum);
        }).catch(err => {
          Log.l("saveKeaneInvoiceNumber(): putInvoiceNumberDoc() threw error!");
          Log.e(err);
          reject(err);
        });
      } else {
        Log.l(`saveKeaneInvoiceNumber(): Keane invoice number document NOT exists!`);
        this.getCurrentInvoiceNumber("KN").then(res => {
          Log.l(`saveKeaneInvoiceNumber(): getCurrentInvoiceNumber() returned: `, res);
          if(res && res._id && res.invoice) {
            this.keane_invoice_numbers = res;
            let body: any = this.keane_invoice_numbers;
            body.invoice = invoiceNumber;
            Log.l(`saveKeaneInvoiceNumber(): now saving Keane document to '${url}'...`);
            this.putInvoiceNumberDoc(url, body, headers).then((invNum: number) => {
              resolve(invNum);
            }).catch(err => {
              Log.l("saveKeaneInvoiceNumber(): putInvoiceNumberDoc() threw error!");
              Log.e(err);
              reject(err);
            });
          } else {
            let err = new Error("saveKeaneInvoiceNumber(): getCurrentInvoiceNumber() returned invalid document!");
            throw err;
          }
        }).catch(err => {
          Log.l(`saveKeaneInvoiceNumber(): getCurrentInvoiceNumber() had error retrieving next number from '${url}'`);
          Log.e(err);
          reject(err);
        });
      }
    });
  }

  public putInvoiceNumberDoc(url:string, body:any, headers:{headers: HttpHeaders}):Promise<number> {
    let http = this.http;
    return http.put(url, body, headers).toPromise().then((res: any) => {
      Log.l(`saveKeaneInvoiceNumber(): Successfully put Keane invoice number document! Got data:\n`, res);
      // if (res && res.invoice) {
      // invoiceNumber = Number(res.invoice);
      if (res && res.ok && res.rev) {
        this.keane_invoice_numbers._rev = res.rev;
        let invoiceNumber = Number(body.invoice);
        this.keane_invoice_numbers.invoice = invoiceNumber;
        return invoiceNumber;
      } else {
        let err = new Error("saveKeaneInvoiceNumber(): response to PUT was invalid!");
        throw err;
      }
    }).catch(err => {
      Log.l(`saveKeaneInvoiceNumber(): Error retrieving next number from '${url}'`);
      Log.e(err);
      throw err;
    });

  }

  public generateNewInvoice(site:Jobsite, rpts:Array<Report>):Invoice {
    let invoice:Invoice = new Invoice();
    let address = site.address;
    let invoiceDate:Moment = moment().startOf('day');
    let client = site.client.name;
    let type   = client;
    invoice.address = new Address();
    invoice.address.street.street1 = address.street.street1;
    invoice.address.street.street2 = address.street.street2;
    invoice.address.city           = address.city;
    invoice.address.state          = address.state;
    invoice.address.zipcode        = address.zipcode;

    if(type === 'HB') {
      invoice.type = "HB";
      invoice.date = invoiceDate;
      invoice.customer_number = "SES100";
      invoice.site_name = site.getInvoiceName();
      return invoice;
    } else if(type === 'KN') {
      invoice.type = "KN";
      invoice.date = invoiceDate;
      invoice.customer_number = "SES100";
      invoice.site_name = site.getInvoiceName();
      return invoice;
    } else if(type === 'BE') {
      invoice.type = "BE";
      invoice.date = invoiceDate;
      invoice.customer_number = "SES100";
      invoice.site_name = site.getInvoiceName();
      return invoice;
    } else {
      Log.w(`InvoiceService.generateNewInvoice(): Improper type '${type}' supplied!`);
      return undefined;
    }
  }

  public fitKeaneInvoice(reports:Array<Report>, site:Jobsite, lineCount?:number) {
    let maxLines = lineCount ? lineCount : MAX_LINES;
    let invoice:Invoice = this.generateFullKeaneInvoice(reports, site);
    let grid:Array<any> = invoice.grid;
    let summaryGrid = invoice.summary_grid;
    let gridlines = invoice.grid.length;
    let summarygridlines = invoice.summary_grid.length;
    let unit_counts = invoice.unit_counts;
    let units = Object.keys(unit_counts);
    let array_of_units = [];
    type UnitStat = {unit: string, count: number};
    for(let unit of units) {
      let unit_count:UnitStat = {unit: unit, count: unit_counts[unit]};
      array_of_units.push(unit_count);
    }
    array_of_units = array_of_units.sort((a:UnitStat, b:UnitStat) => {
      let aC = a.count;
      let bC = b.count;
      // return aC > bC ? 1 : aC < bC ? -1 : 0;
      return aC > bC ? -1 : aC < bC ? 1 : 0;
    });
    let invoice_grid_line_count = 0, invoice_unit_count = 0;
  }

  public generateFullKeaneInvoice(rpts:Array<Report>, site:Jobsite):Invoice {
    let reports:Array<Report> = rpts || [];
    let invoice:Invoice = new Invoice();
    Log.l("generateInvoiceGrid(): Using reports array:\n", reports);
    let grid = [];
    let unitStats = {};
    // let site:Jobsite = this.site;
    let rate = Number(site.billing_rate);
    if(isNaN(rate)) {
      rate = 65;
    }
    let i = 0, j = 0;
    for(let report of reports) {
      let date  = report.report_date;
      let tech  = report.technician;
      let unit  = report.unit_number;
      let hours = report.repair_hours;
      let total = hours * rate;
      let row   = [date, tech, unit, hours, total, report];
      grid.push(row);
      let totalHours = unitStats[unit] || 0;
      totalHours += hours;
      unitStats[unit] = totalHours;
      i++;
    }
    let max_lines = this.MAX_LINES;
    let count = max_lines - grid.length;
    for(let i = 0; i < count; i++) {
      grid.push(["", "", "", "", "", ""]);
    }
    let invoiceGrid = grid;
    let totalUnitHours = 0;
    let totalUnitBilled = 0;
    let totalHours = 0;
    let totalBilled = 0;
    let summary = [];
    let units = Object.keys(unitStats);
    for(let unit of units) {
      let hours = unitStats[unit];
      let total = hours * rate;
      totalUnitHours += hours;
      totalUnitBilled += total;
      totalHours += hours;
      totalBilled += total;
      let row = [unit, hours, total, "", "", ""];
      summary.push(row);
    }
    let max_summary_lines = 10;
    count = max_summary_lines - summary.length;
    for(let i = 0; i < count; i++) {
      summary.push(["", "", "", "", ""]);
    }
    // this.summary = summary;
    let billedText = this.numServ.toCurrency(totalBilled);
    // this.billedText = billedText;
    invoice.grid               = grid;
    invoice.summary_grid       = summary;
    invoice.unit_counts        = unitStats;
    invoice.total_unit_hours   = totalUnitHours;
    invoice.total_unit_billed  = totalUnitBilled;
    invoice.total_hours_billed = totalHours;
    invoice.total_billed       = totalBilled;
    invoice.total_astext       = billedText;
    invoice.customer_number    = "SES100";
    return invoice;
  }


}
