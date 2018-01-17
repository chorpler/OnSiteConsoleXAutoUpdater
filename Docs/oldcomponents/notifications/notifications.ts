// import { MessageService                                                     } from './messageservice'              ;
import { Log                                                                } from '../../config/config.functions' ;
import { Subscription                                                       } from 'rxjs/Subscription'             ;
import { Component, ElementRef, AfterViewInit, DoCheck, OnInit, OnDestroy,  } from '@angular/core'                 ;
import { Input, Output, ViewChild, EventEmitter, IterableDiffers, Optional, } from '@angular/core'                 ;
import { Notice                                                             } from '../../domain/domain-classes'   ;
import { DomHandler                                                         } from '../../providers/dom-handler'   ;
import { NotifyService                                                      } from '../../providers/notify-service';
import { NotificationComponent                                              } from '../notification/notification'  ;

@Component({
  selector: 'notifications',
  templateUrl: 'notifications.html',
  // template: `
  //   <div #container [ngClass]="'ui-notification ui-widget'" [style.zIndex]="zIndex" [ngStyle]="style" [class]="styleClass">
  //     <div #msgel *ngFor="let msg of value;let i = index" class="ui-notification-item-container ui-state-highlight ui-corner-all ui-shadow" aria-live="polite" [ngClass]="{'ui-notification-message-info':msg.severity == 'info', 'ui-notification-message-warn':msg.severity == 'warn', 'ui-notification-message-error':msg.severity == 'error','ui-notification-message-success':msg.severity == 'success'}" (click)="onMessageClick(i)" (mouseenter)="onMessageHover(i)">
  //       <div class="ui-notification-item">
  //         <div class="ui-notification-icon-close fa fa-close" (click)="remove(i,msgel)"></div>
  //         <span class="ui-notification-image fa fa-2x" [ngClass]="{'fa-info-circle':msg.severity == 'info', 'fa-exclamation-circle':msg.severity == 'warn', 'fa-close':msg.severity == 'error','fa-check':msg.severity == 'success'}"></span>
  //         <div class="ui-notification-message">
  //           <span class="ui-notification-title">{{msg.summary}}</span>
  //           <p [innerHTML]="msg.detail"></p>
  //         </div>
  //         <div style="clear: both;"></div>
  //       </div>
  //     </div>
  //   </div>
  // `,
  // providers: [DomHandler],
})
export class NotificationsComponent implements AfterViewInit, DoCheck, OnInit, OnDestroy {
  @Input('sticky') sticky: boolean;
  @Input('life') life: number = 3000;
  @Input('style') style: any;
  @Input('styleClass') styleClass: string;
  @Input('immutable') immutable: boolean = true;
  @Output('onClick') onClick: EventEmitter<any> = new EventEmitter();
  @Output('onHover') onHover: EventEmitter<any> = new EventEmitter();
  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter();
  @Output('valueChange') valueChange: EventEmitter<Notice[]> = new EventEmitter<Notice[]>();
  @ViewChild('container') containerViewChild: ElementRef;
  @ViewChild('notificationsWrapper') notificationsWrapper:ElementRef;
  public _value         : Notice[]  = [] ;
  public zIndex         : number         ;
  public container      : HTMLDivElement ;
  public timeout        : any            ;
  public preventRerender: boolean        ;
  public differ         : any            ;
  public subscription   : Subscription   ;
  public closeIconClick : boolean        ;
  public colorClasses   : any = {}       ;

  @Input() public get value():Notice[] {
    return this._value;
  }

  public set value(val:Notice[]) {
    this._value = val;
    if (this.container && this.immutable) {
      this.handleValueChange();
    }
  }

  // constructor(public el:ElementRef, public domHandler:DomHandler, public differs:IterableDiffers, @Optional() public notify?:NotifyService) {
  // constructor(public el:ElementRef, public domHandler:DomHandler, public differs:IterableDiffers, public notify?:NotifyService) {
  constructor(public el:ElementRef, public domHandler:DomHandler, public differs:IterableDiffers, public notify?:NotifyService) {
    window['onsitenotificationscomponent'] = this;
    this.zIndex = DomHandler.zindex;
    this.differ = differs.find([]).create(null);


    if (notify) {
      this.subscription = notify.messageObserver.subscribe((messages:Notice|Notice[]) => {
        Log.l("NotificationsComponent: received message observer from MessageService:\n", messages);
        if (messages) {
          if (messages instanceof Array) {
            for(let msg of messages) {
              if(msg['life'] === -1) {
                this.sticky = true;
                break;
              }
            }
            this.value = messages;
          } else {
            if(messages['life'] === -1) {
              this.sticky = true;
            }
            // let val = this._value || [];
            // val.push(messages);
            // this.value = val.slice(0);
            this.value = [messages];
          }
        } else {
          this.value = null;
        }
      });
    }
  }

  ngOnInit() {
    Log.l("NotificationsComponent: ngOnInit() fired.");
  }

  ngAfterViewInit() {
    Log.l("NotificationsComponent: ngAfterViewInit() fired.");
    // this.container = <HTMLDivElement>this.containerViewChild.nativeElement;
    // if (!this.sticky) {
    //   this.initTimeout();
    // }
  }

  ngDoCheck() {
    // Log.l("NotificationsComponent: ngDoCheck() fired.");
    if (!this.immutable && this.container) {
      let changes = this.differ.diff(this.value);
      if (changes) {
        this.handleValueChange();
      }
    }
  }

  ngOnDestroy() {
    Log.l("NotificationsComponent: ngOnDestroy() fired.");
    if (!this.sticky) {
      clearTimeout(this.timeout);
    }

    if (this.subscription && this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }

  handleValueChange() {
    if (this.preventRerender) {
      this.preventRerender = false;
      return;
    }

    this.zIndex = ++DomHandler.zindex;
    this.domHandler.fadeIn(this.container, 250);

    if (!this.sticky) {
      this.initTimeout();
    }
  }

  public initTimeout() {
    let value = this.value;
    let globalLife:number = this.life || 3000;
    let life:number = globalLife;
    if(value && value.length) {
      let msg:Notice = value[0];
      if(msg.life !== life) {
        life = msg.life;
      }
    } else if(this.life) {
      life = this.life;
    }
    // let life = this.value && this.value.length ? this.value[0].life this.life
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.removeAll();
    }, life);
    // }, this.life);
  }

  public remove(index: number, msgel: any) {
    Log.l(`NotificationsComponent: remove() clicked for notice ${index}. MessageElement is:\n`, msgel);
    this.closeIconClick = true;
    this.domHandler.fadeOut(msgel, 250);

    setTimeout(() => {
      this.preventRerender = true;
      this.onClose.emit({ message: this.value[index] });

      if (this.immutable) {
        this._value = this.value.filter((val, i) => i !== index);
        this.valueChange.emit(this._value);
      } else {
        this._value.splice(index, 1);
      }
    }, 250);
  }

  public removeAll() {
    Log.l(`NotificationsComponent: removeAll() called.`);
    if (this.value && this.value.length) {
      this.domHandler.fadeOut(this.container, 250);

      setTimeout(() => {
        this.value.forEach((msg, index) => this.onClose.emit({ message: this.value[index] }));
        if (this.immutable) {
          this.value = [];
          this.valueChange.emit(this.value);
        } else {
          this.value.splice(0, this.value.length);
        }
      }, 250);
    }
  }

  public messageRemoved(killedNotice:Notice) {
    Log.l("Notifications.messageRemoved(): event sent is:\n", killedNotice);
    let msgID = killedNotice.id;
    let matchIndex = 0;
    matchIndex = this.value.findIndex((a) => {
      return a.id === msgID;
    });
    if(matchIndex) {
      let removedNotice = this.value.splice(matchIndex, 1);
      this.value = this.value.slice(0);
    }
  }

}
