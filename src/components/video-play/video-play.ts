import { Component, Input, Output, EventEmitter,   } from '@angular/core'                 ;
import { OnInit, OnDestroy, ViewChild, ElementRef, } from '@angular/core'                 ;
import { Log                                       } from '../../config/config.functions' ;
import { Pipe, PipeTransform                       } from '@angular/core'                 ;
import { DomSanitizer, SafeHtml                    } from '@angular/platform-browser'     ;
import { SafePipe                                  } from '../../pipes/safe'              ;

@Component({
  selector: 'video-play',
  templateUrl: 'video-play.html',
})
export class VideoPlayComponent implements OnInit,OnDestroy {
  @ViewChild('videoElement') videoElement:ElementRef;
  @Output('onEnd') onEnd = new EventEmitter<any>();
  // @Input('popoverContents') popoverContents:any;
  public popoverContents:SafeHtml = "";
  constructor(public sanitizer:DomSanitizer) {
    window['onsitevideocomponent'] = this;
  }

  ngOnInit() {
    Log.l("VideoPlayComponent: ngOnInit fired.");
    let video = this.videoElement.nativeElement;
    setTimeout(() => {
      let video = this.videoElement.nativeElement;
      video.play();
    }, 300);
  }

  ngOnDestroy() {
    Log.l("VideoPlayComponent: ngOnDestroy fired.");
  }

  public cancel() {
    // this.viewCtrl.dismiss();
    this.onEnd.emit(true);

  }

  public videoEnd() {
    Log.l("VideoPlayComponent: video ended.");
    this.cancel();
  }

}
