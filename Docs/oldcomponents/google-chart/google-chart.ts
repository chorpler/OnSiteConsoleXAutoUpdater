import { Component, Input, ViewChild, ElementRef } from '@angular/core'                 ;
import { Log, Moment, moment                     } from '../../config/config.functions' ;

declare var google;

@Component({
  selector: 'google-chart',
  templateUrl: 'google-chart.html'
})
export class GoogleChartComponent {
  @Input('pieChartData') public pieChartData      : any    ;
  @Input('pieChartOptions') public pieChartOptions: any    ;
  // @Input('pieChartOptions') public pieChartOptions: any    ;
  public text                                     : string ;
  private _element                                : any    ;

  constructor(public element:ElementRef) {
    Log.l('Hello GoogleChartComponent Component');
    // this.text     = 'Hello World'                                ;
    // this._element = this.element.nativeElement                   ;
    // let container = window['document'].getElementById('google-pie-chart');
    // let container = this.gPC.nativeElement            ;
    // let container = this._element            ;
    // let chart     = new google.visualization.PieChart(container) ;
    // let data      = this.pieChartData                            ;
    // let options   = this.pieChartOptions                         ;
    // chart.draw(data, options);
  }

}
