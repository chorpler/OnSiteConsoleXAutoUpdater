import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core'                  ;
import { IonicPage                                        } from 'ionic-angular'                  ;
import { NavController, ModalController                   } from 'ionic-angular'                  ;
import { NavParams                                        } from 'ionic-angular'                  ;
import { Storage                                          } from '@ionic/storage'                 ;
import { Log, moment, Moment, isMoment, oo                } from '../../config/config.functions'  ;
import { AuthService                                      } from '../../providers/auth-service'   ;
import { ServerService                                    } from '../../providers/server-service' ;
import { DBService                                        } from '../../providers/db-service'     ;
import { OSData                                           } from '../../providers/data-service'   ;
import { AlertService                                     } from '../../providers/alert-service'  ;
import { Preferences                                      } from '../../providers/preferences'    ;
import { Employee                                         } from '../../domain/employee'          ;
import { SelectItem, MenuItem                             } from 'primeng/primeng'                ;

@IonicPage({ name: 'Employees' })
@Component({
  selector: 'page-employees',
  templateUrl: 'employees.html',
})
export class EmployeesPage implements OnInit {
  @ViewChild('dt') dt: ElementRef;
  @ViewChild('cm') cm: ElementRef;
  public title              : string          = "Employees"                       ;
  public employeesdb        : any             ;
  public editMode           : boolean         = false                             ;
  public userInfo           : any             = {u: '', p: '' }                   ;
  public employeeFields     : Array<string>   = ["firstName", "lastName", "name"] ;
  public employeeList       : any             = []                                ;
  public allEmployees       : Array<Employee> = []                                ;
  public employees          : Array<Employee> = []                                ;
  public displayEmployees   : Array<Employee> = []                                ;
  public selectedEmployee   : Employee                                            ;
  public styleColIndex      : any                                                 ;
  public styleColEdit       : any                                                 ;
  public moment             : any             = moment                            ;
  public cols               : Array<any>      = []                                ;
  public colOpts            : SelectItem[]    = []                                ;
  public fields             : Array<any>      = []                                ;
  public allFields          : Array<any>      = []                                ;
  public items              : SelectItem[]    = []                                ;
  public selected           : SelectItem[]    = []                                ;
  public displayColumns     : Array<any>      = []                                ;
  public dataReady          : boolean         = false                             ;
  public showUsername       : boolean         = false                             ;
  public showAllEmployees   : boolean         = false                             ;
  public fieldsDialogVisible: boolean         = false                             ;
  public selectedColumns    : string[]        = []                                ;
  public ctxItems           : MenuItem[]      = []                                ;
  public tooltipDelay       : number          = 0                                 ;
  public static PREFS       : any             = new Preferences()                 ;

  public get prefs(): any { return EmployeesPage.PREFS; };
  public get rowCount(): number { return this.prefs.CONSOLE.pages.employees; };
  public set rowCount(val: number) { this.prefs.CONSOLE.pages.employees = val; };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public server: ServerService,
    public db: DBService,
    public alert: AlertService,
    public storage: Storage,
    public data: OSData,
    public auth: AuthService,
    public modalCtrl: ModalController,
    public zone: NgZone
  ) {
    Log.l("EmployeesPage constructor");
    window['employeespage'] = this;
    window['Employee'] = Employee;
  }

  // ionViewDidLoad() {
  //   Log.l('ionViewDidLoad EmployeesPage');
  // }
  ngOnInit() {
    Log.l("EmployeesPage: ngOnInit() running");
    this.data.appReady().then(res => {
      this.runWhenReady();
    });
  }

  public runWhenReady() {
    let spinnerID = this.alert.showSpinner('Retrieving employee list...');
    this.styleColEdit = {'max-width':'40px', 'width': '40px'};
    this.styleColIndex = {'max-width':'50px', 'width': '50px'};
    this.selected = this.fields;
    this.ctxItems = [
      {label: 'Edit Employee', icon: 'fa-user', command: (event) => this.editEmployee(this.selectedEmployee)},
    ];

    this.generateFieldList();
    // this.createFields();
    this.db.getEmployees().then((docs: Array<Employee>) => {
      Log.l("EmployeesPage: got results:\n", docs);
      docs.forEach((employeeDoc) => {
        let emp1 = new Employee();
        emp1.readFromDoc(employeeDoc);
        let emp2 = new Employee();
        emp2.readFromDoc(employeeDoc);
        this.allEmployees.push(emp1);
        this.displayEmployees.push(emp2);
      });
      Log.l("EmployeesPage: final employees list:\n", this.allEmployees);
      this.employees = this.allEmployees.filter((a: Employee) => {
        if (!this.showAllEmployees) {
          return a.active;
          // return obj['active'] && obj['lastName'] !== 'Sargeant' && obj['username'] !== 'mike';
        } else {
          return true;
        }
      });
      this.displayEmployees = this.allEmployees.filter((a: Employee) => {
        if (!this.showAllEmployees) {
          return a.active;
          // return obj['active'] && obj['lastName'] !== 'Sargeant' && obj['username'] !== 'mike';
        } else {
          return true;
        }
      });
      // this.displayEmployees = this.employees.slice(0);
      for (let tech of this.displayEmployees) {
        let client = tech.client;
        let location = tech.location;
        let locID = tech.locID;
        tech.client = this.data.getFullName('client', client);
        tech.location = this.data.getFullName('location', location);
        tech.locID = this.data.getFullName('locID', locID);
      }
      this.alert.hideSpinner(spinnerID);
      this.dataReady = true;
      // setTimeout(() => {
      //   let newColumns = [
      //     // "updated",
      //     "avatarName",
      //     "lastName",
      //     "firstName",
      //     "client",
      //     "location",
      //     "locID",
      //   ];
      //   this.selectedColumns = newColumns;
      //   this.columnsChanged();
      // }, 1000);
    }).catch((err) => {
      this.alert.hideSpinner(spinnerID);
      Log.l("Error retrieving docs from users DB!");
      Log.e(err);
      this.alert.showAlert("ERROR", "Error retrieving employees from database:<br>\n<br>\n" + err.message)
    });
  }


  // public createFields() {
  //   let fields = [];
  //   let af = this.allFields;
  //   fields.push(af[7]);
  //   fields.push(af[5]);
  //   fields.push(af[4]);
  //   fields.push(af[9]);
  //   fields.push(af[10]);
  //   fields.push(af[11]);
  //   let sel = [];
  //   for(let field of fields) {
  //     sel.push(field.value);
  //   }
  //   // this.selectedColumns = sel;
  //   // this.columnsChanged();
  //   // this.displayColumns = sel;
  //   return fields;
  // }

  // public updateFields() {
  //   let fields = [];
  //   if(this.showUsername) {
  //     fields.push(this.allFields[7]);
  //     // fields.push({field: 'avatarName', header: 'User', filter: true, filterPlaceholder: "Username"});
  //   }
  //   for(let field of this.selectedColumns) {
  //     // if(field.field !== 'avatarName') {
  //       fields.push(field);
  //     }
  //   }
  //   this.fields = fields;
  //   Log.l("updateFields(): Now using fields:\n", fields);
  //   // this.employees = [...this.employees];
  //   return this.fields;
  // }

  public toggleShowAllEmployees() {
    this.showAllEmployees = !this.showAllEmployees;
    Log.l("toggleShowAllEmployees(): ShowAllEmployees set to '%s'.", this.showAllEmployees);
    // this.employees = this.allEmployees.filter((a:Employee) => {
    //   if (!this.showAllEmployees) {
    //     return a.active && a.lastName !== 'Sargeant' && a.username !== 'mike';
    //   } else {
    //     return true;
    //   }
    // });
    this.displayEmployees = this.allEmployees.filter((a: Employee) => {
      if (!this.showAllEmployees) {
        return a.active && a.lastName !== 'Sargeant' && a.username !== 'mike';
      } else {
        return true;
      }
    });
    this.employees = this.displayEmployees.slice(0);
    for (let tech of this.displayEmployees) {
      let client    = tech.client;
      let location  = tech.location;
      let locID     = tech.locID;
      tech.client   = this.data.getFullName('client', client);
      tech.location = this.data.getFullName('location', location);
      tech.locID    = this.data.getFullName('locID', locID);
    }
    let i = this.selectedColumns.indexOf("active");
    if(this.showAllEmployees) {
      if( i === -1) {
        this.selectedColumns.unshift("active");
        this.columnsChanged();
      }
    } else {
      if(i !== -1) {
        this.selectedColumns.splice(i, 1);
        this.columnsChanged();
      }
    }
  }

  public onRowSelect(event: any) {
    let user:Employee = event.data;
    this.editEmployee(user);
  }

  public editEmployee(user:Employee, event?:any) {
    let employee = this.employees.find((a: Employee) => {
      return a.username === user.username;
    });

    Log.l("editEmployee(): Editing employee:\n", employee);
    let modalTarget = 'Add Employee';
    if(event && event.shiftKey) {
      modalTarget = "Employee";
    }
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Edit', employee: employee }, { cssClass: 'edit-employee-modal' });
    let modal = this.modalCtrl.create(modalTarget, { mode: 'Edit', employee: employee }, { cssClass: 'edit-employee-modal' });
    modal.onDidDismiss(data => {
      Log.l("editEmployee(): Edit Employee modal was dismissed, returned data:\n", data);
      if (data && data.deleted) {
        let i = this.employees.indexOf(data.employee);
        if (i > -1) {
          Log.l("editEmployee(): Edit Employee modal sent back a deleted employee or something.")
          let tmp1 = this.employees.slice(i, i + 1)[0];
          window['tmpemployee'] = tmp1;
          let tmp2 = [...this.employees.slice(0, i), ...this.employees.slice(i + 1)];
          this.employees = tmp2;
        }
      }
    });
    modal.present();

  }

  public addEmployee() {
    let employees = this.employees.map((a: Employee) => a.username);
    // let modal = this.modalCtrl.create('Add Employee', { mode: 'Add', usernames: employees }, { cssClass: 'edit-employee-modal' });
    let modal = this.modalCtrl.create('Employee', { mode: 'Add', usernames: employees }, { cssClass: 'edit-employee-modal' });
    modal.onDidDismiss(data => { Log.l("Employee modal was dismissed, returned data:\n", data); });
    modal.present();
  }

  public generateFieldList() {
    let fields = [], selectItems = [], items = [];
    fields.push({ field: "avatarName"     , header: "Username"    , filter: true , filterPlaceholder: "Username"    , order: 0  }); // 7
    fields.push({ field: "active"         , header: "Active"      , filter: true , filterPlaceholder: "Active"      , order: 1  }); // 0
    fields.push({ field: "updated"        , header: "Updated"     , filter: true , filterPlaceholder: "Updated"     , order: 2  }); // 1
    fields.push({ field: "prefix"         , header: "Prefix"      , filter: true , filterPlaceholder: "Prefix"      , order: 3  }); // 2
    fields.push({ field: "middleName"     , header: "Middle"      , filter: true , filterPlaceholder: "Middle"      , order: 4  }); // 3
    fields.push({ field: "firstName"      , header: "First"       , filter: true , filterPlaceholder: "First"       , order: 5  }); // 4
    fields.push({ field: "lastName"       , header: "Last"        , filter: true , filterPlaceholder: "Last"        , order: 6  }); // 5
    fields.push({ field: "suffix"         , header: "Suffix"      , filter: true , filterPlaceholder: "Suffix"      , order: 7  }); // 6
    fields.push({ field: "userClass"      , header: "Class"       , filter: true , filterPlaceholder: "Class"       , order: 9  }); // 8
    fields.push({ field: "client"         , header: "Client"      , filter: true , filterPlaceholder: "Client"      , order: 10 }); // 9
    fields.push({ field: "location"       , header: "Loc"         , filter: true , filterPlaceholder: "Loc"         , order: 11 }); // 10
    fields.push({ field: "locID"          , header: "LocID"       , filter: true , filterPlaceholder: "LocID"       , order: 12 }); // 11
    fields.push({ field: "shift"          , header: "Shift"       , filter: true , filterPlaceholder: "Shift"       , order: 13 }); // 12
    fields.push({ field: "shiftLength"    , header: "ShiftLen"    , filter: true , filterPlaceholder: "ShiftLen"    , order: 14 }); // 13
    fields.push({ field: "shiftStartTime" , header: "Shift Start" , filter: true , filterPlaceholder: "Shift Start" , order: 15 }); // 14
    fields.push({ field: "rotation"       , header: "Rot"         , filter: true , filterPlaceholder: "Rot"         , order: 16 }); // 15
    fields.push({ field: "email"          , header: "Email"       , filter: true , filterPlaceholder: "Email"       , order: 17 }); // 16
    fields.push({ field: "phone"          , header: "Phone"       , filter: true , filterPlaceholder: "Phone"       , order: 18 }); // 17
    fields.push({ field: "cell"           , header: "Cell"        , filter: true , filterPlaceholder: "Cell"        , order: 19 }); // 18
    fields.push({ field: "address"        , header: "Address"     , filter: true , filterPlaceholder: "Address"     , order: 20 }); // 19
    fields.push({ field: "payRate"        , header: "Pay Rate"    , filter: true , filterPlaceholder: "Pay Rate"    , order: 21 }); // 20
    this.colOpts = [];
    let initialize = [];
    // fields = fields.sort((a:any,b:any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    for (let field of fields) {
      let item = { label: field.header, value: field.field };
      // let item = {label: field.header, value: field};
      this.colOpts.push(item);
      initialize.push(field.field);
    }

    this.allFields = fields;
    this.items = this.colOpts;
    // let initialColumns = initialize;
    let initialColumns = [
      "avatarName",
      "lastName",
      "firstName",
      "client",
      "location",
      "locID",
    ]
    this.selectedColumns = initialColumns;
    this.columnsChanged();
    return fields;
  }

  public showFields() {
    this.fieldsDialogVisible = true;
  }

  public selectionChanged(colList?: string[]) {
    this.dataReady = false;
    this.columnsChanged(colList);
    this.dataReady = true;
  }

  public selectionChanged2() {
    Log.l("Selection is now:\n", this.cols);
  }

  public columnsChanged(colList?: string[]) {
    let vCols = colList ? colList : this.selectedColumns;
    // let cols = this.cols;
    Log.l("columnsChanged(): Items now selected:\n", vCols);
    // let sel = [];
    let sel = this.allFields.filter((a: any) => {
      return (vCols.indexOf(a.field) > -1);
    }).sort((a: any, b: any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Items selected via string:\n", sel);
    // this.displayColumns = [];
    // this.displayColumns = oo.clone(sel);
    // this.cols = oo.clone(sel);
    this.cols = sel;
    // this.displayColumns = [];
    // for(let item of sel) {
    //   // this.displayColumns = [...this.displayColumns, oo.clone(item)];
    //   this.displayColumns.push(oo.clone(item));
    //   // let i = dc.findIndex((a:any) => {
    //   //   return (a.field === item['field']);
    //   // });
    //   // if(i === -1) {
    //   //   dc = [...dc, item];
    //   // }
    // }
    this.cols = this.cols.sort((a: any, b: any) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    });
    Log.l("columnsChanged(): Now field list is:\n", this.cols);
    // this.displayColumns = this.displayColumns.sort((a: any, b: any) => {
    //   return a.order > b.order ? 1 : a.order < b.order ? -1 : 0;
    // });
    // Log.l("columnsChanged(): Now field list is:\n", this.displayColumns);
    // Log.l("columnsChanged(): Have now updated displayColumns to:\n", sel);
    // this.displayColumns = sel;
  }

  public toggleEditMode() {
    this.editMode = !this.editMode;
    Log.l("toggleEditMode(): Edit Mode is now '%s'", this.editMode);
  }

}
