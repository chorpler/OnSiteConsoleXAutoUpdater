import { NgModule                                       } from '@angular/core'                                       ;
import { CommonModule                                   } from '@angular/common'                       ;
import { FormsModule                                    } from '@angular/forms'                        ;
import { IonicPageModule                                } from 'ionic-angular'                                       ;
import { EmployeesBetaPage                              } from './employees-beta'                                    ;
import { DataTableModule,SharedModule                   } from 'primeng/primeng'                                     ;
import { TooltipModule, MultiSelectModule, DialogModule } from 'primeng/primeng'                                     ;
import { ContextMenuModule,                             } from 'primeng/primeng'                                     ;
import { EditorComponentModule                          } from '../../components/editor/editor.module'               ;
import { EmployeeViewComponentModule                    } from '../../components/employee-view/employee-view.module' ;

@NgModule({
  declarations: [
    EmployeesBetaPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicPageModule.forChild(EmployeesBetaPage),
    DataTableModule,
    SharedModule,
    TooltipModule,
    MultiSelectModule,
    DialogModule,
    ContextMenuModule,
    EditorComponentModule,
    EmployeeViewComponentModule,
  ],
  exports: [
    EmployeesBetaPage,
  ]
})
export class EmployeesBetaPageModule {}
