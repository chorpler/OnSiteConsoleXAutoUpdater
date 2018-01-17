import { Component                           } from '@angular/core'                 ;
import { IonicPage, NavController, NavParams } from 'ionic-angular'                 ;
import { OSData                              } from '../../providers/data-service'  ;
import { PDFService                          } from '../../providers/pdf-service'   ;
import { Report                              } from '../../domain/report'           ;
import { Log, Moment, isMoment, moment       } from '../../config/config.functions' ;
import { logo1                               } from '../../config/config.assets'    ;

export const colors = {
  bg: {blue: "#4159a7" },
  fg: {blue: "#415987" }
};

@IonicPage({ name: 'Invoice'})
@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html',
})
export class Invoice {
  public title:string = "Invoice";
  constructor(public navCtrl: NavController, public navParams: NavParams, public pdf:PDFService) {
    window['onsiteinvoice'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad InvoicePage');
  }

  generateBasicEnergyInvoice() {
    return this.generateKeaneInvoice();
  }

  generateHalliburtonInvoice() {
    return this.generateKeaneInvoice();
  }

  generateKeaneInvoice(type?:number) {
    if(type && type === 1) {
      let dd = this.generateDesignDocument();
      Log.l("createPDF(): Now attempting to create PDF from design document: ", dd);
      this.pdf.createPDF(dd);
      Log.l("createPDF(): Now attempting to show PDF...");
      this.pdf.openPDF();
    } else {
      this.navCtrl.push('Invoicing Templates');
    }
  }

  public generateDesignDocument() {
    let dd = { content: [], styles: {}, defaultStyle: {} };
    // let logo = 'assets/images/SESALogo.png';
    let logo = logo1;
    let defaultMargin  = [0  , 0, 0, 0];
    let headerMargin   = [120, 0, 0, 0];
    let defaultHeight  = 10;
    let smallHeight    = 10;
    let headerFontSize = 12;
    let dateFontSize   = 12;
    let sitesDataFontSize = 10;
    // let colWidths = [5, '*', '*', '*', '*', '*', '*', 5];
    let colWidths = [5, 75, 75, 75, 75, 75, 75, 5];
    // let colWidths = [10, 90, 90, 90, 90, 90, 90, 10];
    let defaultStyle = { alignment: 'left', margin: defaultMargin, color: 'black', fontSize: 9, bold: true };
    let styles = {
      LABEL: { bold: true, alignment: 'right', margin: [0, 0, 5, 0], color: 'black', fontSize: sitesDataFontSize },
      DATA: { bold: true, alignment: 'right', margin: [0, 0, 0, 0], color: 'black', fontSize: sitesDataFontSize },
      TECHHDR: { bold: true, alignment: 'right', margin: [0, 0, 5, 0], color: 'black', fontSize: sitesDataFontSize },
      TECHDATA: { bold: true, alignment: 'right', margin: [0, 0, 0, 0], color: 'black', fontSize: sitesDataFontSize },
      HEADERLABEL: {alignment: 'center', fillColor: colors.bg.blue, color: 'white'},
      HEADERDATA:  {alignment: 'center', fillColor: 'white', color: 'black'},
      HEADERTEXT:  {alignment: 'center', fillColor: 'white', color: colors.fg.blue, bold: true},
      BILLINGLABEL: {alignment: 'right', margin: [5, 0, 15, 0]},
      BILLINGINFO : {alignment: 'left' , margin: [15, 0, 5, 0]},
      SHIFTLABEL: {alignment: 'right'  , margin: [5, 0, 15, 0], color: colors.fg.blue},
      SHIFTINFO : {alignment: 'left'   , margin: [15, 0, 5, 0], color: colors.fg.blue},
      CUSTOMERLABEL: {alignment: 'right', margin: [0, 0, 0, 0], color: colors.fg.blue},
      CUSTOMERINFO: {alignment: 'center', margin: [0, 0, 0, 0], color: colors.fg.blue},
      INVOICETABLEKEANE: {color: 'black'},
      DATAHEADERROW: {alignment: 'center', fillColor: 'lightgrey', color: 'black'},
      // DATE: { bold: true, alignment: 'center', fontSize: dateFontSize, color: colors.fg.date, fillColor: colors.bg.date },
      // DATEDIVIDER: { bold: true, alignment: 'center', fontSize: dateFontSize, color: 'black' },
      DIVIDER: { bold: true, margin: [0, 5, 0, 5] },
    };
    // for (let client of this.clients) {
    //   styles[client.name] = { bold: true, color: colors.fg[client.name], fontSize: sitesDataFontSize };
    //   styles[client.name + 'CELL'] = { bold: true, color: 'black', fillColor: colors.bg[client.name], margin: headerMargin, alignment: 'left', fontSize: headerFontSize };
    //   styles[client.name + 'HDR'] = { bold: true, color: colors.fg[client.name], margin: [0, 0, 10, 0], alignment: 'right', fontSize: sitesDataFontSize };
    //   styles[client.name + 'DATA'] = { bold: true, color: colors.fg[client.name], margin: [0, 0, 0, 0], alignment: 'right', fontSize: sitesDataFontSize };
    // }
    // let getRowHeight = function (i) {
    //   // let style = node.table.body[i][0].style;
    //   Log.l("getRowHeight(): params are: ", i);
    //   return 14;
    //   // if(style.indexOf('HDR') > -1) {
    //   //   return 14;
    //   // } else {
    //   //   return 14;
    //   // }
    // };
    // dd['styles'] = styles;
    dd.styles = styles;
    dd.defaultStyle = defaultStyle;
    let table = [
      [{style: 'IMAGE', colSpan: 2, rowSpan: 8,  stack: [{image: logo, margin: [0,0,0,0], width:110}]}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {style: 'HEADERTEXT', colSpan: 4, text: '2801 Corporate Drive'}, {}, {}, {}, {style: 'HEADERLABEL', colSpan: 2, text: 'INVOICE'}, {}],
      [{}, {}, {style: 'HEADERTEXT', colSpan: 4, text: 'Weslaco TX 78596'}, {}, {}, {}, {style: 'HEADERDATA', colSpan: 2, text: '{INVNO}'}, {}],
      [{}, {}, { style: 'HEADERTEXT', colSpan: 4, text: 'Phone: (956) 647-5119'}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, { style: 'HEADERLABEL', colSpan: 2, text: 'DATE'}, {}],
      [{}, {}, { style: 'HEADERTEXT', colSpan: 4, text: 'WWW.SESAFLEETSERVICES.COM' }, {}, {}, {}, { style: 'HEADERDATA', colSpan: 2, text: '{DATE}'}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {style: 'BILLINGLABEL', text: 'Billed to:'}, {style: 'BILLINGINFO', colSpan: 2, text: 'Keane Group'}, {}, {}, {}, {}, {}],
      [{}, {style: 'BILLINGLABEL', text: 'Address:'  }, {style: 'BILLINGINFO', colSpan: 2, text: '41500 Wolverine Road'}, {}, {}, {}, {}, {}],
      [{}, {                                         }, {style: 'BILLINGINFO', colSpan: 2, text: 'Shawnee, Oklahoma 74804'}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {style: 'SHIFTLABEL', text: 'Shift:'}, {style: 'SHIFTINFO', colSpan: 2, text: 'Keane Shawnee Mechanic Shop'}, {}, {}, {style: 'CUSTOMERLABEL', text:'Customer No:'}, {style: 'CUSTOMERINFO', text: 'SES100'}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{ style: 'DATAHEADERROW', text: '' }, { style: 'DATAHEADERROW', text: 'Date' }, { style: 'DATAHEADERROW', text: 'Technician' },
      { style: 'DATAHEADERROW', text: '' }, { style: 'DATAHEADERROW', text: 'Unit No.' }, { style: 'DATAHEADERROW', text: 'Hours' },
      { style: 'DATAHEADERROW', text: 'Total' }, { style: 'DATAHEADERROW', text: '' }, ],
      [{}, {text: 'test01'}, {}, {}, {}, {}, {}, {}],
      [{}, {text: 'test02'}, {}, {}, {}, {}, {}, {}],
      [{}, {text: 'test03'}, {}, {}, {}, {}, {}, {}],
      [{}, {text: ' '}, {}, {}, {}, {}, {}, {}],
      [{}, {text: ' '}, {}, {}, {}, {}, {}, {}],
      [{}, {text: ' '}, {}, {}, {}, {}, {}, {}],
    ];

    // Reminder of what this.stats looks like:
    // let stats = { CLIENTS: {${client.name}: {total:0, working:0, off:0}}, SESA: { 'total': 0, 'working': 0, 'off': 0 }, VACATION: 0, SITES: {${site.schedule_name}: {total:0,working:0,off:0}}, TECHS: { 'total': 0, 'working': 0, 'off': 0 } };
    // for (let client of this.clients) {
    //   if (client.name === 'SE') {
    //     continue;
    //   }
    //   let name = client.fullName;
    //   let stat = this.stats.CLIENTS[client.name];
    //   let headCell = [{ style: client.name + 'CELL', colSpan: 2, text: name.toUpperCase() }, {}];
    //   let totalRow = [{ style: 'LABEL', bold: true, text: 'Total' }, { style: 'DATA', text: stat.total }];
    //   let workingRow = [{ style: 'LABEL', bold: true, text: 'Working' }, { style: 'DATA', text: stat.working }];
    //   let daysOffRow = [{ style: 'LABEL', bold: true, text: 'Days Off' }, { style: 'DATA', text: stat.off }];
    //   table = [...table, headCell, totalRow, workingRow, daysOffRow];
    // }
    // table.push([{ text: '', colSpan: 2, style: 'DIVIDER' }, {}]);
    // for (let site of this.sites) {
    //   if (site.client.name === 'SE') {
    //     continue;
    //   }
    //   let name = site.schedule_name;
    //   let cli = site.client.name;
    //   let stat = this.stats.SITES[name];
    //   let totalRow = [{ style: cli + 'HDR', text: name }, { style: cli + 'DATA', text: stat.total }];
    //   table = [...table, totalRow];
    // }
    // let techTotalRow = [{ style: 'TECHHDR', bold: true, text: 'Total Techs' }, { style: 'TECHDATA', text: this.stats.TECHS.total }];
    // let techWorkingRow = [{ style: 'TECHHDR', bold: true, text: 'Techs Working' }, { style: 'TECHDATA', text: this.stats.TECHS.working }];
    // let techDaysOffRow = [{ style: 'TECHHDR', bold: true, text: 'Techs Days Off' }, { style: 'TECHDATA', text: this.stats.TECHS.off }];
    // let sesaTotalRow = [{ style: 'SEHDR', bold: true, text: 'SESA HQ' }, { style: 'SEDATA', text: this.stats.SESA.total }];
    // let techUnassignedRow = [{ style: 'TECHHDR', bold: true, text: 'Techs Unassigned' }, { style: 'TECHDATA', text: this.techs.length }];
    // table = [...table, techTotalRow, techWorkingRow, techDaysOffRow, sesaTotalRow, techUnassignedRow];
    // // let table1 = {style: 'scheduleTable', table: {widths: colWidths, height: function(i) { return 14;}, body: table}};
    // let table1 = { style: 'INVOICETABLEKEANE', table: { widths: colWidths, body: table }, layout: 'noBorders' };
    let table1 = { style: 'INVOICETABLEKEANE', table: { widths: colWidths, body: table } };
    dd.content.push(table1);
    window['onsiteinvoicedd'] = dd;
    Log.l("generateDesignDocument(): Returning:\n", dd);
    return dd;
  }



}
