import { NgModule                                      } from '@angular/core'      ;
import { CommonModule,                                 } from '@angular/common'    ;
import { FormsModule                                   } from '@angular/forms'     ;
import { ReportViewBetaComponent                       } from './report-view-beta' ;
import { DialogModule, DropdownModule, CalendarModule, } from 'primeng/primeng'    ;
import { InputMaskModule, InputTextareaModule,         } from 'primeng/primeng'    ;
import { TooltipModule,                                } from 'primeng/primeng'    ;

@NgModule({
  declarations: [
    ReportViewBetaComponent,
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
    ReportViewBetaComponent,
  ]
})
export class ReportViewBetaComponentModule {}
