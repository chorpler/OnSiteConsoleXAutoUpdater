// import { Directive, ElementRef, Input, Output, OnChanges,   } from '@angular/core'                 ;
// import { OnDestroy, EventEmitter, HostBinding, HostListener } from '@angular/core'                 ;
// import { Log                                                } from '../../config/config.functions' ;

// declare const google                    : any ;
// declare var googleLoaded                : any ;
// declare const googleChartsPackagesToLoad: any ;

// @Directive({
//   selector: 'google-charts',
// })
// export class GoogleCharts implements OnChanges {
//   @Input('chartType'     ) public chartType    : string = "PieChart"                                             ;
//   @Input('chartOptions'  ) public chartOptions : Object                                                          ;
//   @Input('loadingDelay'  ) public loadingDelay : number = 500                                                    ;
//   @Input('chartData'     ) public chartData    : Object                                                          ;
//   @Output('itemSelect'   ) public itemSelect   : EventEmitter<{row:number, column:number }> = new EventEmitter() ;
//   @Output('itemDeselect' ) public itemDeselect : EventEmitter<void> = new EventEmitter<void>()                   ;
//   public dataTable:any;
//   public wrapper  :any;
//   public _element :any;

//   constructor(public element: ElementRef) {
//     this._element = this.element.nativeElement;
//   }

//   @HostListener('window:resize') onResize(event: Event) {
//     this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element);
//   }

//   ngOnChanges() {
//     if (!googleLoaded) {
//       googleLoaded = true;
//       google.charts.load('current', { 'packages': ['corechart'] });
//     }
//     setTimeout(() => {
//       this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element);
//     }, this.loadingDelay);
//   }

//   public itemSelected() {
//     let wrapper = this.wrapper;
//     const selectedItem = wrapper.getChart().getSelection()[0];
//     if (selectedItem) {
//       let msg;
//       if (selectedItem !== undefined) {
//         const selectedRowValues = [];
//         if (selectedItem.row && selectedItem.column) {
//           selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, 0));
//           selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, selectedItem.column));
//           msg = {
//             message: 'select',
//             row: selectedItem.row,
//             column: selectedItem.column,
//             selectedRowValues: selectedRowValues
//           };
//         }
//       }
//       this.itemSelect.emit(msg);
//     } else
//       this.itemDeselect.emit();
//   }

//   public drawChart(chartOptions:any, chartType:any, chartData:any, ele:any) {
//     let data = chartData || [['Type', 'Percentage'],['NO DATA LOADED', 1]];
//     let dataTable = google.visualization.arrayToDataTable(data);
//     let chartConfig = {
//       chartType: chartType,
//       dataTable: chartData,
//       options  : chartOptions || {},
//     };
//     let wrapper = new google.visualization.ChartWrapper(chartConfig);
//     this.wrapper = wrapper;
//     wrapper.draw(ele);
//     google.visualization.event.addListener(wrapper, 'select', this.itemSelected());
//     // google.visualization.events.addListener(wrapper, 'select', function () {
//     //   const selectedItem = wrapper.getChart().getSelection()[0];
//     //   if (selectedItem) {
//     //     let msg;
//     //     if (selectedItem !== undefined) {
//     //       const selectedRowValues = [];
//     //       if (selectedItem.row && selectedItem.column) {
//     //         selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, 0));
//     //         selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, selectedItem.column));
//     //         msg = {
//     //           message: 'select',
//     //           row: selectedItem.row,
//     //           column: selectedItem.column,
//     //           selectedRowValues: selectedRowValues
//     //         };
//     //       }
//     //     }
//     //     this.itemSelect.emit(msg);
//     //   } else
//     //     this.itemDeselect.emit();
//     // });

//   }


//   public drawGraph(chartOptions, chartType, chartData, ele) {
//     google.charts.setOnLoadCallback(this.drawChart);
//     // let drawChart = () => {
//     //   // const wrapper = new google.visualization.ChartWrapper({
//     //   //   chartType: chartType,
//     //   //   dataTable: chartData,
//     //   //   options: chartOptions || {}
//     //   // });
//     //   let wrapper = new google.visualization.ChartWrapper({
//     //     chartType: chartType,
//     //     dataTable: dataTable,
//     //     options: chartOptions || {}
//     //   });
//     //   wrapper.draw(ele);
//     //   google.visualization.events.addListener(wrapper, 'select', function () {
//     //     const selectedItem = wrapper.getChart().getSelection()[0];
//     //     if (selectedItem) {
//     //       let msg;
//     //       if (selectedItem !== undefined) {
//     //         const selectedRowValues = [];
//     //         if (selectedItem.row && selectedItem.column) {
//     //           selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, 0));
//     //           selectedRowValues.push(wrapper.getDataTable().getValue(selectedItem.row, selectedItem.column));
//     //           msg = {
//     //             message: 'select',
//     //             row: selectedItem.row,
//     //             column: selectedItem.column,
//     //             selectedRowValues: selectedRowValues
//     //           };
//     //         }
//     //       }
//     //       this.itemSelect.emit(msg);
//     //     } else
//     //       this.itemDeselect.emit();
//     //   });
//     // }
//     // google.charts.setOnLoadCallback(drawChart);
//   }
// }
