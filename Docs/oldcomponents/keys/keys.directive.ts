import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core'  ;
import { Keycode, ExtendedKeyboardEvent                  } from './keys.model'   ;
import { KeysService                                     } from './keys.service' ;

import 'mousetrap';

@Directive({
  selector: '[keys]',
  providers: [KeysService]
})
export class KeysDirective implements OnInit, OnDestroy {
  @Input() keys: { [combo: string]: (event: KeyboardEvent, combo: string) => ExtendedKeyboardEvent }[];

  private mousetrap: MousetrapInstance;
  private hotkeysList: Keycode[] = [];
  private oldHotkeys: Keycode[] = [];

  constructor(private _hotkeysService: KeysService, private _elementRef: ElementRef) {
    this.mousetrap = new Mousetrap(this._elementRef.nativeElement); // Bind hotkeys to the current element (and any children)
  }

  ngOnInit() {
    for (let hotkey of this.keys) {
      let combo = Object.keys(hotkey)[0];
      let hotkeyObj: Keycode = new Keycode(combo, hotkey[combo]);
      let oldHotkey: Keycode = <Keycode>this._hotkeysService.get(combo);
      if (oldHotkey !== null) { // We let the user overwrite callbacks temporarily if you specify it in HTML
        this.oldHotkeys.push(oldHotkey);
        this._hotkeysService.remove(oldHotkey);
      }
      this.hotkeysList.push(hotkeyObj);
      this.mousetrap.bind(hotkeyObj.combo, hotkeyObj.callback);
    }
  }

  ngOnDestroy() {
    for (let hotkey of this.hotkeysList) {
      this.mousetrap.unbind(hotkey.combo);
    }
    this._hotkeysService.add(this.oldHotkeys);
  }

}






















