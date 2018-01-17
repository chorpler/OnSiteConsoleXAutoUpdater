import { sprintf                                                                         } from 'sprintf-js'                       ;
import { Component, OnInit, NgZone, ViewChild, ElementRef                                } from '@angular/core'                    ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                    ;
import { ServerService                                                                   } from '../../providers/server-service'   ;
import { DBService                                                                       } from '../../providers/db-service'       ;
import { AuthService                                                                     } from '../../providers/auth-service'     ;
import { AlertService                                                                    } from '../../providers/alert-service'    ;
import { NumberService                                                                   } from '../../providers/number-service'   ;
import { Log, Moment, moment, dec, Decimal, oo, ooPatch, _matchCLL, _matchSite           } from '../../config/config.functions'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from '../../domain/domain-classes'      ;
import { OSData                                                                          } from '../../providers/data-service'     ;
import { PDFService                                                                      } from '../../providers/pdf-service'      ;
import { OptionsComponent                                                                } from '../../components/options/options' ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                 ;

@IonicPage({name: "DPS Report"})
@Component({
  selector: 'page-dps-report',
  templateUrl: 'dps-report.html',
})
export class DPSReportPage {
  public title        : string            = "DPS Report" ;
  public mode         : string            = "page"       ;
  public period       : PayrollPeriod     ;
  public sites        : Array<Jobsite>    = []           ;
  public reports      : Array<Report>     = []           ;
  public allReports   : Array<Report>     = []           ;
  public techs        : Array<Employee>   = []           ;
  public grid         : Array<Array<any>> = []           ;
  public eShifts      : Map<Employee,Shift>              ;
  public ePeriod      : Map<Employee,PayrollPeriod>      ;
  private _element    : any                              ;
  public dataReady    : boolean           = false        ;
  public chart_data   : Array<Array<any>>                ;
  public chart_options: any                              ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db:DBService, public server:ServerService, public data:OSData, public hotkeys:HotkeysService, public element:ElementRef) {
    window['onsitedpsreport'] = this;
    this._element = this.element.nativeElement;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad DPSReportPage');
    if(this.navParams.get('ePeriod') !== undefined) { this.ePeriod = this.navParams.get('ePeriod');}
    this.hotkeys.add(new Hotkey(['meta+c', 'alt+c'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
      Log.l("DPSReport: got hotkey:\n", event, combo);
      this.toggleShowChart();
      let e: ExtendedKeyboardEvent = event;
      e.returnValue = false;
      return e;
    }));
    this.readAndProcessData();
  }

  public createDefaultData() {
    this.chart_data = [
      ['Type', 'Percentage'],
      ['Segment A', 75],
      ['Segment B', 25],
    ];
    this.chart_options = { title: "Pie Chart", width: 500, height: 500, is3D: true };
  }

  public readAndProcessData() {
    this.sites = this.data.getData('sites');
    this.techs = this.data.getData('employees');
    this.allReports = this.data.getData('reports');
    let now = moment();
    let startDate = this.data.getPayrollPeriodStartDate(now);
    // moment().format("YYYY-MM-DD");
    let endDate = moment(now).add(6, 'days').format("YYYY-MM-DD");
    this.reports = this.data.getData('reports').filter(a => {
      return a.report_date >= startDate && a.report_date <= endDate;
    });
    // setTimeout(() => {
    //   this.dataReady = true;
    // }, 5000);
    this.dataReady = true;

  }

  public updateDate(startDate:Moment|Date) {
    let start = moment(startDate).startOf('day');
    let end   = moment(start).add(6, 'days');
    let strStart = start.format("YYYY-MM-DD");
    let strEnd   = end.format("YYYY-MM-DD");
    this.reports = this.allReports.filter(a => {
      return a.report_date >= strStart && a.report_date <= strEnd;
    });
    let s = start.toExcel();
    let e = end.toExcel();
    for(let i = s; i <= e; i++) {
      for(let tech of this.techs) {

      }
    }
  }

  public toggleShowChart() {
    this.dataReady = !this.dataReady;
  }

}
