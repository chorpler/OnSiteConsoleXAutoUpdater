import { NgModule                       } from '@angular/core'     ;
import { IonicPageModule                } from 'ionic-angular'     ;
import { SchedulingBetaChoosePage             } from './scheduling-beta-choose' ;
// import { CalendarModule, ScheduleModule } from 'primeng/primeng'   ;
import { DropdownModule                 } from 'primeng/primeng'   ;
import { CalendarModule } from 'angular-calendar';

@NgModule({
  declarations: [
    SchedulingBetaChoosePage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulingBetaChoosePage),
    CalendarModule.forRoot(),
    // ScheduleModule,
    DropdownModule,
  ],
  exports: [
    SchedulingBetaChoosePage,
  ],
})
export class SchedulingBetaChoosePageModule { }
