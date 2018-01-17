import 'rxjs/add/operator/debounceTime';
import { sprintf                                            } from 'sprintf-js'                                 ;
import { Component, OnInit, OnDestroy, NgZone               } from '@angular/core'                              ;
import { IonicPage, NavController, NavParams                } from 'ionic-angular'                              ;
import { ViewController, ModalController, PopoverController } from 'ionic-angular'                              ;
import { FormGroup, FormControl, Validators                 } from "@angular/forms"                             ;
import { Log, moment, Moment, isMoment                      } from '../../config/config.functions'              ;
import { OSData                                             } from '../../providers/data-service'               ;
import { AuthService                                        } from '../../providers/auth-service'               ;
import { DBService                                          } from '../../providers/db-service'                 ;
import { ServerService                                      } from '../../providers/server-service'             ;
import { AlertService                                       } from '../../providers/alert-service'              ;
import { Preferences                                        } from '../../providers/preferences'                ;
import { Street                                             } from '../../domain/street'                        ;
import { Address                                            } from '../../domain/address'                       ;
import { Jobsite                                            } from '../../domain/jobsite'                       ;
import { AgmCoreModule, GoogleMapsAPIWrapper                } from '@agm/core'                                  ;
import { Subscription                                       } from 'rxjs/Subscription'                          ;
import { Command, KeyCommandService                         } from '../../providers/key-command-service'        ;
import { NotifyService                                      } from '../../providers/notify-service'             ;
import { NotificationComponent                              } from '../../components/notification/notification' ;

@IonicPage({name : "Add Work Site"})
@Component({
  selector      : 'page-add-work-site',
  templateUrl   : 'add-work-site.html'
})

export class AddWorkSitePage implements OnInit,OnDestroy {
  public title                      : string  = "Add Work Site"                                    ;
  public keySubscription            : Subscription                                                 ;
  public jobsite                    : Jobsite                                                      ;
  public sites                      : Array<Jobsite> = []                                          ;
  public siteIndex                  : number = 0                                                   ;
  public siteCount                  : number = 0                                                   ;
  public modal                      : any                                                          ;
  public mode                       : string  = 'Add'                                              ;
  public source                     : string  = ''                                                 ;
  public clientList                 : any                                                          ;
  public locationList               : any                                                          ;
  public locIDList                  : any                                                          ;
  public loc2ndList                 : any                                                          ;
  public rotations                  : any                                                          ;
  public techShifts                 : any                                                          ;
  public lat                        : number  = 26.177260                                          ;
  public lon                        : number  = -97.964594                                         ;
  public mapMode                    : string  = "hybrid"                                           ;
  public mapZoom                    : number  = 16                                                 ;
  public radiusColor                : string  = "rgba(255,0,0,0.5)"                                ;

  public jobSiteForm                : FormGroup                                                    ;
  public selected_client            : FormControl                                                  ;
  public client                     : FormControl                                                  ;
  public location                   : FormControl                                                  ;
  public locID                      : FormControl                                                  ;
  public address                    : FormControl                                                  ;
  public billing_address            : FormControl                                                  ;
  public latitude                   : FormControl                                                  ;
  public longitude                  : FormControl                                                  ;
  public within                     : FormControl                                                  ;
  public account_number             : FormControl                                                  ;
  public travel_time                : FormControl                                                  ;
  public per_diem_rate              : FormControl                                                  ;
  public lodging_rate               : FormControl                                                  ;
  public requires_preauth           : FormControl                                                  ;
  public requires_preauth_pertech   : FormControl                                                  ;
  public requires_invoice_woreports : FormControl                                                  ;
  public account_or_contract        : FormControl                                                  ;
  public billing_rate               : FormControl                                                  ;
  public active                     : FormControl                                                  ;
  public shiftStartTimes            : any                                                          ;
  public startOptions               : Array<string> = []                                           ;
  public startOptionsAM             : Array<string> = []                                           ;
  public startOptionsPM             : Array<string> = []                                           ;
  public startAM                    : string        = ""                                           ;
  public startPM                    : string        = ""                                           ;
  public timeAM                     : string        = ""                                           ;
  public timePM                     : string        = ""                                           ;

  private _client                   : any                                                          ;
  private _location                 : any                                                          ;
  private _locID                    : any                                                          ;
  // private _loc2nd                   : any                                                          ;
  private _lat                      : any                                                          ;
  private _lon                      : any                                                          ;
  public selectedClient             : any                                                          ;

  public siteDivisions              : any                                                          ;

  public addClient                  : any     = {name:"__", fullName:"Add new client"}             ;
  public addLocation                : any     = {name:"__", fullName:"Add new location"}           ;
  public addLocID                   : any     = {name:"__", fullName:"Add new location ID"}        ;
  // public addLoc2nd                  : any     = {name:"__", fullName:"Add new secondary location"} ;
  public dataReady                  : boolean = false                                              ;

  public static PREFS     : any           = new Preferences()                 ;
  public get prefs()      : any { return AddWorkSitePage.PREFS; }               ;


  constructor(public navCtrl   : NavController       ,
              public navParams : NavParams           ,
              public viewCtrl  : ViewController      ,
              public modalCtrl : ModalController     ,
              public popover   : PopoverController   ,
              public zone      : NgZone              ,
              public db        : DBService           ,
              public server    : ServerService       ,
              public alert     : AlertService        ,
              public auth      : AuthService         ,
              public data      : OSData              ,
              public map       : GoogleMapsAPIWrapper,
              public keyService: KeyCommandService   ,
              public notify    : NotifyService       ,
  ) {
      window['addworksite'] = this;
  }

  public ngOnInit() {
    Log.l("AddWorkSitePage: ngOnInit() fired");
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "AddWorkSitePage.saveNoExit"    : this.saveNoExit(); break;
        case "AddWorkSitePage.sitePrevious"  : this.sitePrevious(); break;
        case "AddWorkSitePage.siteNext"      : this.siteNext(); break;
        case "AddWorkSitePage.onSubmit"      : this.onSubmit(); break;
      }
    });
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public ngOnDestroy() {
    Log.l("AddWorkSitePage: ngOnInit() fired");
    this.keySubscription.unsubscribe();
  }

  // public ionViewDidLoad() {
  //   Log.l('ionViewDidLoad AddWorkSitePage');
    // this.hotkeys.add(new Hotkey(['ctrl+up', 'command+up'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.sitePrevious();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+down', 'command+down'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.siteNext();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+s', 'command+s', 'alt+s', 'meta+s'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.saveNoExit();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.hotkeys.add(new Hotkey(['ctrl+shift+s', 'command+shift+s'], (event: KeyboardEvent, combo: string): ExtendedKeyboardEvent => {
    //   Log.l("AddWorkSite: got hotkey:\n", event, combo);
    //   this.onSubmit();
    //   let e: ExtendedKeyboardEvent = event;
    //   e.returnValue = false;
    //   return e;
    // }));

    // this.data.appReady().then(res => {
    //   this.runWhenReady();
    // });
  // }

  public runWhenReady() {
    if (this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode'); } else { this.mode = "Add" };
    if (this.navParams.get('source') !== undefined) { this.source = this.navParams.get('source'); } else { this.source = "worksites" };
    if(this.navParams.get('sites') !== undefined) { this.sites = this.navParams.get('sites'); } else { this.sites = this.data.getData('sites');}
    this.title = `${this.mode} Job Site`;
    if(this.navParams.get('jobsite') !== undefined) {
      this.jobsite = this.navParams.get('jobsite');
      this.siteIndex = this.sites.indexOf(this.jobsite) + 1;
      this.siteCount = this.sites.length;
    } else {
      this.jobsite = new Jobsite( {"name":"", "fullName": ""},
                                  {"name":"", "fullName": ""},
                                  {"name":"MNSHOP", "fullName":"Maintenance Shop"},
                                  new Address(new Street('', ''), '', '', ''), 26.177260, -97.964594, 500 );
      this.sites.push(this.jobsite);
      this.siteIndex = this.sites.length;
      let sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
        let sA = a.site_number;
        let sB = b.site_number;
        return sA > sB ? 1 : sA < sB ? -1 : 0;
      });
      let siteNumber = sortedSites[sortedSites.length - 1].site_number;
      siteNumber++;
      this.jobsite.setSiteNumber(siteNumber);
      this.siteCount = this.sites.length;
    }
    Log.l(`Mode is '${this.mode}' and jobsite is:\n`, this.jobsite);

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        let time = sprintf("%02d:%02d", i, j);
        this.startOptions.push(time);
        this.startOptionsAM.push(time);
        this.startOptionsPM.push(time);
      }
    }
    if(this.jobsite) {
      let times = this.jobsite.getShiftStartTimes();
      this.shiftStartTimes = times;
      this.startAM = times.AM;
      this.startPM = times.PM;
    }
    this.server.getClients().then((res) => {
      Log.l("AddWorkSites: got client data:\n", res);
      this.clientList = res;
      this.clientList.push(this.addClient);
      return this.server.getLocations();
    }).then((res) => {
      Log.l("AddWorkSites: got location data:\n", res);
      this.locationList = res;
      this.locationList.push(this.addLocation);
      return this.server.getLocIDs();
    }).then((res) => {
      Log.l("AddWorkSites: got locID data:\n", res);
      this.locIDList = res;
      this.locIDList.push(this.addLocID);
      // return this.server.getLoc2nds();
    // }).then((res) => {
      // Log.l("AddWorkSites: got loc2nd data:\n", res);
      // this.loc2ndList = res;
      // this.loc2ndList.push(this.addLoc2nd);
      return this.server.getShiftRotations();
    }).then((res) => {
      Log.l("AddWorkSites: got shift rotation data:\n", res);
      this.rotations = res;
      let rotnames = Object.keys(this.jobsite.shiftRotations);
      if(!rotnames.length) {
        this.jobsite.shiftRotations = this.rotations;
      }
      return this.server.getTechShifts();
    }).then((res) => {
      Log.l("AddWorkSites: got tech shift data:\n", res);
      this.techShifts = res;
      let shiftNames = Object.keys(this.jobsite.techShifts);
      if(!shiftNames.length) {
        this.jobsite.techShifts = this.techShifts;
      }
      Log.l("AddWorkSites: all data ready, Jobsite is:\n", this.jobsite);
      this.initializeForm();
      this.updateForm();
      this.dataReady = true;
    }).catch((err) => {
      Log.l("AddWorkSites: error getting data!");
      Log.e(err);
    });
  }

  public addJobSite() {
    this.dataReady = false;
    this.mode = 'Add';
    let jobsite = new Jobsite( {"name":"", "fullName": ""},
                                {"name":"", "fullName": ""},
                                {"name":"MNSHOP", "fullName":"Maintenance Shop"},
                                new Address(new Street('', ''), '', '', ''), 26.177260, -97.964594, 500 );
    let sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
      let sA = a.site_number;
      let sB = b.site_number;
      return sA > sB ? 1 : sA < sB ? -1 : 0;
    });
    let siteNumber = sortedSites[sortedSites.length - 1].site_number;
    siteNumber++;
    jobsite.setSiteNumber(siteNumber);
    sortedSites = this.sites.sort((a:Jobsite, b:Jobsite) => {
      let sA = a.sort_number;
      let sB = b.sort_number;
      return sA > sB ? 1 : sA < sB ? -1 : 0;
    });
    let sortNumber = sortedSites[sortedSites.length - 1].sort_number;
    jobsite.sort_number = sortNumber + 1;
    this.sites.push(jobsite);
    this.siteIndex = this.sites.length;
    this.siteCount = this.sites.length;
    let times = jobsite.getShiftStartTimes();
    this.shiftStartTimes = times;
    this.startAM = times.AM;
    this.startPM = times.PM;
    this.getConfigData().then(res => {
      jobsite.techShifts = this.techShifts;
      jobsite.shiftRotations = this.rotations;
      this.jobsite = jobsite;
      this.initializeForm();
      this.updateForm();
      this.updateDisplay();
      this.dataReady = true;
    }).catch(err => {
      Log.l("addJobSite(): Error while adding.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error adding new job site:<br>\n<br>\n" + err.message);
    });
  }

  public getConfigData() {
    return new Promise((resolve,reject) => {
      this.server.getClients().then((res) => {
        Log.l("AddWorkSites: got client data:\n", res);
        this.clientList = res;
        this.clientList.push(this.addClient);
        return this.server.getLocations();
      }).then((res) => {
        Log.l("AddWorkSites: got location data:\n", res);
        this.locationList = res;
        this.locationList.push(this.addLocation);
        return this.server.getLocIDs();
      }).then((res) => {
        Log.l("AddWorkSites: got locID data:\n", res);
        this.locIDList = res;
        this.locIDList.push(this.addLocID);
        // return this.server.getLoc2nds();
      // }).then((res) => {
        // Log.l("AddWorkSites: got loc2nd data:\n", res);
        // this.loc2ndList = res;
        // this.loc2ndList.push(this.addLoc2nd);
        return this.server.getShiftRotations();
      }).then((res) => {
        Log.l("AddWorkSites: got shift rotation data:\n", res);
        this.rotations = res;
        // let rotnames = Object.keys(this.jobsite.shiftRotations);
        // if(!rotnames.length) {
        //   this.jobsite.shiftRotations = this.rotations;
        // }
        return this.server.getTechShifts();
      }).then((res) => {
        Log.l("AddWorkSites: got tech shift data:\n", res);
        this.techShifts = res;
        // let shiftNames = Object.keys(this.jobsite.techShifts);
        // if(!shiftNames.length) {
        //   this.jobsite.techShifts = this.techShifts;
        // }
        resolve(res);
      }).catch(err => {
        Log.l("getConfigData(): Error during configuration fetching.");
        Log.e(err);
        reject(err);
      });
    });
  }

  public initializeForm() {
    let street1         = new FormControl(this.jobsite.address.street.street1         , Validators.required)  ;
    let street2         = new FormControl(this.jobsite.address.street.street2         , Validators.required)  ;
    let street          = new FormGroup({'street1'  : street1                         , 'street2': street2})  ;
    let city            = new FormControl(this.jobsite.address.city                   , Validators.required)  ;
    let state           = new FormControl(this.jobsite.address.state                  , Validators.required)  ;
    let zip             = new FormControl(this.jobsite.address.zipcode                , Validators.required)  ;
    let address         = new FormGroup({
    'street'                                        : street                          ,
    'city'                                          : city                            ,
    'state'                                         : state                           ,
    'zip'                                           : zip
    })                                                                                                        ;
    street1             = new FormControl(this.jobsite.billing_address.street.street1 , Validators.required)  ;
    street2             = new FormControl(this.jobsite.billing_address.street.street2 , Validators.required)  ;
    street              = new FormGroup({ 'street1' : street1                         , 'street2': street2 }) ;
    city                = new FormControl(this.jobsite.billing_address.city           , Validators.required)  ;
    state               = new FormControl(this.jobsite.billing_address.state          , Validators.required)  ;
    zip                 = new FormControl(this.jobsite.billing_address.zipcode        , Validators.required)  ;
    let billing_address = new FormGroup({
    'street'                                        : street                          ,
    'city'                                          : city                            ,
    'state'                                         : state                           ,
    'zip'                                           : zip
    })                                                                                                        ;

    this.jobSiteForm = new FormGroup({
      'client'                        : new FormControl(this.jobsite.client                        , Validators.required),
      'location'                      : new FormControl(this.jobsite.location                      , Validators.required),
      'locID'                         : new FormControl(this.jobsite.locID                         , Validators.required),
      'schedule_name'                 : new FormControl(this.jobsite.schedule_name                 , Validators.required),
      'site_number'                   : new FormControl(this.jobsite.site_number                   , Validators.required),
      'address'                       : address,
      'billing_address'               : billing_address,
      'latitude'                      : new FormControl(this.jobsite.latitude                      , Validators.required),
      'longitude'                     : new FormControl(this.jobsite.longitude                     , Validators.required),
      'within'                        : new FormControl(this.jobsite.within                        , Validators.required),
      'account_number'                : new FormControl(this.jobsite.account_number                , Validators.required),
      'travel_time'                   : new FormControl(this.jobsite.travel_time                   , Validators.required),
      'per_diem_rate'                 : new FormControl(this.jobsite.per_diem_rate                 , Validators.required),
      'lodging_rate'                  : new FormControl(this.jobsite.lodging_rate                  , Validators.required),
      'requires_preauth'              : new FormControl(this.jobsite.requires_preauth              , Validators.required),
      'requires_preauth_pertech'      : new FormControl(this.jobsite.requires_preauth_pertech      , Validators.required),
      'requires_invoice_woreports'    : new FormControl(this.jobsite.requires_invoice_woreports    , Validators.required),
      'account_or_contract'           : new FormControl(this.jobsite.account_or_contract           , Validators.required),
      'billing_rate'                  : new FormControl(this.jobsite.billing_rate                  , Validators.required),
      'site_active'                   : new FormControl(this.jobsite.site_active                   , Validators.required),
      'sort_number'                   : new FormControl(this.jobsite.sort_number                   , Validators.required),
    });
  }

  public updateDisplay() {
    let f = this.jobSiteForm;
    let a = f.controls.address['controls'];
    let b = f.controls.billing_address['controls'];
    let a_s = a.street['controls'];
    let b_s = b.street['controls'];
    // f.controls.address.setValue();
    // f.controls.billing_address.setValue();
    let client = this.clientList.find(a => {
      return a.name.toUpperCase() === this.jobsite.client.name.toUpperCase();
    });
    let location = this.locationList.find(a => {
      return a.name.toUpperCase() === this.jobsite.location.name.toUpperCase();
    });
    let locID = this.locIDList.find(a => {
      return a.name.toUpperCase() === this.jobsite.locID.name.toUpperCase();
    });

    f.controls.client.setValue(client);
    f.controls.location.setValue(location);
    f.controls.locID.setValue(locID);
    f.controls.schedule_name.setValue(this.jobsite.schedule_name);
    f.controls.site_number.setValue(this.jobsite.site_number);
    f.controls.latitude.setValue(this.jobsite.latitude);
    f.controls.longitude.setValue(this.jobsite.longitude);
    f.controls.within.setValue(this.jobsite.within);
    f.controls.account_number.setValue(this.jobsite.account_number);
    f.controls.travel_time.setValue(this.jobsite.travel_time);
    f.controls.per_diem_rate.setValue(this.jobsite.per_diem_rate);
    f.controls.lodging_rate.setValue(this.jobsite.lodging_rate);
    f.controls.requires_preauth.setValue(this.jobsite.requires_preauth);
    f.controls.requires_preauth_pertech.setValue(this.jobsite.requires_preauth_pertech);
    f.controls.requires_invoice_woreports.setValue(this.jobsite.requires_invoice_woreports);
    f.controls.account_or_contract.setValue(this.jobsite.account_or_contract);
    f.controls.billing_rate.setValue(this.jobsite.billing_rate);
    f.controls.site_active.setValue(this.jobsite.site_active);
    f.controls.sort_number.setValue(this.jobsite.sort_number);

    a.city.setValue(this.jobsite.address.city);
    a.state.setValue(this.jobsite.address.state);
    a.zip.setValue(this.jobsite.address.zipcode);
    a_s.street1.setValue(this.jobsite.address.street.street1);

    b.city.setValue(this.jobsite.billing_address.city);
    b.state.setValue(this.jobsite.billing_address.state);
    b.zip.setValue(this.jobsite.billing_address.zipcode);
    b_s.street1.setValue(this.jobsite.billing_address.street.street1);

  }

  public updateForm() {
    this._client   = this.jobSiteForm.controls['client'    ] ;
    this._location = this.jobSiteForm.controls['location'  ] ;
    this._locID    = this.jobSiteForm.controls['locID'     ] ;
    this._lat      = this.jobSiteForm.controls['latitude'  ] ;
    this._lon      = this.jobSiteForm.controls['longitude' ] ;
    if (this.mode == 'Add') {
      for (let locID of this.locIDList) {
        if (locID.name == "MNSHOP") {
          this._locID.setValue(locID);
          this.jobsite.locID = locID;
        }
      }
    } else {
      for(let client of this.clientList) {
        if(client.name == this.jobsite.client.name) {
          this._client.setValue(client);
        }
      }
      for(let location of this.locationList) {
        if(location.name == this.jobsite.location.name) {
          this._location.setValue(location);
        }
      }
      for(let locID of this.locIDList) {
        if (locID.name == this.jobsite.locID.name) {
          this._locID.setValue(locID);
        }
      }
    }
    this._client.valueChanges.subscribe((value: any) => {
      Log.l("valueChanged for client:\n", value);
      if(value) {
        this.clientChanged(value);
      }
    });
    this._location.valueChanges.subscribe((value: any) => {
      Log.l("valueChanged for location:\n", value);
      if(value) {
        this.locationChanged(value);
      }
    });
    this._locID.valueChanges.subscribe((value: any) => {
      Log.l("valueChanged for locID:\n", value);
      if(value) {
        this.locIDChanged(value);
      }
    });

    this._lat.valueChanges.debounceTime(300).subscribe((value:any) => {
      Log.l("Latitude changed to: ", value);
      if(value) {
        let lat = Number(value);
        if(!isNaN(lat)) { this.jobsite.latitude = lat; }
      }
    });
    this._lon.valueChanges.debounceTime(300).subscribe((value:any) => {
      Log.l("Longitude changed to: ", value);
      if(value) {
        let lon = Number(value);
        if(!isNaN(lon)) { this.jobsite.longitude = lon; }
      }
    });
  }

  public locationChanged(location:any) {
    Log.l("locationChanged(): Location changed to:\n", this._location.value);
    if (location.name == "__") {
      this.addNewLocation();
    } else {
      this.jobsite.location = location;
      this.jobsite.address.city = location.fullName;
      this.jobSiteForm.controls.address['controls']['city'].setValue(location.fullName);
    }
  }

  public addNewLocation() {
    Log.l("addNewLocation(): Called, now adding new location...");
    let addLocationPage = this.modalCtrl.create('Add New Location', {}, { cssClass: 'add-location-modal' });
    addLocationPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if(data){
        let newLocation = data;
        this.insertLocation(newLocation);
      }
    });
    addLocationPage.present();
  }

  public insertLocation(newLocation: any) {
    this.locationList.pop();
    this.locationList.push(newLocation);
    this.locationList.push(this.addLocation);
    this.jobsite.location = newLocation;
    this.jobSiteForm.controls['location'].setValue(newLocation);
    this.server.saveLocation(newLocation).then((res) => {
      Log.l("insertLocation(): Saved new location successfully!");
    }).catch((err) => {
      Log.l("insertLocation(): Error saving new location!");
      Log.e(err);
    });
  }

  public locIDChanged(locID:any) {
    Log.l("locIDChanged(): Location changed to:\n", this._locID.value);
      if(locID.name == "__") {
        this.addNewLocID();
      } else {
        this.jobsite.locID = locID;
      }
  }

  public addNewLocID() {
    Log.l("addNewlocID(): Called, now adding new location...");
    let addLocIDPage = this.modalCtrl.create('Add New Location ID', {}, { cssClass: 'add-locid-modal' });
    addLocIDPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if(data != null){
        let newLocID = data;
        this.insertLocID(newLocID);
      }
    });
    addLocIDPage.present();
  }

  public insertLocID(newLocID: any) {
    this.locIDList.pop();
    this.locIDList.push(newLocID);
    this.locIDList.push(this.addLocation);
    this.jobsite.locID = newLocID;
    this.jobSiteForm.controls['locID'].setValue(newLocID);
    this.server.saveLocID(newLocID).then((res) => {
      Log.l("insertLocID(): Saved new locID successfully!");
    }).catch((err) => {
      Log.l("insertLocID(): Error saving new locID!");
      Log.e(err);
    });
  }

  public clientChanged(client:any) {
    Log.l("clientChanged(): Client changed to:\n", this._client.value);
    if(client.name == "__") {
      this.addNewClient();
    }
  }

  public addNewClient() {
    Log.l("addClient(): Called, now adding new client...");
    let addClientPage = this.modalCtrl.create('Add New Client', { }, { cssClass: 'add-client-modal' });
    addClientPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if(data != null) {
        let newClient = {name: data.clientAbbreviation, fullName: data.clientName};
        this.insertClient(newClient);
      }
    });
    addClientPage.present();
  }

  public insertClient(newClient:any) {
    this.clientList.pop();
    this.clientList.push(newClient);
    this.clientList.push(this.addClient);
    this.jobsite.client = newClient;
    this.jobSiteForm.controls['client'].setValue(newClient);
    this.server.saveClient(newClient).then((res) => {
      Log.l("insertClient(): Saved new client successfully!");
    }).catch((err) => {
      Log.l("insertClient(): Error saving new client!");
      Log.e(err);
    });
  }

  public saveSite() {
    return new Promise((resolve,reject) => {
      let siteInfo = this.jobSiteForm.value;
      Log.l(siteInfo);
      let client = siteInfo.client;
      let location = siteInfo.location;
      let locID = siteInfo.locID;
      let siteNumber = siteInfo.site_number;
      let existing = this.sites.filter((a:Jobsite) => {
        return a.client.name === client.name && a.location.name === location.name && a.locID.name === locID.name;
      });
      let locMatches = existing.length;
      let existingNumber = this.sites.filter((a:Jobsite) => {
        return a.site_number === siteNumber;
      });
      let numberMatches = existingNumber.length;
      if(locMatches > 1 && this.mode !== 'Edit') {
        // this.alert.showAlert("DUPLICATION", "There is already a site with that client, location, and location ID!").then(res => {
        reject({message: `Site already exists for client '${client.fullName}', location '${location.fullName}', locID '${locID.fullName}'.`})
        // });
      } else if(numberMatches > 1 && this.mode !== 'Edit') {
        reject({message: `Site already exists with number '${siteNumber}'.`})
      } else {
        for(let prop in siteInfo) {
          let val = siteInfo[prop];
          Log.l(`saveSite(): Now setting jobsite['${prop}'] to: `, val);
          if(prop == 'address') {
            this.jobsite.address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
          } else if(prop == 'billing_address') {
            this.jobsite.billing_address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
          } else {
            this.jobsite[prop] = siteInfo[prop];
          }
        }
        let lat = Number(this.jobsite.latitude);
        let lon = Number(this.jobsite.longitude);
        let rad = Number(this.jobsite.within);
        this.jobsite.latitude = lat ? lat : this.jobsite.latitude;
        this.jobsite.longitude = lon ? lon : this.jobsite.longitude;
        this.jobsite.within = rad ? rad : this.jobsite.within;

        delete this.jobsite['_$visited'];

        this.db.saveJobsite(this.jobsite).then((res) => {
          Log.l("saveSite(): Successfully saved jobsite.");
          resolve(res);
        }).catch((err) => {
          Log.l("saveSite(): Error saving jobsite!");
          Log.e(err);
          reject(err);
        });
      }
    });

  }

  public onSubmit() {
    Log.l("onSubmit(): Now attempting to save jobsite from form:");
    this.alert.showSpinner('Saving job site...');
    this.saveSite().then(res => {
      this.alert.hideSpinner();
      this.leavePage();
    }).catch(err => {
      Log.l("onSubmit(): Error saving site.");
      Log.e(err);
      this.alert.hideSpinner();
      this.alert.showAlert("ERROR", "Error saving site:<br>\n<br>\n" + err.message);
    });
  }

  public leavePage() {
    if(this.source === 'worksites') {
      this.navCtrl.setRoot("Work Sites");
    } else {
      this.viewCtrl.dismiss();
    }
  }

public saveNoExit() {
  Log.l("saveNoExit(): Now attempting to save jobsite from form:");
  this.alert.showSpinner('Saving job site...');
  this.saveSite().then(res => {
    this.alert.hideSpinner();
    // this.leavePage();
  }).catch(err => {
    Log.l("saveNoExit(): Error saving site.");
    Log.e(err);
    this.alert.hideSpinner();
    this.alert.showAlert("ERROR", "Error saving site:<br>\n<br>\n" + err.message);
  });
}

  public editSiteHours() {
    Log.l("editSiteHours(): Called, now editing site hours...");
    let editSiteHoursModal = this.modalCtrl.create('Edit Site Hours', { shiftRotations: this.rotations, jobsite: this.jobsite }, { cssClass: 'edit-site-hours-modal' });
    editSiteHoursModal.onDidDismiss(data => {
      Log.l("Got back:\n", data);
    });
    editSiteHoursModal.present();
  }

  public cancel() {
    Log.l("Canceled input of job site.");
    if(this.source === 'worksites') {
      this.navCtrl.setRoot("Work Sites");
    } else {
      this.viewCtrl.dismiss();
    }
  }

  public startTimeUpdated(shiftType: string, time:string) {
    Log.l("startTimeUpdated(): Now updating start time for '%s' to '%s'...", shiftType, time);
    this.jobsite.shift_start_times[shiftType] = time;
    // if (shiftType === 'AM') {
    //   this.jobsite.shift_start_times.AM = time;
    // } else if(shiftType === 'PM') {
    //   this.jobsite.shift_start_times.PM = time;
    // }
  }

  public addressCopy(direction:"up"|"down") {
    let f = this.jobSiteForm.value;
    let a1 = f.address;
    let b1 = f.billing_address;
    let src = a1, dest = b1;
    if(direction === 'down') {
      dest.city           = src.city           ;
      dest.state          = src.state          ;
      dest.zipcode        = src.zipcode        ;
      dest.street.street1 = src.street.street1 ;
      dest.street.street2 = src.street.street2 ;
      this.updateDisplay();
    } else if(direction === 'up') {
      src = b1, dest = a1;
      dest.city           = src.city           ;
      dest.state          = src.state          ;
      dest.zipcode        = src.zipcode        ;
      dest.street.street1 = src.street.street1 ;
      dest.street.street2 = src.street.street2 ;
      this.updateDisplay();
    } else {
      let errStr = `addressCopy(): Invalid option '${direction}' passed! Valid options are 'down' (address to billing) or 'up' (billing to address)!`;
      Log.w(errStr);
      this.alert.showAlert("ERROR", errStr);
    }
  }

  public address2billing() {
    let f = this.jobSiteForm.value;
    let a1 = f.address;
    let b1 = f.billing_address;
    let a = this.jobsite.address;
    let b = this.jobsite.billing_address;
    a.city = a1.city;
    a.state = a1.state;
    a.zipcode = a1.zipcode;
    a.street.street1 = a1.street.street1;
    a.street.street2 = a1.street.street2;
    b.city = a.city;
    b.state = a.state;
    b.zipcode = a.zipcode;
    b.street.street1 = a.street.street1;
    b.street.street2 = a.street.street2;
    this.updateDisplay();
  }

  public billing2address() {
    let f = this.jobSiteForm.value;
    let a1 = f.billing_address;
    let b1 = f.address;
    let a = this.jobsite.billing_address;
    let b = this.jobsite.address;
    a.city = a1.city;
    a.state = a1.state;
    a.zipcode = a1.zipcode;
    a.street.street1 = a1.street.street1;
    a.street.street2 = a1.street.street2;
    b.city = a.city;
    b.state = a.state;
    b.zipcode = a.zipcode;
    b.street.street1 = a.street.street1;
    b.street.street2 = a.street.street2;
    this.updateDisplay();
  }

  public sitePrevious() {
    if(this.siteIndex > 1) {
      this.siteIndex--;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public siteNext() {
    if(this.siteIndex < this.siteCount) {
      this.siteIndex++;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public noPrevious() {
    this.alert.showAlert("START OF SITES", "Can't go to previous work site. Already at start of list.");
  }

  public noNext() {
    this.alert.showAlert("END OF SITES", "Can't go to next work site. Already at end of list.");
  }


}
