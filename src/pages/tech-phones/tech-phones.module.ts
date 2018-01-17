import { NgModule                          } from '@angular/core'   ;
import { IonicPageModule                   } from 'ionic-angular'   ;
import { TechPhonesPage                    } from './tech-phones'   ;
import { DataTableModule, SharedModule     } from 'primeng/primeng' ;
import { TooltipModule, MultiSelectModule, } from 'primeng/primeng' ;

@NgModule({
  declarations: [
    TechPhonesPage,
  ],
  imports: [
    IonicPageModule.forChild(TechPhonesPage),
    DataTableModule,
    SharedModule,
    TooltipModule,
    MultiSelectModule,
  ],
  exports: [
    TechPhonesPage
  ]
})
export class TechPhonesPageModule {}
