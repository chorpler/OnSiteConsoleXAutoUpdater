import { NgModule                                } from '@angular/core'                                     ;
import { IonicPageModule                         } from 'ionic-angular'                                     ;
import { PayrollPage                             } from './payroll'                                         ;
// import { GrowlModule, TooltipModule,             } from 'primeng/primeng'                                   ;
import { TooltipModule,             } from 'primeng/primeng'                                   ;
import { InplaceModule, DropdownModule,          } from 'primeng/primeng'                                   ;
// import { SelectItem, MenuItem, TieredMenuModule, } from 'primeng/primeng'                                   ;
// import { NotificationComponentModule,            } from '../../components/notification/notification.module' ;

@NgModule({
  declarations: [
    PayrollPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollPage),
    // GrowlModule,
    TooltipModule,
    InplaceModule,
    DropdownModule,
    // TieredMenuModule,
    // NotificationComponentModule,
  ],
  exports: [
    PayrollPage,
  ]
})
export class PayrollPageModule {}
