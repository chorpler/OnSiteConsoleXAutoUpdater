import { NgModule            } from '@angular/core'                            ;
import { SharedModule        } from 'primeng/primeng'                          ;
import { SelectItem          } from 'primeng/components/common/api'            ;
import { Message             } from 'primeng/components/common/api'            ;
import { MessageService      } from 'primeng/components/common/messageservice' ;
import { GrowlModule         } from 'primeng/primeng'                          ;
import { PrimeGrowlComponent } from './prime-growl'                            ;

@NgModule({
  declarations: [
    PrimeGrowlComponent,
  ],
  entryComponents: [
    PrimeGrowlComponent,
  ],
  imports: [
    SharedModule,
    GrowlModule,
  ],
  exports: [
    PrimeGrowlComponent,
  ],
})
export class PrimeGrowlComponentModule { }


// import { Observable } from 'rxjs/Observable';
// import { Message } from './message';
// export declare class MessageService {
//     private messageSource;
//     messageObserver: Observable<Message>;
//     add(message: Message): void;
//     addAll(messages: Message[]): void;
//     clear(): void;
// }
