import { NgModule                   } from '@angular/core'                                     ;
import { IonicPageModule            } from 'ionic-angular'                                     ;
import { DPSDetailCalculationsPage  } from './dps-detail-calculations'                         ;
import { GoogleChartComponentModule } from '../../components/google-chart/google-chart.module' ;

@NgModule({
  declarations: [
    DPSDetailCalculationsPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSDetailCalculationsPage),
    GoogleChartComponentModule,
  ],
})
export class DPSDetailCalculationsPageModule { }
