import { NgModule                                      } from '@angular/core'      ;
import { CommonModule,                                 } from '@angular/common'    ;
import { FormsModule                                   } from '@angular/forms'     ;
import { SearchTextComponent                           } from './search-text'      ;

@NgModule({
  declarations: [
    SearchTextComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    SearchTextComponent,
  ]
})
export class SearchTextComponentModule {}
