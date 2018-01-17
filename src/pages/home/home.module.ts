import { NgModule                                     } from '@angular/core'                                               ;
import { IonicPageModule                              } from 'ionic-angular'                                               ;
import { HomePage                                     } from './home'                                                      ;
import { CommonModule,                                } from '@angular/common'                                             ;
import { FormsModule,                                 } from '@angular/forms'                                              ;
import { CurrencyMaskModule                           } from '../../components/ngx-currency-mask/ngx-currency-mask.module' ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG     } from '../../components/ngx-currency-mask/ngx-currency-mask.config' ;
import { SharedModule, OverlayPanelModule             } from 'primeng/primeng'                                             ;
import { PanelModule, InputTextModule, SpinnerModule, } from 'primeng/primeng'                                             ;
import { TooltipModule, DropdownModule,               } from 'primeng/primeng'                                             ;
import { LoginComponentModule                         } from '../../components/login/login.module'                         ;
import { NotificationComponentModule,                  } from '../../components/notification/notification.module'           ;
// import { MouseWheelModule                             } from '../../components/mousewheel/mousewheel.module'               ;

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
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    CommonModule,
    FormsModule,
    SharedModule,
    CurrencyMaskModule,
    PanelModule,
    InputTextModule,
    SpinnerModule,
    TooltipModule,
    DropdownModule,
    OverlayPanelModule,
    // MouseWheelModule,
    NotificationComponentModule,
    LoginComponentModule,
    // NotificationComponentModule.forRoot(),
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
    // NotificationComponentModule.forRoot().providers,
  ],
  exports: [
    HomePage
  ]
})
export class HomePageModule {}
