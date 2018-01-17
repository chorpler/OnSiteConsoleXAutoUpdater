import { NgModule                      } from '@angular/core'                                           ;
import { IonicPageModule               } from 'ionic-angular'                                           ;
import { SchedulingPage                } from './scheduling'                                            ;
import { DndModule                     } from '../../components/dnd/dnd.module'                         ;
import { CalendarModule                } from 'primeng/primeng'                                         ;
import { TooltipModule, DialogModule,  } from 'primeng/primeng'                                         ;
import { OptionsComponentModule        } from '../../components/options/options.module'                 ;
import { OptionsGenericComponentModule } from '../../components/options-generic/options-generic.module' ;
import { VideoPlayComponentModule      } from '../../components/video-play/video-play.module'           ;
import { PipesModule                   } from '../../pipes/pipes.module'                                ;
import { EmployeeViewComponentModule   } from '../../components/employee-view/employee-view.module'     ;

@NgModule({
  // entryComponents: [
  //   VideoPopover,
  //   NewSchedulePopover,
  // ],
  declarations: [
    SchedulingPage,
    // VideoPopover,
    // NewSchedulePopover,
  ],
  imports: [
    IonicPageModule.forChild(SchedulingPage),
    DndModule,
    CalendarModule,
    TooltipModule,
    DialogModule,
    OptionsComponentModule,
    OptionsGenericComponentModule,
    VideoPlayComponentModule,
    PipesModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    SchedulingPage,
  ]
})
export class SchedulingPageModule {}
