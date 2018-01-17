/**
 * Name: Invoice domain class
 * Vers: 2.3.1
 * Date: 2017-12-04
 * Auth: David Sargeant
 * Logs: 2.3.1 2017-12-04: Added crew field
 * Logs: 2.3.0 2017-11-12: Added _id and _rev
 * Logs: 2.2.0: Added customer_name and unitData properties
 * Logs: 2.1.0: Added unitCounts object
 * Logs: 2.0.0: First serious attempt, but a modification with huge breaking changes even though they were never used before, so ...
 */

import { sprintf                                     } from 'sprintf-js'                 ;
import { Log, isMoment, Moment, moment, dec, Decimal } from '../config/config.functions' ;
import { Jobsite, Address,                           } from './domain-classes'           ;

export class Invoice {
  public _id               : string            ;
  public _rev              : string            ;
  public type              : string            = "KN";
  public date              : Moment            = moment()                   ;
  public period_start      : string            = ""                         ;
  public invoice_number    : string            = ""                         ;
  public get number()      : string            { return this.invoice_number ;       } ;
  public set number(val    : string)           { this.invoice_number        = val ; } ;
  public customer          : Jobsite           ;
  public customer_name     : string            = ""                         ;
  public customer_number   : string            = ""                         ;
  public address           : Address           = new Address()              ;
  public grid              : Array<Array<any>> = []                         ;
  public summary_grid      : Array<Array<any>> = []                         ;
  public site              : Jobsite           ;
  public site_number       : number            ;
  public site_name         : string            ;
  public total_hours_billed: number            ;
  public total_unit_hours  : number            ;
  public total_unit_billed : number            ;
  public total_astext      : string            ;
  public total_billed      : number            ;
  public unit_counts       : Object            ;
  public unitData          : Object            ;
  public crew              : string = ""       ;

  // public total:BigNumber = BigNumber(0);

  constructor() {
    window['onsite'] = window['onsite'] || new Object();
    window['onsite']['Invoice'] = Invoice;
    window['OSXInvoice'] = Invoice;
  }

  public serialize() {
    let doc:any = {};
    if(!doc._id) {
      this._id = this.generateInvoiceID();
      doc._id = this._id;
    }
    let keys = Object.keys(this);
    for(let key of keys) {
      if(key === 'site') {
      } else if(key === 'site_number') {
        if(this.site_number !== undefined && this.site_number !== null) {
          doc.site_number = this.site_number;
        } else if(this.site && this.site instanceof Jobsite) {
          doc.site_number = this.site.site_number;
        } else {
          doc.site_number = 1;
        }
      } else if(key === 'date') {
        doc[key] = this.date.format("YYYY-MM-DD");
      } else {
        doc[key] = this[key];
      }
    }
    Log.l("Invoice.serialize(): Returning doc:\n", doc);
    return doc;
  }

  public static deserialize(doc:any, invc?:Invoice) {
    let keys = Object.keys(doc);
    let invoice = invc ? invc : new Invoice();
    for(let key of keys) {
      if(key === 'date') {
        invoice.date = moment(doc.date, "YYYY-MM-DD");
      } else {
        invoice[key] = doc[key];
      }
    }
    Log.l("Invoice.deserialize(): Returning invoice:\n", invoice);
    return invoice;
  }

  public deserialize(doc:any) {
    return Invoice.deserialize(doc, this);
  }

  public readFromDoc(doc:any) {
    return Invoice.deserialize(doc, this);
  }

  public getGridRow(value:number) {
    let grid = this.grid;
    if(value >= grid.length) {
      return null;
    } else {
      return grid[value];
    }
  }

  public getInvoiceNumber():string {
    return this.invoice_number;
  }

  public setInvoiceNumber(val:number|string) {
    let invoice_number = String(val);
    this.invoice_number = invoice_number;
    return this.invoice_number;
  }

  public getInvoiceID() {
    if(this._id) {
      return this._id;
    } else {
      let id = this.generateInvoiceID();
      this._id = id;
      return this._id;
    }
  }

  public generateInvoiceID() {
    let ts = moment().format("YYYYMMDD.HHmmss");
    // let id = `${this.site_name}_${this.period_start}}_${ts}`;
    // let id = `${this.site_name}_${this.invoice_number}`;
    let siteID = this.site.getSiteID();
    let siteNumber = this.site.getSiteNumber();
    let id = `${siteID}_${this.invoice_number}`;
    return id;
  }

}
