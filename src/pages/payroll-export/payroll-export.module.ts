import { NgModule                                } from '@angular/core'                                     ;
import { IonicPageModule                         } from 'ionic-angular'                                     ;
import { PayrollExportPage                       } from './payroll-export'                                  ;
import { TooltipModule,                          } from 'primeng/primeng'                                   ;
import { InplaceModule, DropdownModule,          } from 'primeng/primeng'                                   ;
import { SelectItem, MenuItem, TieredMenuModule, } from 'primeng/primeng'                                   ;
import { NotificationComponentModule,            } from '../../components/notification/notification.module' ;

// import { MessageService                                } from '../../components/notification/messageservice'                ;

@NgModule({
  declarations: [
    PayrollExportPage,
  ],
  imports: [
    IonicPageModule.forChild(PayrollExportPage),
    // GrowlModule,
    TooltipModule,
    InplaceModule,
    DropdownModule,
    TieredMenuModule,
    NotificationComponentModule,
    // NotificationComponentModule.forRoot(),
  ],
  // providers: [
  //   MessageService,
  //   NotificationComponentModule.forRoot().providers,
  // ],
  exports: [
    PayrollExportPage,
  ]
})
export class PayrollExportPageModule {}
