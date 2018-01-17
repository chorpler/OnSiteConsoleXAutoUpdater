import { NgModule           } from '@angular/core'                  ;
import { CommonModule       } from '@angular/common'                ;
import { FormsModule        } from '@angular/forms'                 ;
import { InvoiceHBComponent } from './invoice-hb'                   ;

@NgModule({
  declarations: [
    InvoiceHBComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    InvoiceHBComponent,
  ]
})
export class InvoiceHBComponentModule {}
