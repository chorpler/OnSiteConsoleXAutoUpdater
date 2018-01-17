import { Subscription                                            } from 'rxjs/Subscription'             ;
import { sprintf                                                 } from 'sprintf-js'                    ;
import { Component, ViewChild, OnInit, OnDestroy, Input, Output, } from '@angular/core'                 ;
import { ElementRef, EventEmitter,                               } from '@angular/core'                 ;
import { Log, moment, Moment, oo, _matchCLL                      } from 'config/config.functions'       ;
import { Employee                                                } from 'domain/domain-classes'         ;
import { ServerService                                           } from 'providers/server-service'      ;
import { Jobsite                                                 } from 'domain/jobsite'                ;
import { AlertService                                            } from 'providers/alert-service'       ;
import { SmartAudio                                              } from 'providers/smart-audio'         ;
import { OSData                                                  } from 'providers/data-service'        ;
import { NotifyService                                           } from 'providers/notify-service'      ;
import { SelectItem, Dropdown                                    } from 'primeng/primeng'               ;
import { EditorComponent                                         } from 'components/editor/editor'      ;
import { Command, KeyCommandService                              } from 'providers/key-command-service' ;
import { DispatchService                                         } from 'providers/dispatch-service'    ;

@Component({
  selector: 'employee-view',
  templateUrl: 'employee-view.html'
})
export class EmployeeViewComponent implements OnInit,OnDestroy {
  @ViewChild('avatarName') avatarName:ElementRef                                      ;
  @ViewChild('emailTextArea') emailTextArea:ElementRef                                ;
  @Input('employee') employee:Employee                                                ;
  @Input('employees') employees:Array<Employee> = []                                  ;
  @Input('mode') mode:string = "edit";
  @Output('onUpdate') onUpdate = new EventEmitter<any>()                             ;
  @Output('onCancel')  onCancel = new EventEmitter<any>()                             ;
  @Output('onDelete')  onDelete = new EventEmitter<any>()                             ;
  public title          : string        = "Employee View"                             ;
  public editorOptions  : any           = {}                                          ;
  public get developerMode():boolean { return this.data.status.role === 'usr' ? false : true; };
  public keySubscription: Subscription                                                ;
  public idx            : number        = 0                                           ;
  public count          : number        = 0                                           ;
  public strBlank       : string        = ""                                          ;
  public userClass      : string        = ""                                          ;
  public userEmail      : string        = ""                                          ;
  public codeFocus      : boolean       = false                                       ;
  public errors         : any           = {username: false, email: false}             ;
  // public mode           : string        = "Add"                                       ;
  public from           : string        = "employees"                                 ;
  public usernames      : Array<string> = []                                          ;
  public dataReady      : boolean       = false                                       ;
  public clients        : any           = null                                        ;
  public locations      : any           = null                                        ;
  public locids         : any           = null                                        ;
  public shifts         : any           = null                                        ;
  public shiftlengths   : any           = null                                        ;
  public shiftstarttimes: any           = null                                        ;
  public jobsite        : Jobsite                                                     ;
  public client         : any           = null                                        ;
  public location       : any           = null                                        ;
  public locID          : any           = null                                        ;
  public shift          : any           = null                                        ;
  public shiftLength    : any           = null                                        ;
  public shiftStartTime : any           = null                                        ;
  public employeeHeader : string        = ""                                          ;
  public prefixList     : SelectItem[]  = []                                          ;
  public suffixList     : SelectItem[]  = []                                          ;
  public jobsiteList    : SelectItem[]  = []                                          ;
  public shiftList      : SelectItem[]  = []                                          ;
  public shiftLengthList: SelectItem[]  = []                                          ;
  public shiftStartList : SelectItem[]  = []                                          ;

  public prefixes       : Array<string> = ["", "Mr.", "Dr.", "Sr.", "Mrs.", "Ms.", "HRM"] ;
  public suffixes       : Array<string> = ["", "Jr.", "Sr.", "III", "Esq"]                ;
  public site           : Jobsite                                                     ;
  public sites          : Array<Jobsite>= []                                          ;
  public _jobsite       : any                                                         ;
  public _shift         : any                                                         ;
  public _shiftLength   : any                                                         ;
  public _shiftStartTime: any                                                         ;
  public username       : string = "unknown"                                          ;
  public backupEmployee : any                                                         ;
  constructor(
    public server:ServerService,
    public alert:AlertService,
    public audio:SmartAudio,
    public data:OSData,
    public notify:NotifyService,
    public keyService:KeyCommandService,
    public dispatch:DispatchService,
  ) {
    window['onsiteemployeeview'] = this;
  }

  ngOnInit() {
    Log.l("EmployeeViewComponent: ngOnInit() fired.");
    if(this.data.isAppReady()) {
      this.runWhenReady();
    };
  }

  ngOnDestroy() {
    Log.l("EmployeeViewComponent: ngOnDestroy() fired.");
    if(this.keySubscription && !this.keySubscription.closed) {
      this.keySubscription.unsubscribe();
    }
  }

  public runWhenReady() {
    this.keySubscription = this.keyService.commands.subscribe((command:Command) => {
      Log.l("Hotkey fired, command is:\n", command);
      switch(command.name) {
        case "EmployeeView.previous" : this.previous(); break;
        case "EmployeeView.next"     : this.next(); break;
        case "EmployeeView.default"  : this.defaultFill(command.ev); break;
      }
    });

    let options = {
      minimap: {enabled: false},
      lineNumbers: "off",
    };
    this.editorOptions = options;
    this.backupEmployee = oo.clone(this.employee.serialize());

    this.initializeEmployeeData();
  // .then(res => {
  //   return
    this.initializeJobsiteData();
  // }).then(res => {
    this.initializeForm();
    this.initializeFormListeners();
    this.initializeMenus();
    this.updateEmployeeDropdownFields();
    // this.backupEmployee = oo.clone(this.employee);
    let user = this.data.getUser();
    if(user) {
      let username = user.getUsername();
      this.username = username;
      // this.developerMode = username === 'mike' || username === 'Chorpler' || username === 'Hachero' ? true : false;
      // this.developerMode = this.data.status.role;
    }
    this.dataReady = true;
    // }).catch(err => {
    //   Log.l("initializeEmployeeData(): Error getting employee data!");
    //   Log.e(err);
    //   this.notify.addError('ERROR', `Could not read employee data: '${err.message}'`, 5000);
    // });
  }

  public initializeEmployeeData() {
    // let techs = this.data.getData('employees');
    let techs = this.employees;
    let tech = this.employee;
    let idx = techs.indexOf(tech);
    let count = techs.length;
    this.idx = idx;
    this.count = count;
    let shifts           = this.data.getConfigData('shifts');
    let shiftlengths     = this.data.getConfigData('shiftLengths');
    let shiftstarttimes  = this.data.getConfigData('shiftStartTimes');
    this.shifts          = shifts;
    this.shiftlengths    = shiftlengths;
    this.shiftstarttimes = shiftstarttimes;

    let name = tech.getFullNameNormal();
    // this.editEmployees = techs;
    if(this.mode === 'add') {
      this.employeeHeader = `Adding user`;
    } else {
      this.employeeHeader = `Editing '${name}' (${idx+1} / ${count})`;
    }

    this.usernames = techs.map((a:Employee) => a.username);

    // return new Promise((resolve,reject) => {
    //   this.server.getAllConfigData().then(res => {
    //     Log.l("initializeEmployeeData(): Successfuly fetched employee config data!");
    //     for(let key of Object.keys(res)) {
    //       this[key] = res[key];
    //     }
    //     resolve(res);
    //   }).catch(err => {
    //     Log.l("initializeEmployeeData(): Error fetching employee config data!");
    //     Log.e(err);
    //     reject(err);
    //   });
    // });
  }

  public initializeJobsiteData() {
    let sites = this.data.getData('sites');
    this.sites = sites;
    // return new Promise((resolve,reject) => {
    //   this.server.getJobsites().then(res => {
    //     Log.l("initializeJobsiteData(): Successfully fetched jobsite list:\n",res);
    //     let sites = new Array<Jobsite>();
    //     for(let key of Object.keys(res)) {
    //       let doc  = res[key];
    //       let site = new Jobsite();
    //       site.readFromDoc(doc);
    //       sites.push(site);
    //     }
    //     this.sites = sites;
    //     resolve(this.sites);
    //   }).catch(err => {
    //     Log.l("initializeJobsiteData(): Error retrieving jobsite list!");
    //     Log.e(err);
    //     reject(err);
    //   });
    // });
  }

  public initializeForm() {
    let e = this.employee;
    let tech = e;

    let hours = [];
    for(let i = 0; i < 24; i++) {
      let hour = sprintf("%02d:00", i);
      let time = {name: String(i), fullName: hour};
      hours.push(time);
    }
    this.shiftstarttimes = hours;
    if(this.mode === 'edit') {
      this.shiftStartTime = this.shiftstarttimes.find((a:any) => { return a.name == tech.shiftStartTime;});
      this.shift = this.shifts.find((a:any) => {return a.name == tech.shift});
      this.shiftLength = this.shiftlengths.find((a:any) => {return a.name == tech.shiftLength});
      this.site = this.data.getTechLocationForDate(tech, moment());
    } else {
    }
    // let name = tech.getFullName();
    // // this.loc2nds = [{name: "N", fullName: "North"}, {name: "S", fullName: "South"}, {name: "NA", fullName: "N/A"}];
    // // for(let site of this.sites) {
    //   // let client = site.client   ;
    //   // let loc    = site.location ;
    //   // let locID  = site.locID    ;
    //   // let loc2   = site.loc2nd   ;

    //   // this.clients.push(client);
    //   // this.locations.push(loc);
    //   // this.locids.push(locID);
    //   // this.loc2nds.push(loc2);
    //   // Log.l(`Checking to see if tech '${tech.getFullName()}' is at site '${site.getSiteID()}':\n`, tech);
    //   // if(_compareTechAndSite(tech, site)) {
    //   //   let siteName = site.getScheduleName();
    //   //   Log.l(`Tech '${name}' found at site '${siteName}'.`);
    //   //   this.site     = site          ;
    //   //   this.client   = site.client   ;
    //   //   this.location = site.location ;
    //   //   this.locID    = site.locID    ;
    //   //   break;
    //   //   // this.loc2nd   = site.loc2nd   ;
    //   // } else {
    //   //   // Log.l(`Tech '${tech.getFullName()}' NOT FOUND at site:\n`, site);
    //   // }
    // // }

    let userClass = "";
    if(typeof this.employee.userClass === 'string') {
      this.employee.userClass = [this.employee.userClass];
    }
    for(let uclass of this.employee.userClass) {
      userClass += uclass + "\n";
    }
    this.userClass = userClass;

    let userEmail = "";
    if(!this.employee.email) {
      this.employee.email = [];
    }
    if(typeof this.employee.email === 'string') {
      this.employee.email = [this.employee.email];
    }
    for(let email of this.employee.email) {
      userEmail += email + "\n";
    }
    this.userEmail = userEmail;
  }

  public initializeFormListeners() {
    // this._jobsite = this.employeeForm.get('jobsite');
    // this._shift   = this.employeeForm.get('shift');
    // this._shiftLength = this.employeeForm.get('shiftLength');
    // this._shiftStartTime = this.employeeForm.get('shiftStartTime');

    // this._jobsite.valueChanges.subscribe((value:any) => {
    //   let site         = value                                                                                 ;
    //   this.updateSite(site);
    // });
  }

  public initializeMenus() {
    let prefixList     : SelectItem[] = [] ;
    let suffixList     : SelectItem[] = [] ;
    let jobsiteList    : SelectItem[] = [] ;
    let shiftList      : SelectItem[] = [] ;
    let shiftLengthList: SelectItem[] = [] ;
    let shiftStartList : SelectItem[] = [] ;

    for(let prefix of this.prefixes) {
      let item:SelectItem = {label: prefix, value: prefix};
      prefixList.push(item);
    }

    this.prefixList                     = this.prefixes.map((a:string) => {
      return {label: a, value: a};
    });
    this.suffixList                     = this.suffixes.map((a:string) => {
      return {label: a, value: a};
    });
    this.jobsiteList                    = this.sites.map((a:Jobsite) => {
      return {label: a.schedule_name, value: a};
    });
    this.shiftList                      = this.shifts.map((a:any) => {
      return {label: a.fullName, value: a};
    });
    this.shiftLengthList                = this.shiftlengths.map((a:any) => {
      return {label: a.fullName, value: a};
    });
    this.shiftStartList                 = this.shiftstarttimes.map((a:any) => {
      return {label: a.fullName, value: a};
    });


    // let tech = this.employee;
    // let now = moment();
    // // let unassignedSite:Jobsite = this.sites.find((a:Jobsite) => {
    // //   return a.site_number === 1;
    // // });
    // let site:Jobsite = this.sites.find((a:Jobsite) => {
    //   return a.client.name === "XX";
    // });
    // if(this.mode === 'edit') {
    //   site = this.data.getTechLocationForDate(tech, now);
    // }
    // // if(tech && tech.site_number !== undefined && tech.site_number !== 1) {
    // //   site = this.sites.find((a:Jobsite) => {
    // //     return a.site_number === tech.site_number;
    // //   });
    // // } else {
    // //   // site = this.data.getSiteForTech(tech);
    // //   site = ;
    // // }
    // let snum = site.site_number || 1;
    // let menuSite = this.jobsiteList.find((a:SelectItem) => {
    //   let siteFromMenu:Jobsite = a.value;
    //   return siteFromMenu.site_number === snum;
    // });

    // this.jobsite = menuSite.value;

    // if(this.mode === 'edit') {
    //   let shift = this.shiftList.find((a:SelectItem) => {
    //     return a.value.name == tech.shift;
    //   });
    //   let shiftLength = this.shiftLengthList.find((a:SelectItem) => {
    //     return a.value.name == tech.shiftLength;
    //   });
    //   let shiftStartTime = this.shiftStartList.find((a:SelectItem) => {
    //     return a.value.name == tech.shiftStartTime;
    //   });
    //   delete shift['_$visited']
    //   delete shiftLength['_$visited']
    //   delete shiftStartTime['_$visited']
    //   this.shift = shift.value;
    //   this.shiftLength = shiftLength.value;
    //   this.shiftStartTime = shiftStartTime.value;
    // }
    // this.prefixList = prefixList;
    // this.suffixList = suffixList;
    // this.jobsiteList = jobsiteList;
    // this.shiftList = shiftList;
    // this.shiftLengthList = shiftLengthList;
    // this.shiftStartList = shiftStartList;
  }

  public updateEmployeeDropdownFields() {
    let tech = this.employee;
    let now = moment();
    // let unassignedSite:Jobsite = this.sites.find((a:Jobsite) => {
    //   return a.site_number === 1;
    // });
    let site:Jobsite = this.sites.find((a: Jobsite) => {
      return a.client.name === "XX";
    });
    if (this.mode === 'edit') {
      site = this.data.getTechLocationForDate(tech, now);
    }
    // if(tech && tech.site_number !== undefined && tech.site_number !== 1) {
    //   site = this.sites.find((a:Jobsite) => {
    //     return a.site_number === tech.site_number;
    //   });
    // } else {
    //   // site = this.data.getSiteForTech(tech);
    //   site = ;
    // }
    let snum = site.site_number || 1;
    let menuSite = this.jobsiteList.find((a: SelectItem) => {
      let siteFromMenu: Jobsite = a.value;
      return siteFromMenu.site_number === snum;
    });

    this.jobsite = menuSite.value;

    if (this.mode === 'edit') {
      let shift = this.shiftList.find((a: SelectItem) => {
        return a.value.name == tech.shift;
      });
      let shiftLength = this.shiftLengthList.find((a: SelectItem) => {
        return a.value.name == tech.shiftLength;
      });
      let shiftStartTime = this.shiftStartList.find((a: SelectItem) => {
        return a.value.name == tech.shiftStartTime;
      });
      if(shift) {
        delete shift['_$visited'];
        this.shift = shift.value;
      } else {
        this.shift = this.shiftList[0].value;
      }
      if(shiftLength) {
        delete shiftLength['_$visited'];
        this.shiftLength = shiftLength.value;
      } else {
        this.shiftLength = this.shiftLengthList[0].value;
      }
      if(shiftStartTime) {
        delete shiftStartTime['_$visited'];
        this.shiftStartTime = shiftStartTime.value;
      } else {
        this.shiftStartTime = this.shiftStartList[0].value;
      }
      // let employeeEmail = tech.email || "\n";
    }
    let employeeEmail = tech.email && tech.email.length ? tech.email.join("\n") : "";
    this.userEmail = employeeEmail;

  }

  // public updateSite(site:Jobsite) {
  //     let tech         = this.employee                                                                         ;
  //     let shiftTimes   = site.getShiftTypes()                                                                  ;
  //     let times        = []                                                                                    ;
  //     for(let time of shiftTimes) {
  //       let one = {name: time.toUpperCase(), fullName: time.toUpperCase()};
  //       times.push(one);
  //     }
  //     if(!tech.rotation) {
  //       tech.rotation = "CONTN WEEK";
  //     }
  //     if(!tech.shift) {
  //       tech.shift = "AM";
  //     }

  //     let shift            = tech.shift                                                                        ;
  //     this.shift           = this.shifts.find(a => {return a['name']==shift || a['fullName']==shift;})         ;

  //     let len              = site.getSiteShiftLength(tech.rotation, tech.shift, moment())                      ;
  //     let strt             = site.getShiftStartTime(tech.shift)                                                ;
  //     let shiftLength      = this.shiftlengths.find(a => {return a['name'] == len || a['fullName'] == len;})   ;
  //     let shiftStartTime   = this.shiftstarttimes.find(a => {return a['name'] == strt || a['fullName']==strt;});
  //     tech.shiftLength     = shiftLength                                                                       ;
  //     tech.shiftStartTime  = shiftStartTime                                                                    ;
  //     this.shiftLength     = shiftLength                                                                       ;
  //     this.shiftStartTime  = shiftStartTime                                                                    ;
  //     this.site            = site                                                                              ;
  //     // this.shift           = this.shifts.find(a => {return a['name']===tech.shift || a['fullName']===tech.shift;});
  //     this._shift.setValue(this.shift, {emitEvent: false})                                                     ;
  //     this._shiftLength.setValue(tech.shiftLength, {emitEvent: false})                                         ;
  //     this._shiftStartTime.setValue(tech.shiftStartTime, {emitEvent: false})                                   ;
  // }

  public updateEmployeeList() {
    this.server.getEmployees().then((res) => {
      Log.l(`updateEmployeeLists(): Success! Result:\n`, res);
      // this.
    }).catch((err) => {
      Log.l(`updateEmployeeLists(): Error!`);
      Log.e(err);
    });
  }

  public employeeUpdated(event:any, type:string) {
    Log.l(`updateEmployee(): Type is '${type}' and event is:\n`, event);
    if(type && type === 'save') {
      this.onUpdate.emit(event);
    } else if(type && type === 'cancel') {
      this.onCancel.emit(event);
    }
  }

  public updateEmployee(param:string, value:any) {
    // public updateEmployee(event:any) {
    Log.l(`updateEmployee(): param: '${param}' and value is:\n`, value);
    if(param === 'prefix') {
      this.employee.prefix = value;
    } else if(param === 'suffix') {
      this.employee.suffix = value;
    } else if(param === 'jobsite') {
      Log.l("updateEmployee(): Now updating jobsite...");
      let site:Jobsite = value;
      let cli = site.client.name;
      let loc = site.location.name;
      let lid = site.locID.name;
      let now = moment();
      let shiftTime = this.employee.shift || this.shift || "AM";
      let t1 = site.getShiftStartTime(shiftTime);
      let startHour = typeof t1 === 'string' && t1.length === 5 ? Number(t1.split(":")[0]) : Number(t1);
      let startTime = Number(startHour);
      this.shiftStartTime = this.shiftStartList.find((a:SelectItem) => {
        return Number(startTime) === Number(a.value.name);
      }).value;
      // let rotation = this.data.getTechRotationForDate(this.employee, now);
      let rotation = this.employee.rotation || "CONTN WEEK";
      let payPeriodStartDate = this.data.getPayrollPeriodStartDate(now);
      let shiftLength = site.getShiftLengthForDate(rotation, shiftTime, payPeriodStartDate);
      if(isNaN(Number(shiftLength))) {
        shiftLength = 11;
      }
      let shiftLengthItem = this.shiftLengthList.find((a:SelectItem) => {
        return Number(shiftLength) === Number(a.value.name);
      });
      if(shiftLengthItem && shiftLengthItem.value) {
        this.shiftLength = shiftLengthItem.value;
        this.employee.shiftLength = Number(shiftLength)
      } else {
        this.shiftLength = this.shiftLengthList[0].value;
        this.employee.shiftLength = Number(shiftLength)
      }
      this.employee.client = cli;
      this.employee.location = loc;
      this.employee.locID = lid;
      this.employee.site_number = site.site_number;
      this.employee.workSite = site.getSiteID();
      this.employee.shift = shiftTime;
      this.employee.shiftStartTime = Number(startTime);
    } else if(param === 'shift') {
      this.employee.shift = value.name;
      this.updateEmployee('jobsite', this.jobsite);
    } else if(param === 'shiftLength') {
      this.employee.shiftLength = Number(value.name);
    } else if(param === 'shiftStart') {
      this.employee.shiftStartTime = Number(value.name);
      this.employee.shiftStartTimeHour = value.fullName;
    }
    Log.l("updateEmployee(): Final updated employee is:\n", this.employee);
    // this.updated.emit(event);
  }

  public createEmail(event?:any) {
    let username = this.employee.avatarName;
    let email = `${username}@sesafleetservices.com`;
    if(username && username.length) {
      let exists = this.userEmail.includes(email);
      if(!exists) {
        if(this.userEmail === "" || this.userEmail === '\n') {
          this.userEmail = email + "\n";
        } else {
          this.userEmail += email + "\n";
        }
      } else {
        this.notify.addError("ERROR", "This e-mail address is already listed!", 5000);
      }
    } else {
      this.notify.addWarn("ALERT", "You must enter a username in order to create an e-mail address automatically.", 5000);
    }
  }

  public focusOnUsername() {
    setTimeout(() => {
      // this.avatarName.setFocus();
      let el:any = this.avatarName.nativeElement;
      if(el) {
        this.codeFocus = true;
        el.focus();
        el.select();
      }
    }, 300)
  }

  // public usernameFocused() {
  //   if(this.codeFocus) {
  //     this.
  //   }
  // }

  public finalizeEmployee() {
    this.employee.technician = this.employee.getTechName();
    this.employee.username = this.employee.name = this.employee.avatarName;
    this.employee.avtrNameAsUser = true;
    if(!this.employee.rotation) {
      this.employee.rotation = "CONTN WEEK";
    }
    if(!this.employee.payRate) {
      this.employee.payRate = 12;
    }
    if(!this.employee.email || !Array.isArray(this.employee.email)) {
      let email = `${this.employee.avatarName}@sesafleetservices.com`;
      this.employee.email = [email];
    } else {

    }
  }

  public setError(type:string, value:boolean) {
    if(type === 'all') {
      this.setError('username', value);
      this.setError('email', value);
    } else if(type === 'username') {
      this.errors.username = value;
    } else if(type === 'email') {
      this.errors.email = value;
    }
  }

  public async saveNoExit(employee?:Employee, event?:any) {
    let spinnerID;
    try {
      let tech:Employee = employee || this.employee;
      let names = this.usernames || [];
      let name = tech.avatarName;
      if (!tech.avatarName) {
        this.notify.addError("USERNAME REQUIRED", "The username field cannot be left blank.", 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
      } else if (names.indexOf(name) > -1 && this.mode.toUpperCase() === 'ADD') {
        // this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
        this.notify.addError("DUPLICATE USER", "Another user already has that username.", 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
        // })
      } else if (names.indexOf(name) > -1 && names.indexOf(name) !== this.employees.indexOf(this.employee)) {
        // this.alert.showAlert("USER EXISTS", "This Avatar Name (username) already exists. Please change avatar name.").then(res => {
        this.notify.addError("DUPLICATE USER", "Another user already has that username.", 3000);
        this.focusOnUsername();
        this.setError('username', true);
        return false;
        // })
      } else {
        Log.l("onSubmit(): Saving employee from form:\n", tech);
        spinnerID = this.alert.showSpinner("Saving employee...");
        this.finalizeEmployee();
        let ts = moment().format();
        let user = this.data.getUser();
        let loggedInUser = user.getUsername();
        let logEntry = {
          type: "updated",
          user: loggedInUser,
          timestamp: ts,
        };
        if (this.mode === 'add') {
          logEntry.type = "created";
          tech.created = ts;
        }
        tech.statusUpdates.push(logEntry);
        tech.lastUpdated = ts;
        // this.employee.readFromDoc();
        // Log.l("onSubmit(): Read employee in from form:\n", this.employee);
        // let employeeDoc = Object.assign({}, this.employee);
        // let employeeDoc:any = oo.clone(this.employee);
        let employeeDoc = tech.serialize();
        if (employeeDoc.shiftStartTimeHour !== undefined) { delete employeeDoc.shiftStartTimeHour; }
        if (employeeDoc.shiftStartTimeMoment !== undefined) { delete employeeDoc.shiftStartTimeMoment; }
        Log.l("onSubmit(): User name is: '%s'", name);
        employeeDoc._id = `org.couchdb.user:${name}`;
        employeeDoc.roles = employeeDoc.roles || ["TECHNICIAN"];
        employeeDoc.type = "user";
        employeeDoc.docID = employeeDoc.docID || employeeDoc._id;
        // if(!employeeDoc['docID']) {
        //   employeeDoc['docID'] = employeeDoc['_id'];
        // }
        employeeDoc.name = name;
        employeeDoc.username = name;
        // let doc = tech.serialize();
        Log.l("onSubmit(): Now saving employee:\n", employeeDoc);
        let res = await this.server.saveEmployee(employeeDoc);
          // this.server.saveEmployee(tech).then((res) => {
        Log.l(`onSubmit(): Success! Result:\n`, res);
        this.alert.hideSpinner(spinnerID);
        if(!employee) {
          return res;
        } else {
          this.notify.addSuccess("SUCCESS", `Successfully saved user '${name}'`, 3000);
        }
          // this.employeeUpdated(evt, 'save');
          // if(this.mode === 'Edit' || this.from === 'scheduling') {
          //   this.viewCtrl.dismiss({employee: this.employee, deleted: false});
          // } else {
          //   this.navCtrl.setRoot("Employees");
          // }
      }
    } catch(err) {
      this.alert.hideSpinner(spinnerID);
      if(!employee) {
        throw new Error(err);
      } else {
        Log.l(`saveNoExit(): Error saving employee '${employee.getUsername()}'`);
        Log.e(err);
        this.notify.addError("ERROR", `Could not save employee '${name}': '${err.message}'`, 10000);
        throw new Error(err);
      }
    }
  }

  public async onSubmit(evt:any) {
    // let formInput = this.employeeForm.value;
    this.finalizeEmployee();
    try {
      let res = await this.saveNoExit();
      if(res) {
        let name = this.employee.getUsername();
        this.notify.addSuccess("SUCCESS", `Successfully saved user '${name}'`, 3000);
        Log.l("onSubmit(): Successfully saved user:\n", res);
        if(this.mode === 'add' || this.mode === 'Add') {
          this.onUpdate.emit({ type: 'add', employee: this.employee })
        } else {
          this.onUpdate.emit(res);
        }
        return res;
      }
    } catch(err) {
      Log.l(`onSubmit(): Error saving employee!`);
      Log.e(err);
      let name = this.employee.getUsername();
      this.notify.addError("ERROR", `Could not save employee '${name}': '${err.message}'`, 10000);
    }

  }

  public cancel(evt:any) {
    // if (this.mode === 'Edit' || this.from === 'scheduling') {
      //   // this.viewCtrl.dismiss();
      // } else {
        //   // this.navCtrl.setRoot("Employees");
        // }
    // let employee = new Employee();
    // employee.readFromDoc(oo.clone(this.backupEmployee));
    // this.employee.readFromDoc(this.backupEmployee);
    // Log.l("cancel(): Employee edit canceled. Employee reverted to:\n", this.employee);
    this.notify.addInfo("CANCELED", "User edit canceled.", 3000);
    // this.employeeUpdated(evt, 'cancel');
    this.onCancel.emit(evt)
  }

  public deleteEmployee(employee:Employee) {
    Log.l("deleteEmployee(): User clicked on delete employee.");
    this.attemptToDelete(employee).then(res => {
      if(res) {
        Log.l("deleteEmployee(): Success.");
        if(this.mode === 'Edit' || this.from === 'scheduling') {
          this.onUpdate.emit({ type: 'delete', employee: employee });
          // this.viewCtrl.dismiss({ employee: this.employee, deleted: true});
        } else {
          // this.navCtrl.setRoot("Employees");
          this.onUpdate.emit({type: 'delete', employee: employee});
        }
      } else {
        Log.l("deleteEmployee(): User chose not to.");
        this.notify.addInfo("DELETE CANCELED", "User not deleted.", 3000);
      }
    }).catch(err => {
      Log.l("deleteEmployee(): Error!");
      Log.e(err);
      // this.alert.showAlert("ERROR", "Could not delete employee. Connection down or other error!");
      this.notify.addError("DELETE FAILED", `Could not delete employee: '${err.message}'`, 5000);
    });
  }

  public async attemptToDelete(employee:Employee) {
    try {
      let warning1 = await this.alert.showConfirmYesNo("WARNING", "Are you sure you want to delete an employee? This may cause problems and should only be used on accidentally created users.");
      if (warning1) {
        let warning2 = await this.alert.showConfirmYesNo("BE AWARE", "This is a permanent operation. Are you absolutely sure you want to delete this user?");
        if (warning2) {
          let name = employee.getUsername();
          // let formInput = this.employeeForm.value;
          // let formInput = this.employee;
          // let tech = this.employee;
          // let employeeDoc = Object.assign({}, employee);
          let employeeDoc: any = oo.clone(employee);
          delete employeeDoc.shiftStartTimeHour;
          delete employeeDoc.shiftStartTimeMoment;
          employeeDoc.roles = ["TECHNICIAN"];
          employeeDoc.type = "user";
          if (!employeeDoc._id) {
            employeeDoc._id = `org.couchdb.user:${employee.avatarName}`;
          }
          if (!employeeDoc.docID) {
            employeeDoc.docID = employeeDoc._id;
          }
          let res = await this.server.deleteUser(employeeDoc);
          Log.l(`attemptToDelete(): Successfully deleted employee '${employee.getUsername()}'`);
          let details = `User '${name}' successfully deleted.`;
          // this.notify.addSuccess("DELETED", details, 3000);
          this.audio.playRandomSound('delete_user');
          return true;
        } else {
          return false;
          // this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`, 3000)
        }
      } else {
        return false;
        // this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`, 3000)
      }
    } catch(err) {
      Log.l(`attemptToDelete(): Error deleting user '${employee.getUsername()}'!`);
      Log.e(err);
      throw new Error(err);
    }
    // return new Promise((resolve,reject) => {
  }

  // public attemptToDelete(employee:Employee) {
  //   return new Promise((resolve,reject) => {
  //     this.alert.showConfirmYesNo("WARNING", "Are you sure you want to delete an employee? This may cause problems and should only be used on accidentally created users.").then(goAhead => {
  //       if (goAhead) {
  //         this.alert.showConfirmYesNo("BE AWARE", "This is a permanent operation. Are you absolutely sure you want to delete this user?").then(goAhead => {
  //           if (goAhead) {
  //             let name = employee.getUsername();
  //             // let formInput = this.employeeForm.value;
  //             // let formInput = this.employee;
  //             // let tech = this.employee;
  //             // let employeeDoc = Object.assign({}, employee);
  //             let employeeDoc:any = oo.clone(employee);
  //             delete employeeDoc.shiftStartTimeHour;
  //             delete employeeDoc.shiftStartTimeMoment;
  //             employeeDoc.roles = ["TECHNICIAN"];
  //             employeeDoc.type = "user";
  //             if (!employeeDoc._id) {
  //               employeeDoc._id = `org.couchdb.user:${employee.avatarName}`;
  //             }
  //             if (!employeeDoc.docID) {
  //               employeeDoc.docID = employeeDoc._id;
  //             }
  //             this.server.deleteUser(employeeDoc).then(res => {
  //               Log.l("attemptToDelete(): Successfully deleted employee.");
  //               let name = employee.getUsername();
  //               let details = `User '${name}' successfully deleted.`;
  //               // this.notify.addSuccess("DELETED", details, 3000);
  //               this.audio.playRandomSound('delete_user');
  //               resolve(res);
  //             }).catch(err => {
  //               Log.l("attemptToDelete(): Error deleting employee.");
  //               Log.e(err);
  //               reject(err);
  //             });
  //           } else {
  //             Log.l("attemptToDelete(): User first opted to delete, but then thought better.");
  //             let name = employee.getUsername();
  //             this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
  //             resolve(false);
  //           }
  //         }).catch(err => {
  //           Log.l("attemptToDelete(): Error getting user response to second prompt. Not deleting.");
  //           Log.e(err);
  //           reject(err);
  //         });
  //       } else {
  //         Log.l("attemptToDelete(): User opted not to delete, probably wisely.");
  //         this.notify.addInfo('CANCELED', `Delete of user '${name}' canceled.`)
  //         resolve(false);
  //       }
  //     }).catch(err => {
  //       Log.l("attemptDelete(): Error attempting to get user's input. Not deleting.");
  //       Log.e(err);
  //       reject(err);
  //     });
  //   });
  // }

  public copyPhone(src:string, dest:string) {
    Log.l(`copyPhone(): Copying '${src}' to '${dest}' ...`);
    this.employee[dest] = this.employee[src];
  }

  public checkKeyUp(type:string, event?:any) {
    Log.l("checkKeyUp(): Event is:\n", event);
    if(type === 'phone') {
      if(event && event.key && event.key === 'PageDown') {
        this.copyPhone('phone', 'cell');
      }
    } else if(type === 'cell') {
      if(event && event.key && event.key === 'PageUp') {
        this.copyPhone('cell', 'phone');
      }
    }
  }

  public updateUserClass(userclass:string) {
    let classArray = userclass.trim().split('\n');
    Log.l(`updateUserClass(): string '${userclass}' split into array:\n`, classArray);
    this.employee.userClass = classArray;
  }

  public updateUserEmail(emails?:string) {
    let email = emails ? emails : this.userEmail;
    this.setError('email', false);
    let emailArray = email.trim().split('\n');
    Log.l(`updateUserRole(): string '${email}' split into array:\n`, emailArray);
    this.employee.email = emailArray;
  }

  public async defaultFill(event?:any) {
    try {
      let confirm = await this.alert.showConfirmYesNo("FILL DEFAULT", "Fill the current user with default test user info?");
      if(confirm) {
        this.setError('all', false);
        this.employee.firstName = 'Aaron';
        this.employee.middleName = 'Aaron';
        this.employee.lastName = 'Aaaronson';
        this.employee.username = this.employee.avatarName = 'Aaaron';
        this.employee.avtrNameAsUser = true;
        let site = this.sites.find((a: Jobsite) => {
          return a.site_number == 1075;
        });
        if (site) {
          this.jobsite = site;
          this.updateEmployee('jobsite', site);
          // this.employee.setJobsite(site);
        }
        let email = `${this.employee.avatarName}@sesafleetservices.com`;
        this.userEmail = email + "\n";
        this.updateUserEmail(email);
        this.employee.phone = "956-614-5117";
        this.employee.cell = "956-614-5117";
        this.employee.address.street.street1 = "2801 Corporate Drive";
        this.employee.address.city = "Weslaco";
        this.employee.address.state = "TX";
        this.employee.address.zip = "78599";
        this.employee.rotation = "CONTN WEEK";
        this.employee.payRate = 12;
        this.employee.active = true;
        this.finalizeEmployee();
        this.notify.addSuccess("SUCCESS", "User set to default test user", 3000);
      } else
      this.notify.addInfo("CANCELED", "User not set to default.", 3000);
       // return res;
    } catch(err) {
      Log.l(`defaultFill(): Error with default fill for some reason.`);
      Log.e(err);
      this.notify.addError("ERROR", `Error filling default: ${err.message}`, 10000);
      // throw new Error(err);
    }
  }

  public previous(event?:any) {
    this.idx--;
    if(this.idx < 0) {
      this.idx = 0;
    }
    this.employee = this.employees[this.idx];
    let count = this.employees.length;
    let name = this.employee.getFullNameNormal();
    this.employeeHeader = `Editing '${name}' (${this.idx + 1} / ${count})`;
    this.updateEmployeeDropdownFields();

    // this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
  }

  public next(event?: any) {
    this.idx++;
    if(this.idx >= this.count) {
      this.idx = this.count - 1;
    }
    this.employee = this.employees[this.idx];
    let count = this.employees.length;
    let name = this.employee.getFullNameNormal();
    this.employeeHeader = `Editing '${name}' (${this.idx + 1} / ${count})`;
    this.updateEmployeeDropdownFields();
    // this.report = this.reports[this.idx];
    // this.reportChange.emit(this.idx);
  }

}
