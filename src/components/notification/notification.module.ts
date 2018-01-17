import { NgModule, ModuleWithProviders } from '@angular/core'                  ;
import { CommonModule                  } from '@angular/common'                ;
// import { DomHandler                    } from '../../providers/dom-handler'    ;
// import { NotifyService                 } from '../../providers/notify-service' ;
import { NotificationComponent         } from './notification'                 ;

export * from '../../domain/notice';
export * from './notification';

// export let providers = [
//   DomHandler,
//   // MessageService,
//   // { provide: DragDropService, useFactory: dragDropServiceFactory },
//   // { provide: DragDropSortableService, useFactory: dragDropSortableServiceFactory, deps: [DragDropConfig] }
// ];


@NgModule({
  declarations: [
    NotificationComponent,
  ],
  entryComponents: [
    NotificationComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    NotificationComponent,
  ],
  // providers: providers,
})
export class NotificationComponentModule {
  // static forRoot():ModuleWithProviders {
  //   return {
  //     ngModule: NotificationComponentModule,
  //     providers: providers,
  //   };
  // }
}
