import { NgModule                                       } from '@angular/core'   ;
import { IonicPageModule                                } from 'ionic-angular'   ;
import { EmployeesPage                                  } from './employees'     ;
import { DataTableModule,SharedModule                   } from 'primeng/primeng' ;
import { TooltipModule, MultiSelectModule, DialogModule } from 'primeng/primeng' ;
import { ContextMenuModule,                             } from 'primeng/primeng';

@NgModule({
  declarations: [
    EmployeesPage,
  ],
  imports: [
    IonicPageModule.forChild(EmployeesPage),
    DataTableModule,
    SharedModule,
    TooltipModule,
    MultiSelectModule,
    DialogModule,
    ContextMenuModule,
  ],
  exports: [
    EmployeesPage
  ]
})
export class EmployeesPageModule {}
