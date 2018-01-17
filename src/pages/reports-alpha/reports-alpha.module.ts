import { NgModule                                      } from '@angular/core'                                               ;
import { IonicPageModule                               } from 'ionic-angular'                                               ;
import { ReportsAlphaPage                              } from './reports-alpha'                                             ;
import { DatagridComponentModule                       } from '../../components/datagrid/datagrid.module'                   ;
import { ReportViewComponentModule                     } from '../../components/report-view/report-view.module'             ;
import { ReportOtherViewComponentModule                } from '../../components/report-other-view/report-other-view.module' ;
import { DialogModule, DropdownModule, CalendarModule, } from 'primeng/primeng'                                             ;
import { InputMaskModule, InputTextareaModule,         } from 'primeng/primeng'                                             ;
import { TooltipModule, PanelModule,                   } from 'primeng/primeng'                                             ;

@NgModule({
  declarations: [
    ReportsAlphaPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsAlphaPage),
    DatagridComponentModule,
    ReportViewComponentModule,
    ReportOtherViewComponentModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    InputMaskModule,
    InputTextareaModule,
    TooltipModule,
    PanelModule,
  ],
  exports: [
    ReportsAlphaPage,
  ],
})
export class ReportsAlphaPageModule {}
