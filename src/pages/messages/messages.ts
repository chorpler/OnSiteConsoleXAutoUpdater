import { Component, ViewChild                } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log, Moment, moment, isMoment       } from '../../config/config.functions' ;
import { Employee, Message                   } from '../../domain/domain-classes'   ;
import { DBService                           } from '../../providers/db-service'    ;
import { ServerService                       } from '../../providers/server-service';
import { AlertService                        } from '../../providers/alert-service' ;
import { OSData                              } from '../../providers/data-service'  ;

@IonicPage({
  name: 'Messages'
})
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  @ViewChild('inputSubject') inputSubject    ;
  public title      : string = "Messages"    ;
  public employee   : Employee               ;
  public messageDate: Date                   ;
  public message    : Message                ;
  public messages   : Array<Message> = []    ;
  public dataReady  : boolean        = false ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db:DBService, public server:ServerService, public alert:AlertService, public data:OSData) {
    window['onsitemessages'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad MessagesPage');
    this.initializeMessages();
  }

  public initializeMessages() {
    this.newMessage();
    this.server.getMessages().then((res:Array<Message>) => {
      this.messages = res.sort((a,b) => {
        let dA = a['date'].format();
        let dB = b['date'].format();
        return dA > dB ? -1 : dA < dB ? 1 : 0;
      });
      this.dataReady = true;
      this.focusOnSubject();
    }).catch(err => {
      Log.l("initializeMessages(): Error getting messages list!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error getting existing messages:<br>\n<br>\n" + err.message);
    });
  }

  public newMessage() {
    let message = new Message();
    let user = this.data.getUser();
    this.employee = user;
    message.from = user ? this.employee.getFullNameNormal() : "";
    let now = moment();
    message.date = now;
    message.duration = 7;
    this.messageDate = now.toDate();
    this.message = message;
    this.focusOnSubject()
  }

  public focusOnSubject() {
    if (this.inputSubject) {
      setTimeout(() => {
        this.inputSubject.setFocus();
      }, 400);
    }
  }

  public openMessage(message:Message) {
    this.message = message;
  }

  public updateFromDate(event:any) {
    Log.l("updateFromDate(): Event passed is:\n", event);
    // let fromDate = moment(event).format("YYYY-MM-DD");
    let msgDate = moment(this.messageDate);
    this.message.date = msgDate;
  }

  public postMessage() {
    Log.l("postMessage(): Starting...");
    this.server.saveMessage(this.message).then(res => {
      Log.l("postMessage(): Success!");
    }).catch(err => {
      Log.l("postMessage(): Error!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error saving message:<br>\n<br>\n" + err.message);
    });
  }

  public cancel() {
    let msg = this.message;
    if((msg.text && msg.text.length > 0) || (msg.textES && msg.textES.length > 0)) {
      this.alert.showConfirm("CANCEL", "Do you really want to cancel the current message? You will lose the text you've entered.").then(res => {
        if(res) {
          this.newMessage();
        }
      });
    } else {
      this.newMessage();
    }
  }
}
