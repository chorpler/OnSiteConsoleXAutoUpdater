import { Component, OnInit, ViewChild, ElementRef             } from '@angular/core'                      ;
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular'                      ;
import { Log, moment, Moment                                  } from '../../config/config.functions'      ;
import { OSData                                               } from '../../providers/data-service'       ;
import { Report, Employee, Jobsite, ReportOther,              } from '../../domain/domain-classes'        ;
import { Dialog                                               } from 'primeng/primeng'                    ;
import { DatagridComponent                                    } from '../../components/datagrid/datagrid' ;

@IonicPage({name: "Reports Alpha"})
@Component({
  selector: 'page-reports-alpha',
  templateUrl: 'reports-alpha.html',
})
export class ReportsAlphaPage {
  @ViewChild('gridContainer') gridContainer:ElementRef;
  @ViewChild('reportGrid') dataGrid:DatagridComponent;
  @ViewChild('reportViewTarget') reportViewTarget:ElementRef;
  @ViewChild('reportViewDialog') reportViewDialog:Dialog;
  @ViewChild('otherGrid') otherGrid:DatagridComponent;
  @ViewChild('otherViewDialog') otherViewDialog:Dialog;
  public title:string = 'Reports Alpha (Canvas Datagrid)';
  public reportData:any;
  public otherData:any;
  public reportGridOptions:any;
  public otherGridOptions:any;
  public site:Jobsite;
  public tech:Employee;
  public report:Report;
  public reports:Array<Report> = [];
  public other:ReportOther;
  public others:Array<ReportOther> = [];
  public sites:Array<Jobsite> = [];
  public techs:Array<Employee> = [];
  public dataReady:boolean = false;
  public reportViewTitle:string = "Report";
  public reportViewVisible:boolean = false;
  public otherViewTitle:string = "Misc Report";
  public otherViewVisible:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl:ModalController, public data:OSData) {
    window['consolereportsalpha'] = this;
  }

  ngOnInit() {
    Log.l("ReportsAlphaPage: ngOnInit() fired.");
    this.data.appReady().then(res => {
      setTimeout(() => {
        this.runWhenReady();
      }, 500);
    });
  }

  // ionViewDidLoad() {
  //   Log.l("FlexBoxesPage: ionViewDidLoad() fired.");
  //   this.data.appReady().then(res => {
  //     this.runWhenReady();
  //   });
  // }

  public runWhenReady() {
    Log.l("ReportsAlphaPage: now instantiating hypergrid...");
    // let gridEl = this.gridContainer.nativeElement;
    this.reports = this.data.getData('reports');
    this.sites = this.data.getData('sites');
    this.techs = this.data.getData('employees');
    this.others = this.data.getData('others');
    const momentAsTime = function (e) {
      let out = "";
      // Log.l("momentAsTime: e is:\n", e);
      // console.log("momentAsTime formatter");
      // if (e && e.cell && e.cell.value && e.cell.value.format) {
        // out = e.format("HH:mm");
      // }
      return moment(e.cell.value).format("HH:mm");
    };
    this.reportGridOptions = {
      data: this.reports,
      schema: [
        { name: '_id'              , type: 'string' , title: "ID"           , },
        { name: 'report_date'      , type: 'string' , title: "Date"         , },
        { name: 'timestamp'        , type: 'string' , title: "Timestamp"    , },
        { name: 'username'         , type: 'string' , title: "User"         , },
        { name: 'last_name'        , type: 'string' , title: "Last Name"    , },
        { name: 'first_name'       , type: 'string' , title: "First Name"   , },
        { name: 'time_start'       , title: "Start"        , defaultValue: "", formatter: function(e) { return moment(e.cell.value).format("HH:mm");} , hidden: true },
        { name: 'time_end'         , title: "End"          , defaultValue: "", formatter: function(e) { return moment(e.cell.value).format("HH:mm");} , hidden: true },
        { name: 'repair_hours'     , type: 'string' , title: "Hours"        , },
        { name: 'client'           , type: 'string' , title: "Client"       , },
        { name: 'location'         , type: 'string' , title: "Location"     , },
        { name: 'location_id'      , type: 'string' , title: "LocID"        , },
        { name: 'unit_number'      , type: 'string' , title: "Unit #"       , },
        { name: 'work_order_number', type: 'string' , title: "Work Order #" , },
        { name: 'notes'            , type: 'string' , title: "Notes"        , },
      ]
    };
    this.otherGridOptions = {height: '100%'};
    // this.reportData = this.convertReportsToDataGrid(this.reports);
    this.otherData  = this.convertReportOthersToDataGrid(this.others);

    this.dataReady = true;
    // let data = [
    //   { name: 'Company 1', price: 300 },
    //   { name: 'Company 2', price: 200 },
    //   { name: 'Company 3', price: 150 },
    //   { name: 'Company 4', price: 500 },
    //   { name: 'Company 5', price: 999 },
    // ];
    // let data = this.reports;
    // let options = {container: '#gridcontainer', data: data};
    // this.gridoptions = options;
    // let hGrid:Hypergrid = new Hypergrid(this.gridoptions);
    // this.hgrid = hGrid;
  }

  public convertReportsToDataGrid(rpts?:Array<Report>) {
    let reports = rpts || this.reports || [];
    let grid = [];
    let keys = []
    for(let report of reports) {
      let reportDoc = {
        "ID"          : report._id                        || "" ,
        "Date"        : report.report_date                || "" ,
        "Timestamp"   : report.timestamp                  || "" ,
        "User"        : report.username                   || "" ,
        "Last Name"   : report.last_name                  || "" ,
        "First Name"  : report.first_name                 || "" ,
        "Start"       : report.time_start.format("HH:mm") || "" ,
        "End"         : report.time_end.format("HH:mm")   || "" ,
        "Hours"       : report.repair_hours               || "" ,
        "Client"      : report.client                     || "" ,
        "Location"    : report.location                   || "" ,
        "LocID"       : report.location_id                || "" ,
        "Unit #"      : report.unit_number                || "" ,
        "Work Order #": report.work_order_number          || "" ,
        "Notes"       : report.notes                      || "" ,
      };
      grid.push(reportDoc);
    }
    return grid;
  }

  public convertReportOthersToDataGrid(othrs?:Array<ReportOther>) {
    let others = othrs || this.others || [];
    let grid = [];
    let keys = []
    for (let other of others) {
      let reportDoc = {
        "ID"          : other._id                              || "" ,
        "Date"        : other.report_date.format("YYYY-MM-DD") || "" ,
        "Type"        : other.type                             || "" ,
        "Training"    : other.training_type                    || "" ,
        "Timestamp"   : other.timestamp                        || "" ,
        "User"        : other.username                         || "" ,
        "Last Name"   : other.last_name                        || "" ,
        "First Name"  : other.first_name                       || "" ,
        "Time"        : other.time                             || "" ,
        "Travel"      : other.travel_location                  || "" ,
        "Client"      : other.client                           || "" ,
        "Location"    : other.location                         || "" ,
        "LocID"       : other.location_id                      || "" ,
        "Notes"       : other.notes                            || "" ,
      };
      grid.push(reportDoc);
    }
    return grid;
  }

  public rowClick(event:any) {
    Log.l("rowClick(): Event is:\n", event);
    let e = event;
    if(e.cell && e.cell.rowIndex !== undefined) {
      let rowIndex = e.cell.rowIndex;
      Log.l(`rowClick(): click fired for row ${rowIndex}`);
      this.editReport('report', rowIndex);
    } else {
      Log.l("rowClick(): click fired but without cell data!");
    }
  }

  public rowClickOther(event:any) {
    Log.l("rowClickOther(): Event is:\n", event);
    let e = event;
    if(e.cell && e.cell.rowIndex !== undefined) {
      let rowIndex = e.cell.rowIndex;
      Log.l(`rowClickOther(): click fired for row ${rowIndex}`);
      this.editReport('other', rowIndex);
    } else {
      Log.l("rowClickOther(): click fired but without cell data!");
    }
  }

  public editReport(type:string, rowIndex:number) {
    if(type==='report') {
      let report:Report = this.reports[rowIndex];
      let tech = this.getTech(report);
      let site = this.getSite(report);
      this.report = report;
      this.tech = tech;
      this.site = site;
      let data = { report: report, reports: this.reports, tech: tech, site: site };
      Log.l(`editReport(${rowIndex}): Editing '${type}' with data:\n`, data);
      this.updateHeader(rowIndex + 1);
      this.showReport();
    } else if(type==='other') {
      let other:ReportOther = this.others[rowIndex];
      let tech = this.getTech(other);
      let site = this.getSite(other);
      this.other = other;
      this.tech = tech;
      this.site = site;
      let data = { other: other, others: this.others, tech: tech, site: site };
      Log.l(`editReport(${rowIndex}): Editing '${type}' with data:\n`, data);
      this.updateHeaderOther(rowIndex + 1);
      this.showReportOther();
    }
    // let modal = this.modalCtrl.create("View Work Report", data);
    // modal.onDidDismiss(data => {
    //   Log.l("editReport(): Modal dismissed.");
    //   if(data) {
    //     Log.l("editReport(): Modal sent back data:\n", data);
    //   };
    // });
    // modal.present();
  }

  public showReport() {
    this.reportViewVisible = true;
  }

  public hideReport() {
    this.reportViewVisible = false;
  }

  public toggleReport() {
    this.reportViewVisible = !this.reportViewVisible;
  }

  public showReportOther() {
    this.otherViewVisible = true;
  }

  public hideReportOther() {
    this.otherViewVisible = false;
  }

  public toggleReportOther() {
    this.otherViewVisible = !this.otherViewVisible;
  }

  public updateHeader(index:number) {
    let idx = index;
    let count = this.reports.length;
    this.reportViewTitle = `Report (${index} / ${count})`;
  }

  public updateReport(event:any) {
    Log.l("updateReport(): Received event:\n", event);
    this.reportViewVisible = false;
  }

  public changeReport(event:any) {
    let count = this.reports.length;
    let index = event;
    this.reportViewTitle = `Report (${index} / ${count})`;
  }

  public updateHeaderOther(index:number) {
    let idx = index;
    let count = this.others.length;
    this.otherViewTitle = `Misc Report (${index} / ${count})`;
  }

  public updateReportOther(event:any) {
    Log.l("updateReportOther(): Received event:\n", event);
    this.otherViewVisible = false;
  }

  public changeReportOther(event:any) {
    let count = this.others.length;
    let index = event;
    this.otherViewTitle = `Misc Report (${index} / ${count})`;
  }

  public getTech(report:Report|ReportOther) {
    let name = report.username;
    this.tech = this.techs.find((a:Employee) => {
      return a.username === name;
    });
    return this.tech;
  }

  public getSite(report:Report|ReportOther) {
    let cli  = this.data.getFullClient(report.client);
    let loc  = this.data.getFullLocation(report.location);
    let lid  = this.data.getFullLocID(report.location_id);
    let site = this.sites.find((a:Jobsite) => {
      let client = cli.name.toUpperCase();
      let location = loc.name.toUpperCase();
      let locID = lid.name.toUpperCase();
      let siteClient   = a.client.name;
      let siteLocation = a.location.name;
      let siteLocID    = a.locID.name;
      return siteClient === client && siteLocation === location && siteLocID === locID;
    });
    this.site = site;
    return site;
  }



}
