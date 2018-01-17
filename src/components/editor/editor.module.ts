import { fromEvent                      } from 'rxjs/observable/fromEvent' ;
import { NgModule, forwardRef           } from '@angular/core'             ;
import { CommonModule                   } from '@angular/common'           ;
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'            ;
import { EditorComponent                } from './editor'        ;

@NgModule({
  declarations: [
    EditorComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    EditorComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ]
})
export class EditorComponentModule {
}
