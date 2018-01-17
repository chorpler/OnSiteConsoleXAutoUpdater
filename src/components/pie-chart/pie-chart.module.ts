import { NgModule             } from '@angular/core'                                                    ;
import { IonicPageModule      } from 'ionic-angular'                                                    ;
import { PieChartComponent    } from './pie-chart'                                                   ;

@NgModule({
  declarations: [
    PieChartComponent,
  ],
  entryComponents: [
    PieChartComponent,
  ],
  imports: [
    IonicPageModule.forChild(PieChartComponent),
  ],
  exports: [
    PieChartComponent,
  ],
})
export class PieChartComponentModule { }
