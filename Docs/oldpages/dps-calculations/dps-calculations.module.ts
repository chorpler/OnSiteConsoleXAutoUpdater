import { NgModule            } from '@angular/core'      ;
import { IonicPageModule     } from 'ionic-angular'      ;
import { DPSCalculationsPage } from './dps-calculations' ;

@NgModule({
  declarations: [
    DPSCalculationsPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSCalculationsPage),
  ],
})
export class DPSCalculationsPageModule {}
