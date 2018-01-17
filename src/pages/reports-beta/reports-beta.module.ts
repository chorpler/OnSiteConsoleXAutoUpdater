import { NgModule                    } from '@angular/core'                                     ;
import { IonicPageModule             } from 'ionic-angular'                                     ;
import { ReportsBetaPage             } from './reports-beta'                                    ;
// import { FinHypergridComponentModule } from '../../components/fin-datagrid/fin-datagrid.module' ;

@NgModule({
  declarations: [
    ReportsBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportsBetaPage),
    // FinHypergridComponentModule,
  ],
  exports: [
    ReportsBetaPage,
  ],
})
export class ReportsBetaPageModule {}
