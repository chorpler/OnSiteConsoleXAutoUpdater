import { NgModule                       } from '@angular/core'   ;
import { IonicPageModule                } from 'ionic-angular'   ;
import { AddWorkSitePage                } from './add-work-site' ;
import { TooltipModule, DropdownModule, } from 'primeng/primeng' ;
import { AgmCoreModule                  } from '@agm/core'       ;

@NgModule({
  declarations: [
    AddWorkSitePage,
  ],
  imports: [
    IonicPageModule.forChild(AddWorkSitePage),
    TooltipModule,
    DropdownModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBut4WZDku34NbzfwOOBPHfNJRn60dH-4k'
    })
  ],
  exports: [
    AddWorkSitePage,
  ]
})
export class AddWorkSitePageModule {}
