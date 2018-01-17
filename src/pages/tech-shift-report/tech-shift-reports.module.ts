import { NgModule                          } from '@angular/core'        ;
import { IonicPageModule                   } from 'ionic-angular'        ;
import { TechShiftReportsPage              } from './tech-shift-reports' ;
import { TieredMenuModule, DropdownModule, } from 'primeng/primeng'      ;
import { MultiSelectModule                 } from 'primeng/primeng'      ;

@NgModule({
  declarations: [
    TechShiftReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(TechShiftReportsPage),
    DropdownModule,
    TieredMenuModule,
    MultiSelectModule,
  ],
  exports: [
    TechShiftReportsPage
  ]
})
export class TechShiftReportsPageModule {}
