import { NgModule, ModuleWithProviders } from '@angular/core'                  ;
import { CommonModule                  } from '@angular/common'                ;
import { DomHandler                    } from '../../providers/dom-handler'    ;
import { NotifyService                 } from '../../providers/notify-service' ;
import { NoticeComponent               } from './notice'                       ;

export * from '../../domain/notice';
export * from './notice';

// export let providers = [
//   DomHandler,
//   // MessageService,
//   // { provide: DragDropService, useFactory: dragDropServiceFactory },
//   // { provide: DragDropSortableService, useFactory: dragDropSortableServiceFactory, deps: [DragDropConfig] }
// ];


@NgModule({
  declarations: [
    NoticeComponent,
  ],
  entryComponents: [
    NoticeComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    NoticeComponent,
  ],
  // providers: providers,
})
export class NoticeComponentModule {
  // static forRoot():ModuleWithProviders {
  //   return {
  //     ngModule: NotificationComponentModule,
  //     providers: providers,
  //   };
  // }
}
