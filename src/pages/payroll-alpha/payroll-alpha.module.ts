import { NgModule                                } from '@angular/core'                                     ;
import { IonicPageModule                         } from 'ionic-angular'                                     ;
import { PayrollAlphaPage                        } from './payroll-alpha'                                   ;
import { TooltipModule,                          } from 'primeng/primeng'                                   ;
import { InplaceModule, DropdownModule,          } from 'primeng/primeng'                                   ;
import { SelectItem, MenuItem, TieredMenuModule, } from 'primeng/primeng'                                   ;
import { DatagridComponentModule                 } from '../../components/datagrid/datagrid.module'         ;
import { NotificationComponentModule,            } from '../../components/notification/notification.module' ;

@NgModule({
  declarations: [
    PayrollAlphaPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollAlphaPage),
    // GrowlModule,
    TooltipModule,
    InplaceModule,
    DropdownModule,
    TieredMenuModule,
    NotificationComponentModule,
    DatagridComponentModule,
  ],
  exports: [
    PayrollAlphaPage,
  ]
})
export class PayrollPageModule {}
