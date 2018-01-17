import { Log                                         } from '../../config/config.functions'   ;
import { Component, OnInit, OnDestroy, EventEmitter, } from '@angular/core'                   ;
import { Input, Output, ViewChild, NgZone            } from '@angular/core'                   ;
import { OSData                                      } from '../../providers/data-service'    ;
import { Preferences                                 } from '../../providers/preferences'     ;
import { StorageService                              } from '../../providers/storage-service' ;

@Component({
  selector: 'options-generic',
  templateUrl: 'options-generic.html'
})
export class OptionsGenericComponent implements OnInit,OnDestroy {
  @Input('type') type:string;
  @Output('close') close = new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<any>();
  @Output('onSave') onSave = new EventEmitter<any>();
  public showAllSites:boolean = false;
  public static PREFS:any = new Preferences();
  public get prefs():any { return OptionsGenericComponent.PREFS;};
  public set prefs(opts:any) { OptionsGenericComponent.PREFS = opts; };

  constructor(public storage:StorageService, public data:OSData) {
    window['consoleoptionsgeneric'] = this;
  }

  ngOnInit() {
    Log.l("OptionsGenericComponent: ngOnInit() called...");
  }

  ngOnDestroy() {
    Log.l("OptionsGenericComponent: ngOnDestroy() called...");
  }

  public cancel(event:any) {
    Log.l("OptionsGeneric: cancel() called")
    this.onCancel.emit(this.prefs);
  }

  public save(event:any) {
    Log.l("OptionsGeneric: save() called");
    this.onSave.emit(this.prefs);
  }
}
