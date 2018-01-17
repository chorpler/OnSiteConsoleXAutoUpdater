import { NgModule           } from '@angular/core'            ;
import { VideoPlayComponent } from './video-play'             ;
import { PipesModule        } from '../../pipes/pipes.module' ;

@NgModule({
  declarations: [
    VideoPlayComponent,
  ],
  imports: [
    PipesModule,
  ],
  exports: [
    VideoPlayComponent,
  ]
})
export class VideoPlayComponentModule {}
