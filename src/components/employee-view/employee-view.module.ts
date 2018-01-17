import { NgModule                                           } from '@angular/core'                         ;
import { CommonModule                                       } from '@angular/common'                       ;
import { FormsModule                                        } from '@angular/forms'                        ;
import { EmployeeViewComponent                              } from './employee-view'                       ;
import { TooltipModule, DropdownModule, OverlayPanelModule, } from 'primeng/primeng'                       ;
import { CheckboxModule, ButtonModule, DialogModule,        } from 'primeng/primeng'                       ;
import { EditorComponentModule                              } from '../../components/editor/editor.module' ;
import { DirectivesModule,                                  } from '../../directives/directives.module'    ;

@NgModule({
  declarations: [
    EmployeeViewComponent,
  ],
  imports: [
    // IonicPageModule.forChild(EmployeePage),
    CommonModule,
    FormsModule,
    DirectivesModule,
    EditorComponentModule,
    TooltipModule,
    DropdownModule,
    OverlayPanelModule,
    CheckboxModule,
    ButtonModule,
    DialogModule,
  ],
  exports: [
    EmployeeViewComponent,
  ]
})
export class EmployeeViewComponentModule {}
