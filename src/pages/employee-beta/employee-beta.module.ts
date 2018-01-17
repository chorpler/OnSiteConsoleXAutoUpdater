import { NgModule                                           } from '@angular/core'   ;
import { IonicPageModule                                    } from 'ionic-angular'   ;
import { EmployeeBetaPage                                   } from './employee-beta' ;
import { TooltipModule, DropdownModule, OverlayPanelModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    EmployeeBetaPage,
  ],
  imports: [
    IonicPageModule.forChild(EmployeeBetaPage),
    TooltipModule,
    DropdownModule,
    OverlayPanelModule,
  ],
  exports: [
    EmployeeBetaPage,
  ]
})
export class EmployeePageModule {}
