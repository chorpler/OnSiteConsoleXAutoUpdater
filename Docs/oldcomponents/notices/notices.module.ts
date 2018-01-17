import { NgModule, ModuleWithProviders } from '@angular/core'                  ;
import { CommonModule                  } from '@angular/common'                ;
import { DomHandler                    } from '../../providers/dom-handler'    ;
import { NotifyService                 } from '../../providers/notify-service' ;
import { NoticesComponent              } from './notices'                      ;
export * from '../../domain/notice';
export * from './notices';

// export let providers = [
//   DomHandler,
//   // MessageService,
//   // { provide: DragDropService, useFactory: dragDropServiceFactory },
//   // { provide: DragDropSortableService, useFactory: dragDropSortableServiceFactory, deps: [DragDropConfig] }
// ];


@NgModule({
  declarations: [
    NoticesComponent,
  ],
  entryComponents: [
    NoticesComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    NoticesComponent,
  ],
  // providers: providers,
})
export class NoticesComponentModule {
  // static forRoot():ModuleWithProviders {
  //   return {
  //     ngModule: NotificationComponentModule,
  //     providers: providers,
  //   };
  // }
}
