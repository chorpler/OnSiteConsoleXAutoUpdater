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
import { DPS                                                                             } from '../../domain/domain-classes'      ;
import { OSData                                                                          } from '../../providers/data-service'     ;
import { PDFService                                                                      } from '../../providers/pdf-service'      ;
import { OptionsComponent                                                                } from '../../components/options/options' ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                 ;

@IonicPage({name: 'DPS Settings'})
@Component({
  selector: 'page-dps-settings',
  templateUrl: 'dps-settings.html',
})
export class DPSSettingsPage {
  public title:string = "DPS Settings";
  public mode:string = 'modal';
  public originalDPS:any;
  public get dps():DPS { return OSData.dps;};
  public get days_in_month():number { return OSData.dps.days_in_month;};
  public set days_in_month(value:number) { OSData.dps.days_in_month = value;};
  public get multiplier():number {return OSData.dps.multiplier.toNumber();};
  public set multiplier(value:number) {let val = value || 0; OSData.dps.multiplier = new dec(val)};
  public get cost_modifier():number { return OSData.dps.cost_modifier.toNumber();}
  public set cost_modifier(value:number) { OSData.dps.cost_modifier = new dec(value);}
  public get internal_salaries():number { return OSData.dps.internal_salaries.toNumber();};
  public set internal_salaries(value:number) { OSData.dps.internal_salaries = new dec(value);};
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController, public db:DBService, public server:ServerService, public alert:AlertService, public data: OSData) {
    window['onsitedpssettings'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad DPSSettingsPage');
    if(this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode');}
    let dps = this.dps;
    this.originalDPS = oo.clone(dps);
  }

  public save() {
    let dpsDoc = this.dps.serialize();
    this.db.saveDPSSettings(dpsDoc).then(res => {
      Log.l("save(): DPS settings saved.");
      this.viewCtrl.dismiss({data:this.dps});
    }).catch(err => {
      Log.l("save(): DPS settings not saved!");
      Log.e(err);
      this.alert.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
    });
  }

  public cancel() {
    this.viewCtrl.dismiss();
  }

}
