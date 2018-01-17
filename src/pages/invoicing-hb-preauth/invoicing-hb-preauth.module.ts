// import { DatagridComponentModule } from '../../components/datagrid/datagrid.module' ;
import { NgModule                      } from '@angular/core'                                             ;
import { IonicPageModule               } from 'ionic-angular'                                             ;
import { HBPreauthPage                 } from './invoicing-hb-preauth'                                    ;
import { TooltipModule, DropdownModule } from 'primeng/primeng'                                           ;
import { TieredMenuModule,             } from 'primeng/primeng'                                           ;
import { MultiSelectModule,            } from 'primeng/primeng'                                           ;
import { ReportViewBetaComponentModule } from '../../components/report-view-beta/report-view-beta.module' ;
import { PreauthOpenComponentModule    } from '../../components/preauth-open/preauth-open.module'         ;
import { PreauthOpenComponent,         } from '../../components/preauth-open/preauth-open'                ;

@NgModule({
  declarations: [
    HBPreauthPage,
  ],
  // entryComponents: [
  //   PreauthOpenComponent,
  // ],
  imports: [
    IonicPageModule.forChild(HBPreauthPage),
    TooltipModule,
    DropdownModule,
    TieredMenuModule,
    MultiSelectModule,
    ReportViewBetaComponentModule,
    PreauthOpenComponentModule,
  ],
})
export class HBPreauthPageModule {}
