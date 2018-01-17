import { NgModule          } from '@angular/core'    ;
import { IonicPageModule   } from 'ionic-angular'    ;
import { SchedulePrintPage } from './schedule-print' ;
import { TooltipModule     } from 'primeng/primeng'  ;

@NgModule({
  declarations: [
    SchedulePrintPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePrintPage),
    TooltipModule,
  ],
})
export class SchedulePrintPageModule {}
