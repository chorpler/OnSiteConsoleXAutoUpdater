import { Component, ViewChild                } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { Log, Moment, moment, isMoment       } from '../../config/config.functions' ;
import { Employee, Message                   } from '../../domain/domain-classes'   ;
import { DBService                           } from '../../providers/db-service'    ;
import { ServerService                       } from '../../providers/server-service';
import { AlertService                        } from '../../providers/alert-service' ;
import { OSData                              } from '../../providers/data-service'  ;

@IonicPage({name: 'Comments'})
@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {
  public title    : string         = "Comments" ;
  public comments : Array<Message> = []         ;
  public comment  : Message        ;
  public dataReady: boolean        = false      ;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db:DBService, public server:ServerService, public alert:AlertService, public data:OSData) {
    window['onsitecomments'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad CommentsPage');
    this.fetchAllComments();
  }

  public fetchAllComments() {
    this.alert.showSpinner("Fetching comments from server...");
    this.server.getComments().then(res => {
      this.comments = res.sort((a:Message,b:Message) => {
        let dA = a.getMessageDate();
        let dB = b.getMessageDate();
        return dA > dB ? -1 : dA < dB ? 1 : 0;
      });
      this.comment = new Message();
      this.alert.hideSpinner();
      Log.l("fetchAllComments(): ")
      this.dataReady = true;
    }).catch(err => {
      this.alert.hideSpinner();
      Log.l("fetchAllComments(): Error fetching comments from server.");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error fetching comments from server:<br>\n<br>\n" + err.message);
    });
  }

  public openComment(comment:Message) {
    this.comment = comment;
  }

  public done() {
    Log.l("This does nothing.");
    this.alert.showAlert("OK", "This button doesn't actually do anything right now.");
  }

}
