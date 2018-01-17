import { NgModule, ModuleWithProviders } from '@angular/core'                       ;
import { CommonModule                  } from '@angular/common'                     ;
import { FormsModule                   } from '@angular/forms'                      ;
import { DomHandler                    } from '../../providers/dom-handler'         ;
import { NotifyService                 } from '../../providers/notify-service'      ;
import { NotificationsComponent        } from './notifications'                     ;
import { NotificationComponentModule   } from '../notification/notification.module' ;

export * from '../../domain/notice';
export * from './notifications';
// export let providers = [
//   DomHandler,
//   // MessageService,
//   // { provide: DragDropService, useFactory: dragDropServiceFactory },
//   // { provide: DragDropSortableService, useFactory: dragDropSortableServiceFactory, deps: [DragDropConfig] }
// ];


@NgModule({
  declarations: [
    NotificationsComponent,
  ],
  entryComponents: [
    NotificationsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NotificationComponentModule,
  ],
  exports: [
    NotificationsComponent,
  ],
  // providers: providers,
})
export class NotificationsComponentModule {
  // static forRoot():ModuleWithProviders {
  //   return {
  //     ngModule: NotificationComponentModule,
  //     providers: providers,
  //   };
  // }
}
