import                                 'rxjs/add/operator/map'                    ;
import * as JSON5                 from 'json5'                                    ;
import { Injectable             } from '@angular/core'                            ;
import { HttpClient             } from '@angular/common/http'                     ;
import { Subject                } from 'rxjs/Subject'                             ;
import { Observable             } from 'rxjs/Observable'                          ;
import { Log                    } from '../config/config.functions'               ;
import { HotkeysService, Hotkey } from 'angular2-hotkeys'                         ;
import { Message                } from 'primeng/components/common/api'            ;
import { MessageService         } from 'primeng/components/common/messageservice' ;

export const configFile = "assets/keyconfig.json5";

class HotkeyConfig {
  [key: string]: string[];
}

class ConfigModel {
  public hotkeys: HotkeyConfig;
}

export class Command {
  public name  : string        ;
  public combo : string        ;
  public ev    : KeyboardEvent ;
}

@Injectable()
export class KeyCommandService {
  public subject:Subject<Command>;
  public commands:Observable<Command>;

  constructor(public hotkeysService:HotkeysService, public http:HttpClient, public growlService:MessageService) {
    this.subject = new Subject<Command>();
    this.commands = this.subject.asObservable();
    this.initializeService();
    // this.getJSON5Config();
    // })
    // .then(r => r.json() as ConfigModel)
    // .then(c => {
    //   for (const key in c.hotkeys) {
    //     const commands = c.hotkeys[key];
    //     hotkeysService.add(new Hotkey(key, (ev, combo) => this.hotkey(ev, combo, commands)));
    //   }
    // });
  }

  public hotkey(ev: KeyboardEvent, combo: string, commands: string[]):boolean {
    commands.forEach(c => {
      const command = {
        name: c,
        ev: ev,
        combo: combo
      } as Command;
      this.subject.next(command);
    });
    return true;
  }

  public initializeService() {
    // return new Promise((resolve,reject) => {
    this.getConfig().then((res:any) => {
      let json = JSON5.parse(res);
      json.map((r:any) => {
        return r.json() as ConfigModel;
      }).then(c => {
        for (const key in c.hotkeys) {
          const commands = c.hotkeys[key];
          this.hotkeysService.add(new Hotkey(key, (ev, combo) => this.hotkey(ev, combo, commands)));
        }
      });
    }).catch(err => {
      Log.l("getJSON5Config(): Error getting config file '%s'!", configFile);
      Log.e(err);
      let msgDetail = `Error while getting JSON5 Observable: '${err.message}'`;
      let msg:Message = {severity: "error", summary:"KeyCommandService error", detail: msgDetail};
      this.growlService.add(msg);
      // reject(err);
    });
    // });
  }

  // public getJSON5Config():Observable<any> {
  public getJSON5Config() {
    let subs:Observable<string> = this.http.get(configFile, {responseType: 'text'});
    subs.subscribe((res:any) => {
      let json = JSON5.parse(res);
      json.map((r:any) => {
        return r.json() as ConfigModel;
      }).then(c => {
        for (const key in c.hotkeys) {
          const commands = c.hotkeys[key];
          this.hotkeysService.add(new Hotkey(key, (ev, combo) => this.hotkey(ev, combo, commands)));
        }
      });
    }, (err) => {
      Log.l("getJSON5Config(): Error during observable subscription!");
      Log.e(err);
      let msgDetail = `Error while getting JSON5 Observable: '${err.message}'`;
      let msg:Message = {severity: "error", summary:"KeyCommandService error", detail: msgDetail};
      this.growlService.add(msg);
  });
    return subs;
  }

  public getConfig():Promise<any> {
    // return new Promise((resolve,reject) => {
    let observable:Observable<string> = this.http.get(configFile, {responseType: 'text'});
    return observable.toPromise();
    // });
  }
}
