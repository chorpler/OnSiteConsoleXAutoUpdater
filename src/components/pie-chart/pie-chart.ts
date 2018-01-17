import * as d3 from 'd3';
import { Component, Input    } from '@angular/core'                 ;
import { Log, Moment, moment } from '../../config/config.functions' ;

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.html'
})
export class PieChartComponent {

  public text: string;

  constructor() {
    Log.l('Hello PieChartComponent Component');
    this.text = 'Hello World';
    window['d3'] = d3;
  }

}
