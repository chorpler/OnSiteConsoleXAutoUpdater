import { NgModule                       } from '@angular/core'                                       ;
import { IonicPageModule                } from 'ionic-angular'                                       ;
import { InvoicingHBPage                } from './invoicing-hb'                                      ;
import { InvoiceHBComponentModule       } from '../../components/invoice-hb/invoice-hb.module'       ;
import { InvoicesOpenComponentModule    } from '../../components/invoices-open/invoices-open.module' ;
import { DropdownModule, TooltipModule, } from 'primeng/primeng'                                     ;

@NgModule({
  declarations: [
    InvoicingHBPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingHBPage),
    DropdownModule,
    TooltipModule,
    InvoiceHBComponentModule,
    InvoicesOpenComponentModule,
  ],
  exports: [
    InvoicingHBPage,
  ]
})
export class InvoicingHBPageModule {}
