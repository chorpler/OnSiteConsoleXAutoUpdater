import { NgModule                                      } from '@angular/core'   ;
import { CommonModule,                                 } from '@angular/common' ;
import { FormsModule                                   } from '@angular/forms'  ;
import { ReportOtherViewComponent                           } from './report-other-view'   ;
import { DialogModule, DropdownModule, CalendarModule, } from 'primeng/primeng' ;
import { InputMaskModule, InputTextareaModule,         } from 'primeng/primeng' ;
import { TooltipModule,                                } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    ReportOtherViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputMaskModule,
    InputTextareaModule,
    TooltipModule,
  ],
  exports: [
    ReportOtherViewComponent,
  ]
})
export class ReportOtherViewComponentModule {}
