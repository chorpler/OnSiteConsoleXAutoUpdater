import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core'              ;
import { Input, Output, ViewChild, NgZone            } from '@angular/core'              ;
import { Log, moment, Moment, oo                     } from 'config/config.functions'    ;
import { OSData                                      } from 'providers/data-service'     ;
import { Preferences                                 } from 'providers/preferences'      ;
import { InvoiceService                              } from 'providers/invoice-service'  ;
import { NotifyService                               } from 'providers/notify-service'   ;
import { DispatchService                             } from 'providers/dispatch-service' ;
import { Dropdown, SelectItem                        } from 'primeng/primeng'            ;

@Component({
  selector: 'options',
  templateUrl: 'options.html'
})
export class OptionsComponent implements OnInit,OnDestroy {
  @Input('type') type:string;
  @Output('close') close = new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<any>();
  @Output('onSave') onSave = new EventEmitter<any>();
  public showAllSites: boolean = false;
  public static PREFS:any = new Preferences();
  public get prefs():any { return OptionsComponent.PREFS;};
  public set prefs(opts:any) { OptionsComponent.PREFS = opts; };
  public keaneInvoiceNumber:number = -1;
  public weekdayMenu:SelectItem[] = [];
  public spinnerOn:boolean = false;
  public lastPeriod:string = "";
  public firstPeriodDate:Moment;
  public payPeriodsOptions:Array<number> = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
  ];
  public payPeriods:number = 8;
  public payPeriodsSelect:SelectItem[] = [];
  public payPeriodDate:string = "";
  public payPeriodString:string = "";

  constructor(
    public zone           :NgZone          ,
    public data           :OSData          ,
    public invoiceService :InvoiceService  ,
    public notify         :NotifyService   ,
    public dispatch       :DispatchService ,
  ) {
    window['consoleoptions'] = this;
  }

  ngOnInit() {
    Log.l("OptionsComponent: ngOnInit() called...");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  ngOnDestroy() {
    Log.l("OptionsComponent: ngOnDestroy() called...");
  }

  public runWhenReady() {
    this.spinnerOn = true;
    this.createMenus();
    let now = moment();
    // let payPeriods =
    let currentPPStart:Moment = this.data.getPayrollPeriodStartDate(now);
    this.createDropdowns();
    let PPToShow:number = this.prefs.USER.payroll_periods;
    let ppStartDate:Moment = this.data.getPayrollPeriodStartDate(now);
    let payPeriodDate = moment(ppStartDate).subtract(PPToShow, 'weeks');
    this.firstPeriodDate = payPeriodDate;
    Log.l("options: pay period to date:\n", payPeriodDate);
    this.getKeaneInvoiceNumber().then(res => {
      this.spinnerOn = false;
    });
  }

  public createMenus() {
    let dayList:SelectItem[] = [];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let count = days.length;
    for(let i = 0; i < count; i++) {
      let item = { label: days[i], value: i };
      dayList.push(item);
    }
    this.weekdayMenu = dayList;
  }

  public createDropdowns() {
    let payPeriodDropdowns:SelectItem[] = [];
    for(let pd of this.payPeriodsOptions) {
      let item:SelectItem = {
        label: pd + "",
        value: pd,
      }
      payPeriodDropdowns.push(item);
    }
    this.payPeriodsSelect = payPeriodDropdowns;
  }

  public getDBKeys() {
    let keys = Object.keys(this.prefs.DB);
    return keys;
  }

  public cancel(event:any) {
    Log.l("Options: cancel() called")
    this.onCancel.emit(this.prefs);
  }

  public save(event:any) {
    Log.l("Options: save() called");
    this.onSave.emit(this.prefs);
  }

  public async getKeaneInvoiceNumber() {
    try {
      let keaneDoc = await this.invoiceService.getCurrentInvoiceNumber();
      if(keaneDoc && keaneDoc.invoice) {
        this.keaneInvoiceNumber = Number(keaneDoc.invoice);
        return this.keaneInvoiceNumber;
      }
    } catch(err) {
      throw err;
    }
  }

  public saveKeaneInvoiceNumber(event?:any) {
    Log.l("saveKeaneInvoiceNumber(): Event is:\n", event);
    let num = this.keaneInvoiceNumber;
    this.invoiceService.saveKeaneInvoiceNumber(num).then(res => {
      this.notify.addSuccess("SUCCESS", `Set Keane invoice number to '${num}'.`, 3000);
    }).catch(err => {
      Log.l("saveKeaneInvoiceNumber(): Error saving Keane invoice number!");
      Log.e(err);
      this.notify.addError("ERROR", `Error setting Keane invoice number: '${err.message}'`, 10000);
    });
  }

  public refreshKeaneInvoiceNumber(event?:any) {
    Log.l("refreshKeaneInvoiceNumber(): Event is:\n", event);
    this.spinnerOn = true;
    this.getKeaneInvoiceNumber().then(res => {
      Log.l("refreshKeaneInvoiceNumber(): Successfully retrieved Keane invoice number!");
      this.spinnerOn = false;
      this.notify.addSuccess("SUCCESS", `Got Keane invoice number: '${res}'.`, 3000);
    }).catch(err => {
      this.spinnerOn = false;
      Log.l("refreshKeaneInvoiceNumber(): Error retrieving Keane invoice number!");
      Log.e(err);
      this.notify.addError("ERROR", `Error getting Keane invoice number: '${err.message}'`, 10000);
    });
  }

  public changePayrollPeriods(evt?:any) {
    Log.l(`changePayrollPeriods(): Creating ${this.prefs.USER.payroll_periods} payroll periods...`);
    let weeksBack:number = this.prefs.USER.payroll_periods;
    this.data.createPayrollPeriods(weeksBack);
  }

}
