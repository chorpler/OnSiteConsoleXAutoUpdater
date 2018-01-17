import { NgModule                                 } from '@angular/core'                              ;
import { IonicPageModule                          } from 'ionic-angular'                              ;
import { DPSSettingsPage                          } from './dps-settings'                             ;
import { CurrencyMaskModule                       } from "ng2-currency-mask"                          ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask/src/currency-mask.config" ;

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
    DPSSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSSettingsPage),
    CurrencyMaskModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
  exports: [
    DPSSettingsPage,
  ]
})
export class DPSSettingsPageModule {}
