import { NgModule                       } from '@angular/core'     ;
import { IonicPageModule                } from 'ionic-angular'     ;
import { ScheduleChooseBetaPage             } from './schedule-choose-beta' ;
// import { CalendarModule, ScheduleModule } from 'primeng/primeng'   ;
import { DropdownModule                 } from 'primeng/primeng'   ;
import { CalendarModule } from 'angular-calendar';

@NgModule({
  declarations: [
    ScheduleChooseBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleChooseBetaPage),
    CalendarModule.forRoot(),
    // ScheduleModule,
    DropdownModule,
  ],
  exports: [
    ScheduleChooseBetaPage,
  ],
})
export class ScheduleChooseBetaPageModule { }
