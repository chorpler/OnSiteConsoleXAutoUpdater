import { Directive, ElementRef, Input, Output, OnChanges,   } from '@angular/core'                 ;
import { OnDestroy, EventEmitter, HostBinding, HostListener } from '@angular/core'                 ;
import { Log                                                } from '../../config/config.functions' ;

declare const google                    : any ;
declare let googleLoaded                : any ;
declare const googleChartsPackagesToLoad: any ;

@Directive({
  // selector: '[GoogleChart]'
  selector: 'google-charts',
})
export class GoogleCharts implements OnChanges {
  @Input('chartType') public chartType: string;
  @Input('chartOptions') public chartOptions: Object;
  @Input('loadingDelay') public loadingDelay = 0;
  @Input('chartData') public chartData: Object;
  // @Output('itemSelect') public itemSelect: EventEmitter<{ row: number, column: number }> = new EventEmitter();
  @Output('itemSelect') public itemSelect: EventEmitter<any> = new EventEmitter();
  @Output('itemDeselect') public itemDeselect: EventEmitter<void> = new EventEmitter<void>();
  public _element: any;
  public selection:any;
  public wrapper:any;
  public formatter:any;

  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
    window['onsitegooglechart'] = this;
  }

  ngOnChanges() {
    if (!googleLoaded) {
      googleLoaded = true;
      google.charts.load('current', { 'packages': ['corechart', 'gauge']['orgchart'] });
    }
    setTimeout(() => this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element), this.loadingDelay);
  }

  @HostListener('window:resize') onResize(event: Event) {
    this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element);
  }

  drawGraph(chartOptions, chartType, chartData, ele) {
    // google.charts.setOnLoadCallback(drawChart);
    const self = this;

    // function drawChart() {
    var drawChart = () => {
      var dataTable = new google.visualization.DataTable();
      let data = chartData.slice(1);
      dataTable.addColumn('string', 'Type');
      dataTable.addColumn('number', 'Amount');
      dataTable.addRows(data);
      var formatter = new google.visualization.NumberFormat({ prefix: '$' });
      formatter.format(dataTable, 1);
      var wrapper = new google.visualization.ChartWrapper({
        chartType: chartType,
        dataTable: dataTable,
        options: chartOptions || {},
      });
      this.wrapper = wrapper;
      // const wrapper = new google.visualization.ChartWrapper({
      //   chartType: chartType,
      //   dataTable: chartData,
      //   options: chartOptions || {}
      // });
      wrapper.draw(ele);
      google.visualization.events.addListener(wrapper, 'select', () => {
        const selectedItem = wrapper.getChart().getSelection()[0];
        if (selectedItem) {
          let msg;
          if (selectedItem !== undefined) {
            Log.l("GoogleCharts(): Item selected is:\n", selectedItem);
            var selectedRowValues = [];
            let rowVal = 0, colVal = 0;
            rowVal = selectedItem.row !== null ? selectedItem.row : 0;
            // colVal = selectedItem.column !== null ? selectedItem.column : 0;
            colVal = typeof selectedItem.column === 'number' ? selectedItem.column : 1;
            // if (selectedItem.row !== null) {
              // selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, 0));
              // selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, selectedItem.column));
              selectedRowValues.push(wrapper.getDataTable().getValue(rowVal, 0));
              selectedRowValues.push(wrapper.getDataTable().getValue(rowVal, 1));
              msg = {
                message: 'select',
                item: selectedItem,
                row: rowVal,
                column: colVal,
                selectedRowValues: selectedRowValues
              };
            }
          // }
          self.itemSelect.emit(msg);
        } else
          self.itemDeselect.emit();
      });
    };
    google.charts.setOnLoadCallback(drawChart);

  }
}
