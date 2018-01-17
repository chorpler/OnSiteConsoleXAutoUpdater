import { NgModule                      } from '@angular/core'               ;
import { IonicPageModule               } from 'ionic-angular'               ;
import { ReportsPage                   } from './reports'                   ;
import { DataTableModule, SharedModule } from 'primeng/primeng'             ;
import { CalendarModule                } from 'primeng/primeng'             ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta' ;

@NgModule({
  declarations: [
    ReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsPage),
    DataTableModule,
    SharedModule,
    CalendarModule,
    ReportViewBetaComponentModule,
  ],
  exports: [
    ReportsPage
  ]
})
export class ReportsPageModule {}
