import   * as canvasDatagrid                                                  from 'canvas-datagrid'         ;
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output } from '@angular/core'           ;
import { EventEmitter,                                                      } from '@angular/core'           ;
import { Log                                                                } from 'config/config.functions' ;
import { OSData                                                             } from 'providers/data-service'  ;
import { Report                                                             } from 'domain/domain-classes'   ;

@Component({
  selector: 'datagrid',
  templateUrl: 'datagrid.html',
})
export class DatagridComponent implements OnInit,OnDestroy {
  @ViewChild('canvasDatagridContainer') canvasDatagridContainer:ElementRef;
  @ViewChild('gridContainer') gridContainer:ElementRef;
  @Input('grid')    grid   :Array<any>;
  @Input('options') options:any;
  @Input('schema')  schema :any;
  @Output('rowClick') rowClick = new EventEmitter<any>();
  public title      : string        = 'Datagrid' ;
  public gdata      : any                        ;
  public gridoptions: any                        ;
  public dataGrid   : any                        ;
  public reports    : Array<Report> = []         ;
  public dataReady  : boolean       = false      ;

  constructor(public data:OSData) {
    window['datagridcomponent'] = this;
    window['CanvasDatagrid'] = canvasDatagrid;
  }

  ngOnInit() {
    Log.l("DatagridComponent: ngOnInit() fired.");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("DatagridComponent: ngOnDestroy() fired");
  }

  public runWhenReady() {
    Log.l("DatagridComponent: now instantiating hypergrid...");
    let data = this.grid;
    let parentNode = this.canvasDatagridContainer.nativeElement;
    // let options:any = this.options || {};
    let options:any = this.options;
    options.parentNode = parentNode;
    if(!options.data) {
      options.data = data;
    }
    Log.l("DatagridComponent: options for grid are:\n", options);
    this.gridoptions = options;
    this.dataGrid = this.createNewDatagrid(options);
    this.dataReady = true;
  }

  public setGrid(grid:Array<any>) {
    this.grid = grid;
    let schema = this.schema || {};
    // this.gridoptions = {container: '#gridcontainer', data: grid, schema: schema, style: {width: "100%"}};
    this.gridoptions.data = grid;
    this.dataGrid = this.createNewDatagrid();
    this.dataGrid.draw();
  }

  public createNewDatagrid(options?:any):any {
    let opts = options || this.gridoptions;
    let data = opts.data;
    delete options.data;

    let grid = canvasDatagrid(opts);

    grid.attributes.selectionMode = 'row';

    // const momentAsTime = function(e) {
    //   let out = "";
    //   Log.l("momentAsTime: e is:\n", e);
    //   if(e && e.cell && e.cell.value && e.cell.value.format) {
    //     out = e.format("HH:mm");
    //   }
    //   return out;
    // };

    // let momentAsTimeFilter = function(value, filterFor) {
    //   if(!filterFor) { return true; }
    //   return value === filterFor;
    // };
    // grid.formatters.date = momentAsTime;
    // grid.filters.momentAsTime = momentAsTimeFilter;
    // grid.setFilter('time_start', 1);
    // grid.setFilter('time_end', 1);

    // grid.filters.momentAsTime = grid.formatters.momentAsTime;

    grid.addEventListener('click', (e:any) => {
      Log.l("datagrid: click event was:\n", e);
      if(e.cell && e.cell.rowIndex !== undefined) {
        let rowIndex = e.cell.rowIndex;
        if(rowIndex > -1) {
          Log.l(`Datagrid: click fired for row ${rowIndex}`);
          this.rowClick.emit(e);
        } else {
          Log.l(`Datagrid: click fired but for non-row ${rowIndex}.`);
        }
      } else {
        Log.l("Datagrid: click fired but without cell data!");
      }
    });
    grid.data = data;
    return grid;
  }
}
