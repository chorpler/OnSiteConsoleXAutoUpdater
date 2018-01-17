import { NgModule             } from '@angular/core'                                                    ;
// import { IonicPageModule      } from 'ionic-angular'                                                    ;
import { GoogleChart          } from './google-chart.directive'                                         ;
// import { GoogleChartComponent } from './google-chart'                                                   ;
import { GoogleChartComponent } from './google-chart.component'                                         ;

@NgModule({
  declarations: [
    GoogleChartComponent,
    GoogleChart,
  ],
  entryComponents: [
    GoogleChartComponent,
  ],
  imports: [
    // GoogleChartComponent,
    // GoogleChart,
    // IonicPageModule.forChild(GoogleChartComponent),
    // IonicPageModule.forChild(GoogleChart),
  ],
  exports: [
    GoogleChartComponent,
    GoogleChart,
  ],
})
export class GoogleChartComponentModule { }
