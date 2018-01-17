import { NgModule                                     } from '@angular/core'                                 ;
import { CommonModule,                                } from '@angular/common'                               ;
import { FormsModule,                                 } from '@angular/forms'                                ;
import { DPSSettingsComponent                         } from './dps-settings'                                ;
import { SharedModule, OverlayPanelModule             } from 'primeng/primeng'                               ;
import { PanelModule, InputTextModule, SpinnerModule, } from 'primeng/primeng'                               ;
import { ButtonModule,                                } from 'primeng/primeng'                               ;
// import { MouseWheelModule                             } from '../../components/mousewheel/mousewheel.module' ;
import { CurrencyMaskModule                           } from '../ngx-currency-mask/ngx-currency-mask.module' ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG     } from '../ngx-currency-mask/ngx-currency-mask.config'

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
    DPSSettingsComponent,
  ],
  entryComponents: [
    DPSSettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CurrencyMaskModule,
    PanelModule,
    InputTextModule,
    SpinnerModule,
    OverlayPanelModule,
    ButtonModule,
    // MouseWheelModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
  exports: [
    DPSSettingsComponent,
  ]
})
export class DPSSettingsComponentModule {}
