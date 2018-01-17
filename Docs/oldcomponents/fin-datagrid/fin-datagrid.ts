import * as Hypergrid       from 'fin-hypergrid'                                ;
// import * as DatasaurFilter  from 'datasaur-filter'                ;
// import * as DatasaurSorter  from 'datasaur-sorter'                ;
import * as FilteringPlugin from 'fin-hypergrid-filtering-plugin' ;
import * as SortingPlugin   from 'fin-hypergrid-sorting-plugin'   ;

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output } from '@angular/core'                 ;
import { Log                                                                } from '../../config/config.functions' ;
import { OSData                                                             } from '../../providers/data-service'  ;
import { Report                                                             } from '../../domain/domain-classes'   ;

@Component({
  selector: 'fin-datagrid',
  templateUrl: 'fin-datagrid.html',
})
export class FinHypergridComponent implements OnInit,OnDestroy {
  @ViewChild('hypergrid') hypergrid:Hypergrid;
  @ViewChild('gridContainer') gridContainer:ElementRef;
  @Input('grid') grid:Array<any>;
  public title:string = 'Datagrid';
  public gdata:any;
  public gridoptions:any;
  public hyperGrid:Hypergrid;
  public reports:Array<Report> = [];
  public dataReady:boolean = false;

  constructor(public data:OSData) {
    window['consoletesting'] = this;
    window['Hypergrid'] = Hypergrid;
  }

  ngOnInit() {
    Log.l("FinHypergridComponent: ngOnInit() fired.");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  ngOnDestroy() {
    Log.l("FinHypergridComponent: ngOnDestroy() fired");
  }

  public runWhenReady() {
    Log.l("FinHypergridComponent: now instantiating hypergrid...");
    this.dataReady = true;
    let data = this.grid;
    let options = {container: '#gridcontainer', data: data};
    this.gridoptions = options;
    // let hyperGrid:Hypergrid = new Hypergrid(this.gridoptions);
    this.hyperGrid = this.createNewHypergrid(options);
  }

  public setGrid(grid:Array<any>) {
    this.grid = grid;
    this.gridoptions = {container: '#gridcontainer', data:grid};
    this.hyperGrid = this.createNewHypergrid();
  }

  public createNewHypergrid(options?:any) {
    let opts = options || this.gridoptions;
    // let hyperGrid = new Hypergrid(opts);
    let hyperGrid = new Hypergrid();
    hyperGrid.setData(opts);

    // hyperGrid.behavior.dataModel.append(DatasaurFilter);
    // hyperGrid.behavior.dataModel.append(DatasaurSorter);
    hyperGrid.installPlugins(FilteringPlugin);
    hyperGrid.installPlugins(SortingPlugin);

    hyperGrid.properties.renderFalsy   = true;
    hyperGrid.properties.showFilterRow = true;

    hyperGrid.behavior.dataModel.filter = hyperGrid.plugins.hyperfilter.create();

    return hyperGrid;
  }


}
