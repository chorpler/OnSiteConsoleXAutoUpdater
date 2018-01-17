import { NgModule, ModuleWithProviders } from '@angular/core'          ;
import { CommonModule                  } from '@angular/common'        ;
import { KeysDirective                 } from './keys.directive'       ;
import { CheatSheetComponent           } from './cheatsheet.component' ;
import { IHotkeyOptions, HotkeyOptions } from './keys.options'         ;
import { KeysService                   } from './keys.service'         ;

export * from './cheatsheet.component';
export * from './keys.model';
export * from './keys.options';
export * from './keys.directive';
export * from './keys.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    KeysDirective,
    CheatSheetComponent,
  ],
  declarations: [
    KeysDirective,
    CheatSheetComponent,
  ],
})
export class KeysModule {
  static forRoot(options: IHotkeyOptions = {}): ModuleWithProviders {
    return {
      ngModule: KeysModule,
      providers: [
        KeysService,
        { provide: HotkeyOptions, useValue: options }
      ]
    };
  }
}
