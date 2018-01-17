import { sprintf                                                                         } from 'sprintf-js'                       ;
import { Component, OnInit, NgZone, ViewChild, ElementRef                                } from '@angular/core'                    ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                    ;
import { ServerService                                                                   } from '../../providers/server-service'   ;
import { DBService                                                                       } from '../../providers/db-service'       ;
import { AuthService                                                                     } from '../../providers/auth-service'     ;
import { AlertService                                                                    } from '../../providers/alert-service'    ;
import { NumberService                                                                   } from '../../providers/number-service'   ;
import { Log, Moment, moment, dec, Decimal, oo,          _matchCLL, _matchSite           } from '../../config/config.functions'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from '../../domain/domain-classes'      ;
import { DPS                                                                             } from '../../domain/domain-classes'      ;
import { OSData                                                                          } from '../../providers/data-service'     ;
import { PDFService                                                                      } from '../../providers/pdf-service'      ;
import { OptionsComponent                                                                } from '../../components/options/options' ;
import { SelectItem, MenuItem, TieredMenuModule,                                         } from 'primeng/primeng'                  ;

@IonicPage({name: 'Config Values'})
@Component({
  selector: 'page-config-values',
  templateUrl: 'config-values.html',
})
export class ConfigValuesPage {
  @ViewChild('dtrt') dtrt:ElementRef;
  @ViewChild('dttt') dttt:ElementRef;
  public title:string = "Configuration";
  public config:any;
  public training_types:Array<any> = [];
  public report_types:Array<any> = [];
  public locIDs:Array<any> = [];
  public rt_fields   :Array<any> = [];
  public tt_fields   :Array<any> = [];
  public locID_fields:Array<any> = [];
  public numberColumnStyle:any = {'max-width': '30px', 'width': '30px', 'text-align': 'right'};
  public dataReady:boolean = true;
  constructor( public navCtrl  : NavController,
    public navParams: NavParams,
    public server   : ServerService,
    public db       : DBService,
    public alert    : AlertService,
    public data     : OSData,
    public auth     : AuthService,
    public modalCtrl: ModalController,
    public zone     : NgZone
  ) {
    window['onsiteconfigvalues'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad ConfigValuesPage');
    if(this.data.isAppReady()) {
      this.runWhenReady();
    }
  }

  public runWhenReady() {
    let training_types:Array<any> = this.data.getData('training_types');
    let report_types:Array<any> = this.data.getData('report_types');
    let locIDs:Array<any> = this.data.getConfigData('locIDs');
    if(training_types && training_types.length > 0) {
      this.training_types = training_types;
      this.report_types = report_types;
      this.locIDs = locIDs;
      this.setupFields();
      this.dataReady = true;
    } else {
      this.db.getAllConfigData().then((res:any) => {
        this.config = res;
        this.report_types = res.report_types;
        this.training_types = res.training_types;
        this.locIDs = res.locids;
        this.setupFields();
        this.dataReady = true;
      }).catch(err => {
        Log.l("runWhenReady(): Config data retrieved.");
        Log.e(err);
        this.alert.showAlert("ERROR", "Error retrieving config data:<br>\n<br>\n" + err.message);
      });
    }
  }

  public setupFields() {
    let rt = [
      {field: "name", header: "Value"},
      {field: "value", header: "Display Name"},
    ];
    let tt = [
      {field: "name", header: "Value"},
      {field: "value", header: "Display Name"},
      {field: "hours", header: "Default Hours"},
    ];
    let lid = [
      // {field: "name", header: "Code" },
      {field: "fullName", header: "Name" },
    ]
    this.rt_fields = rt;
    this.tt_fields = tt;
    this.locID_fields = lid;
  }

  public addConfig(type:string, event?:any) {
    if(type === 'report_type') {
      let report_type = {name: "", fullName: ""};
      this.report_types.push(report_type);
      this.report_types = this.report_types.slice(0);
    } else if(type === 'training') {
      let training = {name: "", fullName: ""};
      this.training_types.push(training);
      this.training_types = this.training_types.slice(0);
    } else if(type === 'locID') {
      let locID = {name: "", fullName: ""};
      this.locIDs.push(locID);
      this.locIDs = this.locIDs.slice(0);
    }
  }



}
