import { BrowserModule                            } from '@angular/platform-browser'                             ;
import { HttpClientModule,                        } from '@angular/common/http'                                  ;
import { BrowserAnimationsModule                  } from '@angular/platform-browser/animations'                  ;
import { ErrorHandler, NgModule                   } from '@angular/core'                                         ;
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'                                         ;
import { FormsModule                              } from '@angular/forms'                                        ;
import { IonicStorageModule                       } from '@ionic/storage'                                        ;
import { OnSiteConsoleX                           } from './app.component'                                       ;
import { StatusBar                                } from '@ionic-native/status-bar'                              ;
import { SplashScreen                             } from '@ionic-native/splash-screen'                           ;
import { DndModule                                } from 'components/dnd/dnd.module'                             ;
import { SharedModule,                            } from 'primeng/primeng'                                       ;
import { TooltipModule, BlockUIModule             } from 'primeng/primeng'                                       ;
import { DialogModule, ConfirmationService        } from 'primeng/primeng'                                       ;
import { OverlayPanelModule,                      } from 'primeng/primeng'                                       ;
import { LoginComponentModule                     } from 'components/login/login.module'                         ;
import { OptionsComponentModule                   } from 'components/options/options.module'                     ;
import { SpinnerModule,                           } from 'components/spinner/spinner.module'                     ;
import { SpinnerComponent,                        } from 'components/spinner/spinner'                            ;
import { SpinnerService                           } from 'providers/spinner-service'                             ;
import { PreauthOpenComponentModule               } from 'components/preauth-open/preauth-open.module'           ;
import { PreauthOpenComponent,                    } from 'components/preauth-open/preauth-open'                  ;
import { DomHandler                               } from 'providers/dom-handler'                                 ;
import { NotifyService                            } from 'providers/notify-service'                              ;
import { NotificationComponentModule,             } from 'components/notification/notification.module'           ;
import { CurrencyMaskModule                       } from 'components/ngx-currency-mask/ngx-currency-mask.module' ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'components/ngx-currency-mask/ngx-currency-mask.config' ;
import { PouchDBService                           } from 'providers/pouchdb-service'                             ;
import { StorageService                           } from 'providers/storage-service'                             ;
import { DBService                                } from 'providers/db-service'                                  ;
import { AuthService                              } from 'providers/auth-service'                                ;
import { AlertService                             } from 'providers/alert-service'                               ;
import { ServerService                            } from 'providers/server-service'                              ;
import { SmartAudio                               } from 'providers/smart-audio'                                 ;
import { Preferences                              } from 'providers/preferences'                                 ;
import { OSData                                   } from 'providers/data-service'                                ;
import { PDFService                               } from 'providers/pdf-service'                                 ;
import { InvoiceService                           } from 'providers/invoice-service'                             ;
import { DispatchService                          } from 'providers/dispatch-service'                            ;
import { LoaderService                            } from 'providers/loader-service'                              ;
import { KeyCommandService                        } from 'providers/key-command-service'                         ;
import { GoogleMapsAPIWrapper                     } from '@agm/core'                                             ;
import { HotkeyModule                             } from 'angular2-hotkeys'                                      ;
import { OnSiteConsoleLibrary                     } from 'providers/lib-service'                                 ;
import { NumberService                            } from 'providers/number-service'                              ;
import { PipesModule                              } from 'pipes/pipes.module'                                    ;
import { WebWorkerService                         } from 'angular2-web-worker'                                   ;
import { AgmCoreOverrideModule                    } from 'lib/angular-google-maps-lazyload.module'               ;
import { AgmCoreModule                            } from '@agm/core'                                             ;
import { ElectronService                          } from 'providers/electron-service'                            ;

export const CustomCurrencyMaskConfig:CurrencyMaskConfig = {
  align        : "right",
  allowNegative: true,
  allowZero    : true,
  decimal      : ".",
  precision    : 2,
  prefix       : "$ ",
  suffix       : "",
  thousands    : ","
};

@NgModule({
  declarations: [
    OnSiteConsoleX,
    // GoogleChart,
  ],
  entryComponents: [
    OnSiteConsoleX,
    SpinnerComponent,
    PreauthOpenComponent,
  ],
  bootstrap: [
    IonicApp,
  ],
  imports: [
    BrowserModule,
    // HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(OnSiteConsoleX),
    IonicStorageModule.forRoot(),
    DndModule.forRoot(),
    SpinnerModule,
    PreauthOpenComponentModule,
    LoginComponentModule,
    OptionsComponentModule,
    FormsModule,
    SharedModule,
    DialogModule,
    // DataTableModule,
    // CalendarModule.forRoot(),
    // GrowlModule,
    TooltipModule,
    BlockUIModule,
    OverlayPanelModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    }),
    // AgmCoreOverrideModule.forRoot({
    //   apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    // }),
    HotkeyModule.forRoot(),
    CurrencyMaskModule,
    PipesModule.forRoot(),
    NotificationComponentModule,
    // SearchTextComponentModule,
    // NotificationsComponentModule,
    // NoticeComponentModule,
    // NoticesComponentModule,
    // NotificationComponentModule.forRoot(),
    // PrimeGrowlComponentModule,
    // KeysModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DndModule.forRoot().providers,
    OSData,
    SpinnerService,
    StorageService,
    ConfirmationService,
    DBService,
    AuthService,
    AlertService,
    ServerService,
    PouchDBService,
    SmartAudio,
    Preferences,
    InvoiceService,
    PDFService,
    GoogleMapsAPIWrapper,
    OnSiteConsoleLibrary,
    NumberService,
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    WebWorkerService,
    DomHandler,
    NotifyService,
    KeyCommandService,
    DispatchService,
    LoaderService,
    ElectronService,
  ]
})
export class AppModule {}
