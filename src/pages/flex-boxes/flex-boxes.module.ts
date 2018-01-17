// import { FinHypergridComponentModule } from '../../components/fin-datagrid/fin-datagrid.module' ;
import { NgModule                    } from '@angular/core'                                       ;
import { IonicPageModule             } from 'ionic-angular'                                       ;
import { FlexBoxesPage               } from './flex-boxes'                                        ;
import { EmployeesPageModule         } from '../employees/employees.module'                       ;
import { EmployeesBetaPageModule     } from '../employees-beta/employees-beta.module'             ;
import { SpinnerClockComponentModule } from '../../components/spinner-clock/spinner-clock.module' ;

@NgModule({
  declarations: [
    FlexBoxesPage,
  ],
  imports: [
    IonicPageModule.forChild(FlexBoxesPage),
    EmployeesPageModule,
    EmployeesBetaPageModule,
    SpinnerClockComponentModule,
    // FinHypergridComponentModule,
  ],
  exports: [
    FlexBoxesPage,
  ]
})
export class FlexBoxesPageModule {}
