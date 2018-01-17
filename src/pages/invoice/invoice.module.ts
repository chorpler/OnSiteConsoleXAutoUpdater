import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Invoice } from './invoice';

@NgModule({
  declarations: [
    Invoice,
  ],
  imports: [
    IonicPageModule.forChild(Invoice),
  ],
  exports: [
    Invoice
  ]
})
export class InvoiceModule {}
