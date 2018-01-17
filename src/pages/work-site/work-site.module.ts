import { NgModule                                           } from '@angular/core'                                           ;
import { IonicPageModule                                    } from 'ionic-angular'                                           ;
import { DirectivesModule                                   } from '../../directives/directives.module'                      ;
import { WorkSitePage                                       } from './work-site'                                             ;
import { TooltipModule, DropdownModule, OverlayPanelModule, } from 'primeng/primeng'                                         ;
import { InputTextModule, ButtonModule, DialogModule,       } from 'primeng/primeng'                                         ;
import { CheckboxModule                                     } from 'primeng/primeng'                                         ;
import { WorkSiteHoursComponentModule                       } from '../../components/work-site-hours/work-site-hours.module' ;
import { AgmCoreModule                                      } from '@agm/core'                                               ;

@NgModule({
  declarations: [
    WorkSitePage,
  ],
  imports: [
    IonicPageModule.forChild(WorkSitePage),
    DirectivesModule,
    TooltipModule,
    DropdownModule,
    OverlayPanelModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    WorkSiteHoursComponentModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    })
  ],
  exports: [
    WorkSitePage,
  ]
})
export class WorkSitePageModule { }
