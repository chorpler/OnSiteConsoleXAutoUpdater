import { sprintf                                                                         } from 'sprintf-js'                         ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef, Input, Output      } from '@angular/core'                      ;
import { EventEmitter, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef        } from '@angular/core'                      ;
import { Subscription                                                                    } from 'rxjs/Subscription'                  ;
import { ServerService                                                                   } from '../../providers/server-service'     ;
import { DBService                                                                       } from '../../providers/db-service'         ;
import { AuthService                                                                     } from '../../providers/auth-service'       ;
import { AlertService                                                                    } from '../../providers/alert-service'      ;
import { NumberService                                                                   } from '../../providers/number-service'     ;
import { Log, Moment, moment, dec, Decimal, oo, ooPatch, _matchCLL, _matchSite           } from '../../config/config.functions'      ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from '../../domain/domain-classes'        ;
import { DPS                                                                             } from '../../domain/domain-classes'        ;
import { OSData                                                                          } from '../../providers/data-service'       ;
import { PDFService                                                                      } from '../../providers/pdf-service'        ;
import { OptionsComponent                                                                } from '../../components/options/options'   ;
import { ComponentMessages                                                               } from '../../providers/component-messages' ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                   ;

@Component({
  selector: 'dps-settings',
  templateUrl: 'dps-settings.html',
})
export class DPSSettingsComponent implements OnInit {
  @Output('updated') updated = new EventEmitter<boolean>();
  public inputElement    : ElementRef                  ;
  public title           : string     = "DPS Settings" ;
  public mode            : string     = 'modal'        ;
  public originalDPS     : any                         ;
  public cost_modifier_readonly:boolean = false        ;
  public internalSalaries: number     = 0              ;
  // public set cost_modifier(value      : number) { OSData.dps.cost_modifier                                                                                        =new dec(value) ;    }

  public get dps()                       : DPS     { return OSData.dps                                                                                               ;               }    ;
  public get days_in_month()             : number  { return OSData.dps.days_in_month                                                                                 ;               }    ;
  public set days_in_month(value         : number) { OSData.dps.days_in_month                                                                                        =value          ;    }                      ;
  public get multiplier()                : number  { return OSData.dps.multiplier.toNumber()                                                                         ;               }    ;
  public set multiplier(value            : number) { let val                                                                                                         =value          || 0 ;OSData.dps.multiplier = new dec(val) } ;
  public get cost_modifier()             : number  { return OSData.dps.cost_modifier.toNumber()                                                                      ;               }
  public set cost_modifier(value         : number) { this.alert.showAlert("READ-ONLY", "This value is derived from the multiplier value. Please adjust it instead.") ;               }    ;
  public get internal_salaries()         : number  { return OSData.dps.internal_salaries.toNumber()                                                                  ;               }    ;
  public set internal_salaries(value     : number) { OSData.dps.internal_salaries                                                                                    =new dec(value) ;    }                      ;
  public get monthly_fuel()              : number  { return OSData.dps.fuel.toNumber()                                                                               ;               }    ;
  public set monthly_fuel(value          : number) { OSData.dps.fuel                                                                                                 =new dec(value) ;    }
  public get monthly_transportation()    : number  { return OSData.dps.transportation.toNumber()                                                                     ;               }    ;
  public set monthly_transportation(value: number) { OSData.dps.transportation                                                                                       =new dec(value) ;    }
  public get insurance_travelers()       : number  { return OSData.dps.travelers.toNumber()                                                                          ;               }    ;
  public set insurance_travelers(value   : number) { OSData.dps.travelers                                                                                            =new dec(value) ;    }
  public get insurance_imperial()        : number  { return OSData.dps.imperial.toNumber()                                                                           ;               }    ;
  public set insurance_imperial(value    : number) { OSData.dps.imperial                                                                                             =new dec(value) ;    }
  public get insurance_tx_mutual()       : number  { return OSData.dps.tx_mutual.toNumber()                                                                          ;               }    ;
  public set insurance_tx_mutual(value   : number) { OSData.dps.tx_mutual                                                                                            =new dec(value) ;    }
  public get insurance_blue_cross()      : number  { return OSData.dps.blue_cross.toNumber()                                                                         ;               }    ;
  public set insurance_blue_cross(value  : number) { OSData.dps.blue_cross                                                                                           =new dec(value) ;    }
  public get insurance_property()        : number  { return OSData.dps.property.toNumber()                                                                           ;               }    ;
  public set insurance_property(value    : number) { OSData.dps.property                                                                                             =new dec(value) ;    }

  constructor(public application:ApplicationRef, public changeDetector:ChangeDetectorRef, public zone:NgZone, public alert:AlertService, public db:DBService, public server:ServerService, public data:OSData, public componentMessages: ComponentMessages) {
    window['onsitedpssettings'] = this;
  }

  ngOnInit() {
    Log.l("DPSSettingsComponent: ngOnInit() called");
    // if(this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode');}
    let dps = this.dps;
    this.originalDPS = oo.clone(dps);
    this.internalSalaries = this.internal_salaries;
  }

  ngOnDestroy() {
    Log.l("DPSSettingsComponent: ngOnDestroy() called");
    this.changeDetector.detach();
  }

  public updateInternalSalaries() {
    let salaries = Number(this.internalSalaries);
    OSData.dps.internal_salaries = new dec(salaries);
    Log.l("updateInternalSalaries(): Updated to: ", salaries);
  }

  public save() {
    let dpsDoc = this.dps.serialize();
    this.db.saveDPSSettings(dpsDoc).then(res => {
      Log.l("save(): DPS settings saved.");
      // this.viewCtrl.dismiss({data:this.dps});
    }).catch(err => {
      Log.l("save(): DPS settings not saved!");
      Log.e(err);
      this.alert.showAlert("ERROR", "DPS settings could not be saved.<br>\n<br>\n" + err.message);
    });
  }

  public cancel() {
    // this.viewCtrl.dismiss();
  }

  public whichElementHasFocus() {
    this.inputElement = new ElementRef(document.activeElement);
    Log.l("whichElementHasFocus(): Focused element is:\n", this.inputElement);
  }

  public moneyAdd(event:any, key:string) {
    Log.l("moneyAdd(): Event is:\n", event);
    let el = event.srcElement;
    let value = new dec(this[key]) || new dec(0);
    let newValue:Decimal = value.add(0.05);
    // let newValue = Number(+value.toFixed(2)) + 0.05;
    value = newValue;
    this[key] = newValue;
    Log.l("moneyAdd(): value is now: ", value.toString());
    this.setDirty();
  }

  public moneySubtract(event:any, key:string) {
    Log.l("moneySubtract(): Event is:\n", event);
    let el = event.srcElement;
    let value = new dec(this[key]) || new dec(0);
    // .attributes['ng-reflect-model'].
    // let newValue = Number(+value.toFixed(2)) - 0.05;
    let newValue:Decimal = value.minus(0.05);
    value = newValue;
    this[key] = newValue;
    Log.l("moneySubtract(): value is now: ", value.toString());
    this.setDirty();
  }

  public setDirty(value?:boolean) {
    // let val = value ? value : true;
    // this.updated.emit(val);
    Log.l("setDirty(): Dirty set!");
    this.updated.emit(true);
  }

}
