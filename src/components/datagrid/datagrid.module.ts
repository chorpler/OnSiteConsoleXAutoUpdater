import { NgModule,                               } from '@angular/core'   ;
import { CommonModule,                           } from '@angular/common' ;
import { FormsModule,                            } from '@angular/forms'  ;
import { DatagridComponent                       } from './datagrid'      ;

@NgModule({
  declarations: [
    DatagridComponent,
  ],
  entryComponents: [
    DatagridComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    DatagridComponent,
  ]
})
export class DatagridComponentModule {
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: DPSCalculationsComponentModule,
  //     providers: providers
  //   };
  // }
}


