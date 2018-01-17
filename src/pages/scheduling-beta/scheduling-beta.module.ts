import { NgModule                      } from '@angular/core'                                           ;
import { IonicPageModule               } from 'ionic-angular'                                           ;
import { SchedulingBetaPage            } from './scheduling-beta'                                       ;
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
    SchedulingBetaPage,
    // VideoPopover,
    // NewSchedulePopover,
  ],
  imports: [
    IonicPageModule.forChild(SchedulingBetaPage),
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
    SchedulingBetaPage,
  ]
})
export class SchedulingBetaPageModule {}
