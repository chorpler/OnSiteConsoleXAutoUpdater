/**
 * Name: Comment domain class
 * Vers: 1.1.2
 * Date: 2017-12-12
 * Auth: David Sargeant
 * Logs: 1.1.2 2017-12-12: Initial model
 */

import { Log, moment, Moment } from '../config/config.functions'     ;

export class Comment {
  public _id       :string = ""  ;
  public _rev      :string = ""  ;
  public technician:string = ""  ;
  public username  :string = ""  ;
  public subject   :string = ""  ;
  public message   :string = ""  ;
  public timestamp :Moment = null;
  public phone     :any    = {
    cordova     : "",
    model       : "",
    platform    : "",
    uuid        : "",
    version     : "",
    manufacturer: "",
    virtual     : "",
    serial      : "",
    uniqueID    : "",
    appName     : "",
    appVersion  : "",
  };

  constructor() {
  }

  public setSubject(subject:string) {
    this.subject = subject;
    return subject;
  }

  public setTechnician(techName:string) {
    this.technician = techName;
    return this.technician;
  }

  public setUsername(name:string) {
    this.username = name;
    return name;
  }

  public setMessage(message:string) {
    this.message = message;
    return message;
  }

  public setPhone(phone:any) {
    this.phone = phone;
    return phone;
  }

  public setTimestamp(timestamp?:Moment) {
    this.timestamp = timestamp || moment();
  }

  public generateID() {
    let id = this.timestamp.format() + "_" + this.username;
    this._id = id;
    return id;
  }

  public serialize() {
    let doc = new Object();
    let keys = Object.keys(this);
    for(let key of keys) {
      doc[key] = this[key];
    }
    doc['timestamp'] = this.timestamp.format();
    doc['_id'] = this.generateID();
    if(this['_rev'] !== '') {
      doc['_rev'] = this['_rev'];
    }
    return doc;
  }

  public deserialize(doc:any) {
    let keys = Object.keys(doc);
    for(let key of keys) {
      if(key === 'timestamp') {
        this[key] = moment(doc[key]);
      } else {
        this[key] = doc[key];
      }
    }
  }

  // public checkPhoneInfo() {
  //   this.readPhoneInfo().then(res => {
  //     Log.l("checkPhoneInfo(): Phone info is fine.");
  //   }).catch(err => {
  //     Log.l("checkPhoneInfo(): Nope.");
  //     Log.e(err);
  //   });
  // }

  // public readPhoneInfo() {
  //   return new Promise((resolve,reject) => {
  //     let cordova      = this.device.cordova      ;
  //     let model        = this.device.model        ;
  //     let platform     = this.device.platform     ;
  //     let uuid         = this.device.uuid         ;
  //     let version      = this.device.version      ;
  //     let manufacturer = this.device.manufacturer ;
  //     let virtual      = this.device.isVirtual    ;
  //     let serial       = this.device.serial       ;
  //     let uniqueID     = ""                       ;
  //     this.unique.get().then(res => {
  //       uniqueID = res;
  //       this.phone = {
  //         cordova     : cordova      ,
  //         model       : model        ,
  //         platform    : platform     ,
  //         uuid        : uuid         ,
  //         version     : version      ,
  //         manufacturer: manufacturer ,
  //         virtual     : virtual      ,
  //         serial      : serial       ,
  //         uniqueID    : uniqueID     ,
  //       };
  //       resolve(this.phone);
  //     }).catch(err => {
  //       Log.l("readPhoneInfo(): Error reading phone info!");
  //       Log.e(err);
  //     });
  //   });
  // }

}
