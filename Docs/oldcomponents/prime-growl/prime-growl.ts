import { Component, ViewChild, Input, OnInit, OnDestroy, ElementRef } from '@angular/core'                            ;
import { SelectItem, Message, Growl                                 } from 'primeng/primeng'                          ;
import { MessageService                                             } from 'primeng/components/common/messageservice' ;
import { Log                                                        } from '../../config/config.functions'            ;

@Component({
  selector: 'prime-growl',
  templateUrl: './prime-growl.html'
})
export class PrimeGrowlComponent implements OnInit,OnDestroy {
  @ViewChild('pGrowlElement') pGrowlElement:Growl;
  @Input('growls') growls:Message[] = [];
  @Input('timeout') timeout:number = 3000;
  constructor(public messageService:MessageService) {
    Log.l("Prime Growl Component loaded!");
    Log.l("Prime Growl Component timeout is: " + this.timeout);
    window['PrimeGrowlComponentThis'] = this;
    window['PrimeGrowlComponent'] = PrimeGrowlComponent;
  }

  ngOnInit() {
    Log.l("PrimeGrowlComponent: ngOnInit() fired.");
  }

  ngOnDestroy() {
    Log.l("PrimeGrowlComponent: ngOnDestroy() fired.");
  }

  public getGrowl():Growl {
    return this.pGrowlElement;
  }

}
