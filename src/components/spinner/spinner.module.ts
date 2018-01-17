// import { SpinnerService   } from './spinner.service' ;
import { NgModule         } from '@angular/core'   ;
import { CommonModule     } from '@angular/common' ;
import { SpinnerComponent } from './spinner'       ;

// export * from './spinner';
// export * from '../../providers/spinner-service'    ;
// export * from './spinner.service';

@NgModule({
  declarations: [
    SpinnerComponent,
  ],
  entryComponents: [
    SpinnerComponent,
  ],
  imports: [
    CommonModule,
  ],
  // providers: [
  //   SpinnerService,
  // ],
  exports: [
    SpinnerComponent,
  ],
})
export class SpinnerModule { }
