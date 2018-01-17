import { NgModule                         } from '@angular/core'       ;
import { IonicPageModule                  } from 'ionic-angular'       ;
import { DPSDailySummaryPage              } from './dps-daily-summary' ;
import { DropdownModule, TieredMenuModule } from 'primeng/primeng'     ;

@NgModule({
  declarations: [
    DPSDailySummaryPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSDailySummaryPage),
    DropdownModule,
    TieredMenuModule,
  ],
})
export class DPSDailySummaryPageModule {}
