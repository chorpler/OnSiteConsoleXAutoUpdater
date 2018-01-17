import { Subscription                                                                            } from 'rxjs/Subscription'          ;
import { sprintf                                                                                 } from 'sprintf-js'                 ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef                             } from '@angular/core'              ;
import { IonicPage, NavController, NavParams, ModalController, PopoverController, ViewController } from 'ionic-angular'              ;
import { ServerService                                                                           } from 'providers/server-service'   ;
import { DBService                                                                               } from 'providers/db-service'       ;
import { AuthService                                                                             } from 'providers/auth-service'     ;
import { AlertService                                                                            } from 'providers/alert-service'    ;
import { Preferences                                                                             } from 'providers/preferences'      ;
import { OSData                                                                                  } from 'providers/data-service'     ;
import { Log, Moment, moment, isMoment, oo                                                       } from 'config/config.functions'    ;
import { Jobsite, Employee, Schedule,                                                            } from 'domain/domain-classes'      ;
import { PDFService                                                                              } from 'providers/pdf-service'      ;
import { OptionsComponent                                                                        } from 'components/options/options' ;
import { SelectItem, DataTable,                                                                  } from 'primeng/primeng'            ;
import { NotifyService                                                                           } from 'providers/notify-service'   ;
import { DispatchService                                                                         } from 'providers/dispatch-service' ;

@IonicPage({name: "Tech Phones"})
@Component({
  selector: 'page-tech-phones',
  templateUrl: 'tech-phones.html',
})
export class TechPhonesPage implements OnInit,OnDestroy {
  @ViewChild('dt') dt: DataTable;
  public title          : string       = "Tech Phones" ;
  public dsSubscription : Subscription                 ;
  public techPhoneLogins: Array<any>   = []            ;
  public allFields      : Array<any>   = []            ;
  public cols           : Array<any>   = []            ;
  public rowCount       : number       = 100           ;
  public colOpts        : SelectItem[] = []            ;
  public selectedColumns: string[]     = []            ;
  public dataReady      : boolean      = false         ;

  constructor(
    public navCtrl   : NavController   ,
    public navParams : NavParams       ,
    public db        : DBService       ,
    public server    : ServerService   ,
    public alert     : AlertService    ,
    public data      : OSData          ,
    public notify    : NotifyService   ,
    public dispatch  : DispatchService ,
  ) {
    window['onsitetechphones'] = this;
  }

  ngOnInit() {
    Log.l('TechPhonesPage: ngOnInit() fired');
    if(this.data.isAppReady()) {
      this.runWhenReady();

    }
  }

  ngOnDestroy() {
    Log.l('TechPhonesPage: ngOnDestroy() fired');
  }

  public runWhenReady() {
    let spinnerID = this.alert.showSpinner("Retrieving latest tech login data...");
    this.initializeFields();
    this.db.getTechPhones().then(res => {
      let loginArray = res;
      for(let record of loginArray) {
        let mo = moment(record.timestampM);
        record.ts = moment(mo);
        record.date = moment(mo).format("YYYY-MM-DD");
        record.time = moment(mo).format("HH:mm:ss");
      }
      // this.techPhoneLogins = loginArray;
      this.techPhoneLogins = loginArray.sort((a:any,b:any) => {
        let aT = a.timestamp;
        let bT = b.timestamp;
        return aT > bT ? -1 : aT < bT ? 1 : 0;
      });
      this.alert.hideSpinner(spinnerID);
      this.dataReady = true;
    }).catch(err => {
      this.alert.hideSpinner(spinnerID);
      Log.l("runWhenReady(): Error getting tech phone login list!");
      Log.e(err);
      this.notify.addError("ERROR", `Error getting tech login list from server: '${err.message}'`, 10000);
    });
  }

  public initializeFields() {
    let fields = [
      { field: "_id"                 , header: "ID"             , filter: true, filterPlaceholder: "ID"             , order: 0   , style: {width: "auto" }} ,
      { field: "username"            , header: "User"           , filter: true, filterPlaceholder: "User"           , order: 1   , style: {width: "auto" }} ,
      { field: "date"                , header: "Login Date"     , filter: true, filterPlaceholder: "Login Date"     , order: 2   , style: {width: "120px"}} ,
      { field: "time"                , header: "Login Time"     , filter: true, filterPlaceholder: "Login Time"     , order: 3   , style: {width: "120px"}} ,
      { field: "ts"                  , header: "Timestamp"      , filter: true, filterPlaceholder: "Timestamp"      , order: 4   , style: {width: "auto"}} ,
      { field: "timestamp"           , header: "TimestampXL"    , filter: true, filterPlaceholder: "Timestamp XL"   , order: 5   , style: {width: "auto" }} ,
      { field: "timestampM"          , header: "TimestampM"     , filter: true, filterPlaceholder: "TimestampM"     , order: 6   , style: {width: "auto" }} ,
      { field: "device.manufacturer" , header: "Maker"          , filter: true, filterPlaceholder: "Maker"          , order: 7   , style: {width: "120px"}} ,
      { field: "device.model"        , header: "Model"          , filter: true, filterPlaceholder: "Model"          , order: 8   , style: {width: "120px" }} ,
      { field: "device.platform"     , header: "Platform"       , filter: true, filterPlaceholder: "Platform"       , order: 9   , style: {width: "120px" }} ,
      { field: "device.version"      , header: "Version"        , filter: true, filterPlaceholder: "Version"        , order: 10  , style: {width: "120px" }} ,
      { field: "device.appVersion"   , header: "App Version"    , filter: true, filterPlaceholder: "App Version"    , order: 11  , style: {width: "120px" }} ,
      { field: "device.virtual"      , header: "Virtual Device" , filter: true, filterPlaceholder: "Virtual Device" , order: 12  , style: {width: "120px" }} ,
      { field: "device.uniqueID"     , header: "UDID"           , filter: true, filterPlaceholder: "UDID"           , order: 13  , style: {width: "auto" }} ,
    ];
    this.allFields = fields;
    this.cols = this.allFields.slice(0);
    for(let field of fields) {
      let item = { label: field.header, value: field.field };
      // let item = {label: field.header, value: field};
      this.colOpts.push(item);
    }
    this.selectedColumns = [];
    for(let field of this.colOpts) {
      if(field.value !== "_id" && field.value !== "ts" && field.value !== "timestamp" && field.value !== "timestampM" && field.value !== "device.uniqueID") {
        this.selectedColumns.push(field.value);
      }
    }
    this.columnsChanged();
  }

  public tableReset() {
    Log.l("tableReset(): Now resetting data table...");
    this.dataReady = false;
    this.initializeFields();
    this.dt.reset();
    this.dataReady = true;
  }

  public selectionChanged(colList?: string[]) {
    this.dataReady = false;
    this.columnsChanged(colList);
    this.dataReady = true;
  }

  public columnsChanged(colList?: string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // let cols = this.cols;
    Log.l("columnsChanged(): Items now selected:\n", vCols);
    // let sel = [];
    let sel = this.allFields.filter((a: any) => {
      return (vCols.indexOf(a.field) > -1);
    }).sort((a: any, b: any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Items selected via string:\n", sel);
    // this.displayColumns = [];
    // this.displayColumns = oo.clone(sel);
    // this.cols = oo.clone(sel);
    this.cols = sel;
    // this.displayColumns = [];
    // for(let item of sel) {
    //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    //   this.displayColumns.push(oo.clone(item));
    //   // let i = dc.findIndex((a:any) => {
    //   //   return (a.field === item['field']);
    //   // });
    //   // if(i === -1) {
    //   //   dc = [...dc, item];
    //   // }
    // }
    this.cols = this.cols.sort((a: any, b: any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Now field list is:\n", this.cols);
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }


}
