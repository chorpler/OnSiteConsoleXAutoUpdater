import { NgModule                                         } from '@angular/core'                                                                 ;
import { IonicPageModule                                  } from 'ionic-angular'                                                                 ;
import { DPSMainPage                                      } from './dps-main'                                                                    ;
import { PipesModule                                      } from '../../pipes/pipes.module'                                                      ;
// import { MouseWheelModule                                 } from '../../components/mousewheel/mousewheel.module'                                 ;
import { DataTableModule, SharedModule                    } from 'primeng/primeng'                                                               ;
import { PanelModule, InputTextModule, ButtonModule,      } from 'primeng/primeng'                                                               ;
import { TooltipModule, MultiSelectModule, TabMenuModule, } from 'primeng/primeng'                                                               ;
import { TabViewModule, InplaceModule, DropdownModule,    } from 'primeng/primeng'                                                               ;
import { SelectItem, MenuItem, TieredMenuModule,          } from 'primeng/primeng'                                                               ;
import { SpinnerModule, OverlayPanelModule,               } from 'primeng/primeng'                                                               ;
import { DialogModule,                                    } from 'primeng/primeng'                                                               ;
import { CurrencyMaskModule,                              } from "ng2-currency-mask"                                                             ;
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG,        } from "ng2-currency-mask/src/currency-mask.config"                                    ;
// import { KeysModule,                                      } from "../../components/keys/keys.module"                                             ;
import { DPSReportComponentModule,                        } from '../../components/dps-report/dps-report.module'                                 ;
import { DPSCalculationsComponentModule,                  } from '../../components/dps-calculations/dps-calculations.module'                     ;
import { DPSAncillaryCalculationsComponentModule,         } from '../../components/dps-ancillary-calculations/dps-ancillary-calculations.module' ;
import { DPSDailySummaryComponentModule,                  } from '../../components/dps-daily-summary/dps-daily-summary.module'                   ;
import { DPSSettingsComponentModule,                      } from '../../components/dps-settings/dps-settings.module'                             ;
import { GoogleChartsModule                               } from '../../components/google-charts/google-charts.module'                           ;

// import { HotkeyModule                                     } from 'angular2-hotkeys'                              ;
// import { DPSCalculationsPage                              } from '../dps-calculations/dps-calculations'          ;

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
    DPSMainPage,
    // DPSCalculationsPage,
  ],
  imports: [
    IonicPageModule.forChild(DPSMainPage),
    // KeysModule.forRoot(),
    PipesModule,
    DataTableModule,
    SharedModule,
    ButtonModule,
    TooltipModule,
    MultiSelectModule,
    TabMenuModule,
    TabViewModule,
    SpinnerModule,
    TieredMenuModule,
    InplaceModule,
    DropdownModule,
    PanelModule,
    OverlayPanelModule,
    DialogModule,
    CurrencyMaskModule,
    // MouseWheelModule,
    DPSReportComponentModule,
    DPSCalculationsComponentModule,
    DPSAncillaryCalculationsComponentModule,
    DPSDailySummaryComponentModule,
    DPSSettingsComponentModule,
    GoogleChartsModule,
  ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
  exports: [
    DPSMainPage,
  ]
})
export class DPSMainPageModule {}
