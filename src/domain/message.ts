/**
 * Name: Message domain class
 * Vers: 2.0.1
 * Date: 2017-08-04
 * Auth: David Sargeant
 */

import { Log, isMoment, moment, Moment  } from '../config/config.functions' ;
import { ServerService                  } from '../providers/server-service';
import { DBService                      } from '../providers/db-service'    ;

export class Message {
  public _id       : string  ;
  public _rev      : string  ;
  public from      : string  ;
  public date      : Moment  ;
  public XLdate    : number  ;
  public duration  : number  ;
  public subject   : string  ;
  public text      : string  ;
  public subjectES : string  ;
  public textES    : string  ;
  public texts     : any     = { en: "", es: "" } ;
  public subjects  : any     = { en: "", es: "" } ;
  public read      : boolean ;
  public readTS    : Moment  ;
  public message   : string  ;
  public technician: string  ;
  public phone     : any     ;

  constructor(from?: string, date?: Moment | Date | string, duration?: number, subject?: string, text?: string) {
    this.from      = from     || ''   ;
    this.duration  = duration || 7 ;
    this.subject   = subject  || ''   ;
    this.text      = text     || ''   ;
    this.subjectES = ''       ;
    this.textES    = ''       ;
    this.read      = false    ;
    this.readTS    = null     ;
    this.technician = "";
    this.message   = this.text;
    this.phone     = {};

    let mDate      = isMoment(date) || date instanceof Date ? moment(date) : typeof date === 'string' ? moment(date, 'YYYY-MM-DD') : moment();
    this.date      = moment(mDate) || null;
    this.XLdate    = mDate.toExcel();
  }

  readFromDoc(doc: any) {
    for (let key in doc) {
      let value = doc[key];
      if (key === 'date') {
        if (isMoment(value) || value instanceof Date) {
          this[key] = moment(value);
        } else if (typeof value === 'string') {
          this[key] = moment(value, "YYYY-MM-DD");
        }
      } else if(key === 'timestamp') {
        let ts = moment(doc[key]);
        this.date = ts;
      } else if (key === 'readTS') {
        this[key] = moment(doc[key]);
      } else if (key === 'duration') {
        if (moment.isDuration(value)) {
          this[key] = moment.duration(value).hours();
        } else {
          this[key] = value;
        }
      } else {
        this[key] = value;
      }
    }
    this.XLdate = this.date.toExcel();
  }

  getMessageDate() {
    return moment(this.date);
  }

  getMessageSender() {
    return this.from;
  }

  getMessageDateString() {
    let d = this.date;
    return moment(d).format("ddd, MMM D, YYYY");
  }

  getMessageSubject() {
    return this.subject;
  }

  getMessageBody() {
    return this.text;
  }

  getMessageDuration() {
    return this.duration;
  }

  getMessageReadStatus() {
    return this.read;
  }

  setMessageRead() {
    this.read = true;
    this.readTS = moment();
    return this.read;
  }

  public generateMessageID() {
    let date = moment(this.date);
    let dateFmt = date.format("YYYY-MM-DDTHH:mm:ss");
    let pattern = new RegExp("/ '\", !?//g");
    let usr = this.from.replace(pattern, '');
    let id = `${dateFmt}_${usr}`;
    this._id = id;
    return id;
  }

  serialize() {
    let keys = ['_id', '_rev', 'from', 'date', 'XLdate', 'duration', 'subject', 'text', 'read', 'readTS'];
    let doc = {};
    for (let key of keys) {
      if (key === 'date' || key === 'readTS') {
        doc[key] = this[key].format();
      } else {
        doc[key] = this[key];
      }
    }
    return doc;
  }

  public isExpired() {
    let now = moment();
    let message = this;
    let date = message.getMessageDate().startOf('day');
    let duration = message.getMessageDuration();
    let expires = moment(date).add(duration, 'days');
    if (now.isSameOrBefore(expires, 'day')) {
      return false;
    } else {
      return true;
    }
  }

  clone() {
    let doc = this.serialize();
    let newMsg = new Message();
    let keys = Object.keys(this);
    for (let key of keys) {
      let value = this[key];
      if (isMoment(value)) {
        newMsg[key] = moment(value);
      } else if (value && typeof value === 'object') {
        newMsg[key] = Object.assign({}, value);
      } else {
        newMsg[key] = this[key];
      }
    }
    return newMsg;
  }

}
