import { NgModule                    } from '@angular/core'     ;
import { CommonModule                } from '@angular/common'   ;
import { FormsModule                 } from '@angular/forms'    ;
import { OptionsGenericComponent     } from './options-generic' ;
import { DialogModule,CheckboxModule } from 'primeng/primeng'   ;
import { ButtonModule,               } from 'primeng/primeng'   ;

@NgModule({
  declarations: [
    OptionsGenericComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CheckboxModule,
    ButtonModule,
  ],
  exports: [
    OptionsGenericComponent,
  ]
})
export class OptionsGenericComponentModule { }
