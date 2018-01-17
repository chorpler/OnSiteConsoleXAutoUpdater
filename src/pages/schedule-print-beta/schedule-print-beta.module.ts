import { NgModule              } from '@angular/core'         ;
import { IonicPageModule       } from 'ionic-angular'         ;
import { SchedulePrintBetaPage } from './schedule-print-beta' ;
import { TooltipModule         } from 'primeng/primeng'       ;

@NgModule({
  declarations: [
    SchedulePrintBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePrintBetaPage),
    TooltipModule,
  ],
})
export class SchedulePrintBetaPageModule {}
