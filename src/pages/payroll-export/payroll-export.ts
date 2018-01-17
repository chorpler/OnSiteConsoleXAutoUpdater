import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core'                              ;
import { IonicPage, NavController, NavParams              } from 'ionic-angular'                              ;
import { Log, Moment, moment                              } from '../../config/config.functions'              ;
import { OnSiteConsoleX                                   } from '../../app/app.component'                    ;
import { OSData                                           } from '../../providers/data-service'               ;
import { Jobsite                                          } from '../../domain/jobsite'                       ;
import { Employee                                         } from '../../domain/employee'                      ;
import { Report                                           } from '../../domain/report'                        ;
import { ReportOther                                      } from '../../domain/reportother'                   ;
import { PayrollPeriod                                    } from '../../domain/payroll-period'                ;
import { Shift                                            } from '../../domain/shift'                         ;
import { Schedule                                         } from '../../domain/schedule'                      ;
import { NotifyService                                    } from '../../providers/notify-service'             ;

@IonicPage({name: 'Payroll Export'})
@Component({
  selector: 'page-payroll-export',
  templateUrl: 'payroll-export.html',
})
export class PayrollExportPage {
  @ViewChild('printArea') printArea:ElementRef;
  public title    : string             = "Payroll Export" ;
  public period   : PayrollPeriod      ;
  public reports  : Array<Report>      = []               ;
  public others   : Array<ReportOther> = []               ;
  public techs    : Array<Employee>    = []               ;
  public dataReady: boolean            = false            ;
  public grid     : Array<Array<any>>  = []               ;
  public csv      : string             = ""               ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public data:OSData, public appComponent:OnSiteConsoleX, public notify:NotifyService) {
    window['payrollexport'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad PayrollExportPage');
    if(this.navParams.get('period' ) !== undefined) { this.period  = this.navParams.get('period' );}
    if(this.navParams.get('reports') !== undefined) { this.reports = this.navParams.get('reports');}
    if(this.navParams.get('techs'  ) !== undefined) { this.techs   = this.navParams.get('techs'  );}
    if(this.navParams.get('grid'   ) !== undefined) { this.grid    = this.navParams.get('grid'   );}
    if(this.navParams.get('csv'    ) !== undefined) { this.csv     = this.navParams.get('csv'    );}
    this.processData();
  }

  public processData() {
    Log.l("processData(): Called...");
    let keys = [];
    if (this.grid !== undefined && this.grid !== null) {
      keys = Object.keys(this.grid);
    }
    if (this.grid && keys.length > 0) {
      this.dataReady = true;
    } else {
      if (this.navParams.get('grid') !== undefined) {
        this.grid = this.navParams.get('grid');
        this.dataReady = true;
      }
    }
    if (this.dataReady) {
      Log.l("Get ready for CSV data:");
      Log.l(this.csv);
      window['mikecsv'] = this.csv;
    }
  }

  public copyTable() {
    let table = this.printArea.nativeElement;
    let el = table.innerHtml;
    let range,selection;
    if(window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('copy');
    selection.removeAllRanges();
    this.notify.addSuccess("SUCCESS", "Table copied to clipboard", 3000);
  }

}
