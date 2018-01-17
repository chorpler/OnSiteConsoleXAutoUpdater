/**
 * Name: Jobsite domain class
 * Vers: 3.0.1
 * Date: 2017-12-15
 * Auth: David Sargeant
 * Logs: 3.0.1 2017-12-15: Merged app and console classes
 * Logs: 2.2.1 2017-08-30: Updated with site_number and new methods
 */

import { Street                            } from './street'                ;
import { Address                           } from './address'               ;
import { Log, moment, Moment, isMoment, oo } from 'config/config.functions' ;

export class Jobsite {
  public _id                       : string  ;
  public _rev                      : string  ;
  public client                    : any     ;
  public location                  : any     ;
  public locID                     : any     ;
  public loc2nd                    : any     ; /* deprecated in 2.0.1 */
  public address                   : Address ;
  public billing_address           : Address =this.address ;
  public latitude                  : number  ;
  public longitude                 : number  ;
  public within                    : number  ;
  public account_number            : any     ;
  public travel_time               : number  ;
  public per_diem_rate             : number  ;
  public lodging_rate              : number  ;
  public requires_preauth          : boolean =false        ;
  public requires_preauth_pertech  : boolean =false        ;
  public requires_invoice_woreports: boolean =false        ;
  public account_or_contract       : string  ='Contract'   ;
  public billing_rate              : number  =65           ;
  public site_active               : boolean =true         ;
  public divisions                 : any     ;
  public shiftRotations            : any     ;
  public hoursList                 : any     ;
  public techShifts                : any     ;
  public schedule_name             : string  ;
  public has_standby               : boolean  = false;
  public sort_number               : number  ;
  public site_number               : number = -1001;
  public shift_start_times         : any  = {"AM" :"06:00", "PM": "18:00"} ;


  constructor(inClient?:any, inLoc?: any, inLocID?:any, inAddress?:Address, inLat?:number, inLon?:number, inWI?:number) {
    this._id                        = ""         ;
    this.client                     = inClient   || null       ;
    this.location                   = inLoc      || null       ;
    this.locID                      = inLocID    || null       ;
    this.loc2nd                     = null       ;
    this.address                    = inAddress  || null       ;
    this.billing_address            = inAddress  || null       ;
    this.latitude                   = inLat      || 26.17726   ;
    this.longitude                  = inLon      || -97.964594 ;
    this.within                     = inWI       || 500        ;
    this.account_number             = ''         ;
    this.travel_time                = 0          ;
    this.per_diem_rate              = 0          ;
    this.lodging_rate               = 0          ;
    this.requires_preauth           = false      ;
    this.requires_preauth_pertech   = false      ;
    this.requires_invoice_woreports = false      ;
    this.account_or_contract        = 'Contract' ;
    this.billing_rate               = 65         ;
    this.site_active                = true       ;
    this.divisions                  =            {           } ;
    this.shiftRotations             =            {           } ;
    this.hoursList                  =            {           } ;
    this.techShifts                 =            {           } ;
    this.schedule_name              = ""         ;
    this.has_standby                = false      ;
    this.sort_number                = 0          ;
    this.site_number                = -1001      ;

    window['onsite'] = window['onsite'] || {};
    window['onsite']['Jobsite'] = Jobsite;

  }

  public setBilling(inAddr: Address) {
    this.billing_address = inAddr;
  }

  public setAddress(inAddr: Address) {
    this.address = inAddr;
  }

  public readFromDoc(doc:any) {
    if(typeof doc != 'object') {
      Log.l("Can't read jobsite from:\n", doc);
      throw new Error("readFromDoc(): Jobsite cannot be read");
    }
    if (doc.address !== undefined) {
      this.address = new Address(new Street(doc.address.street.street1, doc.address.street.street2), doc.address.city, doc.address.state, doc.address.zipcode);
    } else {
      this.address = new Address(new Street('', ''), '', '', '');
    }
    if (doc.billing_address !== undefined) {
      this.billing_address = new Address(new Street(doc.billing_address.street.street1, doc.billing_address.street.street2), doc.billing_address.city, doc.billing_address.state, doc.billing_address.zipcode);
    } else {
      this.billing_address = new Address(new Street('', ''), '', '', '');
    }

    for(let prop in doc) {
      if(prop === 'lodging_rate' || prop === 'per_diem_rate' || prop === 'site_number') {
        this[prop] = Number(doc[prop]);
      } else if (prop !== 'address' && prop !== 'billing_address') {
        this[prop] = doc[prop];
      }
    }
    if(doc['schedule_name'] === undefined) {
      this.schedule_name = this.getSiteName();
    }
    if(!this._id) {
      this._id = this.getSiteID();
    } else {
      this._id = doc['_id'];
      if(doc['_rev']) {
        this._rev = doc['_rev'];
      }
    }
  }

  public serialize() {
    var keys = Object.keys(this);
    let doc = {};
    for(let key of keys) {
      doc[key] = JSON.stringify(this[key]);
    }
    return doc;
  }

  public getSiteName() {
    let cli = this.client.fullName.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.fullName.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.loc2nd && this.loc2nd.name) { laux = this.loc2nd.name; }
    // if (laux !== "NA" && laux !== "N/A") {
    //   l2d = this.loc2nd.fullName.toUpperCase();
    // }

    let siteName = '';
    if(this.client.name === "HB") {
      siteName = '';
    } else {
      siteName = `${cli} `;
    }

    siteName += `${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
    //   siteName += ` ${l2d}`;
    // }

    if(this.locID.name !== "MNSHOP") {
      siteName += ` ${lid}`
    }

    return siteName;
  }

  public getSiteSelectName() {
    // let cli = this.client.fullName.toUpperCase();
    let cli = this.client.name.toUpperCase();
    let loc = this.location.fullName.toUpperCase();
    let lid = this.locID.name.toUpperCase();
    // let l2d = '';
    // let laux = "NA";
    // if (this.loc2nd && this.loc2nd.name) { laux = this.loc2nd.name; }
    // if (laux !== "NA" && laux !== "N/A") {
      // l2d = this.loc2nd.fullName.toUpperCase();
    // }

    let siteName = `${cli}`;
    siteName    += ` ${loc}`;

    // if (laux !== "NA" && laux !== "N/A") {
      // siteName += ` ${l2d}`;
    // }

    siteName += ` ${lid}`;
    return siteName;
  }

  public getScheduleName() {
    return this.schedule_name;
  }

  public setScheduleName(name:string) {
    this.schedule_name = name;
  }

  public getInvoiceName() {
    let cli = this.client.fullName;
    let loc = this.location.fullName;
    let lid = this.locID.fullName;
    let out = `${cli} ${loc} ${lid}`;
    return out;
  }

  public getShiftTypes() {
    return Object.keys(this.shift_start_times);
  }

  public getShiftStartTimes() {
    return this.shift_start_times;
  }

  public getShiftStartTime(key:string) {
    if(this.shift_start_times[key] !== undefined) {
      return this.shift_start_times[key];
    } else {
      Log.e("getShiftStartTime(): Error, key was not found in start times object: ", key);
      return null;
    }
  }

  public getShiftRotations() {
    return this.shiftRotations;
  }

  public setShiftRotations(value:any) {
    this.shiftRotations = value;
    return this.shiftRotations;
  }

  public getSiteID() {
    if (this._id) {
      return this._id;
    } else {
      let siteid = '';
      let cli = this.client.name.toUpperCase();
      let loc = this.location.fullName.toUpperCase();
      let lid = this.locID.name.toUpperCase();
      // let laux = "NA";
    // if (this.loc2nd && this.loc2nd.name) { laux = this.loc2nd.name; }
    // if (laux !== "NA" && laux !== "N/A") {
    //   l2d = this.loc2nd.name.toUpperCase();
      // siteid = `${cli} ${loc} ${l2d} ${lid}`;
    // } else {
      siteid = `${cli} ${loc} ${lid}`;
    // }
      return siteid;
    }
  }

  public getShortID() {
    let siteid = '';
    let cli = this.client.name.toUpperCase();
    let loc = this.location.name.toUpperCase();
    let l2d = '';
    let lid = this.locID.name.toUpperCase();
    let laux = "NA";
    if (this.loc2nd && this.loc2nd.name) { laux = this.loc2nd.name; }
    if (laux !== "NA" && laux !== "N/A") {
      l2d = this.loc2nd.name.toUpperCase();
      siteid = `${cli} ${loc} ${l2d} ${lid}`;
    } else {
      siteid = `${cli} ${loc} ${lid}`;
    }
    return siteid;
  }

  public updateSiteDivisions(rotations:any, hours:any) {
    let js = this;
    let cli = js.client.name;
    let loc = js.location.name;
    let sr = rotations;
    let sd = {};
    let hasLoc2nd = js.loc2nd.length;
    sd[cli] = {};
    sd[cli][loc] = {};
    if (hasLoc2nd) {
      for (let loc2 of js.loc2nd) {
        sd[cli][loc][loc2] = {};
        for (let locID of js.locID) {
          sd[cli][loc][loc2][locID] = {};
          for (let rotation of sr) {
            let rot = rotation.name;
            sd[cli][loc][loc2][locID][rot] = [];
          }
        }
      }
    } else {
      for (let locID of js.locID) {
        sd[cli][loc][locID] = {};
        for (let rotation of sr) {
          let rot = rotation.name;
          sd[cli][loc][locID][rot] = [];
        }
      }
    }
    this.divisions = sd;
    Log.l("JobSite.updateSiteDivisions(): Site divisions are now:\n", sd);
  }

  public getFullHoursList() {
    return this.hoursList;
  }

  public getHoursList(shiftRotation:string|object, shiftTime?:string) {
    let match = "", oneHourList = null, singleShiftList = null;
    if(typeof shiftRotation === 'string') {
      match = shiftRotation;
    } else if(shiftRotation && typeof shiftRotation === 'object' && typeof shiftRotation['name'] === 'string') {
      match = shiftRotation['name'];
    }
    if(this.hoursList[match] !== undefined) {
      oneHourList = this.hoursList[match];
    } else {
      // if (shiftRotation === 'UNASSIGNED' || shiftRotation === 'DAYS OFF') {
      if (shiftRotation === 'UNASSIGNED') {
        oneHourList = { AM: ["0", "0", "0", "0", "0", "0", "0"], PM: ["0", "0", "0", "0", "0", "0", "0"] };
        return oneHourList;
      } else {
        Log.e("Jobsite.getHoursList('%s', '%s'): Index not found!", match, shiftTime);
        Log.l(this);
        return null;
      }
    }
    if(shiftTime) {
      singleShiftList = oneHourList[shiftTime];
      return singleShiftList;
    } else {
      return oneHourList;
    }
  }

  public getShiftLengthForDate(shiftRotation:string|object, shiftTime:string, date:Moment|Date):number {
    let list = this.getHoursList(shiftRotation, shiftTime);
    let day = moment(date);
    let dayIndex = day.isoWeekday();
    let hoursIndex = (dayIndex + 4) % 7;
    let shiftLength = list[hoursIndex];
    let output = shiftLength;
    if(shiftLength == 0) {
      output = "OFF";
    }
    return output;
  }

  public getSiteShiftLength(shiftType: string | object, shiftTime: string, date: Moment | Date) {
    return this.getShiftLengthForDate(shiftType, shiftTime, date);
  }

  public getSiteNumber() {
    return this.site_number;
  }

  public setSiteNumber(value:number) {
    this.site_number = value;
    return this.site_number;
  }

  public toJSON() {
    return this.serialize();
  }

  public static fromJSON(doc:any) {
    return new Jobsite().readFromDoc(doc);
  }

}
