import { NgModule                      } from '@angular/core'                                 ;
import { IonicPageModule               } from 'ionic-angular'                                 ;
import { InvoicingBEPage               } from './invoicing-be'                                ;
import { TooltipModule                 } from 'primeng/primeng'                               ;
import { InplaceModule                 } from 'primeng/primeng'                               ;
import { DropdownModule                } from 'primeng/primeng'                               ;
import { DialogModule                  } from 'primeng/primeng'                               ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta'                   ;
import { InvoicesOpenComponentModule   } from 'components/invoices-open/invoices-open.module' ;

@NgModule({
  declarations: [
    InvoicingBEPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingBEPage),
    InvoicesOpenComponentModule,
    TooltipModule,
    DropdownModule,
    DialogModule,
    ReportViewBetaComponentModule,
  ],
  exports: [
    InvoicingBEPage,
  ]
})
export class InvoicingBEPageModule {}
