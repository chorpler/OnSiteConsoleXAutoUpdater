import { NgModule                      } from '@angular/core'                                 ;
import { IonicPageModule               } from 'ionic-angular'                                 ;
import { InvoicingKNPage               } from './invoicing-kn'                                ;
// import { TooltipModule                 } from 'primeng/primeng'                               ;
import { InplaceModule                 } from 'primeng/primeng'                               ;
import { DropdownModule                } from 'primeng/primeng'                               ;
import { DialogModule                  } from 'primeng/primeng'                               ;
import { ReportViewComponentModule     } from 'components/report-view/report-view.module'     ;
import { ReportViewBetaComponentModule } from 'components/report-view-beta'                   ;
import { InvoicesOpenComponentModule   } from 'components/invoices-open/invoices-open.module' ;

@NgModule({
  declarations: [
    InvoicingKNPage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicingKNPage),
    InvoicesOpenComponentModule,
    // TooltipModule,
    DropdownModule,
    DialogModule,
    ReportViewComponentModule,
    ReportViewBetaComponentModule,
  ],
  exports: [
    InvoicingKNPage,
  ]
})
export class InvoicingKnPageModule {}
