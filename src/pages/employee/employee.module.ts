import { NgModule                                           } from '@angular/core'   ;
import { IonicPageModule                                    } from 'ionic-angular'   ;
import { EmployeePage                                   } from './employee'      ;
import { TooltipModule, DropdownModule, OverlayPanelModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    EmployeePage,
  ],
  imports: [
    IonicPageModule.forChild(EmployeePage),
    TooltipModule,
    DropdownModule,
    OverlayPanelModule,
  ],
  exports: [
    EmployeePage,
  ]
})
export class EmployeeBetaPageModule {}
