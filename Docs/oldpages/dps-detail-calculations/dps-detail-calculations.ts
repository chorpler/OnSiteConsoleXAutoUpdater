import { sprintf                                                                         } from 'sprintf-js'                             ;
import { Component, OnInit, NgZone, ViewChild, ElementRef                                } from '@angular/core'                          ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                          ;
import { ServerService                                                                   } from '../../providers/server-service'         ;
import { DBService                                                                       } from '../../providers/db-service'             ;
import { AuthService                                                                     } from '../../providers/auth-service'           ;
import { AlertService                                                                    } from '../../providers/alert-service'          ;
import { NumberService                                                                   } from '../../providers/number-service'         ;
import { Log, Moment, moment, _matchCLL, _matchSite, oo                                  } from '../../config/config.functions'          ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from '../../domain/domain-classes'            ;
import { OSData                                                                          } from '../../providers/data-service'           ;
import { PDFService                                                                      } from '../../providers/pdf-service'            ;
import { OptionsComponent                                                                } from '../../components/options/options'       ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                       ;
import { SelectItem                                                                      } from 'primeng/primeng'                        ;
import { DataTable                                                                       } from 'primeng/components/datatable/datatable' ;

@IonicPage({name: 'DPS Detail Calculations'})
@Component({
  selector: 'page-dps-detail-calculations',
  templateUrl: 'dps-detail-calculations.html',
})
export class DPSDetailCalculationsPage {
  public title:string = "DPS Detail Calculations";
  public dataReady:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public db:DBService, public server:ServerService, public alert:AlertService, public data:OSData, public hotkeys:HotkeysService,) {
    window['onsitedpsdetailcalculations'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad DPSDetailCalculationsPage');
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public runWhenReady() {

  }

}
