import { HotkeyOptions, IHotkeyOptions } from './keys.options' ;
import { Subject                       } from 'rxjs/Subject'   ;
import { Inject, Injectable            } from '@angular/core'  ;
import { Keycode                       } from './keys.model'   ;
import 'mousetrap';

@Injectable()
export class KeysService {
  public hotkeys         : Keycode[]          =[]            ;
  public pausedHotkeys   : Keycode[]          =[]            ;
  public mousetrap       : MousetrapInstance ;
  public cheatSheetToggle: Subject<any>      =new Subject() ;

  private _preventIn = ['INPUT', 'SELECT', 'TEXTAREA'];

  constructor( @Inject(HotkeyOptions) private options: IHotkeyOptions) {
    Mousetrap.prototype.stopCallback = (event: KeyboardEvent, element: HTMLElement, combo: string, callback: Function) => {
      // if the element has the class "mousetrap" then no need to stop
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false;
      }
      return (element.contentEditable && element.contentEditable === 'true');
    };
    this.mousetrap = new (<any>Mousetrap)();
    if (!this.options.disableCheatSheet) {
      this.add(new Keycode(
        this.options.cheatSheetHotkey || '?',
        function (event: KeyboardEvent) {
          this.cheatSheetToggle.next();
        }.bind(this),
        [],
        this.options.cheatSheetDescription || 'Show / hide this help menu',
      ));
    }

    if (this.options.cheatSheetCloseEsc) {
      this.add(new Keycode(
        'esc',
        function (event: KeyboardEvent) {
          this.cheatSheetToggle.next(false);
        }.bind(this),
        ['HOTKEYS-CHEATSHEET'],
        'Hide this help menu',
      ));
    }

  }

  add(hotkey: Keycode | Keycode[], specificEvent?: string): Keycode | Keycode[] {
    if (Array.isArray(hotkey)) {
      let temp: Keycode[] = [];
      for (let key of hotkey) {
        temp.push(<Keycode>this.add(key, specificEvent));
      }
      return temp;
    }
    this.remove(hotkey);
    this.hotkeys.push(<Keycode>hotkey);
    this.mousetrap.bind((<Keycode>hotkey).combo, (event: KeyboardEvent, combo: string) => {
      let shouldExecute = true;

      // if the callback is executed directly `hotkey.get('w').callback()`
      // there will be no event, so just execute the callback.
      if (event) {
        let target: HTMLElement = <HTMLElement>(event.target || event.srcElement); // srcElement is IE only
        let nodeName: string = target.nodeName.toUpperCase();

        // check if the input has a mousetrap class, and skip checking preventIn if so
        if ((' ' + target.className + ' ').indexOf(' mousetrap ') > -1) {
          shouldExecute = true;
        } else if (this._preventIn.indexOf(nodeName) > -1 && (<Keycode>hotkey).allowIn.map(allow => allow.toUpperCase()).indexOf(nodeName) === -1) {
          // don't execute callback if the event was fired from inside an element listed in preventIn but not in allowIn
          shouldExecute = false;
        }
      }

      if (shouldExecute) {
        return (<Keycode>hotkey).callback.apply(this, [event, combo]);
      }
    }, specificEvent);
    return hotkey;
  }

  remove(hotkey?: Keycode | Keycode[]): Keycode | Keycode[] {
    let temp: Keycode[] = [];
    if (!hotkey) {
      for (let key of this.hotkeys) {
        temp.push(<Keycode>this.remove(key));
      }
      return temp;
    }
    if (Array.isArray(hotkey)) {
      for (let key of hotkey) {
        temp.push(<Keycode>this.remove(key));
      }
      return temp;
    }
    let index = this.findHotkey(<Keycode>hotkey);
    if (index > -1) {
      this.hotkeys.splice(index, 1);
      this.mousetrap.unbind((<Keycode>hotkey).combo);
      return hotkey;
    }
    return null;
  }

  get(combo?: string | string[]): Keycode | Keycode[] {
    if (!combo) {
      return this.hotkeys;
    }
    if (Array.isArray(combo)) {
      let temp: Keycode[] = [];
      for (let key of combo) {
        temp.push(<Keycode>this.get(key));
      }
      return temp;
    }
    for (let i = 0; i < this.hotkeys.length; i++) {
      if (this.hotkeys[i].combo.indexOf(<string>combo) > -1) {
        return this.hotkeys[i];
      }
    }
    return null;
  }

  pause(hotkey?: Keycode | Keycode[]): Keycode | Keycode[] {
    if (!hotkey) {
      return this.pause(this.hotkeys);
    }
    if (Array.isArray(hotkey)) {
      let temp: Keycode[] = [];
      for (let key of hotkey) {
        temp.push(<Keycode>this.pause(key));
      }
      return temp;
    }
    this.remove(hotkey);
    this.pausedHotkeys.push(<Keycode>hotkey);
    return hotkey;
  }

  unpause(hotkey?: Keycode | Keycode[]): Keycode | Keycode[] {
    if (!hotkey) {
      return this.unpause(this.pausedHotkeys);
    }
    if (Array.isArray(hotkey)) {
      let temp: Keycode[] = [];
      for (let key of hotkey) {
        temp.push(<Keycode>this.unpause(key));
      }
      return temp;
    }
    let index: number = this.pausedHotkeys.indexOf(<Keycode>hotkey);
    if (index > -1) {
      this.add(hotkey);
      return this.pausedHotkeys.splice(index, 1);
    }
    return null;
  }

  reset() {
    this.mousetrap.reset();
  }

  private findHotkey(hotkey: Keycode): number {
    return this.hotkeys.indexOf(hotkey);
  }
}
