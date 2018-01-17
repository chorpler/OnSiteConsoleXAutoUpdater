import { NgModule                    } from '@angular/core'   ;
import { IonicPageModule             } from 'ionic-angular'   ;
import { OptionsComponent            } from './options'       ;
import { DialogModule,CheckboxModule } from 'primeng/primeng' ;
import { ButtonModule,DropdownModule } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    OptionsComponent,
  ],
  imports: [
    IonicPageModule.forChild(OptionsComponent),
    DialogModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
  ],
  exports: [
    OptionsComponent,
  ]
})
export class OptionsComponentModule { }
