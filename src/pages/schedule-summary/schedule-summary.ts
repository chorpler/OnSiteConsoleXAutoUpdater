import { Component,                                           } from '@angular/core'                   ;
import { IonicPage, NavController, NavParams                  } from 'ionic-angular'                   ;
import { Log, Moment, moment                                  } from '../../config/config.functions'   ;
// import { ServerService                                        } from '../../providers/server-service'  ;
// import { DBService                                            } from '../../providers/db-service'      ;
// import { AuthService                                          } from '../../providers/auth-service'    ;
// import { AlertService                                         } from '../../providers/alert-service'   ;
// import { Jobsite                                              } from '../../domain/jobsite'            ;
// import { Employee                                             } from '../../domain/employee'           ;
// import { Schedule                                             } from '../../domain/schedule'           ;
// import { OSData                                               } from '../../providers/data-service'    ;
// import { PDFService                                           } from '../../providers/pdf-service'     ;
// import { OptionsComponent                                     } from '../../components/options/options';

export const colors = {
  // These are background colors used for Halliburton and other clients in Scheduling and whatnot
  bg: {
    HB: "#d9e1f2",
    KN: "#e2efda",
    BE: "#f8cbad",
    SE: "#ffffff",
    date: "#004080",
  },
  // Foreground colors for clients, used in Scheduling summary and whatnot
  fg: {
    HB: "#203764",
    KN: "#c65911",
    BE: "#375623",
    SE: "#cc0099",
    date: "#e6e6e6",
  },
  get date() { return { color: colors.fg.date, fillColor: colors.bg.date }; },

};


@IonicPage({name: 'Schedule Summary'})
@Component({
  selector: 'page-schedule-summary',
  templateUrl: 'schedule-summary.html',
})
export class ScheduleSummaryPage {
  public data: any;
  public csv : any;
  public dataReady:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    window['schedulingsummary'] = this;
    if(this.navParams.get('data') !== undefined) {
      this.data = this.navParams.get('data');
    }
    if(this.navParams.get('csv') !== undefined) {
      this.csv = this.navParams.get('csv');
    }
  }

  ionViewDidEnter() {
    Log.l('ionViewDidLoad ScheduleSummaryPage');
    let keys =[];
    if(this.data !== undefined && this.data !== null) {
      keys = Object.keys(this.data);
    }
    if(this.data && keys.length > 0) {
      this.dataReady = true;
    } else {
      if (this.navParams.get('data') !== undefined) {
        this.data = this.navParams.get('data');
        this.dataReady = true;
      }
    }
    if(this.dataReady) {
      Log.l("Get ready for CSV data:");
      Log.l(this.csv);
      window['mikecsv'] = this.csv;
    }
  }

}
