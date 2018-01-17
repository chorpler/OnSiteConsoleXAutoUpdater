import { NgModule                   } from '@angular/core'                                        ;
import { IonicPageModule            } from 'ionic-angular'                                        ;
import { DPSReportPage              } from './dps-report'                                         ;
import { GoogleChartComponentModule } from '../../components/google-chart/google-chart.module'    ;
import { PieChartComponentModule    } from '../../components/pie-chart/pie-chart.module'          ;

@NgModule({
  declarations: [
    DPSReportPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSReportPage),
    GoogleChartComponentModule,
    PieChartComponentModule,
  ],
})
export class DPSReportPageModule {}
