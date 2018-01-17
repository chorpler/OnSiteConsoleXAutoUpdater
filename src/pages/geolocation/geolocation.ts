import 'rxjs/add/operator/debounceTime';
import { sprintf                                                     } from 'sprintf-js'                           ;
import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core'                        ;
import { IonicPage, NavController, NavParams                         } from 'ionic-angular'                        ;
import { ViewController, ModalController, PopoverController          } from 'ionic-angular'                        ;
import { FormGroup, FormControl, Validators                          } from "@angular/forms"                       ;
import { Log, moment, Moment, isMoment, oo, _dedupe                  } from 'config/config.functions'              ;
import { OSData                                                      } from 'providers/data-service'               ;
import { AuthService                                                 } from 'providers/auth-service'               ;
import { DBService                                                   } from 'providers/db-service'                 ;
import { ServerService                                               } from 'providers/server-service'             ;
import { AlertService                                                } from 'providers/alert-service'              ;
import { Preferences                                                 } from 'providers/preferences'                ;
import { Street                                                      } from 'domain/street'                        ;
import { Address                                                     } from 'domain/address'                       ;
import { Jobsite                                                     } from 'domain/jobsite'                       ;
import { GoogleMapsAPIWrapper                                        } from '@agm/core'                            ;
import { Subscription                                                } from 'rxjs/Subscription'                    ;
import { Command, KeyCommandService                                  } from 'providers/key-command-service'        ;
import { NotifyService                                               } from 'providers/notify-service'             ;
import { NotificationComponent                                       } from 'components/notification/notification' ;
import { OverlayPanel, SelectItem, Dialog, Checkbox,                 } from 'primeng/primeng'                      ;

@IonicPage({ name: "Geolocation" })
@Component({
  selector: 'page-geolocation',
  templateUrl: 'geolocation.html'
})

export class GeolocationPage implements OnInit,OnDestroy {
  public title          : string         = "Geolocation"       ;
  public static    PREFS: any            = new Preferences()   ;
  public keySubscription: Subscription                         ;
  public jobsite        : Jobsite                              ;
  public sites          : Array<Jobsite> = []                  ;
  public latitude       : number         = 26.177280           ;
  public longitude      : number         = -97.964652          ;
  public mapMode        : string         = "hybrid"            ;
  public mapZoom        : number         = 16                  ;
  public siteIndex      : number         = 0                   ;
  public siteCount      : number         = 0                   ;
  public modal          : any                                  ;
  public mode           : string         = 'Add'               ;
  public source         : string         = ''                  ;
  public client         : any                                  ;
  public location       : any                                  ;
  public locID          : any                                  ;
  public clientList     : Array<any>     = []                  ;
  public locationList   : Array<any>     = []                  ;
  public locIDList      : Array<any>     = []                  ;
  public clientMenu     : SelectItem[]   = []                  ;
  public locationMenu   : SelectItem[]   = []                  ;
  public locIDMenu      : SelectItem[]   = []                  ;
  public accountMenu    : SelectItem[]   = []                  ;
  public rotations      : Array<any>     = []                  ;
  public techShifts     : Array<any>     = []                  ;
  public siteLat        : number         = 26.177260           ;
  public siteLon        : number         = -97.964594          ;
  public siteRadius     : number         = 500                 ;
  public lat            : number         = 26.177260           ;
  public lon            : number         = -97.964594          ;
  public radiusColor    : string         = "rgba(255,0,0,0.5)" ;
  public tooltipPosition:string          = "left"              ;
  public tooltipDelay   :number          = 500                 ;
  public hoursDialogVisible:boolean      = false               ;
  public hoursClosable  :boolean         = false               ;
  public hoursModalMode :boolean         = false               ;
  public dropdownHeight :string          = "200px"             ;

  public shiftStartTimes           : any                ;
  public startOptions              : Array<string> = [] ;
  public startOptionsAM            : Array<string> = [] ;
  public startOptionsPM            : Array<string> = [] ;
  public startAM                   : string        = "" ;
  public startPM                   : string        = "" ;
  public timeAM                    : string        = "" ;
  public timePM                    : string        = "" ;

  public addClient: any = { name: "__", fullName: "Add new client" };
  public addLocation: any = { name: "__", fullName: "Add new location" };
  public addLocID: any = { name: "__", fullName: "Add new location ID" };
  public dataReady: boolean = false;

  public get prefs(): any { return GeolocationPage.PREFS; };

  constructor(
    public navCtrl    : NavController        ,
    public navParams  : NavParams            ,
    public viewCtrl   : ViewController       ,
    public modalCtrl  : ModalController      ,
    public popover    : PopoverController    ,
    public zone       : NgZone               ,
    public db         : DBService            ,
    public server     : ServerService        ,
    public alert      : AlertService         ,
    public auth       : AuthService          ,
    public data       : OSData               ,
    public map        : GoogleMapsAPIWrapper ,
    public keyService : KeyCommandService    ,
    public notify     : NotifyService        ,
  ) {
    window['onsitegeolocation'] = this;
    window['_dedupe'] = _dedupe;
  }

  public ngOnInit() {
    Log.l("GeolocationPage: ngOnInit() fired");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  public ngOnDestroy() {
    Log.l("GeolocationPage: ngOnInit() fired");
    if(this.keySubscription && this.keySubscription.unsubscribe) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    // this.initializeSubscribers();
    // if (this.navParams.get('mode') !== undefined) { this.mode = this.navParams.get('mode'); } else { this.mode = "Add" };
    // if (this.navParams.get('source') !== undefined) { this.source = this.navParams.get('source'); } else { this.source = "worksites" };
    // if (this.navParams.get('sites') !== undefined) { this.sites = this.navParams.get('sites'); } else { this.sites = this.data.getData('sites'); }
    // if (this.navParams.get('jobsite') !== undefined) {
    //   this.jobsite = this.navParams.get('jobsite');
    //   this.siteIndex = this.sites.indexOf(this.jobsite) + 1;
    //   this.siteCount = this.sites.length;
    // } else {
    //   this.jobsite = new Jobsite({ "name": "", "fullName": "" },
    //     { "name": "", "fullName": "" },
    //     { "name": "", "fullName": "" },
    //     new Address(new Street('', ''), '', '', ''), 26.177260, -97.964594, 500);
    //   this.sites.push(this.jobsite);
    //   this.siteIndex = this.sites.length;
    //   let sortedSites = this.sites.sort((a: Jobsite, b: Jobsite) => {
    //     let sA = a.site_number;
    //     let sB = b.site_number;
    //     return sA > sB ? 1 : sA < sB ? -1 : 0;
    //   });
    //   let siteNumber = sortedSites[sortedSites.length - 1].site_number;
    //   siteNumber++;
    //   this.jobsite.setSiteNumber(siteNumber);
    //   this.siteCount = this.sites.length;
    // }
    // Log.l(`Mode is '${this.mode}' and jobsite is:\n`, this.jobsite);

    // for (let i = 0; i < 24; i++) {
    //   for (let j = 0; j < 60; j += 30) {
    //     let time = sprintf("%02d:%02d", i, j);
    //     this.startOptions.push(time);
    //     this.startOptionsAM.push(time);
    //     this.startOptionsPM.push(time);
    //   }
    // }
    // if (this.jobsite) {
    //   let times = this.jobsite.getShiftStartTimes();
    //   this.shiftStartTimes = times;
    //   this.startAM = times.AM;
    //   this.startPM = times.PM;
    // }
    // // this.server.getClients().then((res:Array<any>) => {
    // //   Log.l("WorkSite: got client data:\n", res);
    // //   this.clientList = res;
    // //   this.clientList.push(this.addClient);
    // //   return this.server.getLocations();
    // // }).then((res:Array<any>) => {
    // //   Log.l("WorkSite: got location data:\n", res);
    // //   this.locationList = res;
    // //   this.locationList.push(this.addLocation);
    // //   return this.server.getLocIDs();
    // // }).then((res:Array<any>) => {
    // //   Log.l("WorkSite: got locID data:\n", res);
    // //   this.locIDList = res;
    // //   this.locIDList.push(this.addLocID);
    // //   // return this.server.getLoc2nds();
    // //   // }).then((res) => {
    // //   // Log.l("WorkSite: got loc2nd data:\n", res);
    // //   // this.loc2ndList = res;
    // //   // this.loc2ndList.push(this.addLoc2nd);
    // //   return this.server.getShiftRotations();
    // // }).then((res:Array<any>) => {
    // //   Log.l("WorkSite: got shift rotation data:\n", res);
    // //   this.rotations = res;
    // //   let rotnames = Object.keys(this.jobsite.shiftRotations);
    // //   if (!rotnames.length) {
    // //     this.jobsite.shiftRotations = this.rotations;
    // //   }
    // //   return this.server.getTechShifts();

    // this.getConfigData().then((res:Array<any>) => {
    //   Log.l("WorkSite: got tech shift data:\n", res);
    //   this.techShifts = res;
    //   let shiftNames = Object.keys(this.jobsite.techShifts);
    //   if (!shiftNames.length) {
    //     this.jobsite.techShifts = this.techShifts;
    //   }
    //   Log.l("WorkSite: all data ready, Jobsite is:\n", this.jobsite);
    //   this.initializeDropdownOptions();
    //   this.initializeForm();
    //   // this.updateForm();
    //   this.dataReady = true;
    // }).catch((err) => {
    //   Log.l("WorkSite: error getting data!");
    //   Log.e(err);
    // });
  }

  public initializeSubscribers() {
    this.keySubscription = this.keyService.commands.subscribe((command: Command) => {
      switch (command.name) {
        case "GeolocationPage.saveNoExit"  : this.saveNoExit(); break;
        case "GeolocationPage.sitePrevious": this.sitePrevious(); break;
        case "GeolocationPage.siteNext"    : this.siteNext(); break;
        case "GeolocationPage.onSubmit"    : this.onSubmit(); break;
      }
    });
  }

  public addJobSite() {
    this.dataReady = false;
    this.mode = 'Add';
    let jobsite = new Jobsite({ "name": "", "fullName": "" },
      { "name": "", "fullName": "" },
      { "name": "MNSHOP", "fullName": "Maintenance Shop" },
      new Address(new Street('', ''), '', '', ''), 26.177260, -97.964594, 500);
    let sortedSites = this.sites.sort((a: Jobsite, b: Jobsite) => {
      let sA = a.site_number;
      let sB = b.site_number;
      return sA > sB ? 1 : sA < sB ? -1 : 0;
    });
    let siteNumber = sortedSites[sortedSites.length - 1].site_number;
    siteNumber++;
    jobsite.setSiteNumber(siteNumber);
    sortedSites = this.sites.sort((a: Jobsite, b: Jobsite) => {
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
      this.initializeDropdownOptions();
      this.initializeForm();
      // this.updateForm();
      this.updateDisplay();
      this.dataReady = true;
    }).catch(err => {
      Log.l("addJobSite(): Error while adding.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error adding new job site:<br>\n<br>\n" + err.message);
    });
  }

  public initializeDropdownOptions() {
    Log.l("initializeDropdownOptions(): Now running...");
    let sites = this.sites;
    // let site = this.jobsite;
    let clientList    = _dedupe(sites.map((a:Jobsite) => a.client));
    let locationList  = _dedupe(sites.map((a:Jobsite) => a.location));
    let locIDList     = _dedupe(sites.map((a:Jobsite) => a.locID));

    // this.clientList   = clientList;
    // this.locationList = locationList;
    // this.locIDList    = locIDList;
  }

  public initializeForm() {
    Log.l("initializeForm(): Now running...");
    let site = this.jobsite;
    let clientMenu:SelectItem[]   = [];
    let locationMenu:SelectItem[] = [];
    let locIDMenu:SelectItem[]    = [];
    for(let client of this.clientList) {
      let item:SelectItem = {label: client.fullName, value: client};
      clientMenu.push(item);
    }
    for(let location of this.locationList) {
      let item:SelectItem = {label: location.fullName, value: location};
      locationMenu.push(item);
    }
    for(let locID of this.locIDList) {
      let item:SelectItem = {label: locID.fullName, value: locID};
      locIDMenu.push(item);
    }
    let accountMenu:SelectItem[]  = [
      {label: "Contract", value: "Contract" },
      {label: "Account" , value: "Account"  },
    ];

    let cli = site.client.name.toUpperCase();
    let loc = site.location.name.toUpperCase();
    let lid = site.locID.name.toUpperCase();
    let client, location, locID;
    let clientEntry = clientMenu.find((a:SelectItem) => {
      return cli === a.value.code.toUpperCase();
    });
    if(clientEntry && clientEntry.value) {
      client = clientEntry.value;
    }
    let locationEntry = locationMenu.find((a:SelectItem) => {
      return loc === a.value.code.toUpperCase();
    });
    if(locationEntry && locationEntry.value) {
      location = locationEntry.value;
    }
    let locIDEntry = locIDMenu.find((a:SelectItem) => {
      return lid === a.value.code.toUpperCase();
    });
    if(locIDEntry && locIDEntry.value) {
      locID = locIDEntry.value;
    }

    this.clientMenu   = clientMenu;
    this.locationMenu = locationMenu;
    this.locIDMenu    = locIDMenu;
    this.accountMenu  = accountMenu;

    this.client   = client;
    this.location = location;
    this.locID    = locID;
  }

  public getConfigData() {
    return new Promise((resolve, reject) => {
      this.server.getClients().then((res:Array<any>) => {
        Log.l("WorkSite: got client data:\n", res);
        this.clientList = res;
        this.clientList.push(this.addClient);
        return this.server.getLocations();
      }).then((res:Array<any>) => {
        Log.l("WorkSite: got location data:\n", res);
        this.locationList = res;
        this.locationList.push(this.addLocation);
        return this.server.getLocIDs();
      }).then((res:Array<any>) => {
        Log.l("WorkSite: got locID data:\n", res);
        this.locIDList = res;
        this.locIDList.push(this.addLocID);
        // return this.server.getLoc2nds();
        // }).then((res) => {
        // Log.l("WorkSite: got loc2nd data:\n", res);
        // this.loc2ndList = res;
        // this.loc2ndList.push(this.addLoc2nd);
        return this.server.getShiftRotations();
      }).then((res:Array<any>) => {
        Log.l("WorkSite: got shift rotation data:\n", res);
        this.rotations = res;
        // let rotnames = Object.keys(this.jobsite.shiftRotations);
        // if(!rotnames.length) {
        //   this.jobsite.shiftRotations = this.rotations;
        // }
        return this.server.getTechShifts();
      }).then((res:Array<any>) => {
        Log.l("WorkSite: got tech shift data:\n", res);
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

  public updateDisplay() {
    // let f = this.jobSiteForm;
    let a = this.jobsite.address;
    let b = this.jobsite.billing_address;
    let a_s = a.street;
    let b_s = b.street;
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

    this.client   = client   ;
    this.location = location ;
    this.locID    = locID    ;
  }

  // public updateForm() {
  //   let client = this.clientList.find(a => {
  //     return a.name.toUpperCase() === this.jobsite.client.name.toUpperCase();
  //   });
  //   let location = this.locationList.find(a => {
  //     return a.name.toUpperCase() === this.jobsite.location.name.toUpperCase();
  //   });
  //   let locID = this.locIDList.find(a => {
  //     return a.name.toUpperCase() === this.jobsite.locID.name.toUpperCase();
  //   });

  //   this._client = this.jobSiteForm.controls['client'];
  //   this._location = this.jobSiteForm.controls['location'];
  //   this._locID = this.jobSiteForm.controls['locID'];
  //   this._lat = this.jobSiteForm.controls['latitude'];
  //   this._lon = this.jobSiteForm.controls['longitude'];
  //   if (this.mode == 'Add') {
  //     for (let locID of this.locIDList) {
  //       if (locID.name == "MNSHOP") {
  //         this._locID.setValue(locID);
  //         this.jobsite.locID = locID;
  //       }
  //     }
  //   } else {
  //     for (let client of this.clientList) {
  //       if (client.name == this.jobsite.client.name) {
  //         this._client.setValue(client);
  //       }
  //     }
  //     for (let location of this.locationList) {
  //       if (location.name == this.jobsite.location.name) {
  //         this._location.setValue(location);
  //       }
  //     }
  //     for (let locID of this.locIDList) {
  //       if (locID.name == this.jobsite.locID.name) {
  //         this._locID.setValue(locID);
  //       }
  //     }
  //   }
  //   this._client.valueChanges.subscribe((value: any) => {
  //     Log.l("valueChanged for client:\n", value);
  //     if (value) {
  //       this.clientChanged(value);
  //     }
  //   });
  //   this._location.valueChanges.subscribe((value: any) => {
  //     Log.l("valueChanged for location:\n", value);
  //     if (value) {
  //       this.locationChanged(value);
  //     }
  //   });
  //   this._locID.valueChanges.subscribe((value: any) => {
  //     Log.l("valueChanged for locID:\n", value);
  //     if (value) {
  //       this.locIDChanged(value);
  //     }
  //   });

  //   this._lat.valueChanges.debounceTime(300).subscribe((value: any) => {
  //     Log.l("Latitude changed to: ", value);
  //     if (value) {
  //       let lat = Number(value);
  //       if (!isNaN(lat)) { this.jobsite.latitude = lat; }
  //     }
  //   });
  //   this._lon.valueChanges.debounceTime(300).subscribe((value: any) => {
  //     Log.l("Longitude changed to: ", value);
  //     if (value) {
  //       let lon = Number(value);
  //       if (!isNaN(lon)) { this.jobsite.longitude = lon; }
  //     }
  //   });
  // }

  public updateClient(client:any) {
    Log.l("updateClient(): Set to:\n", client);
    if(client.name === '__') {
      this.addNewClient();
    } else {
      this.jobsite.client = client;
    }
  }
  public updateLocation(location:any) {
    Log.l("updateLocation(): Set to:\n", location);
    if (location.name === '__') {
      this.addNewLocation();
    } else {
      this.jobsite.location = location;
      this.jobsite.address.city = location.fullName;
    }
  }
  public updateLocID(locID:any) {
    Log.l("updateLocID(): Set to:\n", locID);
    if (locID.name === '__') {
      this.addNewLocID();
    } else {
      this.jobsite.locID = locID;
    }
  }

  public updateLatLon() {
    let lat = Number(this.siteLat);
    let lon = Number(this.siteLon);
    if(!isNaN(lat) && !isNaN(lon)) {
      this.jobsite.latitude = lat;
      this.jobsite.longitude = lon;
    }
  }

  public updateRadius() {
    let radius = Number(this.siteRadius);
    if(!isNaN(radius)) {
      this.jobsite.within = radius;
    }
  }

  // public locationChanged(location: any) {
  //   Log.l("locationChanged(): Location changed to:\n", this._location.value);
  //   if (location.name == "__") {
  //     this.addNewLocation();
  //   } else {
  //     this.jobsite.location = location;
  //     this.jobsite.address.city = location.fullName;
  //     this.jobSiteForm.controls.address['controls']['city'].setValue(location.fullName);
  //   }
  // }

  public addNewLocation() {
    Log.l("addNewLocation(): Called, now adding new location...");
    let addLocationPage = this.modalCtrl.create('Add New Location', {}, { cssClass: 'add-location-modal' });
    addLocationPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if (data) {
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
    // this.jobSiteForm.controls['location'].setValue(newLocation);
    this.server.saveLocation(newLocation).then((res) => {
      Log.l("insertLocation(): Saved new location successfully!");
    }).catch((err) => {
      Log.l("insertLocation(): Error saving new location!");
      Log.e(err);
    });
  }

  public addNewLocID() {
    Log.l("addNewLocID(): Called, now adding new location...");
    let addLocIDPage = this.modalCtrl.create('Add New Location ID', {}, { cssClass: 'add-locid-modal' });
    addLocIDPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if (data != null) {
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
    // this.jobSiteForm.controls['locID'].setValue(newLocID);
    this.server.saveLocID(newLocID).then((res) => {
      Log.l("insertLocID(): Saved new locID successfully!");
      this.notify.addSuccess("SAVED", `New Tech Class ID created`, 3000);
    }).catch((err) => {
      Log.l("insertLocID(): Error saving new locID!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving new Tech Class ID: ${err.message}`, 10000);
    });
  }

  // public clientChanged(client: any) {
  //   Log.l("clientChanged(): Client changed to:\n", this._client.value);
  //   if (client.name == "__") {
  //     this.addNewClient();
  //   }
  // }

  public addNewClient() {
    Log.l("addClient(): Called, now adding new client...");
    let addClientPage = this.modalCtrl.create('Add New Client', {}, { cssClass: 'add-client-modal' });
    addClientPage.onDidDismiss(data => {
      Log.l("Got back:\n", data);
      if (data != null) {
        let newClient = { name: data.clientAbbreviation, fullName: data.clientName };
        this.insertClient(newClient);
      }
    });
    addClientPage.present();
  }

  public insertClient(newClient: any) {
    this.clientList.pop();
    this.clientList.push(newClient);
    this.clientList.push(this.addClient);
    this.jobsite.client = newClient;
    // this.jobSiteForm.controls['client'].setValue(newClient);
    this.server.saveClient(newClient).then((res) => {
      Log.l("insertClient(): Saved new client successfully!");
      this.notify.addSuccess("SAVED", `New client created`, 3000);
    }).catch((err) => {
      Log.l("insertClient(): Error saving new client!");
      Log.e(err);
      this.notify.addError("ERROR", `Error saving new client: ${err.message}`, 10000);
    });
  }

  public saveSite() {
    return new Promise((resolve, reject) => {
      // let siteInfo = this.jobSiteForm.value;
      let siteInfo = this.jobsite;
      // Log.l(siteInfo);
      let client     = siteInfo.client      ;
      let location   = siteInfo.location    ;
      let locID      = siteInfo.locID       ;
      let siteNumber = siteInfo.site_number ;
      let existing = this.sites.filter((a: Jobsite) => {
        return a.client.name === client.name && a.location.name === location.name && a.locID.name === locID.name;
      });
      let locMatches = existing.length;
      let existingNumber = this.sites.filter((a: Jobsite) => {
        return a.site_number === siteNumber;
      });
      let numberMatches = existingNumber.length;
      if (locMatches > 1 && this.mode !== 'Edit') {
        // this.alert.showAlert("DUPLICATION", "There is already a site with that client, location, and location ID!").then(res => {
        reject({ message: `Site already exists for client '${client.fullName}', location '${location.fullName}', locID '${locID.fullName}'.` })
        // });
      } else if (numberMatches > 1 && this.mode !== 'Edit') {
        reject({ message: `Site already exists with number '${siteNumber}'.` })
      } else {
        // for (let prop in siteInfo) {
        //   let val = siteInfo[prop];
        //   Log.l(`saveSite(): Now setting jobsite['${prop}'] to: `, val);
        //   if (prop == 'address') {
        //     this.jobsite.address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
        //   } else if (prop == 'billing_address') {
        //     this.jobsite.billing_address = new Address(new Street(val.street.street1, val.street.street2), val.city, val.state, val.zip);
        //   } else {
        //     this.jobsite[prop] = siteInfo[prop];
        //   }
        // }
        let lat = Number(this.jobsite.latitude);
        let lon = Number(this.jobsite.longitude);
        let rad = Number(this.jobsite.within);
        this.jobsite.latitude  = lat ? lat: this.jobsite.latitude  ;
        this.jobsite.longitude = lon ? lon: this.jobsite.longitude ;
        this.jobsite.within    = rad ? rad: this.jobsite.within    ;

        delete this.jobsite['_$visited'];

        this.db.saveJobsite(this.jobsite).then((res) => {
          Log.l("saveSite(): Successfully saved jobsite.");
          resolve(res);
        }).catch((err) => {
          Log.l("saveSite(): Error saving jobsite!");
          Log.e(err);
          this.notify.addError("ERROR", `Error saving work site: ${err.message}`, 10000);
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
      this.notify.addSuccess("SAVED", "Saved jobsite successfully.", 3000);
      this.leavePage();
    }).catch(err => {
      Log.l("onSubmit(): Error saving site.");
      Log.e(err);
      this.alert.hideSpinner();
      this.notify.addError("ERROR", `Error saving site: ${err.message}`, -1);
      // this.alert.showAlert("ERROR", "Error saving site:<br>\n<br>\n" + err.message);
    });
  }

  public leavePage() {
    // if (this.source === 'worksites') {
    //   this.navCtrl.setRoot("Work Sites");
    // } else {
    //   this.viewCtrl.dismiss();
    // }
    this.navCtrl.setRoot("Work Sites");
  }

  public saveNoExit() {
    Log.l("saveNoExit(): Now attempting to save jobsite from form:");
    this.alert.showSpinner('Saving job site...');
    this.saveSite().then(res => {
      this.alert.hideSpinner();
      this.notify.addSuccess("SUCCESS", "Saved jobsite successfully");
      // this.leavePage();
    }).catch(err => {
      Log.l("saveNoExit(): Error saving site.");
      Log.e(err);
      this.alert.hideSpinner();
      // this.alert.showAlert("ERROR", "Error saving site:<br>\n<br>\n" + err.message);
      this.notify.addError("ERROR", `Error saving site: ${err.message}`, -1);
    });
  }

  // public editSiteHours() {
  //   Log.l("editSiteHours(): Called, now editing site hours...");
  //   let editSiteHoursModal = this.modalCtrl.create('Edit Site Hours', { shiftRotations: this.rotations, jobsite: this.jobsite }, { cssClass: 'edit-site-hours-modal' });
  //   editSiteHoursModal.onDidDismiss(data => {
  //     Log.l("Got back:\n", data);
  //   });
  //   editSiteHoursModal.present();
  // }

  public editSiteHours(event:any) {
    Log.l("editSiteHours(): Called with event:\n", event);
    // let editSiteHoursModal = this.modalCtrl.create('Edit Site Hours', { shiftRotations: this.rotations, jobsite: this.jobsite }, { cssClass: 'edit-site-hours-modal' });
    // editSiteHoursModal.onDidDismiss(data => {
    //   Log.l("Got back:\n", data);
    // });
    // editSiteHoursModal.present();
    // this.hoursOverlay.show(event);
    // this.hoursOverlay.show({}, this.overlayTarget.nativeElement);
    this.showHoursDialog();
  }

  public showHoursDialog() {
    this.hoursDialogVisible = true;
  }

  public hideHoursDialog() {
    this.hoursDialogVisible = false;
  }

  public jobsiteUpdated(event:any) {
    Log.l("jobsiteUpdated(): Event received:\n", event);
    // this.hoursOverlay.hide();
    this.hideHoursDialog();
  }


  public cancel() {
    Log.l("Canceled input of job site.");
    if (this.source === 'worksites') {
      this.navCtrl.setRoot("Work Sites");
    } else {
      this.viewCtrl.dismiss();
    }
  }

  public startTimeUpdated(shiftType: string, time: string) {
    Log.l("startTimeUpdated(): Now updating start time for '%s' to '%s'...", shiftType, time);
    this.jobsite.shift_start_times[shiftType] = time;
    // if (shiftType === 'AM') {
    //   this.jobsite.shift_start_times.AM = time;
    // } else if(shiftType === 'PM') {
    //   this.jobsite.shift_start_times.PM = time;
    // }
  }

  public addressCopy(direction: "up" | "down") {
    // let f = this.jobSiteForm.value;
    let f = this.jobsite;
    let a1 = f.address;
    let b1 = f.billing_address;
    let src = a1, dest = b1;
    if (direction === 'down') {
      dest.city = src.city                     + "";
      dest.state = src.state                   + "";
      dest.zipcode = src.zipcode               + "";
      dest.street.street1 = src.street.street1 + "";
      dest.street.street2 = src.street.street2 + "";
      // this.updateDisplay();
    } else if (direction === 'up') {
      src = b1, dest = a1;
      dest.city = src.city                     + "";
      dest.state = src.state                   + "";
      dest.zipcode = src.zipcode               + "";
      dest.street.street1 = src.street.street1 + "";
      dest.street.street2 = src.street.street2 + "";
      // this.updateDisplay();
    } else {
      let errStr = `addressCopy(): Invalid option '${direction}' passed! Valid options are 'down' (address to billing) or 'up' (billing to address)!`;
      Log.w(errStr);
      this.alert.showAlert("ERROR", errStr);
    }
  }

  public numberize(val:any) {
    let num = Number(val);
    if(isNaN(num)) {
      Log.w("numberize(): Non-numerica value specified: " + val);
      return null;
    } else {
      return num;
    }
  }

  public sitePrevious() {
    if (this.siteIndex > 1) {
      this.siteIndex--;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public siteNext() {
    if (this.siteIndex < this.siteCount) {
      this.siteIndex++;
      this.jobsite = this.sites[this.siteIndex - 1];
      this.updateDisplay();
    }
  }

  public noPrevious() {
    this.notify.addWarn("ALERT", `No previous work site.`, 3000);
    // this.alert.showAlert("START OF SITES", "Can't go to previous work site. Already at start of list.");
  }

  public noNext() {
    this.notify.addWarn("ALERT", `No next work site.`, 3000);
    // this.alert.showAlert("END OF SITES", "Can't go to next work site. Already at end of list.");
  }


}
