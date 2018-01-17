import { Injectable } from '@angular/core'           ;
import { Notice     } from 'domain/notice'           ;
import { Subject    } from 'rxjs/Subject'            ;
import { Observable } from 'rxjs/Observable'         ;
import { Log        } from 'config/config.functions' ;

@Injectable()
export class NotifyService {
  // private messageSource = new Subject<Notice|Notice[]>();
  private messageSource = new Subject<Notice>();
  public messageObserver = this.messageSource.asObservable();

  constructor() {
    window['onsitenotifyservice'] = this;
  }

  public add(message:Notice) {
    if (message) {
      this.messageSource.next(message);
    }
  }

  public addMessage(summary:string, details:string, severity?:string, life?:number) {
    let severityLevel = typeof severity === 'string' ? severity : 'info';
    let timeoutValue = life ? life : 3000;
    let msg:Notice = {severity: severityLevel, summary: summary, detail: details, life: timeoutValue};
    this.add(msg);
  }

  public addSuccessMessage(summary:string, details:string, life?:number) {
    let severityLevel = 'success';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addWarningMessage(summary: string, details: string, life?: number) {
    let severityLevel = 'warn';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addInfoMessage(summary: string, details: string, life?: number) {
    let severityLevel = 'info';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addErrorMessage(summary: string, details: string, life?: number) {
    let severityLevel = 'error';
    let timeoutValue = life ? life : 3000;
    this.addMessage(summary, details, severityLevel, timeoutValue);
  }

  public addMessages(messages:Notice[]) {
    if (messages && messages.length) {
      for(let message of messages) {
        this.messageSource.next(message);
      }
    }
  }
  // public addSuccess(summary: string, details: string, life?: number) {
  //   this.addSuccessMessage(summary, details, life);
  // }

  public addSuccess = this.addSuccessMessage;
  public addWarning = this.addWarningMessage;
  public addWarn    = this.addWarningMessage;
  public addInfo    = this.addInfoMessage;
  public addError   = this.addErrorMessage;
  public addAll     = this.addMessages;


  public clear() {
    this.messageSource.next(null);
  }
}
