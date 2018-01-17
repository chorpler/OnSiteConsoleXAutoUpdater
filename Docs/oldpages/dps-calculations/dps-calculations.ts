import { sprintf                                                                         } from 'sprintf-js'                       ;
import { Component, OnInit, NgZone, ViewChild, ElementRef, Input                         } from '@angular/core'                    ;
import { IonicPage, NavController, NavParams, ModalController, ViewController            } from 'ionic-angular'                    ;
import { ServerService                                                                   } from '../../providers/server-service'   ;
import { DBService                                                                       } from '../../providers/db-service'       ;
import { AuthService                                                                     } from '../../providers/auth-service'     ;
import { AlertService                                                                    } from '../../providers/alert-service'    ;
import { NumberService                                                                   } from '../../providers/number-service'   ;
import { Log, Moment, moment, oo, _matchCLL, _matchSite, Decimal, dec                    } from '../../config/config.functions'    ;
import { Jobsite, Employee, Report, ReportOther, PayrollPeriod, Shift, Schedule, Invoice } from '../../domain/domain-classes'      ;
import { DPS                                                                             } from '../../domain/domain-classes'      ;
import { OSData                                                                          } from '../../providers/data-service'     ;
import { PDFService                                                                      } from '../../providers/pdf-service'      ;
import { OptionsComponent                                                                } from '../../components/options/options' ;
import { HotkeysService, Hotkey,                                                         } from 'angular2-hotkeys'                 ;


@IonicPage({name: 'DPS Calculations'})
@Component({
  selector: 'page-dps-calculations',
  templateUrl: 'dps-calculations.html',
})
export class DPSCalculationsPage {
  @ViewChild('printArea') printArea:ElementRef;
  @ViewChild('DPSCalcTable') DPSCalcTable:ElementRef;
  // @Input('')

  public title                     : string = "DPS Calculations";
  public techs                     : Array<Employee> = [];
  public sites                     : Array<Jobsite>  = [];
  public dps                       : DPS = OSData.dps;

  public schedules                 : Array<Schedule> = [];
  public schedule                  : Schedule;
  public periods                   : Array<PayrollPeriod> = [];
  public period                    : PayrollPeriod;
  public ePeriod                   : Map<Employee,PayrollPeriod> = new Map();
  public allShifts                 : Array<Shift> = [];
  public dataGrid                  : Array<Array<any>> = [];
  public periodSelectReady         : boolean = false;
  public dataReady                 : boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl:ModalController, public viewCtrl:ViewController, public alert:AlertService, public db:DBService, public server:ServerService, public data:OSData) {
    window['onsitedpscalculations'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad DPSCalculationsPage');
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public runWhenReady() {
    this.dps = this.data.dps;
    this.periods = this.data.createPayrollPeriods();
    this.period = this.periods[0];
    this.periodSelectReady = true;
    this.alert.showSpinner('Gathering DPS data...');
    setTimeout(() => {
      try {
        this.generateDPSCalculations(this.period);
        this.alert.hideSpinner();
        this.dataReady = true;
      } catch(err) {
        this.alert.hideSpinner();
        Log.l("runWhenReady(): Error generating DPS calculations.");
        Log.e(err);
        this.alert.showAlert("ERROR", "Error generating DPS calculations:<br>\n<br>\n" + err.message);
      }
    }, 1000);
  }

  public generateDPSCalculations(period:PayrollPeriod) {
    let _sortTechs = (a:Employee, b:Employee) => {
      let cliA = this.data.getFullClient(a.client);
      let cliB = this.data.getFullClient(b.client);
      let locA = this.data.getFullLocation(a.location);
      let locB = this.data.getFullLocation(b.location);
      let lidA = this.data.getFullLocID(a.locID);
      let lidB = this.data.getFullLocID(b.locID);
      let usrA = a.getTechName();
      let usrB = b.getTechName();
      !(cliA) ? Log.w("Error with tech:\n", a) : cliA = cliA.name;
      !(cliB) ? Log.w("Error with tech:\n", b) : cliB = cliB.name;
      !(locA) ? Log.w("Error with tech:\n", a) : locA = locA.name;
      !(locB) ? Log.w("Error with tech:\n", b) : locB = locB.name;
      !(lidA) ? Log.w("Error with tech:\n", a) : lidA = lidA.name;
      !(lidB) ? Log.w("Error with tech:\n", b) : lidB = lidB.name;
      cliA = cliA ? cliA : 0;
      cliB = cliB ? cliB : 0;
      locA = locA ? locA : 0;
      locB = locB ? locB : 0;
      lidA = lidA ? lidA : 0;
      lidB = lidB ? lidB : 0;
      let rotA = a.rotation;
      let rotB = b.rotation;
      let rsA = (rotA === 'UNASSIGNED') ? 5 : (rotA === 'FIRST WEEK') ? 1 : (rotA === 'CONTN WEEK') ? 2 : (rotA === 'FINAL WEEK') ? 3 : (rotA === 'DAYS OFF') ? 4 : 6;
      let rsB = (rotB === 'UNASSIGNED') ? 5 : (rotB === 'FIRST WEEK') ? 1 : (rotB === 'CONTN WEEK') ? 2 : (rotB === 'FINAL WEEK') ? 3 : (rotB === 'DAYS OFF') ? 4 : 6;
      return cliA < cliB ? -1 : cliA > cliB ? 1 : locA < locB ? -1 : locA > locB ? 1 : lidA < lidB ? -1 : lidA > lidB ? 1 : rsA < rsB ? -1 : rsA > rsB ? 1 : usrA < usrB ? -1 : usrA > usrB ? 1 : 0;
    }
    let _sortReports = (a:Report, b:Report) => {
      return a.report_date > b.report_date ? 1 : a.report_date < b.report_date ? -1 : 0;
    };

    this.ePeriod = this.data.createEmployeePeriodMap(period);
    let allEmployees = this.data.getData('employees');
    let employees = allEmployees.filter((a:Employee) => {
      let userclass = Array.isArray(a.userClass) ? a.userClass[0].toUpperCase() : typeof a.userClass === 'string' ? a.userClass.toUpperCase() : "M-TECH";
      return a.active === true && a.client && a.location && a.locID && userclass !== 'MANAGER';
    }).sort(_sortTechs);
    let datagrid = this.generateGridData();
    this.dataGrid = datagrid;
  }

  public countWorkingTechs() {
    let e = this.ePeriod;
    let working_techs = 0;
    for(let entry of e) {
      let tech:Employee = entry[0];
      let period:PayrollPeriod = entry[1];
      let hours = period.getNormalHours();
      if(hours > 0) {
        working_techs++;
      }
    }
    return working_techs;
  }

  public generateGridData() {
    let techs = this.techs.slice(0);
    let e = this.ePeriod;
    let grid = [];
    let i = 0;
    // let working_techs = this.dps.getWorkingTechs();
    let working_techs = this.countWorkingTechs();
    this.dps.setWorkingTechs(working_techs);
    let transportation:Decimal = this.dps.getTransportationDaily();
    let fuel:Decimal = this.dps.getFuelDaily();
    let insurance:Decimal = this.dps.getInsuranceDaily();
    let internal:Decimal = this.dps.getInternalSalariesDaily();
    let transportationPerTech:Decimal = transportation.div(working_techs);
    let fuelPerTech:Decimal = fuel.div(working_techs);
    let insurancePerTech:Decimal = insurance.div(working_techs);
    let internalPerTech:Decimal = internal.div(working_techs);

    for(let entry of e) {
      let tech:Employee = entry[0];
      let period:PayrollPeriod = entry[1];
      i++;
      let pr = tech.payRate || 0;
      let rate = new dec(pr);
      // rate = rate.plus(pr);
      let site = this.data.getSiteForTech(tech);
      let pDate = moment(period.start_date);
      let rotation = this.data.getTechRotationForDate(tech, pDate);
      let rotSeq   = this.data.getRotationSequence(rotation);
      let billing_rate = new dec(site.billing_rate);
      let lodging = new dec(site.lodging_rate);
      let per_diem = new dec(site.per_diem_rate);
      let shifts = period.getPayrollShifts();
      for(let shift of shifts) {
        // let costs = new dec(0);
        let date = shift.getShiftDate();
        let strDay = date.format("ddd");
        let hours = shift.getPayrollHours();
        let billable_hours = shift.getNormalHours();
        let hrsTravel = shift.getTravelHours();
        let hrsTraining = shift.getTrainingHours();
        let hrsVacation = shift.getVacationHours();
        let hrsStandby = shift.getStandbyHours();
        let hrsSick = shift.getSickHours();
        let travel:Decimal, training:Decimal, vacation:Decimal, standby:Decimal, sick:Decimal, payroll:Decimal;
        travel   = rate.times(hrsTravel)   ;
        training = rate.times(hrsTraining) ;
        vacation = rate.times(hrsVacation) ;
        standby  = rate.times(hrsStandby)  ;
        sick     = rate.times(hrsSick)     ;
        payroll  = rate.times(hours)       ;
        let tpt:Decimal, fpt:Decimal, ipt:Decimal, spt:Decimal, ldg:Decimal, pdm:Decimal;
        if(!hours) {
          tpt = new dec(0);
          fpt = new dec(0);
          ipt = new dec(0);
          spt = new dec(0);
          ldg = new dec(0);
          pdm = new dec(0);
        } else {
          tpt = transportationPerTech;
          fpt = fuelPerTech;
          ipt = insurancePerTech;
          spt = internalPerTech;
          ldg = lodging;
          pdm = per_diem;
        }

        let costs:Decimal = payroll.plus(lodging).plus(per_diem).plus(vacation).plus(travel).plus(training).plus(standby).plus(sick).plus(transportationPerTech).plus(fuelPerTech).plus(insurancePerTech).plus(internalPerTech);
        let revenue:Decimal = billing_rate.times(billable_hours);
        let profit:Decimal = revenue.minus(costs);
        let profitPercent:Decimal = profit.div(revenue).times(100);
        let row:Array<any> = [
          i,
          shift.getShiftNumber(),
          strDay,
          tech.payRate,
          site.getScheduleName(),
          site.client.name,
          site.location.name,
          site.locID.name,
          tech.getTechName(),
          site.locID.fullName,
          site.client.fullName,
          date.format("MMM DD YYYY"),
          rotSeq,
          billable_hours,
          payroll, //13
          ldg,
          pdm,
          new dec(0),
          vacation,
          travel,
          training,
          standby, //20
          tpt,
          fpt,
          ipt,
          spt,
          costs,
          revenue,
          profit,
          profitPercent,
        ];

        Object.defineProperty(row, 26, {
          get: function() {
            let offset = 12;
            let i = 26;
            let cost = row[14].plus(row[15]).plus(row[16]).plus(new dec(row[17])).plus(row[18]).plus(row[19]).plus(row[20]).plus(row[21]).plus(row[22]).plus(row[23]).plus(row[24]).plus(row[25]);
            return cost;
          }
        });

        Object.defineProperty(row, 28, {
          get: function() {
            let profit = row[27].minus(row[26]);
            return profit;
          }
        });

        Object.defineProperty(row, 29, {
          get: function() {
            let percent;
            if(row[27].equals(0)) {
              percent = new dec(0);
            } else {
              percent = row[28].div(row[27]).times(100);
            }
            return percent;
          }
        });

        grid.push(row);
      }
    }
    Log.l("generateGridData(): Created grid:\n", grid);
    return grid;
  }

  public updatePeriod(period:PayrollPeriod) {
    this.dataReady = false;
    this.alert.showSpinner("Setting period to " + period.getPeriodName("MMM DD") + " ...");
    setTimeout(() => {
      try {
        this.generateDPSCalculations(period);
        this.alert.hideSpinner();
        this.dataReady = true;
      } catch(err) {
        this.alert.hideSpinner();
        this.alert.showAlert("ERROR", "Error updating payroll period:<br>\n<br>\n" + err.message);
      }
    }, 1000);
  }

  public copyTable() {
    let table = this.printArea.nativeElement;
    let el = table.innerHtml;
    let range,selection;
    if(window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(table);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('copy');
  }

}
