import { NgModule                         } from '@angular/core'                   ;
import { IonicPageModule                  } from 'ionic-angular'                   ;
import { WorkSitesPage                    } from './work-sites'                    ;
import { DataTableModule, SharedModule    } from 'primeng/primeng'                 ;
import { TooltipModule, MultiSelectModule } from 'primeng/primeng'                 ;
import { DndModule                        } from '../../components/dnd/dnd.module' ;

@NgModule({
  declarations: [
    WorkSitesPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkSitesPage),
    DataTableModule,
    SharedModule,
    DndModule,
    TooltipModule,
    MultiSelectModule,
  ],
  exports: [
    WorkSitesPage,
  ]
})
export class WorkSitesPageModule {}
