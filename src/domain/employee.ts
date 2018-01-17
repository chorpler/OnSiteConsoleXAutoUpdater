/**
 * Name: Employee domain class
 * Vers: 4.1.1
 * Date: 2017-11-20
 * Auth: David Sargeant
 * Logs: 4.1.1: added technician property output to serialize method
 * Logs: 4.1.0: added isOfficeEmployee method
 * Logs: 4.0.1: changed type of userClass, client, location, locID (all were any)
 * Logs: 3.5.1: Changed "created" and "lastUpdated" to timestamp strings instead of Moment
 */

import { Address                 } from './address'                  ;
import { Jobsite                 } from './jobsite'                  ;
import { Log, moment, Moment, oo } from '../config/config.functions' ;

export type CLL = {name: string, fullName: string};

export interface IFEmployee {
  _id                 :string           ;
  _rev                :string           ;
  name                : string          ;
  username            : string          ;
  avatarName          : string          ;
  prefix              : string          ;
  firstName           : string          ;
  lastName            : string          ;
  middleName          : string          ;
  suffix              : string          ;
  technician          : string          ;
  type                : any             ;
  avtrNameAsUser      : boolean         ;
  userClass           : Array<string>   ;
  client              : CLL             ;
  location            : CLL             ;
  locID               : CLL             ;
  site_number         : number          ;
  shift               : string          ;
  shiftLength         : string | number ;
  shiftStartTime      : string | number ;
  shiftStartTimeMoment: Moment          ;
  shiftStartTimeHour  : string          ;
  rotation            : string          ;
  email               : Array<string>   ;
  phone               : string          ;
  cell                : string          ;
  address             : Address         ;
  payRate             : number          ;
  active              : boolean         ;
  updated             : boolean         ;
  created             : string          ;
  lastUpdated         : string          ;
  statusUpdates       : Array<any>      ;
}

export class Employee implements IFEmployee {
  public _id                 : string        ;
  public _rev                : string        ;
  public name                : string        ;
  public username            : string        ;
  public avatarName          : string        ;
  public prefix              : string        ;
  public firstName           : string        ;
  public lastName            : string        ;
  public middleName          : string        ;
  public suffix              : string        ;
  public technician          : string        ;
  public type                : any           ;
  public avtrNameAsUser      : boolean       ;
  public userClass           : any ;
  public client              : any           ;
  public location            : any           ;
  public locID               : any           ;
  public workSite            : string        ;
  public site_number         : number        ;
  public shift               : string        ;
  public shiftLength         : number        ;
  public shiftStartTime      : number        ;
  public shiftStartTimeMoment: Moment        ;
  public shiftStartTimeHour  : string        ;
  public rotation            : string        ;
  public email               : Array<string> ;
  public phone               : string        ;
  public cell                : string        ;
  public address             : Address       ;
  public payRate             : number        ;
  public active              : boolean       =true  ;
  public updated             : boolean       =false ;
  public created             : string        ;
  public lastUpdated         : string        ;
  public statusUpdates       : Array<any> = [];

  constructor(prefix?, firstName?, lastName?, middleName?, suffix?, username?, name?, type?, avatarName?, avtrNameAsUser?, userClass?, client?, location?, locID?, shift?, shiftLength?, shiftStartTime?, email?, phone?, cell?) {    this.prefix               = prefix         || null ;
    this._id                  = "";
    this._rev                 = "";
    this.firstName            = firstName      || null ;
    this.lastName             = lastName       || null ;
    this.middleName           = middleName     || null ;
    this.suffix               = suffix         || null ;
    this.technician           = ""             ;
    this.username             = username       || null ;
    this.name                 = name           || null ;
    this.type                 = type           || null ;
    this.avatarName           = avatarName     || null ;
    this.avtrNameAsUser       = avtrNameAsUser || null ;
    this.userClass            = userClass      || ["TECHNICIAN"] ;
    this.client               = client         || null ;
    this.location             = location       || null ;
    this.locID                = locID          || null ;
    this.workSite             = ""                     ;
    this.site_number          = -1                     ;
    // this.loc2nd               = "" ;
    this.shift                = shift          || null ;
    this.shiftLength          = shiftLength    || null ;
    this.shiftStartTime       = shiftStartTime || null ;
    this.shiftStartTimeMoment = shiftStartTime || null ;
    this.shiftStartTimeHour   = shiftStartTime || null ;
    this.rotation             = ""                     ;
    this.email                = [email]        || null ;
    this.phone                = phone          || null ;
    this.cell                 = cell           || null ;
    this.address              = new Address()  ;
    this.payRate              = 0              ;
    this.active               = true           ;
    this.updated              = false          ;
    this.created              = moment().format();
    this.lastUpdated          = moment().format();
  }

  public readFromForm(doc:any) {
    for (let prop in doc) {
      let docprop = doc[prop];
      if (docprop && typeof docprop === 'object') {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop].name);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = startHour;
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if(prop === 'jobsite') {
          let site = doc[prop];
          Log.l("Employee.readFromDoc(): site is:\n", site);
          let cli = site.client;
          let loc = site.location;
          let lid = site.locID;
          let sno = site.site_number;
          if(typeof cli === 'string') {
            cli = JSON.parse(cli);
          }
          if(typeof loc === 'string') {
            loc = JSON.parse(loc);
          }
          if(typeof lid === 'string') {
            lid = JSON.parse(lid);
          }
          if(typeof sno === 'string') {
            sno = JSON.parse(sno);
          }
          this.client = cli.fullName.toUpperCase();
          this.location = loc.fullName.toUpperCase();
          this.locID = lid.name.toUpperCase();
          this.workSite = site._id || `${cli.name.toUpperCase()} ${loc.fullName.toUpperCase()} ${lid.name.toUpperCase()}`;
          this.site_number = sno || -1;
        } else if (prop === 'client' || prop === 'location') {
          this[prop] = doc[prop].fullName.toUpperCase();
        } else if (prop === 'locID' || prop === 'loc2nd' || prop === 'shift') {
          this[prop] = doc[prop].name.toUpperCase();
        } else if (prop === 'shiftLength' || prop === 'shiftStartTime') {
          this[prop] = Number(doc[prop].name);
        } else if (prop === 'address') {
          let a:any = doc[prop];
          if (typeof a.street === 'object') {
            // this.address = a;
            this.address.street.street1 = a.street.street1;
            this.address.street.street2 = a.street.street2;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode || a.zip || '';
          } else if (a.street) {
            this.address.street.street1 = a.street;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode ? a.zipcode : a.zip ? a.zip : '';
          } else {
            Log.w("Address.readFromDoc(): Doc invalid:\n", doc);
            return null;
          }
        } else {
          this[prop] = doc[prop];
        }
      } else {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop]);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = doc[prop];
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if (prop === 'street') {
          this.address.street.street1 = doc[prop];
        } else if (prop === 'zipcode' || prop === 'zip') {
          this.address.zip = doc[prop];
        } else {
          this[prop] = doc[prop];
        }
      }
    }
    if (doc && doc.name === undefined) { this.name = doc.avatarName; }
    this.avatarName = this.name;
    this.username = this.name;
  }

  public readFromDoc(doc: any) {
    for (let prop in doc) {
      let docprop = doc[prop];
      if (docprop && typeof docprop === 'object') {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop].name);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = startHour;
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if (prop === 'client' || prop === 'location') {
          this[prop] = doc[prop].fullName.toUpperCase();
        } else if (prop === 'locID' || prop === 'loc2nd' || prop === 'shift') {
          this[prop] = doc[prop].name.toUpperCase();
        } else if (prop === 'shiftLength' || prop === 'shiftStartTime') {
          this[prop] = Number(doc[prop].name);
        } else if (prop === 'address') {
          let a:any = doc[prop];
          if (typeof a.street === 'object') {
            // this.address = a;
            this.address.street.street1 = a.street.street1;
            this.address.street.street2 = a.street.street2;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode || a.zip || '';
          } else if (a.street) {
            this.address.street.street1 = a.street;
            this.address.city           = a.city;
            this.address.state          = a.state;
            this.address.zip            = a.zipcode ? a.zipcode : a.zip ? a.zip : '';
          } else {
            Log.w("Address.readFromDoc(): Doc invalid:\n", doc);
            return null;
          }
        } else if(prop !== 'jobsite') {
          this[prop] = doc[prop];
        }
      } else {
        if (prop === 'shiftStartTime') {
          let startHour = Number(doc[prop]);
          this['shiftStartTimeMoment'] = moment().hour(startHour).startOf('hour');
          this[prop] = doc[prop];
          this['shiftStartTimeHour'] = this.shiftStartTimeMoment.format("HH:mm");
        } else if (prop === 'street') {
          this.address.street.street1 = doc[prop];
        } else if (prop === 'zipcode' || prop === 'zip') {
          this.address.zip = doc[prop];
        } else if(prop !== 'jobsite') {
          this[prop] = doc[prop];
        }
      }
    }
    if (doc && doc.name === undefined) { this.name = doc.avatarName; }
    this.avatarName = this.name;
    this.username = this.name;
  }

  public serialize():any {
    let keys = Object.keys(this);
    let doc:any = {};
    for(let key of keys) {
      if(key === 'shiftStartTimeMoment') {
        // doc[key] = this[key].format();
      } else if(key === 'technician') {
        doc[key] = this.technician || this.getTechName();
      } else {
        doc[key] = this[key];
      }
    }
    doc['avtrNameAsUser'] = true;
    return doc;
  }

  public getTechID() {
    return this.username;
  }

  public getFullName() {
    let fullName = "";
    fullName += this.lastName ? this.lastName : '';
    fullName += ",";
    fullName += this.prefix ? ` ${this.prefix}` : '';
    fullName += this.firstName ? ` ${this.firstName}` : '';
    fullName += this.middleName ? ` ${this.middleName}` : '';
    fullName += this.suffix ? ` ${this.suffix}` : '';
    return fullName;
  }

  public getTechName() {
    let fullName = `${this.lastName}, ${this.firstName}`;
    return fullName;
  }

  public getFullNameNormal() {
    let fullName = `${this.firstName} ${this.lastName}`;
    return fullName;
  }

  public getClient() {
    return this.client && typeof this.client === 'object' && this.client.fullName ? this.client.fullName.toUpperCase() : this.client;
  }

  public getUsername() {
    return this.username ? this.username : this.avatarName;
  }

  public getShiftType(): string {
    return this.shift;
  }

  public setShiftType(AMorPM: string) {
    this.shift = AMorPM;
    return this.shift;
  }

  public getShiftRotation(): string {
    if (this.rotation) {
      return this.rotation;
    } else {
      return "CONTN WEEK";
    }
  }

  public getShiftSymbol():string {
    // let sun = "☀☼🌞🌣";
    // let moon = "☽🌛🌜";
    let sun = "☀";
    let moon = "☽";
    if(!this.shift || this.shift.toUpperCase() === 'AM') {
      return sun;
    } else {
      return moon;
    }
  }

  public setJobsite(site:Jobsite) {
    let site_number = site.site_number;
    let site_id     = site.getSiteSelectName();
    this.site_number = site_number;
    this.workSite = site_id;
  }

  public isOfficeEmployee() {
    let role = "";
    let uclass:any = this.userClass;
    if (Array.isArray(uclass)) {
      for(let userclass of this.userClass) {
        let userRole = userclass.toUpperCase();
        if(userRole === 'MANAGER' || userRole === 'OFFICE') {
          return true;
        }
      }
      // role = this.userClass[0].toUpperCase();
    } else if (typeof uclass === 'string') {
      role = uclass.toUpperCase();
      if(role === 'MANAGER' || role === 'OFFICE') {
        return true;
      }
    }
    // if(role === 'MANAGER') {
    //   return true;
    // } else if(role === 'OFFICE') {
    //   return false;
    // } else {
    return false;
    // }
  }

  public isManager() {
    let role = "";
    let uclass:any = this.userClass;
    if (Array.isArray(uclass)) {
      for(let userclass of this.userClass) {
        let userRole = userclass.toUpperCase();
        if(userRole === 'MANAGER') {
          return true;
        }
      }
      // role = this.userClass[0].toUpperCase();
    } else if (typeof uclass === 'string') {
      role = uclass.toUpperCase();
      if(role === 'MANAGER') {
        return true;
      }
    }
    // if(role === 'MANAGER') {
    //   return true;
    // } else if(role === 'OFFICE') {
    //   return false;
    // } else {
    return false;
    // }
  }

  public isLevel1Manager() {
    let result = false;
    if(this.isManager()) {
      let name = this.getUsername();
      if(this.username === 'patron' || this.username === 'cvela' || this.username === 'Chorpler' || this.username === 'Hachero') {
        result = true;
      } else {
        result = false;
      }
    } else {
      result = false;
    }
    return result;
  }

  public isActive() {
    return this.active;
  }

  public activate() {
    this.active = true;
    return this.active;
  }

  public deactivate() {
    this.active = false;
    return this.active;
  }

  public toString() {
    return this.getFullName();
  }
}
