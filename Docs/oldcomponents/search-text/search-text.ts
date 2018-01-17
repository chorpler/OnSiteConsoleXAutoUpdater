import { sprintf                                              } from 'sprintf-js'                    ;
import { Subscription                                         } from 'rxjs/Subscription'             ;
import { Command, KeyCommandService                           } from 'providers/key-command-service' ;
import { Component, OnInit, OnDestroy, NgZone, Input, Output, } from '@angular/core'                 ;
import { ElementRef, ViewChild, EventEmitter,                 } from '@angular/core'                 ;
import { Log                                                  } from 'config/config.functions'       ;
import { ElectronService                                      } from 'providers/electron-service'    ;

@Component({
  selector: 'search-text',
  templateUrl: 'search-text.html',
})
export class SearchTextComponent implements OnInit,OnDestroy {
  @Output('onSearchText') onSearchText = new EventEmitter<any>();
  @Output('onClose') onClose = new EventEmitter<any>();
  @ViewChild('searchInput') searchInput:ElementRef;
  @ViewChild('searchResults') searchResults:ElementRef;
  public searchText:string = "";
  public searchResultCount:number = 0;
  public isSearchVisible:boolean = false;
  public focusDelay:number = 120;
  public keySub:Subscription;
  public foundSub:Subscription;

  constructor(public keyService:KeyCommandService, public electron:ElectronService) {
    window['onsitesearch'] = this;
  }

  ngOnInit() {
    Log.l("SearchTextComponent: ngOnInit() fired");
    this.initializeSubscribers();
    setTimeout(() => {
      this.isSearchVisible = true;
    }, 20);
    this.focusOnInput();
  }

  ngOnDestroy() {
    Log.l("SearchTextComponent: ngOnDestroy() fired");
    this.quitSearch();
    if(this.keySub && this.keySub.unsubscribe) {
      this.keySub.unsubscribe();
    }
    if(this.foundSub && this.foundSub.unsubscribe) {
      this.foundSub.unsubscribe();
    }
  }

  public initializeSubscribers() {
    this.keySub = this.keyService.commands.subscribe((command:Command) => {
      switch(command.name) {
        case "SearchText.close" : this.close(command.ev); break;
        case "SearchText.searchNext" : this.next(command.ev); break;
        case "Searchtext.search": this.focusOnInput(); break;
      }
    });
    this.foundSub = this.electron.searchEvent.subscribe((event:any) => {
      this.gotResults(event);
    });
  }

  public focusOnInput() {
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, this.focusDelay);
  }

  public close(evt?:any) {
    this.quitSearch();
    this.isSearchVisible = false;
    setTimeout(() => {
      this.onClose.emit(true);
    }, 250);
  }

  public stringChanged(txt?:string) {
    let text = txt ? txt : this.searchText;
    if(text && text.length > 0) {
      this.electron.searchText(text);
      this.focusOnInput();
    }
  }

  public gotResults(result:any) {
    Log.l("gotResults(): Result is:\n", result);
    if(!result.matches) {
      this.searchResultCount = 0;
      this.focusOnInput();
    } else {
      this.searchResultCount = result.matches;
      this.focusOnInput();
    }
  }

  public quitSearch() {
    this.electron.stopSearch();
  }

  public checkKey(event:any) {
    // Log.l("checkKey(): Event is:\n", event);
    if(event && event.keyCode) {
      if(event.keyCode === 27) {
        this.close(event);
      } else if(event.keyCode === 13) {
        this.next(event);
      }
    }
  }

  public next(event?:any) {
    this.electron.searchNext(this.searchText);
  }
}
