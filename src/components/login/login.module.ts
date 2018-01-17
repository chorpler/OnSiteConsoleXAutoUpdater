import { NgModule                                    } from '@angular/core'   ;
import { CommonModule,                               } from '@angular/common' ;
import { FormsModule,                                } from '@angular/forms'  ;
import { LoginComponent                              } from './login'         ;
import { PanelModule, InputTextModule, ButtonModule, } from 'primeng/primeng' ;
import { TooltipModule, OverlayPanelModule,          } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    OverlayPanelModule,
  ],
  exports: [
    LoginComponent
  ]
})
export class LoginComponentModule {}
