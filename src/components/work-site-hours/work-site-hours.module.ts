import { NgModule                                      } from '@angular/core'     ;
import { CommonModule,                                 } from '@angular/common'   ;
import { FormsModule                                   } from '@angular/forms'    ;
import { WorkSiteHoursComponent                        } from './work-site-hours' ;
import { DataTableModule, SharedModule, CalendarModule } from 'primeng/primeng'   ;
import { TooltipModule, DropdownModule,                } from 'primeng/primeng'   ;
import { InputTextModule, ButtonModule,                } from 'primeng/primeng'   ;

@NgModule({
  declarations: [
    WorkSiteHoursComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DataTableModule,
    CalendarModule,
    TooltipModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
  ],
  exports: [
    WorkSiteHoursComponent
  ]
})
export class WorkSiteHoursComponentModule {}
