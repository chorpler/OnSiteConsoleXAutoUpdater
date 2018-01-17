import { NgModule,                               } from '@angular/core'      ;
import { CommonModule,                           } from '@angular/common'    ;
import { FormsModule,                            } from '@angular/forms'     ;
import { FinHypergridComponent                   } from './fin-datagrid'     ;

@NgModule({
  declarations: [
    FinHypergridComponent,
  ],
  entryComponents: [
    FinHypergridComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    FinHypergridComponent,
  ]
})
export class FinHypergridComponentModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: DPSCalculationsComponentModule,
  //     providers: providers
  //   };
  // }
}


