import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TmpShiftReportsPage } from './tmp-shift-reports';
import { TieredMenuModule, DropdownModule, } from 'primeng/primeng';
import { MultiSelectModule } from 'primeng/primeng';

@NgModule({
  declarations: [
    TmpShiftReportsPage,
  ],
  imports: [
    IonicPageModule.forChild(TmpShiftReportsPage),
    DropdownModule,
    TieredMenuModule,
    MultiSelectModule,
  ],
  exports: [
    TmpShiftReportsPage
  ]
})
export class TmpShiftReportsPageModule {}
